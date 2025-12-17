"""
Enhanced security utilities for authentication and authorization
Includes token management, password hashing, and token blacklisting
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
import secrets
import hashlib
from config import settings

# Password hashing - using bcrypt for production-grade security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# In-memory token blacklist (for production, use Redis)
token_blacklist = set()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a hash
    
    Args:
        plain_password: Plain text password
        hashed_password: Hashed password from database
        
    Returns:
        bool: True if password matches, False otherwise
    """
    try:
        # Bcrypt has a 72-byte limit, truncate password to prevent errors
        truncated_password = plain_password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
        return pwd_context.verify(truncated_password, hashed_password)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt
    Bcrypt has a 72-byte limit, so we truncate passwords to prevent errors
    
    Args:
        password: Plain text password
        
    Returns:
        str: Hashed password
    """
    # Bcrypt has a 72-byte limit, truncate password to prevent errors
    truncated_password = password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    return pwd_context.hash(truncated_password)


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
    token_type: str = "access"
) -> str:
    """
    Create a JWT token (access or refresh)
    
    Args:
        data: Data to encode in the token (should include 'sub' for user identifier)
        expires_delta: Custom expiration time
        token_type: Type of token ('access' or 'refresh')
        
    Returns:
        str: Encoded JWT token
    """
    to_encode = data.copy()
    
    # Set expiration based on token type
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    elif token_type == "refresh":
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Add standard claims
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": token_type,
        "jti": secrets.token_urlsafe(16)  # Unique token ID for blacklisting
    })
    
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """
    Create a refresh token with longer expiration
    
    Args:
        data: Data to encode in the token
        
    Returns:
        str: Encoded JWT refresh token
    """
    return create_access_token(data, token_type="refresh")


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode and verify a JWT token
    
    Args:
        token: JWT token string
        
    Returns:
        dict: Token payload if valid, None otherwise
    """
    try:
        # Check if token is blacklisted
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        if token_hash in token_blacklist:
            return None
        
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        # Validate required fields
        username: str = payload.get("sub")
        token_type: str = payload.get("type", "access")
        
        if username is None:
            return None
        
        return {
            "username": username,
            "type": token_type,
            "jti": payload.get("jti"),
            "exp": payload.get("exp"),
            "iat": payload.get("iat")
        }
    except JWTError:
        return None
    except Exception:
        return None


def blacklist_token(token: str) -> bool:
    """
    Add a token to the blacklist
    
    Args:
        token: JWT token to blacklist
        
    Returns:
        bool: True if successfully blacklisted
    """
    try:
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        token_blacklist.add(token_hash)
        return True
    except Exception:
        return False


def is_token_blacklisted(token: str) -> bool:
    """
    Check if a token is blacklisted
    
    Args:
        token: JWT token to check
        
    Returns:
        bool: True if blacklisted, False otherwise
    """
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    return token_hash in token_blacklist


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password strength
    
    Args:
        password: Password to validate
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not any(char.isdigit() for char in password):
        return False, "Password must contain at least one digit"
    
    if not any(char.isupper() for char in password):
        return False, "Password must contain at least one uppercase letter"
    
    if not any(char.islower() for char in password):
        return False, "Password must contain at least one lowercase letter"
    
    return True, ""


def generate_secure_token(length: int = 32) -> str:
    """
    Generate a cryptographically secure random token
    
    Args:
        length: Length of the token
        
    Returns:
        str: Secure random token
    """
    return secrets.token_urlsafe(length)
