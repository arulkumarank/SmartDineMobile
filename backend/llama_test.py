from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
import ollama
import os

load_dotenv()

mongodb_uri = os.getenv("MONGODB_URI")
# groq_api_key = os.getenv("GROQ_API_KEY")

# url = "https://api.groq.com/openai/v1/chat/completions"

Client = MongoClient(mongodb_uri, server_api=ServerApi('1'))
db = Client["smartdine"]
collection = db["restaurants"]

docs = list(collection.find({}, {"_id": 0}))
print("docs:", docs)
while True:
    questions = input("question (exit to stop): ")
    if questions.lower()=="exit":
        break
    
    prompt = f"""
You are a restaurant assistant.
Here are restaurants:
{docs}

Answer based on the list only:
{questions}
"""

    response = ollama.chat(
        model="llama3.2",
        messages=[{"role": "user", "content": prompt}],
        options={"temperature": 0.2}
    )

    print("\nAI:", response["message"]["content"])
