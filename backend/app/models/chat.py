from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class MessageCreate(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000, description="Chat message body")

class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    conversation_id: str
    sender_id: str
    text: str
    created_at: str

class MessageListResponse(BaseModel):
    conversation_id: str
    total: int
    messages: List[MessageResponse]

class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    participant_id: str
    name: str
    avatar: str
    area: str
    skill_topic: str
    last_message: str
    last_message_at: str
    unread: int = 0

class ConversationListResponse(BaseModel):
    total: int
    conversations: List[ConversationResponse]
