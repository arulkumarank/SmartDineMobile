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
    
    # Build user preferences string
    user_preferences = ""
    if user_profile:
        user_preferences = f"""
Taste Preference: {user_profile.get('taste_preference', 'Not specified')}
Cuisine Preference: {user_profile.get('cuisine_preference', 'Not specified')}
Dietary Restrictions: {', '.join(user_profile.get('dietary_restrictions', [])) or 'None'}
"""
    
    prompt = f"""
You are SmartDine AI.

Your purpose:
Recommend food and restaurants using the user's message, their taste preferences, cuisine preferences, and the full SmartDine database.

User message:
"{data.question}"

User profile preferences (taste, cuisine, diet, mood):
{user_preferences if user_preferences else "Not Available"}

Database of restaurants and menus:
{docs}

---------------------------------------
OUTPUT RULES
---------------------------------------

1️⃣ SHORT, SIMPLE, SHINING FIRST LINE  
Generate exactly ONE short sentence like examples below:

Examples:
• "Here are foods that match your taste."
• "Here are foods that match your craving."
• "Here are foods that match your mood."
• "Here are foods that match your preference."
• "Here are foods that match what you searched for."

Do NOT mention user name.
Do NOT mention 'according to your preference'.
Do NOT mention SmartDine.
Keep it friendly and clean.

2️⃣ JSON OUTPUT FOR THE APP  
After the sentence, output a clean JSON object with TWO arrays:

{{
  "foods": [
      {{ 
        "name": "",
        "restaurant": "",
        "price": "",
        "spicy": "",
        "diet": "",
        "image": ""
      }}
  ],
  "restaurants": [
      {{
        "name": "",
        "cuisine": "",
        "rating": "",
        "image": "",
        "location_link": ""
      }}
  ]
}}

3️⃣ MATCHING LOGIC  
Use these rules to find food matches:
- match taste words: spicy, crispy, sweet, tangy, creamy, juicy, mild, hot  
- match nutrition words: protein, healthy, low calorie  
- match cooking styles: fried, grilled, biryani, pizza  
- match ingredients: chicken, paneer, rice, noodles  
- match cuisine: Indian, Chinese, Italian, Fast Food, Japanese, Mexican  

If user has profile preferences:
- boost foods that match taste preference  
- boost restaurants that match cuisine preference  

4️⃣ RESTAURANT MAP LINK  
For "location_link", generate a working Google Maps query:
Example:
https://www.google.com/maps/search/?api=1&query=Spice+Symphony+Chennai

Never leave it empty.

5️⃣ SURPRISE ME MODE  
If user message contains:
- "surprise me"
- "something new"
- "give me something different"

Choose a dish:
- not previously suggested to this user
- from any cuisine
- preferably unique or uncommon  
Return JSON normally.

6️⃣ TYPOS & SPELLING MISTAKES  
If the user types a wrong spelling:
- try to understand intent
- match with closest cuisine or dish  
Never return empty.

7️⃣ FOOD DETAIL PAGE SUPPORT  
If user clicks a food card and asks "tell me more":
Provide:
- taste profile (spicy/mild/creamy/juicy/etc.)
- texture (crispy/soft/fluffy/thick/etc.)
- recommended sides
- cooking style
- best time to eat
- description in natural language  
Still return in the same format:  
Short sentence + JSON (foods contains only that one dish)

8️⃣ NEVER INVENT RESTAURANT NAMES  
You may invent descriptive text,
BUT **food items MUST exist** from menus in the database.

---------------------------------------

Now generate the response using the above rules.
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
