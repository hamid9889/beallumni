from datetime import datetime, timedelta, timezone
from typing import Optional
import hashlib
import os
import json
import base64
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key')
JWT_EXPIRATION_HOURS = int(os.environ.get('JWT_EXPIRATION_HOURS', '24'))

# itsdangerous serializer for tokens
serializer = URLSafeTimedSerializer(JWT_SECRET)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash using hashlib"""
    salt = hashed_password[:32]
    stored_hash = hashed_password[32:]
    new_hash = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
    return new_hash == stored_hash

def get_password_hash(password: str) -> str:
    """Hash a password using hashlib"""
    salt = os.urandom(16).hex()
    hash_value = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
    return salt + hash_value

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed token using itsdangerous"""
    return serializer.dumps(data)

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify a token using itsdangerous"""
    try:
        # JWT_EXPIRATION_HOURS in seconds
        max_age = JWT_EXPIRATION_HOURS * 3600
        return serializer.loads(token, max_age=max_age)
    except (BadSignature, SignatureExpired):
        return None
