"""Authentication module: Google token verification, JWT creation, and FastAPI dependency."""

import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_session
from models import User, UserAppAccess

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_DAYS = 7
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "")
ADMIN_USER_ID = int(os.getenv("ADMIN_USER_ID", "1"))
ALL_APPS = ["tasks", "gym", "plants"]

bearer_scheme = HTTPBearer()


def verify_google_token(credential: str) -> dict:
    """Verify a Google ID token and return the decoded payload.

    Raises HTTPException if the token is invalid.
    """
    try:
        idinfo = google_id_token.verify_oauth2_token(
            credential, google_requests.Request(), GOOGLE_CLIENT_ID
        )
        return idinfo
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {e}",
        )


def create_jwt(user_id: int) -> str:
    """Create a signed JWT for the given user ID with 7-day expiry."""
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRY_DAYS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_jwt(token: str) -> dict:
    """Decode and validate a JWT. Raises HTTPException on failure."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


async def get_user_features(user_id: int, session: AsyncSession) -> dict[str, bool]:
    """Load app feature flags for a user. Defaults to True for any missing app."""
    result = await session.execute(
        select(UserAppAccess).where(UserAppAccess.user_id == user_id)
    )
    rows = result.scalars().all()
    features = {app: True for app in ALL_APPS}
    for row in rows:
        if row.app in features:
            features[row.app] = row.enabled
    return features


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_session),
) -> User:
    """FastAPI dependency that extracts the current user from the Authorization header."""
    token = credentials.credentials
    if ADMIN_API_KEY and token == ADMIN_API_KEY:
        user = await session.get(User, ADMIN_USER_ID)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Admin user not found",
            )
        return user
    payload = decode_jwt(token)
    user_id = int(payload["sub"])
    user = await session.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user
