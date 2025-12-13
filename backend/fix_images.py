"""
Update restaurant images and fix prawn/cheesecake images
ONLY updates specific image URLs, does NOT touch other data
"""
from db import collection

# Unique restaurant images
restaurant_images = {
    'Coastal Catch': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
    'Street Food Junction': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    'Breakfast Club': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
    "Amma's Rasoi": 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
    'Noodle Nest': 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800',
    'Green Spoon': 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?w=800',
    'Spice Symphony': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    'Urban Bites': 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800',
    'Dragon Wok': 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=800',
    'Burger Hub': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    'Pasta Palace': 'https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=800',
    'Dessert Dreams': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800',
    'The Curry House': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
    'Tandoor Tales': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800',
    'Pizza Point': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    'Saravana Bhavan': 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=800',
    'MTR - Mavalli Tiffin Room': 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800',
    'Udupi Grand': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800',
    'Spice Junction': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800',
    'Green Bowl Cafe': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
    'The Dosa House': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800',
    'Pizza Paradise': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
    'Burger Barn': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800',
}

# Valid images for specific menu items
menu_item_images = {
    'Prawn Curry': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600',
    'Cheesecake': 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=600',
}

print("🔧 Updating restaurant images...")
updated_restaurants = 0
for name, img in restaurant_images.items():
    result = collection.update_one({'name': name}, {'$set': {'image': img}})
    if result.modified_count > 0:
        print(f"  ✅ {name}")
        updated_restaurants += 1

print(f"\n🔧 Updating menu item images (Prawn Curry, Cheesecake)...")
updated_items = 0
for restaurant in collection.find():
    menu = restaurant.get('menu', [])
    updated = False
    for item in menu:
        if item['name'] in menu_item_images:
            item['image'] = menu_item_images[item['name']]
            updated = True
            updated_items += 1
    
    if updated:
        collection.update_one(
            {'_id': restaurant['_id']},
            {'$set': {'menu': menu}}
        )
        print(f"  ✅ Fixed items in {restaurant['name']}")

print(f"\n✅ Done!")
print(f"   Restaurants updated: {updated_restaurants}")
print(f"   Menu items fixed: {updated_items}")
