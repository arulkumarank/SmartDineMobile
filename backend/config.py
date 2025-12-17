"""
Configuration management for SmartDine backend
Centralizes all environment variables and settings
"""
import os
from dotenv import load_dotenv
from typing import Optional

load_dotenv()


class Settings:
    """Application settings and configuration"""
    
    # Application (with sensible defaults)
    APP_NAME: str = "SmartDine API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")
    
    # Server (defaults work for most deployments)
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Database - REQUIRED
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "smartdine")
    
    # JWT/Security - REQUIRED
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days default
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30  # 30 days default
    
    # CORS (permissive default, restrict in production)
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "*").split(",")
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list = ["*"]
    CORS_ALLOW_HEADERS: list = ["*"]
    
    # AI APIs - REQUIRED
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = "llama-3.1-70b-versatile"
    GROQ_API_TIMEOUT: int = 30
    
    
    # Email (optional - only if using OTP verification)
    EMAIL_HOST: str = os.getenv("EMAIL_HOST", "smtp.gmail.com")
    EMAIL_PORT: int = int(os.getenv("EMAIL_PORT", "587"))
    EMAIL_USERNAME: str = os.getenv("EMAIL_USERNAME", "")
    EMAIL_PASSWORD: str = os.getenv("EMAIL_PASSWORD", "")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", os.getenv("EMAIL_USERNAME", "noreply@smartdine.com"))
    
    # OTP Settings (sensible defaults)
    OTP_EXPIRE_MINUTES: int = 10
    OTP_LENGTH: int = 6
    
    # Performance (sensible defaults)
    RATE_LIMIT_PER_MINUTE: int = 60
    CACHE_TTL_SECONDS: int = 300  # 5 minutes
    
    # Vector Search (sensible defaults)
    VECTOR_INDEX_PATH: str = "services/faiss_index"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    
    # Logging (sensible defaults)
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    @classmethod
    def validate(cls):
        """Validate critical settings"""
        errors = []
        warnings = []
        
        # Critical errors (will stop app)
        if not cls.MONGODB_URI:
            errors.append("MONGODB_URI is required")
        
        if not cls.JWT_SECRET_KEY:
            errors.append("JWT_SECRET_KEY is required")
        
        if not cls.GROQ_API_KEY:
            errors.append("GROQ_API_KEY is required")
        
        # Warnings (won't stop app)
        if cls.ENVIRONMENT == "production":
            if cls.DEBUG:
                warnings.append("DEBUG should be False in production")
            
            if cls.CORS_ORIGINS == ["*"]:
                warnings.append("CORS_ORIGINS should be restricted in production for better security")
        
        # Show warnings
        if warnings:
            import logging
            logger = logging.getLogger(__name__)
            for warning in warnings:
                logger.warning(f"Configuration warning: {warning}")
        
        # Raise errors
        if errors:
            raise ValueError(f"Configuration errors: {', '.join(errors)}")
        
        return True


# Create settings instance
settings = Settings()
