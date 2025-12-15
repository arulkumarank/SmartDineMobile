"""
Get all restaurant names from database and update ALL coordinates to Chennai
"""

from pymongo import MongoClient
import os
import random
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
MONGODB_URI = os.getenv('MONGODB_URI')
client = MongoClient(MONGODB_URI)
db = client['smartdine']
restaurants_col = db['restaurants']

# Get all restaurants
all_restaurants = list(restaurants_col.find({}, {"name": 1}))
print(f"Found {len(all_restaurants)} restaurants in database\n")

# Update each with Chennai coordinates
updated_count = 0
for restaurant in all_restaurants:
    # Generate random but realistic coordinates in Chennai
    lat = round(random.uniform(13.03, 13.12), 4)
    lng = round(random.uniform(80.20, 80.28), 4)
    
    result = restaurants_col.update_one(
        {"_id": restaurant["_id"]},
        {"$set": {
            "location": {
                "type": "Point",
                "coordinates": [lng, lat],  # MongoDB uses [lng, lat]
                "latitude": lat,
                "longitude": lng
            }
        }}
    )
    
    if result.modified_count > 0:
        print(f"Updated: {restaurant['name']} -> ({lat}, {lng})")
        updated_count += 1

print(f"\nUpdated {updated_count} restaurants with Chennai coordinates!")
print("All restaurants now in Chennai area (Lat: 13.03-13.12, Lng: 80.20-80.28)")
