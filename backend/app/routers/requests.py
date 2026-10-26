import logging
from typing import Optional, Literal
from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_database
from app.core.auth import get_current_user
from app.models.request import (
    SkillRequestCreate,
    SkillRequestStatusUpdate,
    SkillRequestResponse,
    SkillRequestListResponse
)
from app.services.notification_service import create_notification

logger = logging.getLogger("oporajito.requests")
router = APIRouter(prefix="/requests", tags=["requests"])

def format_request_doc(doc: dict) -> SkillRequestResponse:
    return SkillRequestResponse(
        id=str(doc["_id"]),
        from_user_id=doc.get("from_user_id", ""),
        from_user_name=doc.get("from_user_name", "Anonymous Neighbor"),
        from_user_avatar=doc.get("from_user_avatar", "🧑🏽‍💻"),
        from_user_area=doc.get("from_user_area", "Dhaka"),
        to_user_id=doc.get("to_user_id", ""),
        to_user_name=doc.get("to_user_name", "Neighbor"),
        to_user_avatar=doc.get("to_user_avatar", "🧑🏽‍💻"),
        to_user_area=doc.get("to_user_area", "Dhaka"),
        skill=doc.get("skill", ""),
        offered_skill=doc.get("offered_skill"),
        message=doc.get("message", ""),
        status=doc.get("status", "pending"),
        created_at=doc.get("created_at", datetime.now(timezone.utc).isoformat()),
        updated_at=doc.get("updated_at", datetime.now(timezone.utc).isoformat())
    )

@router.post("", response_model=SkillRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_skill_request(
    payload: SkillRequestCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    current_user_id = str(current_user["_id"])
    to_user_id = payload.to_user_id.strip()

    # Prevent swapping with oneself
    if current_user_id == to_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot send a skill swap request to yourself."
        )

    # Validate target user exists
    if not ObjectId.is_valid(to_user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid recipient neighbor ID."
        )

    target_user = await db["users"].find_one({"_id": ObjectId(to_user_id)})
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target neighbor not found."
        )

    # Check block list
    blocked_by_target = target_user.get("blocked_users", [])
    if current_user_id in blocked_by_target:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot send request to this neighbor."
        )

    my_blocks = current_user.get("blocked_users", [])
    if to_user_id in my_blocks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have blocked this neighbor. Unblock them first to swap skills."
        )

    # Check for existing pending request
    existing_pending = await db["skill_requests"].find_one({
        "from_user_id": current_user_id,
        "to_user_id": to_user_id,
        "skill": payload.skill,
        "status": "pending"
    })
    if existing_pending:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"You already have a pending swap request for '{payload.skill}' with this neighbor."
        )

    now_iso = datetime.now(timezone.utc).isoformat()
    from_area_str = f"{current_user.get('area', '')}, {current_user.get('district', '')}".strip(", ") or "Bangladesh"
    to_area_str = f"{target_user.get('area', '')}, {target_user.get('district', '')}".strip(", ") or "Bangladesh"

    req_doc = {
        "from_user_id": current_user_id,
        "from_user_name": current_user.get("name", "Neighbor"),
        "from_user_avatar": current_user.get("avatar", "🧑🏽‍💻"),
        "from_user_area": from_area_str,
        "to_user_id": to_user_id,
        "to_user_name": target_user.get("name", "Neighbor"),
        "to_user_avatar": target_user.get("avatar", "🧑🏽‍💻"),
        "to_user_area": to_area_str,
        "skill": payload.skill.strip(),
        "offered_skill": payload.offered_skill.strip() if payload.offered_skill else None,
        "message": (payload.message or "").strip(),
        "status": "pending",
        "created_at": now_iso,
        "updated_at": now_iso
    }

    result = await db["skill_requests"].insert_one(req_doc)
    req_doc["_id"] = result.inserted_id

    # Create in-app notification for the recipient
    sender_name = current_user.get("name", "A neighbor")
    await create_notification(
        db=db,
        user_id=to_user_id,
        notif_type="request_received",
        title="Swap Request Received",
        message=f"{sender_name} wants to swap skills for '{payload.skill}'!",
        link="/requests"
    )

    return format_request_doc(req_doc)

