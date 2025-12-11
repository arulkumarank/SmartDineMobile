"""
Comprehensive Sample Data for SmartDine App
============================================
This script populates the database with realistic Indian restaurant data
designed to showcase all features of the SmartDine app including:
- AI recommendations
- Nutritional filtering
- Dietary restrictions
- Price ranges
- Multiple cuisines
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import (
    collection as restaurants_collection,
    userdetails_collection,
    auth_collection
)
from datetime import datetime

# ============================================
# RESTAURANTS WITH MENUS
# ============================================

restaurants_data = [
    {
        "name": "Spice Symphony",
        "cuisine": "North Indian",
        "rating": 4.7,
        "image": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
        "location": {
            "latitude": 13.0827,
            "longitude": 80.2707,
            "address": "12, Cathedral Road, Gopalapuram, Chennai - 600086"
        },
        "menu": [
            {
                "name": "Butter Chicken",
                "price": 320,
                "image": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600",
                "diet": "non-veg",
                "spicy": "medium",
                "nutritional_info": {"protein": 28, "fiber": 3, "calories": 450, "carbs": 15, "fat": 32},
                "tags": ["comfort", "traditional", "popular"],
                "is_vegetarian": False
            },
            {
                "name": "Paneer Tikka Masala",
                "price": 280,
                "image": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600",
                "diet": "veg",
                "spicy": "medium",
                "nutritional_info": {"protein": 18, "fiber": 5, "calories": 380, "carbs": 20, "fat": 24},
                "tags": ["comfort", "traditional", "vegetarian"],
                "is_vegetarian": True,
                "is_gluten_free": True
            },
            {
                "name": "Dal Makhani",
                "price": 220,
                "image": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600",
                "diet": "veg",
                "spicy": "mild",
                "nutritional_info": {"protein": 14, "fiber": 9, "calories": 280, "carbs": 35, "fat": 10},
                "tags": ["traditional", "vegetarian", "healthy", "high-fiber"],
                "is_vegetarian": True,
                "is_vegan": False
            },
            {
                "name": "Chicken Biryani",
                "price": 350,
                "image": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600",
                "diet": "non-veg",
                "spicy": "hot",
                "nutritional_info": {"protein": 32, "fiber": 4, "calories": 580, "carbs": 65, "fat": 18},
                "tags": ["traditional", "comfort", "spicy", "popular"],
                "is_vegetarian": False
            },
            {
                "name": "Palak Paneer",
                "price": 260,
                "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600",
                "diet": "veg",
                "spicy": "mild",
                "nutritional_info": {"protein": 16, "fiber": 6, "calories": 320, "carbs": 18, "fat": 22},
                "tags": ["traditional", "vegetarian", "healthy"],
                "is_vegetarian": True
            }
        ]
    },
    {
        "name": "The Fitness Kitchen",
        "cuisine": "Healthy & Protein-Rich",
        "rating": 4.8,
        "image": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
        "location": {
            "latitude": 13.0569,
            "longitude": 80.2425,
            "address": "45, ECR Main Road, Neelankarai, Chennai - 600115"
        },
        "menu": [
            {
                "name": "Grilled Chicken Protein Bowl",
                "price": 380,
                "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
                "diet": "non-veg",
                "spicy": "mild",
                "nutritional_info": {"protein": 45, "fiber": 8, "calories": 420, "carbs": 35, "fat": 12},
                "tags": ["modern", "high-protein", "healthy", "high-fiber"],
                "is_vegetarian": False,
                "is_gluten_free": True
            },
            {
                "name": "Quinoa Buddha Bowl",
                "price": 340,
                "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600",
                "diet": "veg",
                "spicy": "mild",
                "nutritional_info": {"protein": 18, "fiber": 12, "calories": 380, "carbs": 55, "fat": 14},
                "tags": ["modern", "vegan", "healthy", "high-fiber", "high-protein"],
                "is_vegetarian": True,
                "is_vegan": True,
                "is_gluten_free": True
            },
            {
                "name": "Salmon Poke Bowl",
                "price": 450,
                "image": "https://images.unsplash.com/photo-1546069901-eacef0df6022?w=600",
                "diet": "non-veg",
                "spicy": "mild",
                "nutritional_info": {"protein": 38, "fiber": 6, "calories": 480, "carbs": 42, "fat": 20},
                "tags": ["modern", "high-protein", "healthy"],
                "is_vegetarian": False,
                "is_gluten_free": True
            },
            {
                "name": "Greek Salad with Grilled Chicken",
                "price": 320,
                "image": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600",
                "diet": "non-veg",
                "spicy": "mild",
                "nutritional_info": {"protein": 35, "fiber": 7, "calories": 350, "carbs": 18, "fat": 16},
                "tags": ["modern", "high-protein", "healthy"],
                "is_vegetarian": False,
                "is_gluten_free": True
            },
            {
                "name": "Avocado Toast with Poached Eggs",
                "price": 290,
                "image": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600",
                "diet": "veg",
                "spicy": "mild",
                "nutritional_info": {"protein": 16, "fiber": 9, "calories": 380, "carbs": 32, "fat": 22},
                "tags": ["modern", "healthy", "high-fiber"],
                "is_vegetarian": True
            }
        ]
    },
    {
        "name": "Dosa Corner",
        "cuisine": "South Indian",
        "rating": 4.5,
        "image": "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800",
        "location": {
            "latitude": 13.0674,
            "longitude": 80.2376,
            "address": "88, TTK Road, Alwarpet, Chennai - 600018"
        },
        "menu": [
            {
                "name": "Masala Dosa",
                "price": 120,
                "image": "https://images.unsplash.com/photo-1694809956528-c8e32a8b98f8?w=600",
                "diet": "veg",
                "spicy": "medium",
                "nutritional_info": {"protein": 8, "fiber": 6, "calories": 280, "carbs": 48, "fat": 8},
                "tags": ["traditional", "comfort", "vegetarian"],
                "is_vegetarian": True,
                "is_vegan": True
            },
            {
                "name": "Idli Sambar (4 pcs)",
                "price": 90,
                "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600",
                "diet": "veg",
                "spicy": "mild",
                "nutritional_info": {"protein": 7, "fiber": 5, "calories": 200, "carbs": 38, "fat": 4},
                "tags": ["traditional", "healthy", "vegetarian"],
                "is_vegetarian": True,
                "is_vegan": True
            },
            {
                "name": "Rava Dosa",
                "price": 110,
                "image": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600",
                "diet": "veg",
                "spicy": "mild",
                "nutritional_info": {"protein": 7, "fiber": 4, "calories": 250, "carbs": 42, "fat": 7},
                "tags": ["traditional", "vegetarian"],
                "is_vegetarian": True
            },
            {
                "name": "Medu Vada (3 pcs)",
                "price": 80,
                "image": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600",
                "diet": "veg",
                "spicy": "medium",
                "nutritional_info": {"protein": 6, "fiber": 3, "calories": 220, "carbs": 28, "fat": 10},
                "tags": ["traditional", "comfort", "vegetarian"],
                "is_vegetarian": True,
                "is_vegan": True
            },
            {
                "name": "Pongal",
                "price": 95,
                "image": "https://images.unsplash.com/photo-1626776876729-bab4eda639c7?w=600",
                "diet": "veg",
                "spicy": "mild",
                "nutritional_info": {"protein": 8, "fiber": 4, "calories": 260, "carbs": 44, "fat": 6},
                "tags": ["traditional", "comfort", "vegetarian"],
                "is_vegetarian": True
            }
        ]
    },
    {
        "name": "Pizza Paradise",
        "cuisine": "Italian",
        "rating": 4.4,
        "image": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
        "location": {
            "latitude": 13.0475,
            "longitude": 80.2167,
            "address": "234, OMR, Thoraipakkam, Chennai - 600097"
        },
        "menu": [
            {
                "name": "Margherita Pizza",
                "price": 350,
                "image": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600",
                "diet": "veg",
                "spicy": "mild",
                "nutritional_info": {"protein": 15, "fiber": 3, "calories": 550, "carbs": 68, "fat": 22},
                "tags": ["comfort", "modern", "vegetarian"],
                "is_vegetarian": True
            },
            {
                "name": "Pepperoni Pizza",
                "price": 420,
                "image": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600",
                "diet": "non-veg",
                "spicy": "medium",
                "nutritional_info": {"protein": 22, "fiber": 3, "calories": 680, "carbs": 72, "fat": 32},
                "tags": ["comfort", "popular"],
                "is_vegetarian": False
            },
            {
                "name": "Chicken BBQ Pizza",
                "price": 450,
                "image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600",
                "diet": "non-veg",
                "spicy": "medium",
                "nutritional_info": {"protein": 28, "fiber": 3, "calories": 720, "carbs": 75, "fat": 34},
                "tags": ["comfort", "high-protein"],
                "is_vegetarian": False
            },
            {
                "name": "Pasta Alfredo",
                "price": 340,
                "image": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600",
                "diet": "veg",
                "spicy": "mild",
                "nutritional_info": {"protein": 18, "fiber": 4, "calories": 520, "carbs": 62, "fat": 24},
                "tags": ["comfort", "modern", "vegetarian"],
                "is_vegetarian": True
            },
            {
                "name": "Lasagna",
                "price": 380,
                "image": "https://images.unsplash.com/photo-1619895092538-128341789043?w=600",
                "diet": "non-veg",
                "spicy": "mild",
                "nutritional_info": {"protein": 24, "fiber": 4, "calories": 620, "carbs": 54, "fat": 32},
                "tags": ["comfort", "traditional"],
                "is_vegetarian": False
            }
        ]
    },
    {
        "name": "The Burger Hub",
        "cuisine": "American",
        "rating": 4.3,
        "image": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800",
        "location": {
            "latitude": 13.0358,
            "longitude": 80.2503,
            "address": "67, East Coast Road, Palavakkam, Chennai - 600041"
        },
        "menu": [
            {
                "name": "Classic Beef Burger",
                "price": 320,
                "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
                "diet": "non-veg",
                "spicy": "mild",
                "nutritional_info": {"protein": 28, "fiber": 3, "calories": 650, "carbs": 52, "fat": 35},
                "tags": ["comfort", "popular"],
                "is_vegetarian": False
            },
            {
                "name": "Grilled Chicken Burger",
                "price": 300,
                "image": "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600",
                "diet": "non-veg",
                "spicy": "mild",
                "nutritional_info": {"protein": 32, "fiber": 3, "calories": 520, "carbs": 45, "fat": 22},
                "tags": ["comfort", "high-protein"],
                "is_vegetarian": False
            },
            {
                "name": "Veggie Burger",
                "price": 260,
                "image": "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600",
                "diet": "veg",
                "spicy": "mild",
                "nutritional_info": {"protein": 14, "fiber": 7, "calories": 440, "carbs": 58, "fat": 18},
                "tags": ["comfort", "vegetarian", "high-fiber"],
                "is_vegetarian": True
            },
            {
                "name": "BBQ Chicken Wings (6 pcs)",
                "price": 350,
                "image": "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=600",
                "diet": "non-veg",
                "spicy": "hot",
                "nutritional_info": {"protein": 32, "fiber": 1, "calories": 580, "carbs": 22, "fat": 38},
                "tags": ["comfort", "spicy", "high-protein"],
                "is_vegetarian": False
            },
            {
                "name": "Loaded Fries",
                "price": 180,
                "image": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600",
                "diet": "veg",
                "spicy": "mild",
                "nutritional_info": {"protein": 6, "fiber": 4, "calories": 520, "carbs": 62, "fat": 28},
                "tags": ["comfort", "vegetarian"],
                "is_vegetarian": True
            }
        ]
    },
    {
        "name": "Sushi Station",
        "cuisine": "Japanese",
        "rating": 4.6,
        "image": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800",
        "location": {
            "latitude": 13.0525,
            "longitude": 80.2439,
            "address": "156, Khader Nawaz Khan Road, Nungambakkam, Chennai - 600006"
        },
        "menu": [
            {
                "name": "California Roll (8 pcs)",
                "price": 420,
                "image": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600",
                "diet": "non-veg",
                "spicy": "mild",
                "nutritional_info": {"protein": 18, "fiber": 3, "calories": 320, "carbs": 42, "fat": 8},
                "tags": ["modern", "healthy"],
                "is_vegetarian": False,
                "is_gluten_free": True
            },
            {
                "name": "Salmon Sashimi (6 pcs)",
                "price": 550,
                "image": "https://images.unsplash.com/photo-1617196034630-95f8e5f04b4a?w=600",
                "diet": "non-veg",
                "spicy": "mild",
                "nutritional_info": {"protein": 42, "fiber": 0, "calories": 280, "carbs": 0, "fat": 15},
                "tags": ["modern", "high-protein", "healthy"],
                "is_vegetarian": False,
                "is_gluten_free": True
            },
            {
                "name": "Vegetable Tempura",
                "price": 320,
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600",
                "diet": "veg",
                "spicy": "mild",
                "nutritional_info": {"protein": 8, "fiber": 5, "calories": 380, "carbs": 48, "fat": 18},
                "tags": ["modern", "vegetarian"],
                "is_vegetarian": True
            },
            {
                "name": "Spicy Tuna Roll (8 pcs)",
                "price": 480,
                "image": "https://images.unsplash.com/photo-1564489563601-c53cfc451e93?w=600",
                "diet": "non-veg",
                "spicy": "hot",
                "nutritional_info": {"protein": 24, "fiber": 2, "calories": 380, "carbs": 45, "fat": 12},
                "tags": ["modern", "spicy", "high-protein"],
                "is_vegetarian": False
            }
        ]
    },
    {
        "name": "Taco Fiesta",
        "cuisine": "Mexican",
        "rating": 4.4,
        "image": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800",
        "location": {
            "latitude": 13.0443,
            "longitude": 80.2548,
            "address": "91, Velachery Main Road, Velachery, Chennai - 600042"
        },
        "menu": [
            {
                "name": "Chicken Tacos (3 pcs)",
                "price": 280,
                "image": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600",
                "diet": "non-veg",
                "spicy": "medium",
                "nutritional_info": {"protein": 28, "fiber": 6, "calories": 450, "carbs": 42, "fat": 18},
                "tags": ["comfort", "spicy", "high-protein"],
                "is_vegetarian": False
            },
            {
                "name": "Veggie Burrito Bowl",
                "price": 320,
                "image": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600",
                "diet": "veg",
                "spicy": "medium",
                "nutritional_info": {"protein": 16, "fiber": 12, "calories": 520, "carbs": 68, "fat": 18},
                "tags": ["modern", "vegetarian", "high-fiber"],
                "is_vegetarian": True
            },
            {
                "name": "Beef Quesadilla",
                "price": 340,
                "image": "https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=600",
                "diet": "non-veg",
                "spicy": "medium",
                "nutritional_info": {"protein": 32, "fiber": 4, "calories": 620, "carbs": 48, "fat": 32},
                "tags": ["comfort", "high-protein"],
                "is_vegetarian": False
            },
            {
                "name": "Guacamole & Chips",
                "price": 180,
                "image": "https://images.unsplash.com/photo-1534939268332-e0b3b92c2e3e?w=600",
                "diet": "veg",
                "spicy": "mild",
                "nutritional_info": {"protein": 4, "fiber": 8, "calories": 320, "carbs": 38, "fat": 18},
                "tags": ["modern", "vegetarian", "vegan", "high-fiber"],
                "is_vegetarian": True,
                "is_vegan": True
            }
        ]
    },
    {
        "name": "The Chinese Wok",
        "cuisine": "Chinese",
        "rating": 4.5,
        "image": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800",
        "location": {
            "latitude": 13.0615,
            "longitude": 80.2294,
            "address": "23, Anna Nagar West, Chennai - 600040"
        },
        "menu": [
            {
                "name": "Chicken Fried Rice",
                "price": 240,
                "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600",
                "diet": "non-veg",
                "spicy": "medium",
                "nutritional_info": {"protein": 22, "fiber": 3, "calories": 520, "carbs": 68, "fat": 16},
                "tags": ["comfort", "traditional"],
                "is_vegetarian": False
            },
            {
                "name": "Veg Hakka Noodles",
                "price": 200,
                "image": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600",
                "diet": "veg",
                "spicy": "medium",
                "nutritional_info": {"protein": 10, "fiber": 5, "calories": 420, "carbs": 72, "fat": 12},
                "tags": ["comfort", "vegetarian"],
                "is_vegetarian": True
            },
            {
                "name": "Manchurian (Dry)",
                "price": 220,
                "image": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600",
                "diet": "veg",
                "spicy": "hot",
                "nutritional_info": {"protein": 12, "fiber": 4, "calories": 380, "carbs": 42, "fat": 18},
                "tags": ["comfort", "spicy", "vegetarian"],
                "is_vegetarian": True
            },
            {
                "name": "Chilli Chicken",
                "price": 280,
                "image": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600",
                "diet": "non-veg",
                "spicy": "hot",
                "nutritional_info": {"protein": 26, "fiber": 3, "calories": 480, "carbs": 32, "fat": 24},
                "tags": ["comfort", "spicy", "popular"],
                "is_vegetarian": False
            },
            {
                "name": "Spring Rolls (4 pcs)",
                "price": 160,
                "image": "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600",
                "diet": "veg",
                "spicy": "mild",
                "nutritional_info": {"protein": 8, "fiber": 4, "calories": 280, "carbs": 38, "fat": 12},
                "tags": ["modern", "vegetarian"],
                "is_vegetarian": True
            }
        ]
    }
]

# ============================================
# SAMPLE USER PROFILES
# ============================================

sample_users = [
    {
        "username": "demo_user",
        "name": "Demo User",
        "email": "demo@smartdine.com",
        "taste_preference": "modern",
        "dietary_restrictions": []
    },
    {
        "username": "fitness_lover",
        "name": "Arjun Kumar",
        "email": "arjun@example.com",
        "taste_preference": "modern",
        "dietary_restrictions": ["high-protein", "low-carb"]
    },
    {
        "username": "veggie_foodie",
        "name": "Priya Sharma",
        "email": "priya@example.com",
        "taste_preference": "traditional",
        "dietary_restrictions": ["vegetarian"]
    }
]

# ============================================
# POPULATE DATABASE
# ============================================

def populate_all_data():
    """Populate all collections with sample data"""
    
    print("=" * 60)
    print("    SMARTDINE DATABASE POPULATION")
    print("=" * 60)
    
    # 1. Clear existing data
    print("\n[1/3] Clearing existing data...")
    restaurants_collection.delete_many({})
    userdetails_collection.delete_many({"username": {"$in": [u["username"] for u in sample_users]}})
    print("✅ Cleared existing data")
    
    # 2. Insert restaurants
    print("\n[2/3] Adding restaurants and menu items...")
    result = restaurants_collection.insert_many(restaurants_data)
    print(f"✅ Added {len(result.inserted_ids)} restaurants")
    
    # Count total menu items
    total_menu_items = sum(len(r.get('menu', [])) for r in restaurants_data)
    print(f"✅ Total menu items: {total_menu_items}")
    
    # 3. Insert user profiles
    print("\n[3/3] Adding sample user profiles...")
    for user in sample_users:
        userdetails_collection.update_one(
            {"username": user["username"]},
            {"$set": user},
            upsert=True
        )
    print(f"✅ Added {len(sample_users)} user profiles")
    
    # Summary
    print("\n" + "=" * 60)
    print("    DATABASE POPULATED SUCCESSFULLY!")
    print("=" * 60)
    
    print("\n📊 SUMMARY:")
    print(f"  • Restaurants: {len(restaurants_data)}")
    print(f"  • Menu Items: {total_menu_items}")
    print(f"  • User Profiles: {len(sample_users)}")
    
    print("\n🍽️  RESTAURANTS:")
    for restaurant in restaurants_data:
        menu_count = len(restaurant.get('menu', []))
        print(f"  • {restaurant['name']:<25} ({restaurant['cuisine']:<20}) - {menu_count} items - ⭐{restaurant['rating']}")
    
    print("\n💰 PRICE RANGE:")
    all_prices = [item['price'] for r in restaurants_data for item in r.get('menu', [])]
    print(f"  • Minimum: ₹{min(all_prices)}")
    print(f"  • Maximum: ₹{max(all_prices)}")
    print(f"  • Average: ₹{sum(all_prices) // len(all_prices)}")
    
    print("\n🏷️  DIETARY OPTIONS:")
    veg_count = sum(1 for r in restaurants_data for item in r.get('menu', []) if item.get('is_vegetarian'))
    vegan_count = sum(1 for r in restaurants_data for item in r.get('menu', []) if item.get('is_vegan'))
    gluten_free_count = sum(1 for r in restaurants_data for item in r.get('menu', []) if item.get('is_gluten_free'))
    high_protein_count = sum(1 for r in restaurants_data for item in r.get('menu', []) if item.get('nutritional_info', {}).get('protein', 0) >= 20)
    
    print(f"  • Vegetarian: {veg_count} items")
    print(f"  • Vegan: {vegan_count} items")
    print(f"  • Gluten-Free: {gluten_free_count} items")
    print(f"  • High Protein (≥20g): {high_protein_count} items")
    
    print("\n👤 SAMPLE USER PROFILES:")
    for user in sample_users:
        restrictions = ", ".join(user['dietary_restrictions']) if user['dietary_restrictions'] else "None"
        print(f"  • {user['name']:<20} - Taste: {user['taste_preference']:<12} - Restrictions: {restrictions}")
    
    print("\n" + "=" * 60)
    print("✅ Your SmartDine app is now ready to use!")
    print("=" * 60)
    
    print("\n💡 TEST QUERIES TO TRY:")
    print("  1. 'I want high protein food'")
    print("  2. 'Show me healthy vegetarian options'")
    print("  3. 'Something spicy and Indian'")
    print("  4. 'Low calorie meals'")
    print("  5. 'Traditional comfort food'")
    print("  6. 'Gluten-free options'")
    print("\n")

if __name__ == "__main__":
    populate_all_data()
