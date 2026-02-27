from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
import uuid


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(UserBase):
    id: uuid.UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenData(BaseModel):
    user_id: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str
    user: User
