from fastapi import APIRouter, HTTPException, Depends, status

from models import UserProfile, UserProfileUpdate
from db import userdetails_collection, search_history_collection, restaurant_cache
from routers.auth import get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=UserProfile)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get user profile with email from auth collection"""
    profile = userdetails_collection.find_one(
        {"username": current_user["username"]},
        {"_id": 0}
    )
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Get email from current_user (which comes from auth collection)
    # OPTIMIZED: Email no longer duplicated in userdetails
    return {
        "username": profile.get("username"),
        "name": profile.get("name", ""),
        "email": current_user.get("email", ""),  # From auth collection
        "taste_preference": profile.get("taste_preference"),
        "taste_preferences": profile.get("taste_preferences", []),
        "cuisine_preferences": profile.get("cuisine_preferences", []),
        "dietary_restrictions": profile.get("dietary_restrictions", []),
    }


@router.put("")
async def update_profile(
    profile_update: UserProfileUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update user profile with new preference fields"""
    update_data = profile_update.dict(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Update in database
    result = userdetails_collection.update_one(
        {"username": current_user["username"]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # CACHE INVALIDATION: Clear cached restaurant order when preferences change
    preference_fields = ["dietary_restrictions", "cuisine_preferences", "taste_preferences"]
    if any(field in update_data for field in preference_fields):
        restaurant_cache.delete_one({"username": current_user["username"]})
        print(f"🗑️ Cleared restaurant cache for {current_user['username']} - preferences changed")
    
    # Return updated profile with email from auth collection
    updated_user = userdetails_collection.find_one({"username": current_user["username"]})
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")

    # OPTIMIZED: Get email from auth collection
    return {
        "username": updated_user.get("username"),
        "name": updated_user.get("name", ""),
        "email": current_user.get("email", ""),  # From auth collection
        "taste_preference": updated_user.get("taste_preference"),
        "taste_preferences": updated_user.get("taste_preferences", []),
        "cuisine_preferences": updated_user.get("cuisine_preferences", []),
        "dietary_restrictions": updated_user.get("dietary_restrictions", []),
    }


@router.get("/history")
async def get_search_history(current_user: dict = Depends(get_current_user)):
    """Get user's search history"""
    history = list(search_history_collection.find(
        {"user_id": current_user["username"]},
        {"_id": 0}
    ).sort("timestamp", -1).limit(10))
    
    return {"history": history}
