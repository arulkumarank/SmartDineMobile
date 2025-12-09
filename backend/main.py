from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import requests
import os
from typing import Optional, List

load_dotenv()

mongodb_uri = os.getenv("MONGODB_URI")
groq_api_key = os.getenv("GROQ_API_KEY")

# MongoDB setup
client = MongoClient(mongodb_uri, server_api=ServerApi('1'))
db = client["smartdine"]
collection = db["restaurants"]
response_collection = db["groq_responses"]
user_collection = db["users"]

# Load restaurants from database
docs = list(collection.find({}, {"_id": 0}))

app = FastAPI(title="SmartDine API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Groq API configuration
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_HEADERS = {
    "Authorization": f"Bearer {groq_api_key}",
    "Content-Type": "application/json"
}

# Pydantic models
class Question(BaseModel):
    question: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserSignup(BaseModel):
    name: str
    email: str
    password: str

class RestaurantFilter(BaseModel):
    cuisine: Optional[str] = None
    min_rating: Optional[float] = None
    diet: Optional[str] = None
    spice: Optional[str] = None

# Routes
@app.get("/")
def root():
    return {
        "message": "SmartDine API",
        "version": "1.0.0",
        "endpoints": {
            "restaurants": "/restaurants",
            "ask": "/ask",
            "login": "/login",
            "signup": "/signup"
        }
    }

@app.get("/restaurants")
def get_restaurants():
    """Get all restaurants from database"""
    try:
        return docs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/restaurants/filter")
def filter_restaurants(filters: RestaurantFilter):
    """Filter restaurants based on criteria"""
    filtered = docs.copy()
    
    if filters.cuisine:
        filtered = [r for r in filtered if filters.cuisine.lower() in r.get("cuisine", "").lower()]
    
    if filters.min_rating:
        filtered = [r for r in filtered if r.get("rating", 0) >= filters.min_rating]
    
    if filters.diet:
        filtered = [r for r in filtered if filters.diet.lower() in r.get("diet", "").lower()]
    
    if filters.spice:
        filtered = [r for r in filtered if filters.spice.lower() in r.get("spice", "").lower()]
    
    return filtered

@app.post("/ask")
def ask_question(data: Question):
    """
    AI-powered restaurant recommendation using Groq
    Analyzes user preferences and suggests matching restaurants
    """
    try:
        # Enhanced prompt for better recommendations
        prompt = f"""You are SmartDine AI, an expert food recommendation assistant.

AVAILABLE RESTAURANTS:
{docs}

USER REQUEST: "{data.question}"

YOUR TASK:
1. Analyze the user's dietary preferences, cuisine interests, and requirements
2. Recommend ONLY restaurants from the list above that match their needs
3. Explain WHY each restaurant is a good match
4. Mention must-try dishes if relevant

RESPONSE FORMAT:
Write 2-3 short paragraphs explaining your recommendations. Be conversational and helpful.

Example format:
"Based on your preference for [preference], I recommend [Restaurant Name]. They specialize in [cuisine] and are known for their [specific dish]. With a rating of [rating], they're a great choice because [reason].

You might also enjoy [Another Restaurant], which offers [cuisine]. Their [dish] is highly recommended, especially if you're looking for [specific quality]."

IMPORTANT RULES:
- Only recommend restaurants from the provided list
- Be specific about why each restaurant matches their needs
- Keep recommendations concise (2-3 restaurants maximum)
- If no exact match exists, recommend the closest alternatives
- Focus on cuisine, dietary restrictions, spice levels, and ratings
"""

        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a helpful food recommendation AI assistant. Provide personalized restaurant suggestions based on user preferences."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.7,
            "max_tokens": 500,
            "top_p": 0.9
        }

        response = requests.post(GROQ_URL, headers=GROQ_HEADERS, json=payload, timeout=30)
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Groq API error")
        
        result = response.json()

        if "choices" not in result or len(result["choices"]) == 0:
            return {"answer": "Sorry, I couldn't generate recommendations. Please try again."}

        answer = result["choices"][0]["message"]["content"].strip()

        # Store the interaction in database
        try:
            response_collection.insert_one({
                "question": data.question,
                "answer": answer,
                "timestamp": None  # MongoDB will add timestamp if configured
            })
        except Exception as db_error:
            print(f"Database logging error: {db_error}")

        return {"answer": answer}

    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="AI service timeout. Please try again.")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=503, detail=f"AI service unavailable: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

@app.post("/login")
def login(credentials: UserLogin):
    """User login endpoint"""
    try:
        user = user_collection.find_one({"email": credentials.email})
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # In production, use proper password hashing (bcrypt, argon2, etc.)
        if user.get("password") != credentials.password:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        return {
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "avatar": user.get("avatar", "https://i.pravatar.cc/200")
            },
            "token": "mock_jwt_token"  # In production, generate actual JWT
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")

@app.post("/signup")
def signup(user_data: UserSignup):
    """User signup endpoint"""
    try:
        # Check if user already exists
        existing_user = user_collection.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(status_code=409, detail="Email already registered")
        
        # In production, hash password before storing
        new_user = {
            "name": user_data.name,
            "email": user_data.email,
            "password": user_data.password,  # HASH THIS IN PRODUCTION!
            "avatar": "https://i.pravatar.cc/200",
            "created_at": None  # MongoDB timestamp
        }
        
        result = user_collection.insert_one(new_user)
        
        return {
            "user": {
                "id": str(result.inserted_id),
                "name": user_data.name,
                "email": user_data.email,
                "avatar": "https://i.pravatar.cc/200"
            },
            "token": "mock_jwt_token"  # In production, generate actual JWT
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signup error: {str(e)}")

@app.get("/health")
def health_check():
    """API health check"""
    return {
        "status": "healthy",
        "database": "connected" if client else "disconnected",
        "restaurants_count": len(docs)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)