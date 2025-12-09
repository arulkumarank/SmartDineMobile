from fastapi import APIRouter, HTTPException
from models import RestaurantFilter
from db import restaurants_collection

router = APIRouter()

docs = list(restaurants_collection.find({}, {"_id": 0}))

@router.get("/restaurants")
def get_restaurants():
    return docs

@router.post("/restaurants/filter")
def filter_restaurants(filters: RestaurantFilter):
    filtered = docs.copy()

    if filters.cuisine:
        filtered = [r for r in filtered if filters.cuisine.lower() in r["cuisine"].lower()]

    if filters.min_rating:
        filtered = [r for r in filtered if r["rating"] >= filters.min_rating]

    return filtered
