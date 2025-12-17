"""
SmartDine API - Main application entry point
Production-optimized FastAPI application
"""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
import logging

from config import settings
from db import close_database_connection, check_database_health
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

