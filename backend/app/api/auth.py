import secrets

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Any

from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin, SessionResponse, UserResponse, UserSettingsUpdate
from app.services.auth import get_password_hash, verify_password, create_access_token
from app.api.deps import get_current_user
from app.config import settings
from app.services.audit import record_audit_event

router = APIRouter()


def establish_session(response: Response, access_token: str) -> None:
    """Set an HttpOnly session cookie and a separate double-submit CSRF token."""
    lifetime_seconds = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    cookie_options = {
        "max_age": lifetime_seconds,
        "secure": settings.COOKIE_SECURE,
        "samesite": settings.COOKIE_SAMESITE,
        "path": "/",
    }
    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=access_token,
        httponly=True,
        **cookie_options,
    )
    response.set_cookie(
        key=settings.CSRF_COOKIE_NAME,
        value=secrets.token_urlsafe(32),
        httponly=False,
        **cookie_options,
    )

@router.post("/register", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> Any:
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalars().first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    # Create new user
    user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    await record_audit_event(db, event_name="account.registered", actor_user_id=user.id, resource_type="user", resource_id=user.id)
    await db.commit()
    
    # Generate token
    access_token = create_access_token(data={"sub": user.email})
    await record_audit_event(db, event_name="session.signed_in", actor_user_id=user.id, resource_type="user", resource_id=user.id)
    await db.commit()
    establish_session(response, access_token)
    return {"message": "Account created"}

@router.post("/login", response_model=SessionResponse)
async def login(
    user_in: UserLogin,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> Any:
    # Find user
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalars().first()
    
    # Authenticate
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=400,
            detail="Incorrect email or password",
        )
    
    # Generate token
    access_token = create_access_token(data={"sub": user.email})
    establish_session(response, access_token)
    return {"message": "Signed in"}


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Response:
    await record_audit_event(db, event_name="session.signed_out", actor_user_id=current_user.id, resource_type="user", resource_id=current_user.id)
    await db.commit()
    response.delete_cookie(key=settings.SESSION_COOKIE_NAME, path="/")
    response.delete_cookie(key=settings.CSRF_COOKIE_NAME, path="/")
    response.status_code = status.HTTP_204_NO_CONTENT
    return response

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> Any:
    return current_user

@router.patch("/settings", response_model=UserResponse)
async def update_settings(
    settings_in: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    current_user.preferred_language = settings_in.preferred_language
    await record_audit_event(db, event_name="account.settings_updated", actor_user_id=current_user.id, resource_type="user", resource_id=current_user.id, metadata={"field": "preferred_language"})
    await db.commit()
    await db.refresh(current_user)
    return current_user
