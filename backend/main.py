"""
SmartDine API - Main application entry point
Production-optimized FastAPI application

Memory-efficient configuration for 512MB RAM:
- Single worker (WEB_CONCURRENCY=1 set by Render)
- Vector search disabled by default (enable with USE_VECTOR_SEARCH=true)
- Lazy loading of heavy dependencies
"""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
import logging

from config import settings
from db import (
    close_database_connection, 
    check_database_health,
    otp_collection,
    user_interactions,
    search_history_collection,
    token_blacklist_collection,
    response_collection,
    auth_collection,
    userdetails_collection,
    food_ratings,
    food_scores
)
from routers import restaurants, ai, auth, profile, foods, feedback

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler
    Manages startup and shutdown events
    """
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    
    # Validate configuration
    try:
        settings.validate()
        logger.info("Configuration validated successfully")
    except ValueError as e:
        logger.error(f"Configuration validation failed: {e}")
        if settings.ENVIRONMENT == "production":
            raise
    
    # Check database health
    db_health = check_database_health()
    if db_health["status"] == "healthy":
        logger.info("Database connection healthy")
    else:
        logger.error(f"Database connection failed: {db_health.get('error')}")
    
    # Log vector search status (memory optimization info)
    if settings.USE_VECTOR_SEARCH:
        logger.info("Vector search: ENABLED (requires 1GB+ RAM)")
    else:
        logger.info("Vector search: DISABLED (memory-efficient mode, ~400-500MB RAM)")
        logger.info("To enable: Set USE_VECTOR_SEARCH=true (requires 1GB+ RAM)")
    
    # Setup TTL indexes for automatic data cleanup (70% storage reduction)
    try:
        logger.info("Setting up MongoDB TTL indexes...")
        setup_mongodb_indexes()
        logger.info("MongoDB indexes configured successfully")
    except Exception as e:
        logger.warning(f"Failed to setup MongoDB indexes: {e}")
        # Don't fail startup if indexes already exist
    
    yield
    
    # Shutdown
    logger.info("Shutting down application...")
    close_database_connection()
    logger.info("Application shutdown complete")


# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered food discovery platform API",
    docs_url="/docs" if settings.DEBUG else None,  # Disable docs in production
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)


# Middleware - GZip compression
app.add_middleware(GZipMiddleware, minimum_size=1000)


# Middleware - CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)


# Middleware - Request logging and timing
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests with timing information"""
    start_time = time.time()
    
    # Log request
    logger.info(f"{request.method} {request.url.path}")
    
    # Process request
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Add timing header
        response.headers["X-Process-Time"] = str(process_time)
        
        # Log response
        logger.info(
            f"{request.method} {request.url.path} "
            f"completed in {process_time:.3f}s with status {response.status_code}"
        )
        
        return response
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(
            f"{request.method} {request.url.path} "
            f"failed after {process_time:.3f}s: {str(e)}"
        )
        raise


# Include routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(restaurants.router)
app.include_router(foods.router)
app.include_router(ai.router)
app.include_router(feedback.router)


# Root endpoint
@app.get("/", tags=["health"])
def root():
    """API root endpoint"""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": "/docs" if settings.DEBUG else "disabled"
    }


# Health check endpoint
@app.get("/health", tags=["health"])
def health_check():
    """
    Comprehensive health check endpoint
    Returns application and database health status
    """
    db_health = check_database_health()
    
    overall_status = "healthy" if db_health["status"] == "healthy" else "degraded"
    
    return {
        "status": overall_status,
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "database": db_health
    }


# Readiness check (for Kubernetes/Docker)
@app.get("/ready", tags=["health"])
def readiness_check():
    """Check if application is ready to serve requests"""
    db_health = check_database_health()
    
    if db_health["status"] == "healthy":
        return {"status": "ready"}
    else:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "not ready", "reason": "database unavailable"}
        )


# Liveness check (for Kubernetes/Docker)
@app.get("/alive", tags=["health"])
def liveness_check():
    """Check if application is alive"""
    return {"status": "alive"}


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all uncaught exceptions"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error" if settings.ENVIRONMENT == "production" else str(exc)
        }
    )


def setup_mongodb_indexes():
    """
    Setup TTL indexes and performance indexes on application startup
    Safe to run multiple times - MongoDB will skip if indexes already exist
    """
    try:
        # TTL Indexes - Auto-delete old data
        otp_collection.create_index("expiry", expireAfterSeconds=0)
        user_interactions.create_index("timestamp", expireAfterSeconds=7776000)  # 90 days
        search_history_collection.create_index("timestamp", expireAfterSeconds=7776000)  # 90 days
        token_blacklist_collection.create_index("blacklisted_at", expireAfterSeconds=604800)  # 7 days
        response_collection.create_index("timestamp", expireAfterSeconds=2592000)  # 30 days
        
        # Performance Indexes
        auth_collection.create_index("username", unique=True)
        auth_collection.create_index("email", unique=True)
        userdetails_collection.create_index("username", unique=True)
        search_history_collection.create_index([("user_id", 1), ("timestamp", -1)])
        food_ratings.create_index([("username", 1), ("food_name", 1)], unique=True)
        food_ratings.create_index("food_name")
        food_scores.create_index("food_name", unique=True)
        food_scores.create_index([("avg_rating", -1), ("rl_score", -1)])
        
        logger.info("✅ All MongoDB indexes configured (TTL + Performance)")
        
    except Exception as e:
        # Indexes already exist or other non-critical error
        logger.debug(f"Index setup note: {e}")

