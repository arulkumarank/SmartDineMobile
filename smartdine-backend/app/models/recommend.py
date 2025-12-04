from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.restaurant import RestaurantOut

class RecommendRequest(BaseModel):
    user_id: Optional[str] = None
    query: str = Field(..., min_length=3)
    city: Optional[str] = None
    limit: int = Field(5, ge=1, le=20)

class ParsedIntent(BaseModel):
    mood: Optional[str] = None
    cuisine_hints: List[str] = []
    budget_max: Optional[int] = None
    food_tags: List[str] = []
    city: Optional[str] = None

class RestaurantRecommendation(RestaurantOut):
    score: float
    explanation: str

class RecommendResponse(BaseModel):
    restaurants: List[RestaurantRecommendation]
    parsed_intent: ParsedIntent