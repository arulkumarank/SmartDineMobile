"""Fix Vegan Delight - remove non-vegan items"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import collection as restaurants_collection

# Non-vegan items that shouldn't be in Vegan Delight
NON_VEGAN_ITEMS = ['Prawn Curry', 'Fish Fry', 'Chicken', 'Mutton', 'Salmon', 'Beef', 'Pork']

restaurant = restaurants_collection.find_one({'name': 'Vegan Delight'})

if restaurant:
    menu = restaurant.get('menu', [])
    original_count = len(menu)
    
    # Filter out non-vegan items
    vegan_menu = [item for item in menu if not any(nv.lower() in item.get('name', '').lower() for nv in NON_VEGAN_ITEMS)]
    
    removed_items = [item['name'] for item in menu if any(nv.lower() in item.get('name', '').lower() for nv in NON_VEGAN_ITEMS)]
    
    if removed_items:
        print(f"Removing non-vegan items from Vegan Delight:")
        for item in removed_items:
            print(f"  - {item}")
        
        restaurants_collection.update_one(
            {'_id': restaurant['_id']},
            {'$set': {'menu': vegan_menu}}
        )
        print(f"\n✅ Menu updated: {original_count} -> {len(vegan_menu)} items")
    else:
        print("No non-vegan items found")
else:
    print("Vegan Delight restaurant not found")
