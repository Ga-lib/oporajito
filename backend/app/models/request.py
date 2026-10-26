from typing import Optional, List, Literal
from datetime import datetime, timezone
from pydantic import BaseModel, Field, ConfigDict

RequestStatus = Literal["pending", "accepted", "declined", "completed", "cancelled"]

class SkillRequestCreate(BaseModel):
    to_user_id: str = Field(..., description="Target neighbor ID to swap skills with")
    skill: str = Field(..., min_length=1, max_length=100, description="The skill to learn from the neighbor")
    offered_skill: Optional[str] = Field(None, max_length=100, description="The skill the requester offers in exchange")
    message: Optional[str] = Field("", max_length=500, description="Friendly message introducing the request")

class SkillRequestStatusUpdate(BaseModel):
    status: Literal["accepted", "declined", "completed", "cancelled"] = Field(
        ..., description="New status for the swap request"
    )

class SkillRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    from_user_id: str
    from_user_name: str
    from_user_avatar: str
    from_user_area: str
    to_user_id: str
    to_user_name: str
    to_user_avatar: str
    to_user_area: str
    skill: str
    offered_skill: Optional[str] = None
    message: str = ""
    status: RequestStatus
    created_at: str
    updated_at: str

class SkillRequestListResponse(BaseModel):
    total: int
    page: int
    limit: int
    requests: List[SkillRequestResponse]
