import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db import collection as restaurants_collection

def get_all_foods():
    """Extract all foods from restaurants"""
    foods = []
    for restaurant in restaurants_collection.find():
        for item in restaurant.get("menu", []):
            foods.append({
                "name": item.get("name", ""),
                "restaurant": restaurant.get("name", ""),
                "cuisine": restaurant.get("cuisine", ""),
                "price": item.get("price", 0),
                "is_vegetarian": item.get("diet", "") == "veg",
                "rating": item.get("rating", restaurant.get("rating", 4.0)),
                "tags": item.get("tags", []),
                "description": f"{item.get('name', '')} from {restaurant.get('name', '')}"
            })
    return foods

def get_all_restaurants():
    """Get all restaurants"""
    restaurants = []
    for r in restaurants_collection.find():
        restaurants.append({
            "name": r.get("name", ""),
            "cuisine": r.get("cuisine", ""),
            "rating": r.get("rating", 4.0),
            "image": r.get("image", ""),
            "location": r.get("location", {}),
            "menu": r.get("menu", [])
        })
    return restaurants

def initialize_embeddings():
    print("🚀 Starting Vector Embedding Initialization...")
    
    # Import vector search
    from services.vector_search import initialize_vector_search, initialize_restaurant_search
    
    # Get data
    print("📦 Loading foods from database...")
    foods = get_all_foods()
    print(f"   Found {len(foods)} food items")
    
    print("📦 Loading restaurants from database...")
    restaurants = get_all_restaurants()
    print(f"   Found {len(restaurants)} restaurants")
    
    # Initialize food embeddings
    print("\n🔧 Creating food embeddings...")
    initialize_vector_search(foods)
    
    # Initialize restaurant embeddings
    print("\n🔧 Creating restaurant embeddings...")
    initialize_restaurant_search(restaurants)
    
    print("\n✅ Vector embeddings created successfully!")
    print("   - Food index: services/faiss_index/foods.index")
    print("   - Restaurant index: services/faiss_index/restaurants.index")

if __name__ == "__main__":
    initialize_embeddings()
