from fastapi import APIRouter, Query
from typing import Optional

from db import collection as restaurants_collection, foods_collection

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
    """Get all foods from restaurant menus with optional filters"""
    
    # Get all restaurants
    restaurants = list(restaurants_collection.find({}, {"_id": 0}))
    
    # Extract all food items from restaurant menus
    all_foods = []
    for restaurant in restaurants:
        if "menu" in restaurant and restaurant["menu"]:
            for menu_item in restaurant["menu"]:
                # Enrich menu item with restaurant data
                food_item = {
                    "name": menu_item.get("name", "Unknown"),
                    "restaurant": restaurant.get("name", "Unknown Restaurant"),
                    "price": menu_item.get("price", 0),
                    "image": menu_item.get("image", restaurant.get("image")),
                    "cuisine": restaurant.get("cuisine", ""),
                    "rating": restaurant.get("rating", 4.0),
                    # Add nutritional info if available
                    "nutritional_info": menu_item.get("nutritional_info", {}),
                    "is_vegetarian": menu_item.get("diet") == "veg" or menu_item.get("is_vegetarian", False),
                    "is_vegan": menu_item.get("is_vegan", False),
                    "is_gluten_free": menu_item.get("is_gluten_free", False),
                    "tags": menu_item.get("tags", []),
                    "spicy": menu_item.get("spicy"),
                    "diet": menu_item.get("diet"),
                }
                all_foods.append(food_item)
    
    # Apply filters
    filtered_foods = all_foods
    
    # Price filters
    if min_price is not None:
        filtered_foods = [f for f in filtered_foods if f["price"] >= min_price]
    if max_price is not None:
        filtered_foods = [f for f in filtered_foods if f["price"] <= max_price]
    
    # Nutritional filters
    if high_protein:
        filtered_foods = [f for f in filtered_foods if f.get("nutritional_info", {}).get("protein", 0) >= 20]
    
    if high_fiber:
        filtered_foods = [f for f in filtered_foods if f.get("nutritional_info", {}).get("fiber", 0) >= 5]
    
    if gluten_free:
        filtered_foods = [f for f in filtered_foods if f.get("is_gluten_free")]
    
    if vegetarian:
        filtered_foods = [f for f in filtered_foods if f.get("is_vegetarian")]
    
    # Taste preference filter
    if taste:
        filtered_foods = [f for f in filtered_foods if taste.lower() in f.get("tags", [])]
    
    return {"foods": filtered_foods, "count": len(filtered_foods)}


@router.get("/featured")
async def get_featured_foods():
    """Get featured food items: highest protein, fiber, best value, and spiciest"""
    
    # Get all restaurants
    restaurants = list(restaurants_collection.find({}, {"_id": 0}))
    
    # Extract all food items
    all_foods = []
    for restaurant in restaurants:
        if "menu" in restaurant and restaurant["menu"]:
            for menu_item in restaurant["menu"]:
                food_item = {
                    "name": menu_item.get("name", "Unknown"),
                    "restaurant": restaurant.get("name", "Unknown Restaurant"),
                    "price": menu_item.get("price", 0),
                    "image": menu_item.get("image", restaurant.get("image")),
                    "cuisine": restaurant.get("cuisine", ""),
                    "rating": restaurant.get("rating", 4.0),
                    "nutritional_info": menu_item.get("nutritional_info", {}),
                    "is_vegetarian": menu_item.get("diet") == "veg" or menu_item.get("is_vegetarian", False),
                    "spicy": menu_item.get("spicy"),
                    "diet": menu_item.get("diet"),
                    "tags": menu_item.get("tags", []),
                }
                all_foods.append(food_item)
    
    # Find featured items
    
    # Highest protein (top 3)
    highest_protein = sorted(
        all_foods, 
        key=lambda x: x.get("nutritional_info", {}).get("protein", 0), 
        reverse=True
    )[:3]
    
    # Highest fiber (top 3)
    highest_fiber = sorted(
        all_foods, 
        key=lambda x: x.get("nutritional_info", {}).get("fiber", 0), 
        reverse=True
    )[:3]
    
    # Best value - lowest price (top 5)
    best_value = sorted(
        all_foods, 
        key=lambda x: x.get("price", 999), 
        reverse=False
    )[:5]
    
    # Spiciest items
    spiciest = [f for f in all_foods if f.get("spicy") == "hot"][:5]
    
    return {
        "highest_protein": highest_protein,
        "highest_fiber": highest_fiber,
        "best_value": best_value,
        "spiciest": spiciest
    }


@router.get("/{food_id}")
async def get_food_by_id(food_id: str):
    """Get food details by ID"""
    food = foods_collection.find_one({"_id": food_id}, {"_id": 0})
    
    if not food:
        return {"error": "Food not found"}
    
    return food
