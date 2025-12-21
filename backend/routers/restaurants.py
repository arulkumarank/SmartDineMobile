from fastapi import APIRouter, Depends, Query
from typing import Optional
from db import get_restaurant_docs, userdetails_collection
from routers.auth import get_current_user

router = APIRouter(prefix="/restaurants", tags=["restaurants"])

# In-memory cache for AI-sorted restaurants (1 hour TTL)
_restaurant_cache = {}


def calculate_veg_score(restaurant: dict) -> float:
    """Calculate percentage of vegetarian items in menu"""
    menu = restaurant.get("menu", [])
    if not menu:
        return 0
    veg_count = sum(1 for item in menu if item.get("diet", "").lower() == "veg")
    return veg_count / len(menu)


@router.get("")
def get_restaurants():
    """Get all restaurants with location data for map display"""
    try:
        # Get all restaurants from database
        all_docs = get_restaurant_docs()
        # Filter restaurants that have valid location data
        restaurants_with_location = [
            doc for doc in all_docs 
            if doc.get('location') and 
               doc['location'].get('latitude') and 
               doc['location'].get('longitude')
        ]
        return {
            "restaurants": restaurants_with_location, 
            "count": len(restaurants_with_location)
        }
    except Exception as e:
        return {"error": str(e), "restaurants": [], "count": 0}

@router.get("/personalized")
def get_personalized_restaurants(current_user: dict = Depends(get_current_user)):
    """Get restaurants sorted using VECTOR EMBEDDINGS - fast, no token cost"""
    from datetime import datetime
    
    username = current_user["username"]
    
    # Check in-memory cache first (1 hour TTL)
    user_cache = _restaurant_cache.get(username)
    if user_cache:
        cache_time = user_cache.get("timestamp")
        if cache_time and (datetime.utcnow() - cache_time).seconds < 3600:  # 1 hour
            print(f"📦 Using cached restaurant order for {username}")
            return user_cache.get("response", {"restaurants": [], "count": 0})
    
    try:
        # Get user profile
        user_profile = userdetails_collection.find_one({"username": username})
        dietary = user_profile.get("dietary_restrictions", []) if user_profile else []
        tastes = user_profile.get("taste_preferences", []) if user_profile else []
        cuisines = user_profile.get("cuisine_preferences", []) if user_profile else []
        
        # Try vector search first (fastest, no API cost)
        try:
            from services.vector_search import search_restaurants_by_preference, initialize_restaurant_search
            
            # Get all restaurants from database
            all_docs = get_restaurant_docs()
            # Ensure restaurants are indexed
            restaurants = [
                doc for doc in all_docs 
                if doc.get('location') and 
                   doc['location'].get('latitude') and 
                   doc['location'].get('longitude')
            ]
            
            # Initialize if needed (one-time cost)
            initialize_restaurant_search(restaurants)
            
            # Vector similarity search
            sorted_restaurants = search_restaurants_by_preference(dietary, tastes, cuisines)
            
            print(f"🔍 Vector search sorted {len(sorted_restaurants)} restaurants")
            
            response_data = {"restaurants": sorted_restaurants, "count": len(sorted_restaurants)}
            
            # Cache the result
            _restaurant_cache[username] = {
                "timestamp": datetime.utcnow(),
                "response": response_data
            }
            
            return response_data
            
        except Exception as vec_error:
            print(f"⚠️ Vector search failed: {vec_error}, using rule-based")
            return rule_based_sort(current_user)
            
    except Exception as e:
        print(f"⚠️ Personalized restaurants failed: {e}")
        return rule_based_sort(current_user)



def rule_based_sort(current_user: dict):
    """Fallback rule-based sorting when AI is unavailable"""
    user_profile = userdetails_collection.find_one({"username": current_user["username"]})
    dietary_restrictions = user_profile.get("dietary_restrictions", []) if user_profile else []
    cuisine_prefs = user_profile.get("cuisine_preferences", []) if user_profile else []
    
    is_vegan = "vegan" in [d.lower() for d in dietary_restrictions]
    is_vegetarian = "vegetarian" in [d.lower() for d in dietary_restrictions] or is_vegan
    
    # Get all restaurants from database
    all_docs = get_restaurant_docs()
    restaurants = [
        doc for doc in all_docs 
        if doc.get('location') and 
           doc['location'].get('latitude') and 
           doc['location'].get('longitude')
    ]
    
    for restaurant in restaurants:
        score = 0
        if is_vegetarian:
            veg_score = calculate_veg_score(restaurant)
            score += veg_score * 100
            if veg_score >= 0.8:
                score += 50
        
        restaurant_cuisine = restaurant.get("cuisine", "").lower()
        for pref in cuisine_prefs:
            if pref.lower() in restaurant_cuisine:
                score += 20
        
        score += restaurant.get("rating", 3) * 5
        restaurant["_score"] = score
    
    restaurants.sort(key=lambda x: x.get("_score", 0), reverse=True)
    
    for r in restaurants:
        r.pop("_score", None)
    
    return {"restaurants": restaurants, "count": len(restaurants)}
