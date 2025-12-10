from fastapi import APIRouter, HTTPException
from models import Question
from db import responses_collection, restaurants_collection
import requests
import os

router = APIRouter()

# Load restaurants from DB
docs = list(restaurants_collection.find({}, {"_id": 0}))

# Groq config
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_HEADERS = {
    "Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}",
    "Content-Type": "application/json"
}


@router.post("/ask")
def ask_question(data: Question):
    try:
        prompt = f"""
        You are SmartDine Assistant.

        The user asks: "{data.question}"

        Only suggest restaurants from this list:
        {docs}

        Based on their question, return the restaurant name and a short useful explanation. 
        If it's about cuisine, match by cuisine.
        If it's about diet, match by diet.
        If it's about spice level, match by spice.

        If none match, return closest possible suggestion.
        """

        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.7,
            "max_tokens": 300
        }

        response = requests.post(GROQ_URL, headers=GROQ_HEADERS, json=payload)

        answer = response.json()["choices"][0]["message"]["content"].strip()

        # optional save response
        responses_collection.insert_one({
            "question": data.question,
            "answer": answer,
        })

        return {"answer": answer}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
