from pydantic import BaseModel
from typing import Optional

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
