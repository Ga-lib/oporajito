import logging
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_database
from app.core.auth import get_current_user
from app.models.review import (
    ReviewCreate,
    ReviewResponse,
    ReviewListResponse
)
from app.services.notification_service import create_notification

logger = logging.getLogger("oporajito.reviews")
router = APIRouter(tags=["reviews"])

def format_review_doc(doc: dict) -> ReviewResponse:
    return ReviewResponse(
        id=str(doc.get("_id", doc.get("id", ""))),
        reviewer_id=str(doc.get("reviewer_id", "")),
        reviewer_name=doc.get("reviewer_name", "Neighbor"),
        reviewer_avatar=doc.get("reviewer_avatar", "🧑🏽‍💻"),
        reviewee_id=str(doc.get("reviewee_id", "")),
        rating=int(doc.get("rating", 5)),
        comment=doc.get("comment", ""),
        created_at=doc.get("created_at", datetime.now(timezone.utc).isoformat())
    )

@router.post("/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def submit_review(
    payload: ReviewCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Submits a 1-5 star review and testimonial for a completed skill swap.
    Recalculates neighbor's average rating in MongoDB and notifies them.
    """
    reviewer_id = str(current_user["_id"])
    reviewee_id = payload.reviewee_id.strip()

    if reviewer_id == reviewee_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot write a review for yourself."
        )

    if not ObjectId.is_valid(reviewee_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid recipient neighbor ID."
        )

    target_user = await db["users"].find_one({"_id": ObjectId(reviewee_id)})
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target neighbor not found."
        )

    now_iso = datetime.now(timezone.utc).isoformat()
    reviewer_name = current_user.get("name") or "A Neighbor"
    reviewer_avatar = current_user.get("avatar") or "🧑🏽‍💻"

    review_doc = {
        "reviewer_id": reviewer_id,
        "reviewer_name": reviewer_name,
        "reviewer_avatar": reviewer_avatar,
        "reviewee_id": reviewee_id,
        "rating": payload.rating,
        "comment": payload.comment.strip(),
        "request_id": payload.request_id,
        "created_at": now_iso
    }

    result = await db["reviews"].insert_one(review_doc)
    review_doc["_id"] = result.inserted_id

    # Recalculate rating average and total count for reviewee
    all_reviews = await db["reviews"].find({"reviewee_id": reviewee_id}).to_list(length=1000)
    total_reviews = len(all_reviews)
    if total_reviews > 0:
        avg_score = round(sum(r["rating"] for r in all_reviews) / total_reviews, 1)
    else:
        avg_score = 5.0

    await db["users"].update_one(
        {"_id": ObjectId(reviewee_id)},
        {"$set": {"rating_avg": avg_score, "rating_count": total_reviews}}
    )

    # Trigger in-app notification for reviewee
    await create_notification(
        db=db,
        user_id=reviewee_id,
        notif_type="review_received",
        title=f"New {payload.rating}★ Review!",
        message=f"{reviewer_name} gave you a {payload.rating}-star review: \"{payload.comment[:60]}\"",
        link=f"/profile/{reviewee_id}"
    )

    return format_review_doc(review_doc)

@router.get("/users/{user_id}/reviews", response_model=ReviewListResponse)
async def get_user_reviews(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Public endpoint retrieving all reviews, ratings, and testimonials for a neighbor.
    """
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID format.")

    target_user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    cursor = db["reviews"].find({"reviewee_id": user_id}).sort("created_at", -1)
    reviews_list = await cursor.to_list(length=100)

    rating_avg = float(target_user.get("rating_avg", 5.0))
    rating_count = int(target_user.get("rating_count", len(reviews_list)))

    return ReviewListResponse(
        reviewee_id=user_id,
        rating_avg=rating_avg,
        rating_count=rating_count,
        reviews=[format_review_doc(r) for r in reviews_list]
    )
