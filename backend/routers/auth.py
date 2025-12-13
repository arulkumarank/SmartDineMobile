from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from datetime import timedelta, datetime

from models import UserSignup, UserLogin, Token, OTPRequest, OTPVerify, SignupWithOTP
from db import auth_collection, userdetails_collection, otp_collection
from utils.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from services.email_service import generate_otp, get_otp_expiry, send_otp_email

router = APIRouter(prefix="/auth", tags=["authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


@router.post("/send-otp")
async def send_otp(data: OTPRequest):
    """Send OTP to email for verification"""
    email = data.email
    
    # Check if email already registered
    existing_email = auth_collection.find_one({"email": email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Generate OTP
    otp = generate_otp()
    expiry = get_otp_expiry()
    
    # Store OTP (replace if exists)
    otp_collection.update_one(
        {"email": email},
        {"$set": {"otp": otp, "expiry": expiry, "verified": False}},
        upsert=True
    )
    
    # Send email
    if send_otp_email(email, otp):
        return {"message": "OTP sent successfully", "email": email}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP email. Check email configuration."
        )


@router.post("/verify-otp")
async def verify_otp(data: OTPVerify):
    """Verify OTP code"""
    email = data.email
    otp = data.otp
    
    # Find OTP record
    otp_record = otp_collection.find_one({"email": email})
    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No OTP found for this email. Request a new OTP."
        )
    
    # Check expiry
    if datetime.utcnow() > otp_record["expiry"]:
        otp_collection.delete_one({"email": email})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP expired. Request a new OTP."
        )
    
    # Verify OTP
    if otp_record["otp"] != otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )
    
    # Mark as verified
    otp_collection.update_one(
        {"email": email},
        {"$set": {"verified": True}}
    )
    
    return {"message": "Email verified successfully", "email": email}


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user: SignupWithOTP):
    """Register a new user (requires verified OTP)"""
    # Check if OTP was verified
    otp_record = otp_collection.find_one({"email": user.email, "verified": True})
    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email not verified. Please verify your email first."
        )
    
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
        "email_verified": True,
        "created_at": datetime.utcnow()
    }
    
    result = auth_collection.insert_one(user_doc)
    
    # Create empty user profile with avatar
    profile_doc = {
        "user_id": str(result.inserted_id),
        "username": user.username,
        "name": user.name or "",
        "email": user.email,
        "avatar_index": hash(user.username) % 8,  # Random avatar (0-7)
        "taste_preferences": [],
        "cuisine_preferences": [],
        "dietary_restrictions": []
    }
    userdetails_collection.insert_one(profile_doc)
    
    # Clean up OTP record
    otp_collection.delete_one({"email": user.email})
    
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
