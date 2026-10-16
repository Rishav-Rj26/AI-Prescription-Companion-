from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)
    full_name: Optional[str] = Field(default=None, max_length=120)

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str]
    preferred_language: str
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserSettingsUpdate(BaseModel):
    preferred_language: str = Field(pattern="^(en|hi)$")

class SessionResponse(BaseModel):
    message: str

class TokenData(BaseModel):
    email: Optional[str] = None
