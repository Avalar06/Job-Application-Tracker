from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator


class ApplicationBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company_name: str = Field(..., min_length=1, max_length=255)
    job_title: str = Field(..., min_length=1, max_length=255)
    location: Optional[str] = Field(default=None, max_length=255)
    job_type: Optional[str] = Field(default=None, max_length=100)
    salary: Optional[str] = Field(default=None, max_length=100)
    application_date: Optional[datetime] = None
    status: str = Field(default="pending", max_length=100)
    job_url: Optional[HttpUrl] = None
    notes: Optional[str] = None
    resume_name: Optional[str] = Field(default=None, max_length=255)
    cover_letter_name: Optional[str] = Field(default=None, max_length=255)

    @field_validator("company_name", "job_title", mode="before")
    @classmethod
    def validate_required_strings(cls, value: object) -> str:
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                raise ValueError("value cannot be empty")
            return stripped
        raise ValueError("value must be a string")

    @field_validator("location", "job_type", "salary", "notes", "resume_name", "cover_letter_name", mode="before")
    @classmethod
    def validate_optional_strings(cls, value: object) -> Optional[str]:
        if value is None:
            return None
        if isinstance(value, str):
            stripped = value.strip()
            return stripped or None
        raise ValueError("value must be a string")

    @field_validator("status", mode="before")
    @classmethod
    def validate_status(cls, value: object) -> str:
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                raise ValueError("status cannot be empty")
            return stripped
        raise ValueError("status must be a string")


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company_name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    job_title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    location: Optional[str] = Field(default=None, max_length=255)
    job_type: Optional[str] = Field(default=None, max_length=100)
    salary: Optional[str] = Field(default=None, max_length=100)
    application_date: Optional[datetime] = None
    status: Optional[str] = Field(default=None, max_length=100)
    job_url: Optional[HttpUrl] = None
    notes: Optional[str] = None
    resume_name: Optional[str] = Field(default=None, max_length=255)
    cover_letter_name: Optional[str] = Field(default=None, max_length=255)

    @field_validator("company_name", "job_title", mode="before")
    @classmethod
    def validate_required_strings(cls, value: object) -> Optional[str]:
        if value is None:
            return None
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                raise ValueError("value cannot be empty")
            return stripped
        raise ValueError("value must be a string")

    @field_validator("location", "job_type", "salary", "notes", "resume_name", "cover_letter_name", mode="before")
    @classmethod
    def validate_optional_strings(cls, value: object) -> Optional[str]:
        if value is None:
            return None
        if isinstance(value, str):
            stripped = value.strip()
            return stripped or None
        raise ValueError("value must be a string")

    @field_validator("status", mode="before")
    @classmethod
    def validate_status(cls, value: object) -> Optional[str]:
        if value is None:
            return None
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                raise ValueError("status cannot be empty")
            return stripped
        raise ValueError("status must be a string")


class ApplicationResponse(ApplicationBase):
    id: int
    created_at: datetime
    updated_at: datetime
