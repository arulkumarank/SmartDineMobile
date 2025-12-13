"""
SmartDine Database Fix Script
=============================
Fixes image URLs, pricing, and tags for all restaurants and menu items.
Run this script to update the database with valid data.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import collection as restaurants_collection

# ============================================
# VALID UNSPLASH IMAGE URLs BY CATEGORY
# ============================================

# Restaurant images by cuisine type
RESTAURANT_IMAGES = {
    "North Indian": [
        "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800"
    ],
    "South Indian": [
        "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800",
        "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800",
        "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800"
    ],
    "Chinese": [
        "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800",
        "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
        "https://images.unsplash.com/photo-1552611052-33e04de081de?w=800"
    ],
    "Italian": [
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800"
    ],
    "Japanese": [
        "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800",
        "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800"
    ],
    "Mexican": [
        "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800",
        "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=800"
    ],
    "American": [
        "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800",
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800"
    ],
    "Healthy": [
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
        "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800"
    ],
    "default": [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
    ]
}

# Menu item images by food name/type
FOOD_IMAGES = {
    # North Indian
    "butter chicken": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600",
    "chicken biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600",
    "paneer tikka": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600",
    "paneer tikka masala": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600",
    "dal makhani": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600",
    "palak paneer": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600",
    "naan": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600",
    "garlic naan": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600",
    "roti": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600",
    "aloo gobi": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600",
    "chana masala": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600",
    "samosa": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600",
    
    # South Indian
    "masala dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600",
    "dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600",
    "paper masala dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600",
    "rava dosa": "https://images.unsplash.com/photo-1630383249896-424e482df921?w=600",
    "idli": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600",
    "idli sambar": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600",
    "medu vada": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600",
    "vada": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600",
    "sambar": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600",
    "pongal": "https://images.unsplash.com/photo-1626776876729-bab4eda639c7?w=600",
    "filter coffee": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600",
    "uttapam": "https://images.unsplash.com/photo-1630383249896-424e482df921?w=600",
    
    # Chinese
    "fried rice": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600",
    "chicken fried rice": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600",
    "szechwan fried rice": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600",
    "veg hakka noodles": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600",
    "hakka noodles": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600",
    "noodles": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600",
    "manchurian": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600",
    "chicken manchurian": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600",
    "veg manchurian": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600",
    "chilli chicken": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600",
    "spring rolls": "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600",
    "veg spring rolls": "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600",
    "honey chilli potato": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600",
    
    # Italian
    "pizza": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600",
    "margherita pizza": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600",
    "pepperoni pizza": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600",
    "pasta": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600",
    "pasta alfredo": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600",
    "pesto pasta": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600",
    "lasagna": "https://images.unsplash.com/photo-1619895092538-128341789043?w=600",
    "caprese salad": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600",
    
    # Japanese
    "sushi": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600",
    "california roll": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600",
    "salmon sashimi": "https://images.unsplash.com/photo-1617196034630-95f8e5f04b4a?w=600",
    "sashimi": "https://images.unsplash.com/photo-1617196034630-95f8e5f04b4a?w=600",
    "tempura": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600",
    "vegetable tempura": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600",
    "ramen": "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=600",
    "spicy tuna roll": "https://images.unsplash.com/photo-1564489563601-c53cfc451e93?w=600",
    
    # Mexican
    "tacos": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600",
    "chicken tacos": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600",
    "burrito": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600",
    "burrito bowl": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600",
    "veggie burrito bowl": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600",
    "quesadilla": "https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=600",
    "beef quesadilla": "https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=600",
    "guacamole": "https://images.unsplash.com/photo-1534939268332-e0b3b92c2e3e?w=600",
    "nachos": "https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=600",
    
    # American/Burgers
    "burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
    "beef burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
    "classic beef burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
    "chicken burger": "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600",
    "grilled chicken burger": "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600",
    "veggie burger": "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600",
    "fries": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600",
    "loaded fries": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600",
    "chicken wings": "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=600",
    "bbq chicken wings": "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=600",
    
    # Healthy
    "salad": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600",
    "grilled chicken salad": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600",
    "greek salad": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600",
    "protein bowl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
    "grilled chicken protein bowl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
    "quinoa": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600",
    "quinoa buddha bowl": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600",
    "quinoa power bowl": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600",
    "poke bowl": "https://images.unsplash.com/photo-1546069901-eacef0df6022?w=600",
    "salmon poke bowl": "https://images.unsplash.com/photo-1546069901-eacef0df6022?w=600",
    "smoothie bowl": "https://images.unsplash.com/photo-1546039907-7fa05f864c02?w=600",
    "avocado toast": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600",
    
    # Desserts
    "gulab jamun": "https://images.unsplash.com/photo-1540648639573-8c848de23f0a?w=600",
    "gajar halwa": "https://images.unsplash.com/photo-1633383718081-22ac93e3db65?w=600",
    "cheesecake": "https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=600",
    "tiramisu": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600",
    "brownie": "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=600",
    "brownie with ice cream": "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=600",
    "chocolate truffle": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600",
    "red velvet cake": "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=600",
    "vanilla creme brulee": "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=600",
    "ice cream": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600",
    
    # Default fallback
    "default": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600"
}

# ============================================
# PRICE NORMALIZATION BY DISH CATEGORY
# ============================================

def get_logical_price(item_name, diet, cuisine=None):
    """
    Get logical price based on dish type
    """
    name_lower = item_name.lower()
    
    # Desserts: ₹100-200
    dessert_keywords = ['gulab jamun', 'halwa', 'cheesecake', 'tiramisu', 'brownie', 
                        'truffle', 'cake', 'brulee', 'ice cream', 'kulfi', 'rasmalai']
    for kw in dessert_keywords:
        if kw in name_lower:
            return 120 + (hash(item_name) % 80)  # 120-200
    
    # Beverages: ₹50-100
    if 'coffee' in name_lower or 'tea' in name_lower or 'lassi' in name_lower or 'juice' in name_lower:
        return 50 + (hash(item_name) % 50)  # 50-100
    
    # South Indian Light: ₹80-150
    south_indian = ['dosa', 'idli', 'vada', 'uttapam', 'pongal', 'sambar']
    for kw in south_indian:
        if kw in name_lower:
            return 80 + (hash(item_name) % 70)  # 80-150
    
    # Starters/Appetizers: ₹120-200
    starters = ['spring roll', 'samosa', 'pakora', 'chips', 'fries', 'nachos', 'guacamole']
    for kw in starters:
        if kw in name_lower:
            return 120 + (hash(item_name) % 80)  # 120-200
    
    # Bread: ₹40-80
    if 'naan' in name_lower or 'roti' in name_lower or 'paratha' in name_lower:
        return 40 + (hash(item_name) % 40)  # 40-80
    
    # Biryani/Rice dishes: ₹200-350
    if 'biryani' in name_lower or 'pulao' in name_lower:
        if diet == 'non-veg':
            return 280 + (hash(item_name) % 70)  # 280-350
        return 220 + (hash(item_name) % 60)  # 220-280
    
    # Pizza/Pasta: ₹280-450
    if 'pizza' in name_lower or 'pasta' in name_lower or 'lasagna' in name_lower:
        return 280 + (hash(item_name) % 170)  # 280-450
    
    # Sushi/Japanese: ₹350-550
    if 'sushi' in name_lower or 'sashimi' in name_lower or 'roll' in name_lower:
        return 350 + (hash(item_name) % 200)  # 350-550
    
    # Chinese: ₹180-320
    chinese = ['fried rice', 'noodles', 'manchurian', 'chilli']
    for kw in chinese:
        if kw in name_lower:
            if diet == 'non-veg':
                return 220 + (hash(item_name) % 100)  # 220-320
            return 180 + (hash(item_name) % 80)  # 180-260
    
    # Healthy Bowls: ₹280-400
    healthy = ['bowl', 'quinoa', 'salad', 'smoothie']
    for kw in healthy:
        if kw in name_lower:
            return 280 + (hash(item_name) % 120)  # 280-400
    
    # Burgers: ₹200-350
    if 'burger' in name_lower:
        if diet == 'non-veg':
            return 250 + (hash(item_name) % 100)  # 250-350
        return 200 + (hash(item_name) % 80)  # 200-280
    
    # Mexican: ₹200-350
    mexican = ['taco', 'burrito', 'quesadilla']
    for kw in mexican:
        if kw in name_lower:
            return 200 + (hash(item_name) % 150)  # 200-350
    
    # Wings: ₹250-350
    if 'wings' in name_lower:
        return 250 + (hash(item_name) % 100)  # 250-350
    
    # Main Course Curry: ₹220-350
    curries = ['chicken', 'paneer', 'curry', 'masala', 'dal', 'gobi']
    for kw in curries:
        if kw in name_lower:
            if diet == 'non-veg':
                return 280 + (hash(item_name) % 70)  # 280-350
            return 220 + (hash(item_name) % 60)  # 220-280
    
    # Default: ₹200-300
    return 200 + (hash(item_name) % 100)


# ============================================
# TAG CORRECTION
# ============================================

def get_correct_tags(item_name, diet, spicy):
    """
    Get appropriate tags based on dish characteristics
    """
    name_lower = item_name.lower()
    tags = []
    
    # Diet tags
    if diet == 'veg':
        tags.append('vegetarian')
    
    # Spicy tags
    if spicy == 'hot':
        tags.append('spicy')
    elif spicy == 'mild':
        tags.append('mild')
    
    # Category tags
    dessert_keywords = ['gulab jamun', 'halwa', 'cheesecake', 'tiramisu', 'brownie', 
                        'truffle', 'cake', 'brulee', 'ice cream', 'kulfi']
    is_dessert = any(kw in name_lower for kw in dessert_keywords)
    
    if is_dessert:
        tags.append('dessert')
        tags.append('sweet')
    
    # Healthy tags
    healthy_keywords = ['salad', 'quinoa', 'grilled', 'bowl', 'smoothie']
    if any(kw in name_lower for kw in healthy_keywords):
        tags.append('healthy')
    
    # Traditional tags
    traditional = ['biryani', 'dosa', 'idli', 'sambar', 'paneer', 'dal', 'naan']
    if any(kw in name_lower for kw in traditional):
        tags.append('traditional')
    
    # Comfort food
    comfort = ['burger', 'fries', 'pizza', 'pasta', 'wings', 'noodles', 'fried rice']
    if any(kw in name_lower for kw in comfort):
        tags.append('comfort')
    
    # High protein
    high_protein = ['chicken', 'salmon', 'protein', 'paneer', 'egg', 'tofu']
    if any(kw in name_lower for kw in high_protein):
        tags.append('high-protein')
    
    # Popular (based on common dishes)
    popular = ['butter chicken', 'biryani', 'dosa', 'pizza', 'burger', 'pasta']
    if any(kw in name_lower for kw in popular):
        tags.append('popular')
    
    return list(set(tags))  # Remove duplicates


def get_image_url(item_name):
    """
    Get appropriate image URL for a food item
    """
    name_lower = item_name.lower()
    
    # Try exact match first
    if name_lower in FOOD_IMAGES:
        return FOOD_IMAGES[name_lower]
    
    # Try partial match
    for key, url in FOOD_IMAGES.items():
        if key in name_lower or name_lower in key:
            return url
    
    # Fallback
    return FOOD_IMAGES["default"]


def get_restaurant_image(cuisine):
    """
    Get appropriate image URL for a restaurant
    """
    import random
    
    for key, urls in RESTAURANT_IMAGES.items():
        if key.lower() in cuisine.lower():
            return random.choice(urls)
    
    return random.choice(RESTAURANT_IMAGES["default"])


# ============================================
# MAIN FIX FUNCTION
# ============================================

def fix_database():
    """
    Fix all restaurants and menu items in the database
    """
    print("=" * 60)
    print("    SMARTDINE DATABASE FIX")
    print("=" * 60)
    
    # Get all restaurants
    restaurants = list(restaurants_collection.find())
    print(f"\n📊 Found {len(restaurants)} restaurants to fix")
    
    fixed_restaurants = 0
    fixed_menu_items = 0
    
    for restaurant in restaurants:
        restaurant_id = restaurant['_id']
        restaurant_name = restaurant.get('name', 'Unknown')
        cuisine = restaurant.get('cuisine', 'default')
        
        # Fix restaurant image
        new_restaurant_image = get_restaurant_image(cuisine)
        
        # Fix menu items
        menu = restaurant.get('menu', [])
        fixed_menu = []
        
        for item in menu:
            item_name = item.get('name', 'Unknown')
            diet = item.get('diet', 'veg')
            spicy = item.get('spicy', 'mild')
            
            # Fix image
            item['image'] = get_image_url(item_name)
            
            # Fix price
            item['price'] = get_logical_price(item_name, diet, cuisine)
            
            # Fix tags
            item['tags'] = get_correct_tags(item_name, diet, spicy)
            
            fixed_menu.append(item)
            fixed_menu_items += 1
        
        # Update restaurant in database
        restaurants_collection.update_one(
            {'_id': restaurant_id},
            {
                '$set': {
                    'image': new_restaurant_image,
                    'menu': fixed_menu
                }
            }
        )
        
        fixed_restaurants += 1
        print(f"  ✅ Fixed: {restaurant_name} ({len(menu)} items)")
    
    print("\n" + "=" * 60)
    print("    FIX COMPLETE!")
    print("=" * 60)
    print(f"\n📊 SUMMARY:")
    print(f"  • Restaurants fixed: {fixed_restaurants}")
    print(f"  • Menu items fixed: {fixed_menu_items}")
    
    # Show sample of fixed data
    print("\n📋 SAMPLE FIXED DATA:")
    sample = restaurants_collection.find_one({}, {"_id": 0})
    if sample:
        print(f"\n  Restaurant: {sample.get('name')}")
        print(f"  Image: {sample.get('image', '')[:60]}...")
        if sample.get('menu'):
            first_item = sample['menu'][0]
            print(f"\n  First menu item: {first_item.get('name')}")
            print(f"    Price: ₹{first_item.get('price')}")
            print(f"    Image: {first_item.get('image', '')[:60]}...")
            print(f"    Tags: {first_item.get('tags')}")
    
    print("\n✅ Database fix complete! Restart your app to see changes.")


if __name__ == "__main__":
    fix_database()
