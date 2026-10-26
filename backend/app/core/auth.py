import os
import json
import logging
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from app.core.config import settings
from app.core.database import get_database

logger = logging.getLogger("oporajito.auth")

# Initialize Firebase Admin SDK
_firebase_initialized = False

def initialize_firebase():
    global _firebase_initialized
    if _firebase_initialized:
        return True

    cred_path = settings.FIREBASE_CREDENTIALS_PATH
    if os.path.exists(cred_path):
        try:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            _firebase_initialized = True
            logger.info("Firebase Admin SDK initialized successfully with serviceAccountKey.")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin SDK from {cred_path}: {e}")
            return False
    else:
        logger.info(
            f"Firebase service account file not found at '{cred_path}'. "
            f"Local development mode active (ALLOW_DEV_TOKENS={settings.ALLOW_DEV_TOKENS})."
        )
        return False

# Attempt initialization at import
initialize_firebase()

async def verify_firebase_id_token(id_token: str) -> Dict[str, Any]:
    """
    Verifies Firebase ID token.
    If real Firebase is initialized, calls firebase_auth.verify_id_token.
    If in local dev mode and ALLOW_DEV_TOKENS is enabled, supports test phone numbers.
    """
    if not id_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token is missing."
        )

    # 1. Try real Firebase verification if initialized
    if _firebase_initialized:
        try:
            decoded = firebase_auth.verify_id_token(id_token)
            return {
                "uid": decoded.get("uid"),
                "phone": decoded.get("phone_number") or decoded.get("phone") or "",
                "email": decoded.get("email") or "",
                "auth_time": decoded.get("auth_time")
            }
        except Exception as e:
            logger.warning(f"Firebase token verification failed: {e}")
            # If dev tokens not allowed, fail immediately
            if not settings.ALLOW_DEV_TOKENS:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Invalid Firebase ID token: {str(e)}"
                )

    # 2. Local Dev / Test Phone verification support
    if settings.ALLOW_DEV_TOKENS:
        # Check for simulated dev tokens: e.g. "dev-token-+8801712345678" or test numbers
        # If passed via URL query without %2B encoding, '+' can arrive as ' '
        normalized = id_token.strip()
        if "dev-token- " in normalized:
            normalized = normalized.replace("dev-token- ", "dev-token-+")
        elif normalized.startswith(" "):
            normalized = "+" + normalized.lstrip()

        if normalized.startswith("dev-token-") or normalized.startswith("test-"):
            clean_part = normalized.replace("dev-token-", "").replace("test-", "").strip()
            if not clean_part.startswith("+"):
                if clean_part.startswith("880"):
                    clean_part = "+" + clean_part
                elif clean_part.startswith("01"):
                    clean_part = "+88" + clean_part
            phone = clean_part if clean_part.startswith("+") or clean_part.isdigit() else "+8801712345678"
            uid = f"uid-{phone.replace('+', '')}"
            return {
                "uid": uid,
                "phone": phone,
                "is_dev": True
            }

        # Check if the token passed is directly a phone number
        if normalized.startswith("+88") or normalized.startswith("01"):
            phone = normalized if normalized.startswith("+88") else f"+88{normalized}"
            return {
                "uid": f"uid-{phone.replace('+', '')}",
                "phone": phone,
                "is_dev": True
            }

        # Check if client sent JSON payload formatted token
        try:
            parsed = json.loads(id_token)
            if isinstance(parsed, dict) and "phone" in parsed:
                phone = parsed["phone"]
                return {
                    "uid": parsed.get("uid", f"uid-{phone.replace('+', '')}"),
                    "phone": phone,
                    "is_dev": True
                }
        except Exception:
            pass

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication credentials."
    )

async def get_current_user(
    authorization: Optional[str] = Header(None, description="Bearer <Firebase_ID_Token>"),
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> Dict[str, Any]:
    """
    FastAPI dependency that enforces authentication on protected routes.
    Verifies Bearer token and returns the user document from MongoDB.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header. Expected 'Bearer <token>'"
        )

    token = authorization.split("Bearer ")[1].strip()
    token_data = await verify_firebase_id_token(token)

    uid = token_data["uid"]
    user = await db["users"].find_one({"firebase_uid": uid})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user profile not found. Please complete verification."
        )

    # Convert MongoDB _id to string id
    user["id"] = str(user["_id"])
    return user

async def get_current_user_optional(
    authorization: Optional[str] = Header(None),
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> Optional[Dict[str, Any]]:
    """Optional authentication for public routes that offer enriched data for logged-in users."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        return await get_current_user(authorization, db)
    except HTTPException:
        return None
