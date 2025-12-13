"""Quick fix for Prawn Curry image"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import collection as restaurants_collection

# Find all restaurants with Prawn Curry
restaurants = list(restaurants_collection.find())

for restaurant in restaurants:
    menu = restaurant.get('menu', [])
    updated = False
    
    for item in menu:
        if 'prawn curry' in item.get('name', '').lower():
            item['image'] = 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600'
            print(f"Updated Prawn Curry image at {restaurant['name']}")
            updated = True
    
    if updated:
        restaurants_collection.update_one(
            {'_id': restaurant['_id']},
            {'$set': {'menu': menu}}
        )

print("Done!")
