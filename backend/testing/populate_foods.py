"""
Sample foods data script - Run this to populate foods collection
"""
from db import foods_collection, collection as restaurants_collection

# Sample food items with nutritional data
sample_foods = [
    {
        "name": "Grilled Chicken Salad",
        "restaurant": "Green Bowl",
        "price": 12.99,
        "cuisine": "Healthy",
        "image": "https://source.unsplash.com/600x400/?salad",
        "nutritional_info": {
            "protein": 35,
            "fiber": 8,
            "calories": 350,
            "carbs": 25,
            "fat": 12
        },
        "tags": ["modern", "high-protein", "high-fiber"],
        "allergens": [],
        "is_vegetarian": False,
        "is_vegan": False,
        "is_gluten_free": True
    },
    {
        "name": "Quinoa Buddha Bowl",
        "restaurant": "Green Bowl",
        "price": 14.50,
        "cuisine": "Vegan",
        "image": "https://source.unsplash.com/600x400/?vegan-bowl",
        "nutritional_info": {
            "protein": 18,
            "fiber": 12,
            "calories": 420,
            "carbs": 65,
            "fat": 15
        },
        "tags": ["modern", "high-fiber"],
        "allergens": [],
        "is_vegetarian": True,
        "is_vegan": True,
        "is_gluten_free": True
    },
    {
        "name": "Classic Burger",
        "restaurant": "The Diner",
        "price": 10.99,
        "cuisine": "American",
        "image": "https://source.unsplash.com/600x400/?burger",
        "nutritional_info": {
            "protein": 25,
            "fiber": 3,
            "calories": 650,
            "carbs": 45,
            "fat": 35
        },
        "tags": ["comfort"],
        "allergens": ["gluten", "dairy"],
        "is_vegetarian": False,
        "is_vegan": False,
        "is_gluten_free": False
    },
    {
        "name": "Protein Power Bowl",
        "restaurant": "Fit Kitchen",
        "price": 15.99,
        "cuisine": "Fitness",
        "image": "https://source.unsplash.com/600x400/?healthy-food",
        "nutritional_info": {
            "protein": 45,
            "fiber": 10,
            "calories": 550,
            "carbs": 40,
            "fat": 18
        },
        "tags": ["modern", "high-protein", "high-fiber"],
        "allergens": [],
        "is_vegetarian": False,
        "is_vegan": False,
        "is_gluten_free": True
    },
    {
        "name": "Grandma's Chicken Pot Pie",
        "restaurant": "Home Kitchen",
        "price": 13.50,
        "cuisine": "Comfort",
        "image": "https://source.unsplash.com/600x400/?pot-pie",
        "nutritional_info": {
            "protein": 22,
            "fiber": 4,
            "calories": 580,
            "carbs": 50,
            "fat": 28
        },
        "tags": ["traditional", "comfort"],
        "allergens": ["gluten", "dairy"],
        "is_vegetarian": False,
        "is_vegan": False,
        "is_gluten_free": False
    },
    {
        "name": "Avocado Toast",
        "restaurant": "Morning Brew Cafe",
        "price": 9.99,
        "cuisine": "Breakfast",
        "image": "https://source.unsplash.com/600x400/?avocado-toast",
        "nutritional_info": {
            "protein": 12,
            "fiber": 9,
            "calories": 320,
            "carbs": 35,
            "fat": 18
        },
        "tags": ["modern", "high-fiber"],
        "allergens": ["gluten"],
        "is_vegetarian": True,
        "is_vegan": False,
        "is_gluten_free": False
    },
]

# Clear existing foods
print("Clearing existing foods...")
foods_collection.delete_many({})

# Insert new foods
print("Adding sample foods...")
result = foods_collection.insert_many(sample_foods)
print(f"Added {len(result.inserted_ids)} food items")

# Update restaurants with locations
print("\nAdding locations to restaurants...")
restaurants_collection.update_many(
    {},
    {"$set": {
        "location": {
            "latitude": 40.7128,
            "longitude": -74.0060,
            "address": "123 Main St, New York, NY"
        }
    }}
)

print("\nDone! Sample data populated successfully.")
print("\nSample foods:")
for food in sample_foods:
    print(f"- {food['name']} at {food['restaurant']} (${food['price']})")
