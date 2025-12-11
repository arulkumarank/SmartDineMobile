"""
Populate restaurants with menu items for SmartDine
Run this script to add sample restaurants with menu items
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import collection as restaurants_collection

# Sample restaurants with menu items
sample_restaurants = [
    {
        "name": "Spice Junction",
        "cuisine": "Indian",
        "rating": 4.5,
        "image": "https://source.unsplash.com/600x400/?indian-restaurant",
        "location": {
            "latitude": 13.0827,
            "longitude": 80.2707,
            "address": "123 Anna Salai, Chennai, Tamil Nadu"
        },
        "menu": [
            {
                "name": "Butter Chicken",
                "price": 280,
                "image": "https://source.unsplash.com/600x400/?butter-chicken",
                "diet": "non-veg",
                "spicy": "medium",
                "nutritional_info": {"protein": 25, "fiber": 3, "calories": 520},
                "tags": ["comfort", "traditional"]
            },
            {
                "name": "Paneer Tikka Masala",
                "price": 240,
                "image": "https://source.unsplash.com/600x400/?paneer",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "medium",
                "nutritional_info": {"protein": 18, "fiber": 5, "calories": 380},
                "tags": ["comfort", "vegetarian"]
            },
            {
                "name": "Dal Tadka",
                "price": 180,
                "image": "https://source.unsplash.com/600x400/?dal",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "mild",
                "nutritional_info": {"protein": 12, "fiber": 8, "calories": 220},
                "tags": ["healthy", "traditional"]
            },
            {
                "name": "Chicken Biryani",
                "price": 320,
                "image": "https://source.unsplash.com/600x400/?biryani",
                "diet": "non-veg",
                "spicy": "hot",
                "nutritional_info": {"protein": 30, "fiber": 4, "calories": 650},
                "tags": ["traditional", "comfort"]
            }
        ]
    },
    {
        "name": "Green Bowl Cafe",
        "cuisine": "Healthy",
        "rating": 4.7,
        "image": "https://source.unsplash.com/600x400/?healthy-cafe",
        "location": {
            "latitude": 13.0569,
            "longitude": 80.2425,
            "address": "456 ECR Road, Chennai, Tamil Nadu"
        },
        "menu": [
            {
                "name": "Grilled Chicken Salad",
                "price": 350,
                "image": "https://source.unsplash.com/600x400/?salad",
                "diet": "non-veg",
                "spicy": "mild",
                "is_gluten_free": True,
                "nutritional_info": {"protein": 35, "fiber": 8, "calories": 350},
                "tags": ["modern", "high-protein", "healthy"]
            },
            {
                "name": "Quinoa Buddha Bowl",
                "price": 380,
                "image": "https://source.unsplash.com/600x400/?buddha-bowl",
                "diet": "veg",
                "is_vegetarian": True,
                "is_vegan": True,
                "is_gluten_free": True,
                "spicy": "mild",
                "nutritional_info": {"protein": 18, "fiber": 12, "calories": 420},
                "tags": ["modern", "vegan", "healthy"]
            },
            {
                "name": "Protein Power Bowl",
                "price": 420,
                "image": "https://source.unsplash.com/600x400/?protein-bowl",
                "diet": "non-veg",
                "is_gluten_free": True,
                "spicy": "mild",
                "nutritional_info": {"protein": 45, "fiber": 10, "calories": 550},
                "tags": ["modern", "high-protein", "healthy"]
            },
            {
                "name": "Avocado Toast",
                "price": 280,
                "image": "https://source.unsplash.com/600x400/?avocado-toast",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "mild",
                "nutritional_info": {"protein": 12, "fiber": 9, "calories": 320},
                "tags": ["modern", "healthy"]
            }
        ]
    },
    {
        "name": "The Dosa House",
        "cuisine": "South Indian",
        "rating": 4.3,
        "image": "https://source.unsplash.com/600x400/?dosa",
        "location": {
            "latitude": 13.0674,
            "longitude": 80.2376,
            "address": "789 Mount Road, Chennai, Tamil Nadu"
        },
        "menu": [
            {
                "name": "Masala Dosa",
                "price": 120,
                "image": "https://source.unsplash.com/600x400/?masala-dosa",
                "diet": "veg",
                "is_vegetarian": True,
                "is_vegan": True,
                "spicy": "medium",
                "nutritional_info": {"protein": 8, "fiber": 6, "calories": 280},
                "tags": ["traditional", "comfort"]
            },
            {
                "name": "Idli Sambar",
                "price": 80,
                "image": "https://source.unsplash.com/600x400/?idli",
                "diet": "veg",
                "is_vegetarian": True,
                "is_vegan": True,
                "spicy": "mild",
                "nutritional_info": {"protein": 6, "fiber": 5, "calories": 180},
                "tags": ["traditional", "healthy"]
            },
            {
                "name": "Rava Dosa",
                "price": 100,
                "image": "https://source.unsplash.com/600x400/?rava-dosa",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "mild",
                "nutritional_info": {"protein": 7, "fiber": 4, "calories": 220},
                "tags": ["traditional"]
            },
            {
                "name": "Uttapam",
                "price": 110,
                "image": "https://source.unsplash.com/600x400/?uttapam",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "medium",
                "nutritional_info": {"protein": 8, "fiber": 6, "calories": 250},
                "tags": ["traditional", "comfort"]
            }
        ]
    },
    {
        "name": "Pizza Paradise",
        "cuisine": "Italian",
        "rating": 4.4,
        "image": "https://source.unsplash.com/600x400/?pizza-restaurant",
        "location": {
            "latitude": 13.0475,
            "longitude": 80.2167,
            "address": "321 OMR, Chennai, Tamil Nadu"
        },
        "menu": [
            {
                "name": "Margherita Pizza",
                "price": 350,
                "image": "https://source.unsplash.com/600x400/?margherita-pizza",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "mild",
                "nutritional_info": {"protein": 15, "fiber": 3, "calories": 580},
                "tags": ["comfort", "modern"]
            },
            {
                "name": "Pepperoni Pizza",
                "price": 420,
                "image": "https://source.unsplash.com/600x400/?pepperoni-pizza",
                "diet": "non-veg",
                "spicy": "medium",
                "nutritional_info": {"protein": 22, "fiber": 3, "calories": 680},
                "tags": ["comfort"]
            },
            {
                "name": "Pasta Alfredo",
                "price": 340,
                "image": "https://source.unsplash.com/600x400/?pasta-alfredo",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "mild",
                "nutritional_info": {"protein": 18, "fiber": 4, "calories": 520},
                "tags": ["comfort", "modern"]
            }
        ]
    },
    {
        "name": "Burger Barn",
        "cuisine": "American",
        "rating": 4.2,
        "image": "https://source.unsplash.com/600x400/?burger-restaurant",
        "location": {
            "latitude": 13.0358,
            "longitude": 80.2503,
            "address": "555 Beach Road, Chennai, Tamil Nadu"
        },
        "menu": [
            {
                "name": "Classic Burger",
                "price": 280,
                "image": "https://source.unsplash.com/600x400/?classic-burger",
                "diet": "non-veg",
                "spicy": "mild",
                "nutritional_info": {"protein": 25, "fiber": 3, "calories": 650},
                "tags": ["comfort"]
            },
            {
                "name": "Veggie Burger",
                "price": 240,
                "image": "https://source.unsplash.com/600x400/?veggie-burger",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "mild",
                "nutritional_info": {"protein": 15, "fiber": 6, "calories": 450},
                "tags": ["comfort", "vegetarian"]
            },
            {
                "name": "Chicken Wings",
                "price": 320,
                "image": "https://source.unsplash.com/600x400/?chicken-wings",
                "diet": "non-veg",
                "spicy": "hot",
                "nutritional_info": {"protein": 28, "fiber": 1, "calories": 580},
                "tags": ["comfort"]
            },
            {
                "name": "French Fries",
                "price": 150,
                "image": "https://source.unsplash.com/600x400/?french-fries",
                "diet": "veg",
                "is_vegetarian": True,
                "is_vegan": True,
                "spicy": "mild",
                "nutritional_info": {"protein": 4, "fiber": 4, "calories": 380},
                "tags": ["comfort"]
            }
        ]
    }
]

def populate_restaurants():
    """Populate restaurants collection with menu data"""
    print("Clearing existing restaurants...")
    restaurants_collection.delete_many({})
    
    print("Adding sample restaurants with menu items...")
    result = restaurants_collection.insert_many(sample_restaurants)
    print(f"✅ Added {len(result.inserted_ids)} restaurants")
    
    # Count total menu items
    total_menu_items = sum(len(r.get('menu', [])) for r in sample_restaurants)
    print(f"✅ Total menu items: {total_menu_items}")
    
    print("\nRestaurants added:")
    for restaurant in sample_restaurants:
        menu_count = len(restaurant.get('menu', []))
        print(f"  - {restaurant['name']} ({restaurant['cuisine']}) - {menu_count} menu items")
    
    print("\n✅ Done! Database populated successfully.")

if __name__ == "__main__":
    populate_restaurants()
