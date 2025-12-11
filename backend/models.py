from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# Authentication Models
class UserSignup(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


# User Profile Models
class UserProfile(BaseModel):
    username: Optional[str] = None
    name: str
    email: EmailStr
    taste_preference: Optional[str] = None  # Legacy: modern, comfort, traditional
    taste_preferences: Optional[List[str]] = []  # New: spicy, sweet, sour, savory, mild
    cuisine_preferences: Optional[List[str]] = []  # italian, indian, mexican, chinese, etc.
    dietary_restrictions: Optional[List[str]] = []  # vegetarian, gluten-free, etc.


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    taste_preference: Optional[str] = None  # Legacy
    taste_preferences: Optional[List[str]] = None  # New
    cuisine_preferences: Optional[List[str]] = None  # New
    dietary_restrictions: Optional[List[str]] = None


# Food Models
class NutritionalInfo(BaseModel):
    protein: Optional[float] = 0  # in grams
    fiber: Optional[float] = 0
    calories: Optional[int] = 0
    carbs: Optional[float] = 0
    fat: Optional[float] = 0


class Food(BaseModel):
    name: str
    restaurant: str
    restaurant_id: Optional[str] = None
    price: float
    cuisine: Optional[str] = None
    image: Optional[str] = None
    nutritional_info: Optional[NutritionalInfo] = None
    tags: Optional[List[str]] = []  # high-protein, high-fiber, etc.
    allergens: Optional[List[str]] = []  # gluten, dairy, nuts, etc.
    is_vegetarian: Optional[bool] = False
    is_vegan: Optional[bool] = False
    is_gluten_free: Optional[bool] = False


# Restaurant Models (enhanced)
class Location(BaseModel):
    latitude: float
    longitude: float
    address: str


class Restaurant(BaseModel):
    name: str
    cuisine: str
    rating: Optional[float] = 4.5
    image: Optional[str] = None
    location: Optional[Location] = None
    menu: Optional[List[str]] = []  # List of food item IDs


# AI Question Model
class Question(BaseModel):
    question: str
    user_id: Optional[str] = None


# Search History
class SearchHistory(BaseModel):
    user_id: str
    query: str
    timestamp: datetime
