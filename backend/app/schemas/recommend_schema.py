
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class BookmarkBasedRecommendRequest(BaseModel):
    user_id: int
    place_type: Optional[int] = None
    top_k_per_bookmark: int = 5

class RecommendedItem(BaseModel):
    place_type: int
    reference_id: int
    name: str
    address: Optional[str] = None
    image_url: Optional[str] = None
    score: float
    extra: Optional[dict] = None

class BookmarkBasedRecommendResponse(BaseModel):
    user_id: int
    total_count: int
    items: List[RecommendedItem]
    
    

