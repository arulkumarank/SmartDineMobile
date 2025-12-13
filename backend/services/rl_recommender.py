"""
RL Recommender Service
Implements Q-Learning and Collaborative Filtering for food recommendations
"""
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from db import user_interactions, food_ratings, food_scores, userdetails_collection, collection

# Reward values
REWARD_CLICK = 1
REWARD_CART = 3
REWARD_RATING_MULTIPLIER = 2  # rating * 2

# Q-Learning parameters
LEARNING_RATE = 0.1  # alpha
DECAY_DAYS = 30  # interactions older than this decay


def record_interaction(username: str, food_name: str, action: str, value: float = 1.0):
    """
    Record user interaction with a food item
    Actions: 'click', 'cart', 'rate'
    """
    interaction = {
        "username": username,
        "food_name": food_name,
        "action": action,
        "value": value,
        "timestamp": datetime.utcnow()
    }
    user_interactions.insert_one(interaction)
    
    # Calculate reward based on action
    if action == "click":
        reward = REWARD_CLICK
    elif action == "cart":
        reward = REWARD_CART
    elif action == "rate":
        reward = value * REWARD_RATING_MULTIPLIER
    else:
        reward = 1
    
    # Update Q-score for this food
    update_food_score(food_name, reward)
    
    return interaction


def record_rating(username: str, food_name: str, rating: int, restaurant_name: str = None):
    """
    Record user rating for a food item (1-5 stars)
    """
    # Upsert rating (one rating per user per food)
    food_ratings.update_one(
        {"username": username, "food_name": food_name},
        {
            "$set": {
                "rating": rating,
                "restaurant_name": restaurant_name,
                "timestamp": datetime.utcnow()
            }
        },
        upsert=True
    )
    
    # Record as interaction for RL
    record_interaction(username, food_name, "rate", rating)
    
    # Recalculate food average rating
    recalculate_food_rating(food_name)
    
    # Recalculate restaurant rating if provided
    if restaurant_name:
        recalculate_restaurant_rating(restaurant_name)


