from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.database import get_database
from app.core.auth import verify_firebase_id_token
from app.models.user import AuthVerifyRequest, AuthVerifyResponse, UserPrivateResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/verify", response_model=AuthVerifyResponse)
async def verify_auth_token(
    payload: AuthVerifyRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Exchanges Firebase ID token (or dev test token).
    Verifies token with firebase-admin, creates user in MongoDB if new,
    and returns authenticated user data.
    """
    token_data = await verify_firebase_id_token(payload.id_token)
    uid = token_data["uid"]
    phone = payload.phone or token_data.get("phone") or "+8801700000000"

    users_col = db["users"]
    user = await users_col.find_one({"firebase_uid": uid})

    now_iso = datetime.now(timezone.utc).isoformat()

    if not user:
        # Create brand new user record
        new_user_doc = {
            "firebase_uid": uid,
            "phone": phone,
            "name": "",
            "district": "",
            "area": "",
            "avatar": "🧑🏽‍💻",
            "bio": "",
            "teaches": [],
            "wants": [],
            "rating_avg": 5.0,
            "rating_count": 0,
            "blocked_users": [],
            "created_at": now_iso,
            "last_active": now_iso
        }
        res = await users_col.insert_one(new_user_doc)
        new_user_doc["id"] = str(res.inserted_id)
        user_response = UserPrivateResponse(**new_user_doc)
        return AuthVerifyResponse(
            user=user_response,
            is_new_user=True,
            token=payload.id_token
        )

    # Existing user: update last_active timestamp
    await users_col.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_active": now_iso}}
    )
    user["id"] = str(user["_id"])
    user["last_active"] = now_iso

    # Determine if user still needs to complete onboarding
    is_new = bool(not user.get("name") or not user.get("district"))

    user_response = UserPrivateResponse(**user)
    return AuthVerifyResponse(
        user=user_response,
        is_new_user=is_new,
        token=payload.id_token
    )
