from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class ReviewCreate(BaseModel):
    reviewee_id: str = Field(..., description="Target neighbor ID receiving the review")
    rating: int = Field(..., ge=1, le=5, description="Star rating between 1 and 5")
    comment: str = Field(..., min_length=2, max_length=1000, description="Helpful review comments")
    request_id: Optional[str] = Field(None, description="Optional associated swap request ID")

class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    reviewer_id: str
    reviewer_name: str
    reviewer_avatar: str
    reviewee_id: str
    rating: int
    comment: str
    created_at: str

class ReviewListResponse(BaseModel):
    reviewee_id: str
    rating_avg: float
    rating_count: int
    reviews: List[ReviewResponse]
