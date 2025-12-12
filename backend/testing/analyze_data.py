"""
Analyze database data for issues with pricing and images
"""
import sys
import os
import json
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import collection as restaurants_collection

# Get all restaurants with full data
restaurants = list(restaurants_collection.find({}, {"_id": 0}))

print(f"Total restaurants: {len(restaurants)}")
print("=" * 80)

# Analyze each restaurant
issues = {
    "invalid_image_urls": [],
    "invalid_prices": [],
    "missing_images": [],
    "missing_prices": []
}

for r in restaurants:
    restaurant_name = r.get('name', 'Unknown')
    restaurant_image = r.get('image', '')
    
    print(f"\n🍽️  {restaurant_name} ({r.get('cuisine', 'Unknown')})")
    print(f"   Restaurant Image: {restaurant_image[:80] if restaurant_image else 'MISSING'}...")
    
    # Check restaurant image
    if not restaurant_image:
        issues["missing_images"].append(f"Restaurant: {restaurant_name}")
    elif not restaurant_image.startswith(('http://', 'https://')):
        issues["invalid_image_urls"].append(f"Restaurant: {restaurant_name} - {restaurant_image}")
    
    # Check menu items
    menu = r.get('menu', [])
    for item in menu:
        item_name = item.get('name', 'Unknown')
        item_price = item.get('price')
        item_image = item.get('image', '')
        
        # Check price
        if item_price is None:
            issues["missing_prices"].append(f"{restaurant_name} > {item_name}")
        elif not isinstance(item_price, (int, float)) or item_price <= 0:
            issues["invalid_prices"].append(f"{restaurant_name} > {item_name}: price={item_price}")
        
        # Check image
        if not item_image:
            issues["missing_images"].append(f"{restaurant_name} > {item_name}")
        elif not item_image.startswith(('http://', 'https://')):
            issues["invalid_image_urls"].append(f"{restaurant_name} > {item_name}: {item_image}")
    
    print(f"   Menu items: {len(menu)}")

print("\n" + "=" * 80)
print("🔍 ISSUES FOUND:")
print("=" * 80)

print(f"\n❌ Invalid Image URLs ({len(issues['invalid_image_urls'])}):")
for issue in issues['invalid_image_urls'][:20]:
    print(f"   - {issue}")
if len(issues['invalid_image_urls']) > 20:
    print(f"   ... and {len(issues['invalid_image_urls']) - 20} more")

print(f"\n❌ Missing Images ({len(issues['missing_images'])}):")
for issue in issues['missing_images'][:20]:
    print(f"   - {issue}")
if len(issues['missing_images']) > 20:
    print(f"   ... and {len(issues['missing_images']) - 20} more")

print(f"\n❌ Invalid Prices ({len(issues['invalid_prices'])}):")
for issue in issues['invalid_prices'][:20]:
    print(f"   - {issue}")
if len(issues['invalid_prices']) > 20:
    print(f"   ... and {len(issues['invalid_prices']) - 20} more")

print(f"\n❌ Missing Prices ({len(issues['missing_prices'])}):")
for issue in issues['missing_prices'][:20]:
    print(f"   - {issue}")
if len(issues['missing_prices']) > 20:
    print(f"   ... and {len(issues['missing_prices']) - 20} more")

# Export raw data for analysis
print("\n" + "=" * 80)
print("📊 EXPORTING RAW DATA TO JSON:")
print("=" * 80)

with open("testing/raw_database_data.json", "w", encoding="utf-8") as f:
    json.dump(restaurants, f, indent=2, ensure_ascii=False)

print("Exported to testing/raw_database_data.json")
print("\n✅ Analysis complete!")
