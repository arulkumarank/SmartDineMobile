from db import collection
import json

# Additional biryani items to add to Biryani House
new_biryani_items = [
    {
        "name": "Vegetable Biryani",
        "price": 210,
        "image": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600",
        "diet": "veg",
        "spicy": "medium",
        "nutritional_info": {
            "protein": 12,
            "fiber": 8,
            "calories": 320,
            "carbs": 58,
            "fat": 8
        },
        "tags": [
            "vegetarian",
            "popular",
            "traditional",
            "high-fiber"
        ],
        "is_vegetarian": True,
        "rating": 4.4,
        "is_vegan": False
    },
    {
        "name": "Egg Biryani",
        "price": 180,
        "image": "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600",
        "diet": "non-veg",
        "spicy": "medium",
        "nutritional_info": {
            "protein": 18,
            "fiber": 4,
            "calories": 340,
            "carbs": 52,
            "fat": 10
        },
        "tags": [
            "popular",
            "traditional",
            "high-protein"
        ],
        "is_vegetarian": False,
        "rating": 4.5
    },
    {
        "name": "Paneer Biryani",
        "price": 240,
        "image": "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600",
        "diet": "veg",
        "spicy": "mild",
        "nutritional_info": {
            "protein": 16,
            "fiber": 5,
            "calories": 380,
            "carbs": 55,
            "fat": 12
        },
        "tags": [
            "vegetarian",
            "mild",
            "high-protein"
        ],
        "is_vegetarian": True,
        "rating": 4.6
    },
    {
        "name": "Fish Biryani",
        "price": 350,
        "image": "https://images.unsplash.com/photo-1633945274309-7b97a78c9ace?w=600",
        "diet": "non-veg",
        "spicy": "hot",
        "nutritional_info": {
            "protein": 32,
            "fiber": 4,
            "calories": 395,
            "carbs": 48,
            "fat": 8
        },
        "tags": [
            "spicy",
            "high-protein",
            "traditional"
        ],
        "is_vegetarian": False,
        "rating": 4.7
    },
    {
        "name": "Prawns Biryani",
        "price": 380,
        "image": "https://images.unsplash.com/photo-1633945274309-7b97a78c9ace?w=600",
        "diet": "non-veg",
        "spicy": "hot",
        "nutritional_info": {
            "protein": 28,
            "fiber": 3,
            "calories": 360,
            "carbs": 50,
            "fat": 6
        },
        "tags": [
            "spicy",
            "high-protein",
            "traditional"
        ],
        "is_vegetarian": False,
        "rating": 4.8
    }
]

# Find Biryani House and add the new items
result = collection.find_one({"name": "Biryani House"})

if result:
    current_menu = result.get("menu", [])
    print(f"Current menu has {len(current_menu)} items")
    
    # Add new items to the menu
    updated_menu = current_menu + new_biryani_items
    
    # Update the restaurant document
    collection.update_one(
        {"name": "Biryani House"},
        {"$set": {"menu": updated_menu}}
    )
    
    print(f"✅ Successfully added {len(new_biryani_items)} new biryani items to Biryani House!")
    print(f"   New menu has {len(updated_menu)} items total")
    print("\nNew items added:")
    for item in new_biryani_items:
        print(f"   - {item['name']} (₹{item['price']}) - {item['diet']}, {item['spicy']} spicy")
else:
    print("❌ Biryani House restaurant not found in database")
