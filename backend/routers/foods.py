from fastapi import APIRouter, Query
from typing import Optional

from db import foods_collection

router = APIRouter(prefix="/foods", tags=["foods"])


@router.get("")
async def get_foods(
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    high_protein: Optional[bool] = Query(None, description="High protein (>20g)"),
    high_fiber: Optional[bool] = Query(None, description="High fiber (>5g)"),
    gluten_free: Optional[bool] = Query(None, description="Gluten-free"),
    vegetarian: Optional[bool] = Query(None, description="Vegetarian"),
    taste: Optional[str] = Query(None, description="Taste preference: modern, comfort, traditional")
):
    """Get all foods with optional filters"""
    
    query = {}
    
    # Price filters
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price
    
    # Nutritional filters
    if high_protein:
        query["nutritional_info.protein"] = {"$gte": 20}
    
    if high_fiber:
        query["nutritional_info.fiber"] = {"$gte": 5}
    
    if gluten_free:
        query["is_gluten_free"] = True
    
    if vegetarian:
        query["is_vegetarian"] = True
    
    # Taste preference filter
    if taste:
        query["tags"] = taste.lower()
    
    foods = list(foods_collection.find(query, {"_id": 0}))
    
    return {"foods": foods, "count": len(foods)}


@router.get("/{food_id}")
async def get_food_by_id(food_id: str):
    """Get food details by ID"""
    food = foods_collection.find_one({"_id": food_id}, {"_id": 0})
    
    if not food:
        return {"error": "Food not found"}
    
    return food
