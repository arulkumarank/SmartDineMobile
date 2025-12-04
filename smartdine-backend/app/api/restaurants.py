from typing import List, Optional
from fastapi import APIRouter, Query
from app.db.restaurants import list_restaurants
from app.models.restaurant import RestaurantOut

router = APIRouter(prefix="/api/restaurants", tags=["restaurants"])

@router.get("", response_model=List[RestaurantOut])
async def get_restaurants(
    limit: int = Query(20, ge=1, le=100),
    city: Optional[str] = None,
    cuisine: Optional[str] = None,
    mood: Optional[str] = None,
    food_tag: Optional[str] = None,
    ):
    restaurants = await list_restaurants(
    limit=limit,
    city=city,
    cuisine=cuisine,
    mood=mood,
    food_tag=food_tag,
    )
    return restaurants