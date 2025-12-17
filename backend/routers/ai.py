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
USE_VECTOR_SEARCH = settings.USE_VECTOR_SEARCH


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
            
            # Get user's dietary restrictions for STRICT filtering
            dietary_restrictions = []
            if user_profile:
                dietary_restrictions = [d.lower() for d in user_profile.get('dietary_restrictions', []) or []]
            
            is_vegan = 'vegan' in dietary_restrictions
            is_vegetarian = 'vegetarian' in dietary_restrictions or is_vegan
            
            print(f"🥗 Dietary: vegan={is_vegan}, vegetarian={is_vegetarian}")
            
            # Get all RL scores
            all_scores = {s["food_name"]: s for s in food_scores.find({}, {"_id": 0})}
            
            # Extract all food items from restaurant menus
            all_foods = []
            for restaurant in restaurants:
                restaurant_name = restaurant.get('name', 'Unknown')
                cuisine = restaurant.get('cuisine', 'Unknown')
                for item in restaurant.get('menu', []):
                    food_name = item.get('name', 'Unknown')
                    is_veg = item.get('diet', '') == 'veg'
                    
                    # STRICT DIETARY FILTER - vegans/vegetarians ONLY see veg foods in suggestions
                    if is_vegetarian and not is_veg:
                        continue  # Skip non-veg for vegetarian/vegan users
                    
                    score_data = all_scores.get(food_name, {})
                    
                    all_foods.append({
                        'name': food_name,
                        'restaurant': restaurant_name,
                        'cuisine': cuisine,
                        'price': item.get('price', 0),
                        'is_vegetarian': is_veg,
                        'tags': item.get('tags', []),
                        'spicy': item.get('spicy', 'mild'),
                        'base_rating': item.get('rating', 3),
                        'user_rating': score_data.get('avg_rating', 0),
                        'rl_score': score_data.get('rl_score', 0)
                    })
            
            # Deduplicate foods by name - keep highest rated version
            name_to_food = {}
            for f in all_foods:
                name_lower = f['name'].lower()
                if name_lower not in name_to_food:
                    name_to_food[name_lower] = f
                else:
                    # Keep the one with higher rating
                    existing_rating = name_to_food[name_lower]['user_rating'] or name_to_food[name_lower]['base_rating']
                    new_rating = f['user_rating'] or f['base_rating']
                    if new_rating > existing_rating:
                        name_to_food[name_lower] = f
            
            unique_foods = list(name_to_food.values())
            
            # Sort by rating + RL score (rating first priority)
            unique_foods.sort(
                key=lambda x: (x['user_rating'] or x['base_rating'], x['rl_score']),
                reverse=True
            )
            
            # LIMIT to top 15 foods to save tokens (optimized for Groq free tier)
            top_foods = unique_foods[:15]
            
            # SHUFFLE to add variety (AI always picks from top of list)
            import random
            random.shuffle(top_foods)
            
            # Build COMPACT food database string for AI (token efficient!)
            food_docs_str = "\n".join([
                f"- {f['name']} | {f['cuisine']} | ₹{f['price']} | {'Veg' if f['is_vegetarian'] else 'Non-Veg'} | {f['spicy']}" 
                for f in top_foods
            ])
            search_method = f"Filtered DB ({len(top_foods)} foods, dietary filtered)"
            print(f"📚 Sending {len(top_foods)} foods to AI (from {len(all_foods)} after dietary filter)")
            
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

IMPORTANT: Recommend 3-5 foods that match the user's request.

CONTEXT RULES:
- "cold/winter" → Warm foods (curries, soups, noodles)
- "hot/summer" → Cool foods (ice cream, cold drinks)
- "sick" → Light foods (soup, rice)
- "heavy/bloated" → Light foods (salads, tea, coffee)
- "tired" → Energizing (coffee, protein)
- "spicy" → Hot dishes
- "healthy" → Low calorie, salads

RESPONSE FORMAT (JSON only):
{{
  "message": "Short friendly message (no food names)",
  "foods": ["Food Name 1", "Food Name 2", "Food Name 3"]
}}

STRICT: 
- Foods must be EXACT names from the list above
- Message should be warm, positive, short
- Pick 3-5 varied foods

Generate JSON:"""
    
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": "You are SmartDine AI. Respond with valid JSON only."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.5,
        "max_tokens": 200
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
