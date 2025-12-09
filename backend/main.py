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
db = client["smartdine"]
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


@app.get("/restaurants")
def get_restaurants():
    return docs


@app.post("/ask")
def ask_question(data: Question):

    prompt = f"""
You are SmartDine AI.

You can only recommend restaurants from THIS LIST:
{docs}

Do NOT invent new restaurants.

User preference: "{data.question}"

Your response rules:
1. Recommend ONLY restaurants present in the list above.
2. Match based on:
   - cuisine
   - spice
   - diet
3. Respond with short bullet points:
   - restaurant name
   - cuisine
   - why it matches
   - must try dish
4. If no match, say "No exact match, here are similar options" and list similar ones from the list.
"""

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.6
    }

    response = requests.post(url, headers=headers, json=payload)
    result = response.json()

    if "choices" not in result:
        return {"answer": "Sorry, AI is unavailable at the moment."}

    answer = result["choices"][0]["message"]["content"]

    response_collection.insert_one({
        "question": data.question,
        "answer": answer
    })

    return {"answer": answer}
