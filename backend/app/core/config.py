import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    PROJECT_NAME: str = "Oporajito"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "127.0.0.1"

    # MongoDB URI (defaults to local MongoDB server on port 27017)
    MONGODB_URI: str = "mongodb://127.0.0.1:27017"
    MONGODB_DB_NAME: str = "oporajito_db"

    # Firebase Admin SDK Credentials
    FIREBASE_CREDENTIALS_PATH: str = "./serviceAccountKey.json"

    # Allow local development test tokens when serviceAccountKey is not yet downloaded
    ALLOW_DEV_TOKENS: bool = True

    # CORS Allowed Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

settings = Settings()
