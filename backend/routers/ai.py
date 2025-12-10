from fastapi import APIRouter, Depends
from dotenv import load_dotenv
import requests
import os
from datetime import datetime

from db import docs, response_collection, userdetails_collection, search_history_collection
from models import Question
from routers.auth import get_current_user

load_dotenv()

router = APIRouter(prefix="/ai", tags=["ai"])

groq_api_key = os.getenv("GROQ_API_KEY")
url = "https://api.groq.com/openai/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {groq_api_key}",
    "Content-Type": "application/json"
}


@router.post("/ask")
def ask_question(data: Question, current_user: dict = Depends(get_current_user)):
    """Ask AI for food recommendations based on user profile and preferences"""
    
    # Get user profile
    user_profile = userdetails_collection.find_one(
        {"username": current_user["username"]},
        {"_id": 0}
    )
    
    # Build personalized prompt
    user_info = ""
    if user_profile:
        user_info = f"""
User Profile:
- Name: {user_profile.get('name', 'Guest')}
- Taste Preference: {user_profile.get('taste_preference', 'Not specified')}
- Dietary Restrictions: {', '.join(user_profile.get('dietary_restrictions', [])) or 'None'}
"""
    
    prompt = f"""
You are SmartDine AI - a personalized food recommendation assistant.

{user_info}

User Query: "{data.question}"

Restaurant & Food Database:
{docs}

Your task:
1. Analyze the user's query for:
   - Nutritional keywords (high protein, high fiber, low carb, healthy, etc.)
   - Cuisine preferences
   - Mood/occasion
   - Price sensitivity
   
2. Consider the user's taste preference and dietary restrictions

3. Recommend SPECIFIC FOOD ITEMS with details:
   - Food name
   - Restaurant name
   - Price
   - Why it matches (nutrition, taste, preference)
   - Nutritional highlights if relevant

4. If query mentions nutrition (protein, fiber, healthy):
   - Prioritize foods meeting those nutritional requirements
   - Mention nutritional benefits

5. Format response clearly with bullet points or numbered list

Give 3-5 specific food recommendations.
"""
    
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.6
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        result = response.json()

        if "choices" not in result:
            return {"answer": "Sorry, AI is unavailable at the moment."}

        answer = result["choices"][0]["message"]["content"]

        # Save AI response
        response_collection.insert_one({
            "username": current_user["username"],
            "question": data.question,
            "answer": answer,
            "timestamp": datetime.utcnow()
        })
        
        # Save to search history
        search_history_collection.insert_one({
            "user_id": current_user["username"],
            "query": data.question,
            "timestamp": datetime.utcnow()
        })

        return {"answer": answer}
    
    except Exception as e:
        return {"answer": f"Error: {str(e)}"}
