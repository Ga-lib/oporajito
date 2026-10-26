import logging
from typing import Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_database
from app.core.auth import get_current_user
from app.models.notification import (
    NotificationResponse,
    NotificationListResponse
)

logger = logging.getLogger("oporajito.notifications")
router = APIRouter(prefix="/notifications", tags=["notifications"])

def format_notif_doc(doc: dict) -> NotificationResponse:
    return NotificationResponse(
        id=str(doc["_id"]),
        user_id=str(doc.get("user_id", "")),
        type=doc.get("type", "request_received"),
        title=doc.get("title", ""),
        message=doc.get("message", ""),
        read=bool(doc.get("read", False)),
        link=doc.get("link"),
        created_at=doc.get("created_at", "")
    )

@router.get("", response_model=NotificationListResponse)
async def get_my_notifications(
    limit: int = Query(30, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = str(current_user["_id"])
    cursor = db["notifications"].find({"user_id": user_id}).sort("created_at", -1).limit(limit)
    items = await cursor.to_list(length=limit)

    unread_count = await db["notifications"].count_documents({
        "user_id": user_id,
        "read": False
    })

    return NotificationListResponse(
        unread_count=unread_count,
        notifications=[format_notif_doc(n) for n in items]
    )

@router.patch("/{notif_id}/read", response_model=NotificationResponse)
async def mark_notification_as_read(
    notif_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if not ObjectId.is_valid(notif_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid notification ID.")

    user_id = str(current_user["_id"])
    notif = await db["notifications"].find_one({
        "_id": ObjectId(notif_id),
        "user_id": user_id
    })
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")

    await db["notifications"].update_one(
        {"_id": ObjectId(notif_id)},
        {"$set": {"read": True}}
    )
    notif["read"] = True
    return format_notif_doc(notif)

@router.patch("/read-all", status_code=status.HTTP_200_OK)
async def mark_all_notifications_as_read(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = str(current_user["_id"])
    result = await db["notifications"].update_many(
        {"user_id": user_id, "read": False},
        {"$set": {"read": True}}
    )
    return {"message": "All notifications marked as read", "updated_count": result.modified_count}