def recalculate_food_rating(food_name: str):
    """
    Recalculate average rating for a food item
    """
    pipeline = [
        {"$match": {"food_name": food_name}},
        {"$group": {"_id": "$food_name", "avg_rating": {"$avg": "$rating"}, "count": {"$sum": 1}}}
    ]
    result = list(food_ratings.aggregate(pipeline))
    
    if result:
        avg_rating = result[0]["avg_rating"]
        count = result[0]["count"]
        
        food_scores.update_one(
            {"food_name": food_name},
            {
                "$set": {
                    "avg_rating": round(avg_rating, 2),
                    "rating_count": count,
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )


def recalculate_restaurant_rating(restaurant_name: str):
    """
    Recalculate restaurant rating from food ratings average
    """
    pipeline = [
        {"$match": {"restaurant_name": restaurant_name}},
        {"$group": {"_id": "$restaurant_name", "avg_rating": {"$avg": "$rating"}, "count": {"$sum": 1}}}
    ]
    result = list(food_ratings.aggregate(pipeline))
    
    if result:
        avg_rating = result[0]["avg_rating"]
        count = result[0]["count"]
        
        # Update restaurant in main collection
        collection.update_one(
            {"name": restaurant_name},
            {
                "$set": {
                    "user_rating": round(avg_rating, 2),
                    "rating_count": count
                }
            }
        )


def update_food_score(food_name: str, reward: float):
    """
    Update Q-score for a food using Q-Learning
    Q(food) = Q(food) + α(reward - Q(food))
    """
    # Get current score
    current = food_scores.find_one({"food_name": food_name})
    current_score = current.get("rl_score", 0) if current else 0
    
    # Q-Learning update
    new_score = current_score + LEARNING_RATE * (reward - current_score / 10)
    
    food_scores.update_one(
        {"food_name": food_name},
        {
            "$set": {"rl_score": round(new_score, 3), "updated_at": datetime.utcnow()},
            "$inc": {"interaction_count": 1}
        },
        upsert=True
    )


def get_user_clicked_foods(username: str) -> List[str]:
    """
    Get list of food names the user has clicked/interacted with
    """
    interactions = user_interactions.find(
        {"username": username},
        {"food_name": 1}
    )
    return list(set(i["food_name"] for i in interactions))


def get_similar_users(username: str, limit: int = 5) -> List[str]:
    """
    Find users with similar taste preferences (collaborative filtering)
    """
    # Get current user's preferences
    user_profile = userdetails_collection.find_one({"username": username})
    if not user_profile:
        return []
    
    user_tastes = set(user_profile.get("taste_preferences", []))
    user_cuisines = set(user_profile.get("cuisine_preferences", []))
    
    if not user_tastes and not user_cuisines:
        return []
    
    # Find other users with similar preferences
    similar_users = []
    all_profiles = userdetails_collection.find(
        {"username": {"$ne": username}},
        {"username": 1, "taste_preferences": 1, "cuisine_preferences": 1}
    )
    
    for profile in all_profiles:
        other_tastes = set(profile.get("taste_preferences", []))
        other_cuisines = set(profile.get("cuisine_preferences", []))
        
        # Calculate similarity score (Jaccard index)
        taste_similarity = len(user_tastes & other_tastes) / max(len(user_tastes | other_tastes), 1)
        cuisine_similarity = len(user_cuisines & other_cuisines) / max(len(user_cuisines | other_cuisines), 1)
        
        total_similarity = (taste_similarity + cuisine_similarity) / 2
        if total_similarity > 0.3:  # Threshold
            similar_users.append((profile["username"], total_similarity))
    
    # Sort by similarity and return top N
    similar_users.sort(key=lambda x: x[1], reverse=True)
    return [u[0] for u in similar_users[:limit]]


def get_collaborative_recommendations(username: str, limit: int = 10) -> List[str]:
    """
    Get food recommendations based on what similar users liked
    """
    similar_users = get_similar_users(username)
    if not similar_users:
        return []
    
    # Get foods that similar users liked (rated 4+)
    liked_foods = food_ratings.find({
        "username": {"$in": similar_users},
        "rating": {"$gte": 4}
    })
    
    # Get user's already-clicked foods to exclude
    user_clicked = set(get_user_clicked_foods(username))
    
    # Return foods the user hasn't tried
    recommendations = []
    for rating in liked_foods:
        if rating["food_name"] not in user_clicked:
            recommendations.append(rating["food_name"])
    
    return list(set(recommendations))[:limit]


def get_surprise_recommendations(username: str, limit: int = 5) -> List[Dict]:
    """
    Get surprise recommendations:
    - Match user preferences
    - Exclude foods user has clicked
    - Respect dietary restrictions (vegan, vegetarian, etc.)
    - Prioritize high-rated foods
    """
    # Get user profile
    user_profile = userdetails_collection.find_one({"username": username})
    user_tastes = user_profile.get("taste_preferences", []) if user_profile else []
    user_cuisines = user_profile.get("cuisine_preferences", []) if user_profile else []
    dietary_restrictions = user_profile.get("dietary_restrictions", []) if user_profile else []
    
    # Check if user has vegan/vegetarian restrictions
    is_vegan = "vegan" in [d.lower() for d in dietary_restrictions]
    is_vegetarian = "vegetarian" in [d.lower() for d in dietary_restrictions] or is_vegan
    
    # Get foods user has clicked
    clicked_foods = set(get_user_clicked_foods(username))
    
    # Get all restaurants with menus
    restaurants = list(collection.find({}, {"_id": 0}))
    
    # Score all foods
    scored_foods = []
    for restaurant in restaurants:
        restaurant_name = restaurant.get("name", "")
        restaurant_cuisine = restaurant.get("cuisine", "").lower()
        
        for item in restaurant.get("menu", []):
            food_name = item.get("name", "")
            food_diet = item.get("diet", "").lower()
            
            # Skip if user has clicked this
            if food_name in clicked_foods:
                continue
            
            # IMPORTANT: Respect dietary restrictions
            if is_vegetarian and food_diet != "veg":
                continue  # Skip non-veg items for vegetarian/vegan users
            
            # Calculate preference match score
            score = 0
            tags = [t.lower() for t in item.get("tags", [])]
            
            # Cuisine match
            if any(c.lower() in restaurant_cuisine for c in user_cuisines):
                score += 3
            
            # Taste match
            for taste in user_tastes:
                if taste.lower() in tags or taste.lower() in food_name.lower():
                    score += 2
            
            # Base rating
            score += item.get("rating", 3)
            
            # Get RL score if exists
            food_score_doc = food_scores.find_one({"food_name": food_name})
            if food_score_doc:
                score += food_score_doc.get("rl_score", 0) * 0.5
                score += food_score_doc.get("avg_rating", 0)
            
            if score > 0:
                scored_foods.append({
                    "name": food_name,
                    "restaurant": restaurant_name,
                    "cuisine": restaurant_cuisine,
                    "price": item.get("price", 0),
                    "score": score,
                    "is_vegetarian": food_diet == "veg"
                })
    
    # Sort by score and return top N
    scored_foods.sort(key=lambda x: x["score"], reverse=True)
    return scored_foods[:limit]


def get_top_rated_foods(limit: int = 10) -> List[Dict]:
    """
    Get top rated foods across all users
    """
    top_foods = list(food_scores.find(
        {"avg_rating": {"$exists": True, "$gt": 0}},
        {"_id": 0}
    ).sort("avg_rating", -1).limit(limit))
    
    return top_foods


def get_food_ranking(foods: List[Dict], username: str = None) -> List[Dict]:
    """
    Rank foods by: Rating > User Preferences > RL Score
    """
    user_profile = None
    user_tastes = []
    user_cuisines = []
    
    if username:
        user_profile = userdetails_collection.find_one({"username": username})
        if user_profile:
            user_tastes = [t.lower() for t in user_profile.get("taste_preferences", [])]
            user_cuisines = [c.lower() for c in user_profile.get("cuisine_preferences", [])]
    
    for food in foods:
        food_name = food.get("name", "")
        cuisine = food.get("cuisine", "").lower()
        tags = [t.lower() for t in food.get("tags", [])]
        
        # Get stored scores
        score_doc = food_scores.find_one({"food_name": food_name})
        
        # Priority 1: Rating
        rating_score = 0
        if score_doc and score_doc.get("avg_rating"):
            rating_score = score_doc["avg_rating"] * 10
        elif food.get("rating"):
            rating_score = food["rating"] * 10
        
        # Priority 2: User preferences
        pref_score = 0
        if any(c in cuisine for c in user_cuisines):
            pref_score += 5
        for taste in user_tastes:
            if taste in tags or taste in food_name.lower():
                pref_score += 3
        
        # Priority 3: RL Score
        rl_score = score_doc.get("rl_score", 0) if score_doc else 0
        
        # Combined score
        food["_rank_score"] = rating_score + pref_score + rl_score
    
    # Sort by combined score
    foods.sort(key=lambda x: x.get("_rank_score", 0), reverse=True)
    return foods
