from fastapi import APIRouter
from db import docs

router = APIRouter(prefix="/restaurants", tags=["restaurants"])


@router.get("")
def get_restaurants():
    """Get all restaurants with location data for map display"""
    try:
        # Filter restaurants that have valid location data
        restaurants_with_location = [
            doc for doc in docs 
            if doc.get('location') and 
               doc['location'].get('latitude') and 
               doc['location'].get('longitude')
        ]
        return {
            "restaurants": restaurants_with_location, 
            "count": len(restaurants_with_location)
        }
    except Exception as e:
        return {"error": str(e), "restaurants": [], "count": 0}

