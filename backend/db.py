from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
import os

load_dotenv()

mongodb_uri = os.getenv("MONGODB_URI")

client = MongoClient(mongodb_uri, server_api=ServerApi('1'))
db = client["smartdine"]

# Collections
collection = db["restaurants"]
response_collection = db["groq_responses"]
auth_collection = db["auth"]  # User credentials
userdetails_collection = db["userdetails"]  # User profiles
foods_collection = db["foods"]  # Food items
search_history_collection = db["search_history"]  # Search history
otp_collection = db["otp_codes"]  # Temporary OTP storage

# RL & Rating Collections
user_interactions = db["user_interactions"]  # clicks, cart adds, views
food_ratings = db["food_ratings"]  # individual user ratings per food
food_scores = db["food_scores"]  # aggregated RL scores per food

# Preload restaurant documents
docs = list(collection.find({}, {"_id": 0}))

