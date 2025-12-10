from fastapi import APIRouter
from db import docs

router = APIRouter(prefix="/restaurants", tags=["restaurants"])


@router.get("")
def get_restaurants():
    """Get all restaurants with location data for map display"""
    try:
        return {"restaurants": docs, "count": len(docs)}
    except Exception as e:
        return {"error": str(e), "restaurants": []}
