import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv


load_dotenv()
mongodb_uri = os.getenv("MONGODB_URI")

# Create a new client and connect to the server
client = MongoClient(mongodb_uri, server_api=ServerApi('1'))

db = client["smartdine"]
collection = db["restaurants"]

print("Restaurants in the database:")
for item in collection.find({}, {"_id": 0}):
    print(item)

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)