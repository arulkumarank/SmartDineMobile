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
        "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600",
        "location": {
            "latitude": 13.0827,
            "longitude": 80.2707,
            "address": "123 Anna Salai, Chennai, Tamil Nadu"
        },
        "menu": [
            {
                "name": "Butter Chicken",
                "price": 280,
                "image": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600",
                "diet": "non-veg",
                "spicy": "medium",
                "nutritional_info": {"protein": 25, "fiber": 3, "calories": 520},
                "tags": ["comfort", "traditional"]
            },
            {
                "name": "Paneer Tikka Masala",
                "price": 240,
                "image": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "medium",
                "nutritional_info": {"protein": 18, "fiber": 5, "calories": 380},
                "tags": ["comfort", "vegetarian"]
            },
            {
                "name": "Dal Tadka",
                "price": 180,
                "image": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "mild",
                "nutritional_info": {"protein": 12, "fiber": 8, "calories": 220},
                "tags": ["healthy", "traditional"]
            },
            {
                "name": "Chicken Biryani",
                "price": 320,
                "image": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600",
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
        "image": "https://images.unsplash.com/photo-1494390248081-4e521a5940db?w=600",
        "location": {
            "latitude": 13.0569,
            "longitude": 80.2425,
            "address": "456 ECR Road, Chennai, Tamil Nadu"
        },
        "menu": [
            {
                "name": "Grilled Chicken Salad",
                "price": 350,
                "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600",
                "diet": "non-veg",
                "spicy": "mild",
                "is_gluten_free": True,
                "nutritional_info": {"protein": 35, "fiber": 8, "calories": 350},
                "tags": ["modern", "high-protein", "healthy"]
            },
            {
                "name": "Quinoa Buddha Bowl",
                "price": 380,
                "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
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
                "image": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600",
                "diet": "non-veg",
                "is_gluten_free": True,
                "spicy": "mild",
                "nutritional_info": {"protein": 45, "fiber": 10, "calories": 550},
                "tags": ["modern", "high-protein", "healthy"]
            },
            {
                "name": "Avocado Toast",
                "price": 280,
                "image": "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=600",
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
        "image": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600",
        "location": {
            "latitude": 13.0674,
            "longitude": 80.2376,
            "address": "789 Mount Road, Chennai, Tamil Nadu"
        },
        "menu": [
            {
                "name": "Masala Dosa",
                "price": 120,
                "image": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600",
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
                "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600",
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
                "image": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "mild",
                "nutritional_info": {"protein": 7, "fiber": 4, "calories": 220},
                "tags": ["traditional"]
            },
            {
                "name": "Uttapam",
                "price": 110,
                "image": "https://images.unsplash.com/photo-1567337710282-00832b415979?w=600",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "medium",
                "nutritional_info": {"protein": 8, "fiber": 6, "calories": 250},
                "tags": ["traditional", "comfort"]
            },
            {
                "name": "Parotta with Kurma",
                "price": 100,
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "medium",
                "rating": 4.5,
                "nutritional_info": {"protein": 9, "fiber": 4, "calories": 340},
                "tags": ["traditional", "south indian", "comfort", "parotta"]
            }
        ]
    },
    {
        "name": "Pizza Paradise",
        "cuisine": "Italian",
        "rating": 4.4,
        "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600",
        "location": {
            "latitude": 13.0475,
            "longitude": 80.2167,
            "address": "321 OMR, Chennai, Tamil Nadu"
        },
        "menu": [
            {
                "name": "Margherita Pizza",
                "price": 350,
                "image": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "mild",
                "nutritional_info": {"protein": 15, "fiber": 3, "calories": 580},
                "tags": ["comfort", "modern"]
            },
            {
                "name": "Pepperoni Pizza",
                "price": 420,
                "image": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600",
                "diet": "non-veg",
                "spicy": "medium",
                "nutritional_info": {"protein": 22, "fiber": 3, "calories": 680},
                "tags": ["comfort"]
            },
            {
                "name": "Pasta Alfredo",
                "price": 340,
                "image": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600",
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
        "image": "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600",
        "location": {
            "latitude": 13.0358,
            "longitude": 80.2503,
            "address": "555 Beach Road, Chennai, Tamil Nadu"
        },
        "menu": [
            {
                "name": "Classic Burger",
                "price": 280,
                "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
                "diet": "non-veg",
                "spicy": "mild",
                "nutritional_info": {"protein": 25, "fiber": 3, "calories": 650},
                "tags": ["comfort"]
            },
            {
                "name": "Veggie Burger",
                "price": 240,
                "image": "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "mild",
                "nutritional_info": {"protein": 15, "fiber": 6, "calories": 450},
                "tags": ["comfort", "vegetarian"]
            },
            {
                "name": "Chicken Wings",
                "price": 320,
                "image": "https://images.unsplash.com/photo-1608039829572-9b8e26f99daa?w=600",
                "diet": "non-veg",
                "spicy": "hot",
                "nutritional_info": {"protein": 28, "fiber": 1, "calories": 580},
                "tags": ["comfort"]
            },
            {
                "name": "French Fries",
                "price": 150,
                "image": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600",
                "diet": "veg",
                "is_vegetarian": True,
                "is_vegan": True,
                "spicy": "mild",
                "nutritional_info": {"protein": 4, "fiber": 4, "calories": 380},
                "tags": ["comfort"]
            }
        ]
    },
    {
        "name": "Saravana Bhavan",
        "cuisine": "South Indian",
        "rating": 4.6,
        "image": "https://images.unsplash.com/photo-1630383249896-424e482df921?w=600",
        "location": {
            "latitude": 13.0604,
            "longitude": 80.2496,
            "address": "21 Cathedral Road, Chennai, Tamil Nadu"
        },
        "menu": [
            {
                "name": "Ghee Roast Dosa",
                "price": 140,
                "image": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "medium",
                "rating": 4.7,
                "nutritional_info": {"protein": 9, "fiber": 5, "calories": 320},
                "tags": ["traditional", "south indian", "comfort"]
            },
            {
                "name": "Pongal",
                "price": 90,
                "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "mild",
                "rating": 4.5,
                "nutritional_info": {"protein": 10, "fiber": 6, "calories": 250},
                "tags": ["traditional", "south indian", "healthy", "breakfast"]
            },
            {
                "name": "Chettinad Veg Kurma",
                "price": 160,
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "hot",
                "rating": 4.4,
                "nutritional_info": {"protein": 12, "fiber": 8, "calories": 280},
                "tags": ["traditional", "south indian", "spicy"]
            },
            {
                "name": "Filter Coffee",
                "price": 40,
                "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "none",
                "rating": 4.9,
                "nutritional_info": {"protein": 1, "fiber": 0, "calories": 80},
                "tags": ["south indian", "beverage"]
            },
            {
                "name": "Mini Tiffin Combo",
                "price": 180,
                "image": "https://images.unsplash.com/photo-1567337710282-00832b415979?w=600",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "mild",
                "rating": 4.6,
                "nutritional_info": {"protein": 15, "fiber": 10, "calories": 420},
                "tags": ["traditional", "south indian", "healthy"]
            },
            {
                "name": "Kothu Parotta",
                "price": 120,
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "hot",
                "rating": 4.6,
                "nutritional_info": {"protein": 12, "fiber": 5, "calories": 380},
                "tags": ["traditional", "south indian", "spicy", "parotta"]
            }
        ]
    },
    {
        "name": "MTR - Mavalli Tiffin Room",
        "cuisine": "South Indian",
        "rating": 4.8,
        "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600",
        "location": {
            "latitude": 13.0732,
            "longitude": 80.2519,
            "address": "14 Lal Bagh Road, Chennai, Tamil Nadu"
        },
        "menu": [
            {
                "name": "Bisi Bele Bath",
                "price": 150,
                "image": "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "medium",
                "rating": 4.7,
                "nutritional_info": {"protein": 14, "fiber": 9, "calories": 380},
                "tags": ["traditional", "south indian", "comfort"]
            },
            {
                "name": "Kesari Bath",
                "price": 80,
                "image": "https://images.unsplash.com/photo-1567337710282-00832b415979?w=600",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "none",
                "rating": 4.5,
                "nutritional_info": {"protein": 3, "fiber": 1, "calories": 220},
                "tags": ["south indian", "sweet", "dessert"]
            },
            {
                "name": "Rava Idli",
                "price": 100,
                "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "mild",
                "rating": 4.6,
                "nutritional_info": {"protein": 8, "fiber": 4, "calories": 200},
                "tags": ["traditional", "south indian", "healthy"]
            },
            {
                "name": "Veg Pulao",
                "price": 140,
                "image": "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "mild",
                "rating": 4.4,
                "nutritional_info": {"protein": 10, "fiber": 6, "calories": 350},
                "tags": ["south indian", "comfort"]
            },
            {
                "name": "Thali Meals",
                "price": 220,
                "image": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "medium",
                "rating": 4.9,
                "nutritional_info": {"protein": 20, "fiber": 15, "calories": 650},
                "tags": ["traditional", "south indian", "healthy", "complete meal"]
            },
            {
                "name": "Egg Parotta",
                "price": 110,
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600",
                "diet": "non-veg",
                "spicy": "medium",
                "rating": 4.5,
                "nutritional_info": {"protein": 15, "fiber": 3, "calories": 420},
                "tags": ["traditional", "south indian", "parotta"]
            },
            {
                "name": "Plain Parotta",
                "price": 60,
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "none",
                "rating": 4.3,
                "nutritional_info": {"protein": 8, "fiber": 2, "calories": 280},
                "tags": ["traditional", "south indian", "parotta"]
            }
        ]
    },
    {
        "name": "Udupi Grand",
        "cuisine": "South Indian",
        "rating": 4.4,
        "image": "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600",
        "location": {
            "latitude": 13.0456,
            "longitude": 80.2345,
            "address": "78 T Nagar, Chennai, Tamil Nadu"
        },
        "menu": [
            {
                "name": "Paper Roast",
                "price": 130,
                "image": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600",
                "diet": "veg",
                "is_vegetarian": True,
                "is_vegan": True,
                "spicy": "mild",
                "rating": 4.5,
                "nutritional_info": {"protein": 7, "fiber": 4, "calories": 260},
                "tags": ["traditional", "south indian"]
            },
            {
                "name": "Mysore Pak",
                "price": 60,
                "image": "https://images.unsplash.com/photo-1567337710282-00832b415979?w=600",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "none",
                "rating": 4.7,
                "nutritional_info": {"protein": 4, "fiber": 0, "calories": 280},
                "tags": ["south indian", "sweet", "dessert"]
            },
            {
                "name": "Onion Rava Dosa",
                "price": 120,
                "image": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "medium",
                "rating": 4.4,
                "nutritional_info": {"protein": 8, "fiber": 5, "calories": 280},
                "tags": ["traditional", "south indian"]
            },
            {
                "name": "Vada Sambar",
                "price": 70,
                "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600",
                "diet": "veg",
                "is_vegetarian": True,
                "is_vegan": True,
                "spicy": "mild",
                "rating": 4.3,
                "nutritional_info": {"protein": 10, "fiber": 6, "calories": 220},
                "tags": ["traditional", "south indian", "healthy"]
            },
            {
                "name": "Tomato Rice",
                "price": 110,
                "image": "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600",
                "diet": "veg",
                "is_vegetarian": True,
                "is_vegan": True,
                "spicy": "medium",
                "rating": 4.2,
                "nutritional_info": {"protein": 8, "fiber": 5, "calories": 320},
                "tags": ["south indian", "comfort"]
            },
            {
                "name": "Curd Rice",
                "price": 90,
                "image": "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "none",
                "rating": 4.6,
                "nutritional_info": {"protein": 9, "fiber": 2, "calories": 240},
                "tags": ["south indian", "healthy", "comfort", "mild"]
            },
            {
                "name": "Chilli Parotta",
                "price": 130,
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600",
                "diet": "veg",
                "is_vegetarian": True,
                "spicy": "hot",
                "rating": 4.4,
                "nutritional_info": {"protein": 10, "fiber": 4, "calories": 360},
                "tags": ["south indian", "spicy", "parotta", "street food"]
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
