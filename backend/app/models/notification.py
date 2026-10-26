from typing import Optional, List, Literal
from pydantic import BaseModel, Field, ConfigDict

NotificationType = Literal[
    "request_received",
    "request_accepted",
    "request_declined",
    "request_completed",
    "new_message",
    "review_received"
]

class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    type: NotificationType
    title: str
    message: str
    read: bool = False
    link: Optional[str] = None
    created_at: str

class NotificationListResponse(BaseModel):
    unread_count: int
    notifications: List[NotificationResponse]
