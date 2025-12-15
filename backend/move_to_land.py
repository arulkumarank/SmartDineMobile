"""
Move ALL restaurants to land areas in Chennai (avoid water bodies)
Chennai land coordinates: Lat 13.04-13.11, Lng 80.21-80.27 (land areas only)
"""

from pymongo import MongoClient
import os
import random
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv('MONGODB_URI')
client = MongoClient(MONGODB_URI)
db = client['smartdine']
restaurants_col = db['restaurants']

# Chennai LAND coordinates only (avoiding Bay of Bengal and water bodies)
# More concentrated in central Chennai to avoid Marina Beach and coastal areas
all_restaurants = list(restaurants_col.find({}, {"name": 1}))
print(f"Moving {len(all_restaurants)} restaurants to LAND in Chennai...\n")

updated = 0
for restaurant in all_restaurants:
    # Land-only coordinates in Chennai (avoiding water)
    # Lat 13.04-13.11, Lng 80.21-80.27
    lat = round(random.uniform(13.04, 13.11), 4)
    lng = round(random.uniform(80.21, 80.27), 4)
    
    restaurants_col.update_one(
        {"_id": restaurant["_id"]},
        {"$set": {
            "location": {
                "type": "Point",
                "coordinates": [lng, lat],
                "latitude": lat,
                "longitude": lng
            }
        }}
    )
    print(f"{restaurant['name']}: ({lat}, {lng})")
    updated += 1

print(f"\nMoved {updated} restaurants to LAND!")
print("All coordinates now in Chennai LAND area (Lat: 13.04-13.11, Lng: 80.21-80.27)")
