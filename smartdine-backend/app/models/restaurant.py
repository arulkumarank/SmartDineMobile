from typing import List, Optional
from pydantic import BaseModel, Field
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def get_validators(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
            return ObjectId(v)
class RestaurantOut(BaseModel):
    id: str = Field(..., alias="id")
    name: str
    cuisine: Optional[str] = None
    avg_price: Optional[int] = None
    city: Optional[str] = None
    rating_avg: Optional[float] = None
    mood_tags: Optional[List[str]] = None
    food_tags: Optional[List[str]] = None

class Config:
    allow_population_by_field_name = True
    arbitrary_types_allowed = True
def restaurant_doc_to_out(doc: dict) -> RestaurantOut:
    return RestaurantOut(
        id=str(doc["_id"]),
        name=doc.get("name", ""),
        cuisine=doc.get("cuisine"),
        avg_price=doc.get("avg_price"),
        city=doc.get("city"),
        rating_avg=doc.get("rating_avg"),
        mood_tags=doc.get("mood_tags"),
        food_tags=doc.get("food_tags"),
    )