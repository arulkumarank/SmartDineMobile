"""
Merge new South Indian restaurants into existing data
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db import collection

# Get current restaurant names
existing_names = [r['name'] for r in collection.find()]
print(f'Current restaurants: {len(existing_names)}')

# Import sample_restaurants from populate script
import importlib.util
spec = importlib.util.spec_from_file_location("populate", "testing/populate_restaurants.py")
module = importlib.util.module_from_spec(spec)

# Read and execute just the data part
with open("testing/populate_restaurants.py", "r") as f:
    content = f.read()
    # Extract just the sample_restaurants list
    start = content.find("sample_restaurants = [")
    end = content.find("\ndef populate_restaurants")
    if start != -1 and end != -1:
        exec(content[start:end])

# Find new restaurants not in existing data
new_restaurants = [r for r in sample_restaurants if r['name'] not in existing_names]
print(f'\nNew restaurants to add: {len(new_restaurants)}')
for r in new_restaurants:
    menu_count = len(r.get('menu', []))
    print(f"  - {r['name']} ({r['cuisine']}) - {menu_count} items")

# Add them to database
if new_restaurants:
    result = collection.insert_many(new_restaurants)
    print(f'\n✅ Added {len(result.inserted_ids)} new restaurants')

# Final count
total_restaurants = collection.count_documents({})
total_foods = sum(len(r.get('menu', [])) for r in collection.find())
print(f'\n📊 Final totals: {total_restaurants} restaurants, {total_foods} menu items')
