from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import requests
import os

load_dotenv()

mongodb_uri = os.getenv("MONGODB_URI")
groq_api_key = os.getenv("GROQ_API_KEY")


client = MongoClient(mongodb_uri, server_api=ServerApi('1'))
db = client["smartdine_ai"]
collection = db["restaurants"]
docs = list(collection.find({}, {"_id": 0}))

response_collection = db["groq_responses"]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


url = "https://api.groq.com/openai/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {groq_api_key}",
    "Content-Type": "application/json"
}


class Question(BaseModel):
    question: str


@app.post("/ask")
def ask_question(data: Question):

    print("---- /ask called ----")
    print("User question received:", data.question)

    print("\nBuilding prompt...")
    prompt = f"""
You are SmartDine AI.
You help users find the best restaurants based on:
- cuisine
- spice level
- location
- budget

Here are restaurants available:
{docs}

User said: "{data.question}"

Respond with:
- Best matching restaurant names
- Why they match
- Price range
- Must try dish
- Short 2-line answer
"""
    print("Prompt ready ✔️")

    print("\nPreparing headers and payload...")

    payload = {
        "model": "llama3-groq-8b",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.6
    }

    print("Payload ready ✔️")

    print("\nSending request to Groq API...")
    response = requests.post(url, headers=headers, json=payload)
    print("Response received ✔️")

    result = response.json()
    print("\nRaw result:", result)

    answer = result["choices"][0]["message"]["content"]
    print("\nExtracted answer:", answer)

    # OPTIONAL: store each conversation
    response_collection.insert_one({
        "question": data.question,
        "answer": answer
    })

    print("Saved to MongoDB ✔️")

    print("---- /ask completed ----\n")

    return {"answer": answer}
