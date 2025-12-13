"""Fix Paneer Tikka and Kulfi images"""
from db import collection

menu_fixes = {
    'Paneer Tikka': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600',
    'Kulfi': 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=600',
}

print('Fixing Paneer Tikka and Kulfi images...')
fixed = 0
for restaurant in collection.find():
    menu = restaurant.get('menu', [])
    updated = False
    for item in menu:
        if item['name'] in menu_fixes:
            item['image'] = menu_fixes[item['name']]
            updated = True
            fixed += 1
    if updated:
        collection.replace_one({'_id': restaurant['_id']}, restaurant)
        print(f"  Fixed in: {restaurant['name']}")

print(f'Done! Fixed {fixed} items')
