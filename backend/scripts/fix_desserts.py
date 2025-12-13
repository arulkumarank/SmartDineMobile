"""
Fix MongoDB desserts with incorrect spicy values
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import collection as restaurants_collection

# Dessert items that should have spicy=none
DESSERT_NAMES = [
    "Cheesecake", "Red Velvet Cake", "Chocolate Truffle", "Brownie with Ice Cream",
    "Vanilla Creme Brulee", "Panna Cotta", "Waffle with Ice Cream", "Vanilla Scoop",
    "Strawberry Sundae", "Macaron Assortment", "Mango Sorbet", "Chocolate Scoop",
    "Coconut Ice Cream", "Blueberry Cheesecake", "Tiramisu", "Gulab Jamun",
    "Gajar Halwa", "Mochi Ice Cream", "Churros", "Shahi Tukda", "Cinnamon Roll",
    "Mango Sticky Rice", "Brownie", "Ice Cream", "Cake", "Sundae", "Truffle",
    "Scoop", "Kulfi", "Rasmalai", "Jalebi", "Halwa", "Kheer"
]

def fix_desserts():
    """Fix all dessert items in MongoDB to have spicy=none"""
    print("=" * 60)
    print("    FIXING DESSERT SPICY VALUES IN MONGODB")
    print("=" * 60)
    
    restaurants = list(restaurants_collection.find())
    print(f"\nFound {len(restaurants)} restaurants")
    
    fixed_count = 0
    
    for restaurant in restaurants:
        restaurant_id = restaurant['_id']
        restaurant_name = restaurant.get('name', 'Unknown')
        menu = restaurant.get('menu', [])
        updated_menu = []
        restaurant_fixed = 0
        
        for item in menu:
            item_name = item.get('name', '')
            # Check if it's a dessert by name
            is_dessert = any(dessert.lower() in item_name.lower() for dessert in DESSERT_NAMES)
            
            if is_dessert and item.get('spicy') != 'none':
                old_spicy = item.get('spicy', 'unknown')
                item['spicy'] = 'none'
                # Also add dessert tag if not present
                if 'tags' not in item:
                    item['tags'] = []
                if 'dessert' not in item['tags']:
                    item['tags'].append('dessert')
                if 'sweet' not in item['tags']:
                    item['tags'].append('sweet')
                print(f"  Fixed: {item_name} at {restaurant_name} - spicy: {old_spicy} -> none")
                restaurant_fixed += 1
                fixed_count += 1
            
            updated_menu.append(item)
        
        if restaurant_fixed > 0:
            # Update the restaurant with fixed menu
            restaurants_collection.update_one(
                {'_id': restaurant_id},
                {'$set': {'menu': updated_menu}}
            )
    
    print(f"\n✅ Fixed {fixed_count} dessert items across all restaurants")
    print("Restart your app to see the changes.")

if __name__ == "__main__":
    fix_desserts()
