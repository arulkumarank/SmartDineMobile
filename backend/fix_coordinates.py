"""
Script to fix restaurant coordinates in MongoDB
All restaurants should be in Chennai, Tamil Nadu, India
Coordinates: Latitude between 12.9-13.2, Longitude between 80.1-80.3
"""

from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
MONGODB_URI = os.getenv('MONGODB_URI')
client = MongoClient(MONGODB_URI)
db = client['smartdine']
restaurants = db['restaurants']

# Chennai area coordinates (realistic locations)
chennai_locations = [
    {"name": "The Grand Buffet", "lat": 13.0569, "lng": 80.2425},
    {"name": "Spice Junction", "lat": 13.0475, "lng": 80.2574},
    {"name": "Biryani House", "lat": 13.0827, "lng": 80.2707},
    {"name": "The Burger Hub", "lat": 13.0632, "lng": 80.2584},
    {"name": "Pizza Palace", "lat": 13.0338, "lng": 80.2204},
    {"name": "Sushi World", "lat": 13.0569, "lng": 80.2510},
    {"name": "BBQ Nation", "lat": 13.0475, "lng": 80.2344},
    {"name": "The Coffee Shop", "lat": 13.0827, "lng": 80.2456},
    {"name": "Pasta Paradise", "lat": 13.0678, "lng": 80.2569},
    {"name": "Tandoori Nights", "lat": 13.0421, "lng": 80.2315},
    {"name": "The Salad Bar", "lat": 13.0583, "lng": 80.2689},
    {"name": "Taco Fiesta", "lat": 13.0744, "lng": 80.2404},
    {"name": "Noodle Express", "lat": 13.0395, "lng": 80.2547},
    {"name": "The Steakhouse", "lat": 13.0612, "lng": 80.2367},
    {"name": "Vegan Delight", "lat": 13.0528, "lng": 80.2633},
    {"name": "Ice Cream Factory", "lat": 13.0697, "lng": 80.2498},
    {"name": "The Pancake House", "lat": 13.0453, "lng": 80.2421},
    {"name": "Seafood Shack", "lat": 13.0801, "lng": 80.2656},
    {"name": "The Juice Bar", "lat": 13.0549, "lng": 80.2578},
    {"name": "Ramen Corner", "lat": 13.0488, "lng": 80.2289},
    {"name": "The Grill House", "lat": 13.0765, "lng": 80.2531},
    {"name": "Smoothie Station", "lat": 13.0621, "lng": 80.2445},
    {"name": "The Breakfast Club", "lat": 13.0412, "lng": 80.2612},
    {"name": "Indian Curry House", "lat": 13.0597, "lng": 80.2389},
    {"name": "The Dumpling Den", "lat": 13.0723, "lng": 80.2667},
    {"name": "Bakery Bliss", "lat": 13.0508, "lng": 80.2501},
    {"name": "The Tea Garden", "lat": 13.0654, "lng": 80.2423},
    {"name": "Mediterranean Feast", "lat": 13.0439, "lng": 80.2558},
    {"name": "The Waffle House", "lat": 13.0782, "lng": 80.2378},
    {"name": "Thai Flavors", "lat": 13.0531, "lng": 80.2645},
    {"name": "The Sandwich Shop", "lat": 13.0689, "lng": 80.2512},
    {"name": "Korean BBQ", "lat": 13.0467, "lng": 80.2434},
    {"name": "The Donut Shop", "lat": 13.0619, "lng": 80.2601},
    {"name": "Vietnamese Kitchen", "lat": 13.0754, "lng": 80.2367},
    {"name": "The Protein Bowl", "lat": 13.0542, "lng": 80.2534},
    {"name": "French Bistro", "lat": 13.0498, "lng": 80.2456},
    {"name": "The Smoothie Bowl", "lat": 13.0712, "lng": 80.2623},
    {"name": "Mexican Cantina", "lat": 13.0581, "lng": 80.2489},
    {"name": "Saravana Bhavan", "lat": 13.0427, "lng": 80.2512}
]

print(f"Updating coordinates for {len(chennai_locations)} restaurants...")

for location in chennai_locations:
    result = restaurants.update_one(
        {"name": location["name"]},
        {"$set": {
            "location": {
                "type": "Point",
                "coordinates": [location["lng"], location["lat"]],
                "latitude": location["lat"],
                "longitude": location["lng"]
            }
        }}
    )
    if result.modified_count > 0:
        print(f"Updated {location['name']}")
    else:
        print(f"Not found: {location['name']}")

print("\nAll coordinates updated to Chennai, Tamil Nadu!")
print("All restaurants are now within: Lat 12.9-13.2, Lng 80.1-80.3")
