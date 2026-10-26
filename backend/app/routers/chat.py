import logging
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_database
from app.core.auth import get_current_user, verify_firebase_id_token
from app.models.chat import (
    MessageCreate,
    MessageResponse,
    MessageListResponse,
    ConversationResponse,
    ConversationListResponse
)
from app.services.chat_service import chat_manager
from app.services.notification_service import create_notification

logger = logging.getLogger("oporajito.chat")
router = APIRouter(tags=["chat"])

def format_message_doc(doc: dict) -> MessageResponse:
    return MessageResponse(
        id=str(doc.get("_id", doc.get("id", ""))),
        conversation_id=str(doc.get("conversation_id", "")),
        sender_id=str(doc.get("sender_id", "")),
        text=doc.get("text", ""),
        created_at=doc.get("created_at", "")
    )

@router.get("/conversations", response_model=ConversationListResponse)
async def get_my_conversations(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    List all active chat conversations for the current neighbor.
    Populates details of the other conversation participant (name, avatar, area).
    """
    current_user_id = str(current_user["_id"])
    cursor = db["conversations"].find({"participant_ids": current_user_id}).sort("last_message_at", -1)
    convo_docs = await cursor.to_list(length=50)

    results: List[ConversationResponse] = []
    for doc in convo_docs:
        convo_id = str(doc["_id"])
        participants = doc.get("participant_ids", [])
        other_id = next((pid for pid in participants if pid != current_user_id), None)

        other_name = "Neighbor"
        other_avatar = "🧑🏽‍💻"
        other_area = "Bangladesh"

        if other_id:
            if ObjectId.is_valid(other_id):
                other_user = await db["users"].find_one({"_id": ObjectId(other_id)})
            else:
                other_user = await db["users"].find_one({"firebase_uid": other_id})

            if other_user:
                other_name = other_user.get("name", "Neighbor")
                other_avatar = other_user.get("avatar", "🧑🏽‍💻")
                other_area = f"{other_user.get('area', '')}, {other_user.get('district', '')}".strip(", ") or "Bangladesh"

        results.append(
            ConversationResponse(
                id=convo_id,
                participant_id=other_id or "",
                name=other_name,
                avatar=other_avatar,
                area=other_area,
                skill_topic=doc.get("skill_topic", "Skill Swap"),
                last_message=doc.get("last_message", ""),
                last_message_at=doc.get("last_message_at", doc.get("created_at", "")),
                unread=0
            )
        )

    return ConversationListResponse(
        total=len(results),
        conversations=results
    )

@router.get("/conversations/{conversation_id}/messages", response_model=MessageListResponse)
async def get_conversation_messages(
    conversation_id: str,
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get paginated message history for a conversation thread.
    """
    if not ObjectId.is_valid(conversation_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid conversation ID.")

    convo = await db["conversations"].find_one({"_id": ObjectId(conversation_id)})
    if not convo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")

    current_user_id = str(current_user["_id"])
    if current_user_id not in convo.get("participant_ids", []):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this conversation.")

    cursor = db["messages"].find({"conversation_id": conversation_id}).sort("created_at", 1).limit(limit)
    msg_docs = await cursor.to_list(length=limit)

    return MessageListResponse(
        conversation_id=conversation_id,
        total=len(msg_docs),
        messages=[format_message_doc(m) for m in msg_docs]
    )

@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_chat_message(
    conversation_id: str,
    payload: MessageCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    REST endpoint to send a message (works alongside WebSocket or as reliable fallback).
    """
    if not ObjectId.is_valid(conversation_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid conversation ID.")

    convo = await db["conversations"].find_one({"_id": ObjectId(conversation_id)})
    if not convo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")

    current_user_id = str(current_user["_id"])
    if current_user_id not in convo.get("participant_ids", []):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized in this conversation.")

    now_iso = datetime.now(timezone.utc).isoformat()
    msg_doc = {
        "conversation_id": conversation_id,
        "sender_id": current_user_id,
        "text": payload.text.strip(),
        "created_at": now_iso
    }

    result = await db["messages"].insert_one(msg_doc)
    msg_doc["_id"] = result.inserted_id

    # Update conversation's last message snippet
    await db["conversations"].update_one(
        {"_id": ObjectId(conversation_id)},
        {"$set": {"last_message": payload.text.strip(), "last_message_at": now_iso}}
    )

    # Format response
    formatted_msg = format_message_doc(msg_doc)

    # Broadcast to WebSocket listeners
    await chat_manager.broadcast_to_conversation(
        conversation_id=conversation_id,
        message_data=formatted_msg.model_dump()
    )

    # Create notification for the recipient
    participants = convo.get("participant_ids", [])
    recipient_id = next((pid for pid in participants if pid != current_user_id), None)
    if recipient_id:
        sender_name = current_user.get("name", "Your neighbor")
        await create_notification(
            db=db,
            user_id=recipient_id,
            notif_type="new_message",
            title=f"Message from {sender_name}",
            message=payload.text.strip()[:80],
            link=f"/chat/{conversation_id}"
        )

    return formatted_msg

@router.websocket("/ws/chat")
async def chat_websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(..., description="Auth token for verification"),
    conversation_id: str = Query(..., description="Target conversation ID"),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Realtime WebSocket chat endpoint:
    ws://localhost:8000/api/v1/ws/chat?token={token}&conversation_id={convo_id}
    """
    # 1. Authenticate token
    try:
        token_data = await verify_firebase_id_token(token)
    except Exception as e:
        logger.warning(f"WebSocket auth failed: {e}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 2. Look up user
    user = await db["users"].find_one({"firebase_uid": token_data["uid"]})
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user_id = str(user["_id"])

    # 3. Validate conversation membership
    if not ObjectId.is_valid(conversation_id):
        await websocket.close(code=status.WS_1003_UNSUPPORTED_DATA)
        return

    convo = await db["conversations"].find_one({"_id": ObjectId(conversation_id)})
    if not convo or user_id not in convo.get("participant_ids", []):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 4. Accept connection
    await chat_manager.connect(conversation_id, user_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()
            text = (data.get("text") or "").strip()
            if not text:
                continue

            now_iso = datetime.now(timezone.utc).isoformat()
            msg_doc = {
                "conversation_id": conversation_id,
                "sender_id": user_id,
                "text": text,
                "created_at": now_iso
            }

            result = await db["messages"].insert_one(msg_doc)
            msg_doc["_id"] = result.inserted_id

            await db["conversations"].update_one(
                {"_id": ObjectId(conversation_id)},
                {"$set": {"last_message": text, "last_message_at": now_iso}}
            )

            formatted = format_message_doc(msg_doc)
            await chat_manager.broadcast_to_conversation(
                conversation_id=conversation_id,
                message_data=formatted.model_dump()
            )

            # Notify the other participant
            participants = convo.get("participant_ids", [])
            recipient_id = next((pid for pid in participants if pid != user_id), None)
            if recipient_id:
                sender_name = user.get("name", "Your neighbor")
                await create_notification(
                    db=db,
                    user_id=recipient_id,
                    notif_type="new_message",
                    title=f"Message from {sender_name}",
                    message=text[:80],
                    link=f"/chat/{conversation_id}"
                )
    except WebSocketDisconnect:
        chat_manager.disconnect(conversation_id, user_id, websocket)
    except Exception as e:
        logger.error(f"WebSocket error in conversation {conversation_id}: {e}")
        chat_manager.disconnect(conversation_id, user_id, websocket)
