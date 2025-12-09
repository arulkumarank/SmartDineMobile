from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os

mongodb_uri = os.getenv("MONGODB_URI")

client = MongoClient(mongodb_uri, server_api=ServerApi('1'))

db = client.smartdine

restaurants_collection = db["restaurants"]
responses_collection = db["groq_responses"]
users_collection = db["users"]
