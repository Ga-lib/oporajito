import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = logging.getLogger("oporajito.database")

class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

db_instance = Database()

def get_database() -> AsyncIOMotorDatabase:
    if db_instance.client is None:
        db_instance.client = AsyncIOMotorClient(settings.MONGODB_URI)
        db_instance.db = db_instance.client[settings.MONGODB_DB_NAME]
    return db_instance.db

async def connect_to_mongo():
    logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
    db_instance.client = AsyncIOMotorClient(settings.MONGODB_URI)
    db_instance.db = db_instance.client[settings.MONGODB_DB_NAME]
    logger.info(f"Connected to database: {settings.MONGODB_DB_NAME}")

    # Create Indexes as specified in prompt
    try:
        users_col = db_instance.db["users"]
        # Unique index on firebase_uid
        await users_col.create_index("firebase_uid", unique=True)
        # Index on users.district
        await users_col.create_index("district")
        # Multikey index on users.teaches
        await users_col.create_index("teaches")
        # Text search index on name and teaches
        await users_col.create_index([("name", "text"), ("teaches", "text")], name="name_teaches_text_idx")

        # Requests collection indexes
        requests_col = db_instance.db["skill_requests"]
        await requests_col.create_index("from_user_id")
        await requests_col.create_index("to_user_id")
        await requests_col.create_index("status")

        # Conversations indexes
        convo_col = db_instance.db["conversations"]
        await convo_col.create_index("participant_ids")

        # Messages index: messages.conversation_id + created_at
        messages_col = db_instance.db["messages"]
        await messages_col.create_index([("conversation_id", 1), ("created_at", 1)])

        # Notifications index: notifications.user_id + read
        notif_col = db_instance.db["notifications"]
        await notif_col.create_index([("user_id", 1), ("read", 1)])

        logger.info("MongoDB collections and required indexes initialized successfully.")
    except Exception as e:
        logger.warning(f"Note on creating indexes: {e}")

async def close_mongo_connection():
    if db_instance.client:
        logger.info("Closing MongoDB connection...")
        db_instance.client.close()
        db_instance.client = None
        db_instance.db = None
        logger.info("MongoDB connection closed.")
