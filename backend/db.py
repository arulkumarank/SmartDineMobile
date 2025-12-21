"""
MongoDB database connection with connection pooling and error handling
Optimized for production deployment
"""
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from config import settings
import logging

# Configure logging
logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL))
logger = logging.getLogger(__name__)

# MongoDB client with connection pooling
_client = None
_db = None


def get_mongodb_client() -> MongoClient:
    """
    Get MongoDB client with connection pooling (singleton pattern)
    
    Returns:
        MongoClient: MongoDB client instance
    """
    global _client
    
    if _client is None:
        try:
            _client = MongoClient(
                settings.MONGODB_URI,
                server_api=ServerApi('1'),
                maxPoolSize=50,  # Maximum connections in pool
                minPoolSize=10,  # Minimum connections to maintain
                maxIdleTimeMS=30000,  # Close idle connections after 30s
                serverSelectionTimeoutMS=5000,  # 5 second timeout
                connectTimeoutMS=10000,  # 10 second connection timeout
                socketTimeoutMS=20000,  # 20 second socket timeout
            )
            # Verify connection
            _client.admin.command('ping')
            logger.info("Successfully connected to MongoDB")
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise Exception(f"Database connection failed: {e}")
    
    return _client


def get_database():
    """
    Get database instance (singleton pattern)
    
    Returns:
        Database: MongoDB database instance
    """
    global _db
    
    if _db is None:
        client = get_mongodb_client()
        _db = client[settings.DATABASE_NAME]
        logger.info(f"Connected to database: {settings.DATABASE_NAME}")
    
    return _db


def check_database_health() -> dict:
    """
    Check database connection health
    
    Returns:
        dict: Health status information
    """
    try:
        client = get_mongodb_client()
        # Ping the database
        client.admin.command('ping')
        
        # Get database stats
        db = get_database()
        stats = db.command('dbStats')
        
        return {
            "status": "healthy",
            "database": settings.DATABASE_NAME,
            "collections": stats.get('collections', 0),
            "dataSize": stats.get('dataSize', 0),
            "connected": True
        }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "connected": False
        }


def close_database_connection():
    """Close database connection (call on shutdown)"""
    global _client, _db
    
    if _client is not None:
        _client.close()
        _client = None
        _db = None
        logger.info("Database connection closed")


# Initialize database and collections
db = get_database()

# Collections
collection = db["restaurants"]
response_collection = db["groq_responses"]
auth_collection = db["auth"]  # User credentials
userdetails_collection = db["userdetails"]  # User profiles
foods_collection = db["foods"]  # Food items
search_history_collection = db["search_history"]  # Search history
otp_collection = db["otp_codes"]  # Temporary OTP storage
token_blacklist_collection = db["token_blacklist"]  # Blacklisted tokens

# RL & Rating Collections
user_interactions = db["user_interactions"]  # clicks, cart adds, views
food_ratings = db["food_ratings"]  # individual user ratings per food
food_scores = db["food_scores"]  # aggregated RL scores per food

# Lazy loading for restaurant documents (only load when needed)
_docs_cache = None


def get_restaurant_docs():
    """
    Get restaurant documents with caching
    
    Returns:
        list: List of restaurant documents
    """
    global _docs_cache
    
    if _docs_cache is None:
        _docs_cache = list(collection.find({}, {"_id": 0}))
        logger.info(f"Loaded {len(_docs_cache)} restaurant documents")
    
    return _docs_cache


def clear_restaurant_cache():
    """Clear restaurant documents cache"""
    global _docs_cache
    _docs_cache = None


# For backwards compatibility
docs = []  # Will be populated on demand