@router.get("", response_model=SkillRequestListResponse)
async def get_skill_requests(
    box: Literal["incoming", "outgoing"] = Query("incoming", description="Incoming or outgoing request box"),
    status: Optional[str] = Query(None, description="Filter by status (pending, accepted, declined, completed)"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    current_user_id = str(current_user["_id"])
    query = {}

    if box == "incoming":
        query["to_user_id"] = current_user_id
    else:
        query["from_user_id"] = current_user_id

    if status:
        query["status"] = status

    total = await db["skill_requests"].count_documents(query)
    skip = (page - 1) * limit
    cursor = db["skill_requests"].find(query).sort("created_at", -1).skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)

    return SkillRequestListResponse(
        total=total,
        page=page,
        limit=limit,
        requests=[format_request_doc(item) for item in items]
    )

@router.patch("/{request_id}", response_model=SkillRequestResponse)
async def update_skill_request_status(
    request_id: str,
    payload: SkillRequestStatusUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if not ObjectId.is_valid(request_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request ID format.")

    req = await db["skill_requests"].find_one({"_id": ObjectId(request_id)})
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Swap request not found.")

    current_user_id = str(current_user["_id"])
    is_sender = (req["from_user_id"] == current_user_id)
    is_recipient = (req["to_user_id"] == current_user_id)

    if not is_sender and not is_recipient:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this request.")

    current_status = req.get("status", "pending")
    new_status = payload.status

    # Validate state transitions
    if new_status in ["accepted", "declined"]:
        if not is_recipient:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the recipient can accept or decline a swap request."
            )
        if current_status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot {new_status} request because it is already '{current_status}'."
            )
    elif new_status == "cancelled":
        if not is_sender:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the sender can cancel a swap request."
            )
        if current_status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot cancel request because it is already '{current_status}'."
            )
    elif new_status == "completed":
        if current_status != "accepted":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only accepted swap requests can be marked as completed."
            )

    now_iso = datetime.now(timezone.utc).isoformat()
    await db["skill_requests"].update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": new_status, "updated_at": now_iso}}
    )
    req["status"] = new_status
    req["updated_at"] = now_iso

    # Notification & Conversation triggers based on status
    if new_status == "accepted":
        # Create or ensure conversation thread
        convo = await db["conversations"].find_one({
            "participant_ids": {"$all": [req["from_user_id"], req["to_user_id"]]}
        })
        if not convo:
            new_convo = {
                "participant_ids": [req["from_user_id"], req["to_user_id"]],
                "skill_topic": f"{req['skill']} Swap",
                "last_message": "Request accepted! Let's arrange a time to meet.",
                "last_message_at": now_iso,
                "created_at": now_iso
            }
            inserted_convo = await db["conversations"].insert_one(new_convo)
            convo_id = str(inserted_convo.inserted_id)
        else:
            convo_id = str(convo["_id"])

        await create_notification(
            db=db,
            user_id=req["from_user_id"],
            notif_type="request_accepted",
            title="Skill Swap Accepted!",
            message=f"{current_user.get('name', 'Your neighbor')} accepted your swap request for '{req['skill']}'. Chat is now open!",
            link=f"/chat/{convo_id}"
        )

    elif new_status == "declined":
        await create_notification(
            db=db,
            user_id=req["from_user_id"],
            notif_type="request_declined",
            title="Swap Request Update",
            message=f"{current_user.get('name', 'Your neighbor')} was unable to accept your swap request for '{req['skill']}' at this time.",
            link="/requests"
        )

    elif new_status == "completed":
        other_user_id = req["from_user_id"] if is_recipient else req["to_user_id"]
        await create_notification(
            db=db,
            user_id=other_user_id,
            notif_type="request_completed",
            title="Skill Swap Completed!",
            message=f"Your skill swap for '{req['skill']}' is marked as completed! Leave a review for your neighbor.",
            link=f"/profile/{current_user_id}"
        )

    return format_request_doc(req)
