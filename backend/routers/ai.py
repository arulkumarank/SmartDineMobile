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

# Load both API keys
groq_api_key_1 = os.getenv("GROQ_API_KEY")
groq_api_key_2 = os.getenv("GROQ_API_KEY_2")
url = "https://api.groq.com/openai/v1/chat/completions"

# Track which key to use (simple counter-based rotation)
request_counter = 0

def get_api_key():
    """Alternate between two API keys to distribute load"""
    global request_counter
    request_counter += 1
    
    # If second key exists, alternate between keys
    if groq_api_key_2:
        if request_counter % 2 == 0:
            print(f"🔑 Using API Key 2")
            return groq_api_key_2
        else:
            print(f"🔑 Using API Key 1")
            return groq_api_key_1
    else:
        print(f"🔑 Using single API Key")
        return groq_api_key_1

def get_headers(api_key):
    """Get headers with specified API key"""
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }


# Vector search feature flag
USE_VECTOR_SEARCH = os.getenv("USE_VECTOR_SEARCH", "false").lower() == "true"


@router.post("/ask")
def ask_question(data: Question, current_user: dict = Depends(get_current_user)):
    """Ask AI for food recommendations based on user profile and preferences"""
    
    # Get user profile
    user_profile = userdetails_collection.find_one(
        {"username": current_user["username"]},
        {"_id": 0}
    )
    
    # Get user's recent search history (last 5 searches)
    search_history = list(search_history_collection.find(
        {"user_id": current_user["username"]},
        {"_id": 0, "query": 1}
    ).sort("timestamp", -1).limit(5))
    
    # Build search history context
    search_context = ""
    if search_history:
        queries = [s["query"] for s in search_history]
        search_context = f"\nRecent searches: {', '.join(queries)}\nGive preference to foods similar to these past searches."
    
    # Build user preferences string
    user_preferences = ""
    if user_profile:
        user_preferences = f"""
Taste Preference: {user_profile.get('taste_preference', 'Not specified')}
Cuisine Preference: {user_profile.get('cuisine_preference', 'Not specified')}
Dietary Restrictions: {', '.join(user_profile.get('dietary_restrictions', [])) or 'None'}
{search_context}
"""
    
    # Get food database - with vector search if enabled
    docs = ""
    search_method = "Full Database"
    
    try:
        if USE_VECTOR_SEARCH:
            # NEW: Use vector search to get only relevant foods
            try:
                from services.vector_search import search_foods
                docs = search_foods(data.question, k=5)
                search_method = "Vector Search (5 foods)"
                print(f"✅ Using vector search for query: '{data.question}'")
            except ImportError as e:
                print(f"⚠️ Vector search not available: {e}, falling back to full DB")
                docs = "\n".join([f"Name: {food['name']}\nRestaurant: {food['restaurant']}\nCuisine: {food['cuisine']}\nPrice: {food['price']}\nVeg: {food.get('is_vegetarian', False)}" for food in docs])
            except Exception as e:
                print(f"⚠️ Vector search failed: {e}, falling back to full DB")
                docs = "\n".join([f"Name: {food['name']}\nRestaurant: {food['restaurant']}\nCuisine: {food['cuisine']}\nPrice: {food['price']}\nVeg: {food.get('is_vegetarian', False)}" for food in docs])
        
        # OLD: Use full database (fallback or default)
        if not docs or not USE_VECTOR_SEARCH:
            all_docs = list(docs)
            docs = "\n".join([f"Name: {food['name']}\nRestaurant: {food['restaurant']}\nCuisine: {food['cuisine']}\nPrice: {food['price']}\nVeg: {food.get('is_vegetarian', False)}" for food in all_docs])
            search_method = f"Full Database ({len(all_docs)} foods)"
            print(f"📚 Using full database")
            
    except Exception as e:
        print(f"❌ Error getting food database: {e}, using fallback")
        # Ultimate fallback - get from MongoDB directly
        all_docs = list(docs)
        docs = "\n".join([f"Name: {food['name']}\nRestaurant: {food['restaurant']}\nCuisine: {food['cuisine']}\nPrice: {food['price']}\nVeg: {food.get('is_vegetarian', False)}" for food in all_docs])
        search_method = "Fallback"
    
    print(f"🔍 Search method used: {search_method}")
    
    prompt = f"""
You are SmartDine AI. Recommend food from database.

USER QUERY: {data.question}

FOOD DATABASE:
{docs}

OUTPUT (JSON only):
{{
  "message": "Here are foods for your mood",
  "foods": ["Food1", "Food2", "Food3"]
}}

MESSAGE EXAMPLES (NO food names):
- "Here are foods perfect for your mood"
- "These traditional dishes will delight you  "
- "Here are foods matching your taste"
- "These foods will enhance your mood"
- "Perfect picks for feeling sick"

RULES:
- message: Short, NO food names
- foods: 3-5 EXACT names from database

Generate JSON."""
    
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.6
    }

    # Get API key and headers
    api_key = get_api_key()
    headers = get_headers(api_key)

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        print(f"✅ GROQ API Status: {response.status_code}")
        
        result = response.json()
        print(f"✅ GROQ API Response keys: {result.keys()}")

        if "choices" not in result:
            print(f"❌ No 'choices' in response. Full response: {result}")
            if "error" in result:
                error_msg = result.get("error", {}).get("message", "Unknown error")
                return {"answer": f"AI service error: {error_msg}"}
            return {"answer": "Sorry, AI is unavailable at the moment."}

        answer = result["choices"][0]["message"]["content"]
        print(f"✅ AI Answer: {answer[:100]}...")

        # Parse JSON response
        try:
            import json
            parsed = json.loads(answer)
            message = parsed.get("message", answer)
            foods = parsed.get("foods", [])
            print(f"✅ Parsed - Message: {message}, Foods: {foods}")
        except:
            message = answer
            foods = []
            print(f"⚠️  Not JSON, using raw")

        # Save AI response
        response_collection.insert_one({
            "username": current_user["username"],
            "question": data.question,
            "answer": message,
            "foods": foods,
            "timestamp": datetime.utcnow()
        })
        
        # Save to search history
        search_history_collection.insert_one({
            "user_id": current_user["username"],
            "query": data.question,
            "timestamp": datetime.utcnow()
        })

        return {"answer": message, "foods": foods}
    
    except requests.exceptions.Timeout:
        print("❌ GROQ API timeout")
        return {"answer": "AI service is taking too long. Please try again."}
    except requests.exceptions.RequestException as e:
        print(f"❌ GROQ API request error: {str(e)}")
        return {"answer": f"AI service connection error: {str(e)}"}
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"answer": f"Unexpected error: {str(e)}"}
