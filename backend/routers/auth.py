from fastapi import APIRouter, HTTPException
from models import UserLogin, UserSignup
from db import users_collection

router = APIRouter()

@router.post("/login")
def login(credentials: UserLogin):
    user = users_collection.find_one({"email": credentials.email})

    if not user:
        raise HTTPException(401, "Invalid credentials")

    if user["password"] != credentials.password:
        raise HTTPException(401, "Invalid credentials")

    return {
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "avatar": user.get("avatar")
        },
        "token": "mock_jwt_token"
    }

@router.post("/signup")
def signup(user_data: UserSignup):
    existing = users_collection.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(409, "Email already registered")

    users_collection.insert_one({
        "name": user_data.name,
        "email": user_data.email,
        "password": user_data.password,
        "avatar": "https://i.pravatar.cc/200",
    })

    return {
        "user": {
            "name": user_data.name,
            "email": user_data.email,
            "avatar": "https://i.pravatar.cc/200",
        },
        "token": "mock_jwt_token"
    }
