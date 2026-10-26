from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

async def create_notification(
    db: AsyncIOMotorDatabase,
    user_id: str,
    notif_type: str,
    title: str,
    message: str,
    link: str = None
) -> dict:
    notif_doc = {
        "user_id": str(user_id),
        "type": notif_type,
        "title": title,
        "message": message,
        "read": False,
        "link": link,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db["notifications"].insert_one(notif_doc)
    notif_doc["id"] = str(result.inserted_id)
    return notif_doc
