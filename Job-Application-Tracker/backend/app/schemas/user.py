from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    is_active: bool = True
    is_superuser: bool = False

    @field_validator("full_name", mode="before")
    @classmethod
    def validate_full_name(cls, value: object) -> str:
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                raise ValueError("full_name cannot be empty")
            return stripped
        raise ValueError("full_name must be a string")


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=255)

    @field_validator("password", mode="before")
    @classmethod
    def validate_password(cls, value: object) -> str:
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                raise ValueError("password cannot be empty")
            return stripped
        raise ValueError("password must be a string")


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=255)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, extra="forbid")
