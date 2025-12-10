from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from datetime import timedelta

from models import UserSignup, UserLogin, Token
from db import auth_collection, userdetails_collection
from utils.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(prefix="/auth", tags=["authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user: UserSignup):
    """Register a new user"""
    # Check if username already exists
    existing_user = auth_collection.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    existing_email = auth_collection.find_one({"email": user.email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and store user
    hashed_password = get_password_hash(user.password)
    user_doc = {
        "username": user.username,
        "email": user.email,
        "password": hashed_password,
        "created_at": None  # Will be set by MongoDB
    }
    
    result = auth_collection.insert_one(user_doc)
    
    # Create empty user profile
    profile_doc = {
        "user_id": str(result.inserted_id),
        "username": user.username,
        "name": "",
        "email": user.email,
        "taste_preference": "",
        "dietary_restrictions": []
    }
    userdetails_collection.insert_one(profile_doc)
    
    return {"message": "User created successfully", "username": user.username}


@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    """Login and get access token"""
    # Find user
    db_user = auth_collection.find_one({"username": user.username})
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Verify password
    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Dependency to get current authenticated user"""
    username = decode_access_token(token)
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = auth_collection.find_one({"username": username}, {"_id": 0, "password": 0})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return current_user
