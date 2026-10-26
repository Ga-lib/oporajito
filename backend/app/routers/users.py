import math
import re
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_database
from app.core.auth import get_current_user, get_current_user_optional
from app.models.user import (
    UserCreateUpdate,
    UserPrivateResponse,
    UserPublicResponse,
    UserSearchResponse,
    UserReportRequest
)

router = APIRouter(prefix="/users", tags=["Users"])

def serialize_user(doc: dict, private: bool = False) -> dict:
    """Helper to convert MongoDB document to response dict, strictly filtering out sensitive fields for public."""
    doc_copy = dict(doc)
    doc_copy["id"] = str(doc_copy.get("_id", doc_copy.get("id", "")))
    if "_id" in doc_copy:
        del doc_copy["_id"]

    if not private:
        doc_copy.pop("phone", None)
        doc_copy.pop("firebase_uid", None)
        doc_copy.pop("blocked_users", None)

    return doc_copy

@router.get("/me", response_model=UserPrivateResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """Returns the authenticated user's complete private profile, including phone number."""
    return UserPrivateResponse(**serialize_user(current_user, private=True))

@router.put("/me", response_model=UserPrivateResponse)
async def update_my_profile(
    payload: UserCreateUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Updates the authenticated user's profile (used for both Onboarding and Edit Profile).
    Strictly validates all inputs via Pydantic.
    """
    users_col = db["users"]
    now_iso = datetime.now(timezone.utc).isoformat()

    update_fields = {
        "name": payload.name.strip(),
        "district": payload.district.strip(),
        "area": payload.area.strip(),
        "avatar": payload.avatar or "🧑🏽‍💻",
        "bio": (payload.bio or "").strip(),
        "teaches": [s.strip() for s in payload.teaches if s.strip()],
        "wants": [s.strip() for s in payload.wants if s.strip()],
        "last_active": now_iso
    }

    await users_col.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": update_fields}
    )

    updated_doc = await users_col.find_one({"_id": ObjectId(current_user["id"])})
    return UserPrivateResponse(**serialize_user(updated_doc, private=True))

@router.get("", response_model=UserSearchResponse)
async def search_and_filter_users(
    q: Optional[str] = Query(None, description="Search term matching name or skill taught"),
    district: Optional[str] = Query(None, description="Filter by Bangladesh district"),
    skill: Optional[str] = Query(None, description="Filter by skill tag taught"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: Optional[dict] = Depends(get_current_user_optional),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Search and filter public neighbor profiles.
    Supports district filtering (all 64 districts), skill tag filter, and text query.
    Never exposes phone numbers.
    """
    users_col = db["users"]
    query_filter: dict = {
        "name": {"$ne": ""}  # Only show onboarded users who completed their profile
    }

    # Hide blocked users if logged in
    if current_user:
        blocked = current_user.get("blocked_users", [])
        if blocked:
            query_filter["_id"] = {"$nin": [ObjectId(b) for b in blocked if ObjectId.is_valid(b)]}

    # District filter
    if district and district.strip() and district.lower() != "all":
        query_filter["district"] = {"$regex": f"^{re.escape(district.strip())}$", "$options": "i"}

    # Skill filter
    if skill and skill.strip():
        query_filter["teaches"] = {"$regex": re.escape(skill.strip()), "$options": "i"}

    # Free text search query
    if q and q.strip():
        search_regex = {"$regex": re.escape(q.strip()), "$options": "i"}
        query_filter["$or"] = [
            {"name": search_regex},
            {"teaches": search_regex},
            {"area": search_regex}
        ]

    total_count = await users_col.count_documents(query_filter)
    skip = (page - 1) * limit

    cursor = users_col.find(query_filter).skip(skip).limit(limit)
    users_list = []
    async for doc in cursor:
        users_list.append(UserPublicResponse(**serialize_user(doc, private=False)))

    total_pages = math.ceil(total_count / limit) if total_count > 0 else 1

    return UserSearchResponse(
        users=users_list,
        total=total_count,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/matches", response_model=List[UserPublicResponse])
async def get_recommended_matches(
    limit: int = Query(10, ge=1, le=50),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Skill-matching algorithm for Oporajito:
    Finds neighbors who teach what the current user wants to learn,
    prioritizing mutual skill swaps (where they also want what you teach!).
    """
    users_col = db["users"]
    current_user_id = ObjectId(current_user["id"])
    my_wants = [w.strip().lower() for w in current_user.get("wants", []) if w.strip()]
    my_teaches = [t.strip().lower() for t in current_user.get("teaches", []) if t.strip()]
    my_district = current_user.get("district", "").strip().lower()
    blocked = [ObjectId(b) for b in current_user.get("blocked_users", []) if ObjectId.is_valid(b)]

    query_filter: dict = {
        "_id": {"$nin": [current_user_id] + blocked},
        "name": {"$ne": ""}
    }

    # Fetch candidate onboarded neighbors
    candidates = await users_col.find(query_filter).to_list(length=100)

    scored_neighbors = []
    for neighbor in candidates:
        neighbor_teaches = [t.strip().lower() for t in neighbor.get("teaches", [])]
        neighbor_wants = [w.strip().lower() for w in neighbor.get("wants", [])]
        neighbor_district = neighbor.get("district", "").strip().lower()

        # Check if neighbor teaches anything current user wants
        teach_matches = []
        for want in my_wants:
            for n_teach in neighbor_teaches:
                if want in n_teach or n_teach in want:
                    teach_matches.append(n_teach)

        # Check if current user teaches anything neighbor wants (reciprocal swap)
        reciprocal_matches = []
        for teach in my_teaches:
            for n_want in neighbor_wants:
                if teach in n_want or n_want in teach:
                    reciprocal_matches.append(n_want)

        score = 0
        if teach_matches:
            score += 50 * len(teach_matches)
        if reciprocal_matches:
            score += 100 * len(reciprocal_matches)  # High bonus for mutual exchange!
        if neighbor_district == my_district and my_district:
            score += 20  # Proximity bonus for same district

        # If user has no specific wants set yet, show neighbors in their district or with top ratings
        if not my_wants and neighbor_district == my_district:
            score += 10

        if score > 0 or not my_wants:
            scored_neighbors.append((score, neighbor))

    # Sort descending by match score
    scored_neighbors.sort(key=lambda x: x[0], reverse=True)
    top_matches = [doc for _, doc in scored_neighbors[:limit]]

    return [UserPublicResponse(**serialize_user(doc, private=False)) for doc in top_matches]

@router.get("/{user_id}", response_model=UserPublicResponse)
async def get_user_public_profile(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Returns public profile of a user.
    Strictly excludes phone number and private identification credentials.
    """
    users_col = db["users"]
    target = None

    if ObjectId.is_valid(user_id):
        target = await users_col.find_one({"_id": ObjectId(user_id)})

    if not target:
        target = await users_col.find_one({"firebase_uid": user_id})

    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID '{user_id}' not found."
        )

    return UserPublicResponse(**serialize_user(target, private=False))

@router.post("/{user_id}/block")
async def block_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Blocks another user so they no longer appear in search feed or chats."""
    if str(current_user["_id"]) == user_id:
        raise HTTPException(status_code=400, detail="You cannot block yourself.")

    await db["users"].update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$addToSet": {"blocked_users": user_id}}
    )
    return {"status": "success", "message": f"User {user_id} blocked successfully."}

@router.post("/{user_id}/report")
async def report_user(
    user_id: str,
    payload: UserReportRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Submits a safety/moderation report against another user."""
    reports_col = db["reports"]
    report_doc = {
        "reporter_id": current_user["id"],
        "target_user_id": user_id,
        "reason": payload.reason,
        "details": payload.details,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "pending_review"
    }
    await reports_col.insert_one(report_doc)
    return {"status": "success", "message": "Report submitted for community review."}
