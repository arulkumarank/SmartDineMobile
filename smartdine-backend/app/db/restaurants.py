from typing import List, Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.db.mongo import get_database
from app.models.restaurant import restaurant_doc_to_out, RestaurantOut

async def list_restaurants(
    limit: int = 20,
    city: Optional[str] = None,
    cuisine: Optional[str] = None,
    mood: Optional[str] = None,
    food_tag: Optional[str] = None,
) -> List[RestaurantOut]:
    db: AsyncIOMotorDatabase = get_database()
    collection = db["restaurants"]


    query: Dict[str, Any] = {}

    if city:
        query["city"] = city
    if cuisine:
        query["cuisine"] = cuisine
    if mood:
        query["mood_tags"] = mood
    if food_tag:
        query["food_tags"] = food_tag

    cursor = collection.find(query).limit(limit)
    docs = await cursor.to_list(length=limit)
    return [restaurant_doc_to_out(doc) for doc in docs]