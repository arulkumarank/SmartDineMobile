"""
Update restaurant images with unique high-quality restaurant images
Only updates restaurant-level images, not food/menu item images
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import collection as restaurants_collection

# Unique restaurant images from Unsplash
RESTAURANT_IMAGES = {
    "Street Food Junction": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600",  # Street food market
    "Breakfast Boulevard": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600",  # Breakfast cafe
    "The Chinese Wok": "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600",  # Chinese restaurant
    "Coastal Catch": "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600",  # Seafood restaurant
    "Vegan Delight": "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600",  # Vegetarian restaurant
    "Cafe Mocha": "https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=600",  # Coffee shop
    "Spice Garden": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600",  # Indian restaurant
    "Pizza Palace": "https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=600",  # Italian pizzeria
    "Sushi Bar": "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=600",  # Japanese sushi
    "BBQ Nation": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",  # BBQ grill
    "Thai Orchid": "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=600",  # Thai restaurant
    "Mexican Fiesta": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600",  # Mexican restaurant
    "The Grill House": "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=600",  # Steakhouse
    "Mediterranean Mezze": "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600",  # Mediterranean
    "Dim Sum Palace": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600",  # Dim sum
}

# Generic fallback restaurant images for restaurants not in the list
FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600",
    "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=600",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600",
    "https://images.unsplash.com/photo-1540914124281-342587941389?w=600",
    "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=600",
]

def update_restaurant_images():
    print("=" * 60)
    print("    UPDATING RESTAURANT IMAGES (NOT FOOD IMAGES)")
    print("=" * 60)
    
    restaurants = list(restaurants_collection.find())
    print(f"\nFound {len(restaurants)} restaurants")
    
    fallback_index = 0
    updated_count = 0
    
    for restaurant in restaurants:
        name = restaurant.get('name', 'Unknown')
        
        # Get the new image for this restaurant
        if name in RESTAURANT_IMAGES:
            new_image = RESTAURANT_IMAGES[name]
        else:
            # Use fallback and cycle through
            new_image = FALLBACK_IMAGES[fallback_index % len(FALLBACK_IMAGES)]
            fallback_index += 1
        
        old_image = restaurant.get('image', 'None')[:50] if restaurant.get('image') else 'None'
        
        # Update only the restaurant image, NOT menu items
        restaurants_collection.update_one(
            {'_id': restaurant['_id']},
            {'$set': {'image': new_image}}
        )
        
        print(f"  Updated: {name}")
        print(f"    Old: {old_image}...")
        print(f"    New: {new_image[:50]}...")
        updated_count += 1
    
    print(f"\n✅ Updated {updated_count} restaurant images")
    print("Note: Food/menu item images were NOT modified")

if __name__ == "__main__":
    update_restaurant_images()
