from fastapi import APIRouter, Depends
from dotenv import load_dotenv
import requests
import os
from datetime import datetime

from db import response_collection, userdetails_collection, search_history_collection
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
    
    # Build user preferences string (use arrays for multi-select fields)
    user_preferences = ""
    preferences_priority = ""
    if user_profile:
        taste_prefs = user_profile.get('taste_preferences', []) or []
        cuisine_prefs = user_profile.get('cuisine_preferences', []) or []
        dietary_restrictions = user_profile.get('dietary_restrictions', []) or []
        
        user_preferences = f"""
USER PROFILE (PRIORITY #1 - MUST MATCH THESE):
- Taste Preferences: {', '.join(taste_prefs) if taste_prefs else 'Not specified'}
- Cuisine Preferences: {', '.join(cuisine_prefs) if cuisine_prefs else 'Not specified'} 
- Dietary Restrictions: {', '.join(dietary_restrictions) if dietary_restrictions else 'None'}
{search_context}
"""
        # Build priority instruction if user has preferences
        if taste_prefs or cuisine_prefs:
            preferences_priority = "\n🎯 HIGHEST PRIORITY: Match the user's taste and cuisine preferences first! Only suggest foods that align with their profile.\n"
    
    # Get food database - with vector search if enabled
    food_docs_str = ""
    search_method = "Full Database"
    
    try:
        if USE_VECTOR_SEARCH:
            # NEW: Use vector search to get only relevant foods
            try:
                from services.vector_search import search_foods
                food_docs_str = search_foods(data.question, k=5)
                search_method = "Vector Search (5 foods)"
                print(f"✅ Using vector search for query: '{data.question}'")
            except ImportError as e:
                print(f"⚠️ Vector search not available: {e}, falling back to full DB")
            except Exception as e:
                print(f"⚠️ Vector search failed: {e}, falling back to full DB")
        
        # Fallback: Use full database - flatten restaurant menus into food items
        if not food_docs_str or not USE_VECTOR_SEARCH:
            from db import collection, food_scores
            restaurants = list(collection.find({}, {"_id": 0}))
            
            # Get all RL scores
            all_scores = {s["food_name"]: s for s in food_scores.find({}, {"_id": 0})}
            
            # Extract all food items from restaurant menus
            all_foods = []
            for restaurant in restaurants:
                restaurant_name = restaurant.get('name', 'Unknown')
                cuisine = restaurant.get('cuisine', 'Unknown')
                for item in restaurant.get('menu', []):
                    food_name = item.get('name', 'Unknown')
                    score_data = all_scores.get(food_name, {})
                    
                    all_foods.append({
                        'name': food_name,
                        'restaurant': restaurant_name,
                        'cuisine': cuisine,
                        'price': item.get('price', 0),
                        'is_vegetarian': item.get('diet', '') == 'veg',
                        'tags': item.get('tags', []),
                        'base_rating': item.get('rating', 3),
                        'user_rating': score_data.get('avg_rating', 0),
                        'rl_score': score_data.get('rl_score', 0)
                    })
            
            # Deduplicate foods by name - keep only first occurrence
            seen_names = set()
            unique_foods = []
            for f in all_foods:
                if f['name'].lower() not in seen_names:
                    seen_names.add(f['name'].lower())
                    unique_foods.append(f)
            
            # Sort by rating + RL score (rating first priority)
            unique_foods.sort(
                key=lambda x: (x['user_rating'] or x['base_rating'], x['rl_score']),
                reverse=True
            )
            
            # Build food database string for AI (rating info included)
            food_docs_str = "\n".join([
                f"- {f['name']} ({f['cuisine']}, ₹{f['price']}, {'Veg' if f['is_vegetarian'] else 'Non-Veg'}, ⭐{f['user_rating'] or f['base_rating']:.1f})" 
                for f in unique_foods
            ])
            search_method = f"Full Database ({len(unique_foods)} unique foods, sorted by rating)"
            print(f"📚 Using {len(unique_foods)} unique foods from {len(all_foods)} total items")
            
    except Exception as e:
        print(f"❌ Error getting food database: {e}")
        import traceback
        traceback.print_exc()
        food_docs_str = "Error loading food database"
        search_method = "Error"
    
    print(f"🔍 Search method used: {search_method}")
    
    prompt = f"""You are SmartDine AI - a friendly food recommendation assistant.

USER REQUEST: "{data.question}"

{user_preferences if user_preferences else ""}
{preferences_priority}

AVAILABLE FOODS:
{food_docs_str}

TASK: Analyze the user's request and recommend 3-5 DIFFERENT foods from the list above.

CRITICAL DISAMBIGUATION (read VERY carefully):

☀️ WEATHER/ENVIRONMENT CONTEXT (user wants warming/cooling food, NOT sick!):
- "feeling cold" / "cold outside" / "cold weather" / "winter" / "chilly out"
  → User wants WARMING comfort food - NOT SICK!
  → Recommend: hot soups, biryanis, hot noodles, chai, coffee, warm curries
  → Message: "Perfect warming foods for the cold weather!"
- "hot outside" / "summer" / "feeling hot" / "sweating"
  → User wants COOLING refreshing food
  → Recommend: cold drinks, ice cream, salads, smoothies, lassi

🤒 ILLNESS CONTEXT (user is actually sick):
- "I have a cold" / "caught a cold" / "fever" / "flu" / "sick" / "unwell" 
- "sore throat" / "cough" / "not feeling well" / "headache" / "under the weather"
  → User is ILL - needs healing foods
  → Recommend: soups, rice, khichdi, warm drinks, light foods
  → AVOID: spicy, oily, heavy, fried foods
  → Message: "Hope you feel better soon! Here are some soothing options."

🌡️ FOOD TEMPERATURE PREFERENCE:
- "hot food" / "warm meal" / "something hot to eat" / "steaming"
  → Hot served dishes: curries, biryanis, hot noodles
- "cold food" / "chilled" / "refreshing food"
  → Cold items: salads, ice cream, cold drinks

🌶️ SPICE LEVEL (different from temperature!):
- "spicy" / "hot and spicy" / "with heat" / "masala"
  → Recommend: dishes with chili, spicy curries, hot wings
- "mild" / "not spicy" / "no spice" / "plain"
  → Recommend: comfort food without chilies

OTHER INTENTS:
- "hungry" / "starving" → filling, hearty dishes
- "light" / "not too heavy" → salads, soups, light meals  
- "healthy" / "diet" / "fitness" → low calorie, high protein, nutritious
- "comfort" / "sad" / "stressed" → classic comfort foods
- "celebration" / "party" → special dishes, biryanis, pizzas
- "quick" / "fast" → finger foods, sandwiches
- Cuisine mentions → match exact cuisine (e.g., "Chinese" → Chinese only)

RESPONSE FORMAT (JSON only):
{{
  "message": "Short friendly message without mentioning food names",
  "foods": ["Exact Food Name 1", "Exact Food Name 2", "Exact Food Name 3"]
}}

RULES:
1. "foods" array MUST contain EXACT names from the AVAILABLE FOODS list
2. "message" should be warm, short (under 15 words), NO food names in message
3. For ILLNESS: Be caring - "Get well soon!" / "These will help you recover!"
4. For TEMPERATURE: Be descriptive - "Perfect hot meals for you!"
5. If user mentions a cuisine, ONLY recommend from that cuisine
6. Respect veg/non-veg preferences
7. Return 3-5 foods maximum

Generate JSON response:"""
    
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": "You are SmartDine AI, a food recommendation assistant. Always respond with valid JSON only, no extra text."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.4,
        "max_tokens": 300
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
