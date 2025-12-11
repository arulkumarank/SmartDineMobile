"""
Verify database has restaurant data
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import collection as restaurants_collection

# Count restaurants
restaurant_count = restaurants_collection.count_documents({})
print(f"Total restaurants: {restaurant_count}")

# Get all restaurants
restaurants = list(restaurants_collection.find({}, {"_id": 0}))

# Count total menu items
total_menu_items = 0
for r in restaurants:
    menu_items = len(r.get('menu', []))
    total_menu_items += menu_items
    print(f"\n{r.get('name', 'Unknown')} ({r.get('cuisine', 'Unknown')}):")
    print(f"  Location: {r.get('location', {}).get('address', 'No address')}")
    print(f"  Menu items: {menu_items}")
    
    # Show first 3 menu items
    for i, item in enumerate(r.get('menu', [])[:3]):
        print(f"    - {item.get('name', 'Unknown')} (₹{item.get('price', 0)})")

print(f"\n✅ Total menu items across all restaurants: {total_menu_items}")
