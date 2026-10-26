from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field, ConfigDict

class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full name of the user")
    district: str = Field(..., min_length=2, max_length=60, description="District in Bangladesh")
    area: str = Field(..., min_length=2, max_length=100, description="Neighborhood, Thana, or Area")
    avatar: str = Field(default="🧑🏽‍💻", description="Avatar emoji or image identifier")
    bio: str = Field(default="", max_length=500, description="Short bio introducing skills and hobbies")
    teaches: List[str] = Field(default_factory=list, description="Skills the user can teach to neighbors")
    wants: List[str] = Field(default_factory=list, description="Skills the user wants to learn")

class UserCreateUpdate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    district: str = Field(..., min_length=2, max_length=60)
    area: str = Field(..., min_length=2, max_length=100)
    avatar: Optional[str] = "🧑🏽‍💻"
    bio: Optional[str] = ""
    teaches: List[str] = Field(default_factory=list)
    wants: List[str] = Field(default_factory=list)

# Public view: NEVER exposes phone or firebase_uid to other users
class UserPublicResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    avatar: str
    bio: str
    district: str
    area: str
    teaches: List[str]
    wants: List[str]
    rating_avg: float = 5.0
    rating_count: int = 0
    created_at: str
    last_active: str

# Private view: strictly for the authenticated user themselves (/users/me)
class UserPrivateResponse(UserPublicResponse):
    phone: str
    firebase_uid: str

class AuthVerifyRequest(BaseModel):
    id_token: str = Field(..., description="Firebase ID Token or local dev test token")
    phone: Optional[str] = Field(None, description="Optional phone number for local testing")

class AuthVerifyResponse(BaseModel):
    user: UserPrivateResponse
    is_new_user: bool
    token: str

class UserSearchResponse(BaseModel):
    users: List[UserPublicResponse]
    total: int
    page: int
    limit: int
    total_pages: int

class UserReportRequest(BaseModel):
    reason: str = Field(..., min_length=2, max_length=100)
    details: Optional[str] = Field("", max_length=500)
