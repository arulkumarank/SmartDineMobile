"""
Feedback Router - Endpoints for tracking user interactions and ratings
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List

from routers.auth import get_current_user
from services.rl_recommender import (
    record_interaction,
    record_rating,
    get_surprise_recommendations,
    get_top_rated_foods,
    get_collaborative_recommendations,
    get_user_clicked_foods
)
from db import food_scores

router = APIRouter(prefix="/feedback", tags=["feedback"])


# Request Models
class ClickRequest(BaseModel):
    food_name: str
    restaurant_name: Optional[str] = None


class CartRequest(BaseModel):
    food_name: str
    restaurant_name: Optional[str] = None


class RateRequest(BaseModel):
    food_name: str
    rating: int  # 1-5
    restaurant_name: Optional[str] = None


# Endpoints
@router.post("/click")
async def track_click(data: ClickRequest, current_user: dict = Depends(get_current_user)):
    """Record when user clicks/views a food item"""
    record_interaction(
        username=current_user["username"],
        food_name=data.food_name,
        action="click"
    )
    return {"message": "Click recorded", "food": data.food_name}


@router.post("/cart")
async def track_cart_add(data: CartRequest, current_user: dict = Depends(get_current_user)):
    """Record when user adds a food item to cart"""
    record_interaction(
        username=current_user["username"],
        food_name=data.food_name,
        action="cart"
    )
    return {"message": "Cart add recorded", "food": data.food_name}


@router.post("/rate")
async def rate_food(data: RateRequest, current_user: dict = Depends(get_current_user)):
    """Record user rating for a food item (1-5 stars)"""
    if data.rating < 1 or data.rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5"
        )
    
    record_rating(
        username=current_user["username"],
        food_name=data.food_name,
        rating=data.rating,
        restaurant_name=data.restaurant_name
    )
    return {"message": "Rating recorded", "food": data.food_name, "rating": data.rating}


@router.get("/surprise")
async def get_surprise(current_user: dict = Depends(get_current_user)):
    """
    Get surprise recommendations:
    - Foods matching user preferences
    - Foods user hasn't clicked before
    - Sorted by rating and RL scores
    """
    recommendations = get_surprise_recommendations(
        username=current_user["username"],
        limit=5
    )
    return {"surprise_foods": recommendations}


@router.get("/top-rated")
async def get_top_rated(limit: int = 10):
    """Get top rated foods across all users"""
    top_foods = get_top_rated_foods(limit)
    return {"top_rated": top_foods}


@router.get("/for-you")
async def get_personalized(current_user: dict = Depends(get_current_user)):
    """
    Get personalized recommendations based on:
    - Collaborative filtering (similar users)
    - User's taste preferences
    - Foods not yet tried
    """
    # Get collaborative recommendations
    collab_recs = get_collaborative_recommendations(
        username=current_user["username"],
        limit=5
    )
    
    # Get surprise recommendations
    surprise_recs = get_surprise_recommendations(
        username=current_user["username"],
        limit=5
    )
    
    return {
        "similar_users_liked": collab_recs,
        "surprise_for_you": surprise_recs
    }


@router.get("/my-history")
async def get_my_history(current_user: dict = Depends(get_current_user)):
    """Get foods the user has interacted with"""
    clicked = get_user_clicked_foods(current_user["username"])
    return {"clicked_foods": clicked, "count": len(clicked)}


@router.get("/food-score/{food_name}")
async def get_food_score(food_name: str):
    """Get RL score and rating for a specific food"""
    score = food_scores.find_one(
        {"food_name": food_name},
        {"_id": 0}
    )
    if not score:
        return {"food_name": food_name, "rl_score": 0, "avg_rating": 0}
    return score
