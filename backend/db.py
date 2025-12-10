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

# Preload restaurant documents
docs = list(collection.find({}, {"_id": 0}))
