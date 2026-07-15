from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class JobApplicationBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company_name: str = Field(..., min_length=1, max_length=255)
    job_title: str = Field(..., min_length=1, max_length=255)
    status: str = Field(..., min_length=1, max_length=100)
    location: Optional[str] = Field(default=None, max_length=255)
    job_url: Optional[str] = Field(default=None, max_length=500)
    salary: Optional[str] = Field(default=None, max_length=100)
    applied_date: Optional[datetime] = None
    notes: Optional[str] = None

    @field_validator("company_name", "job_title", "status", mode="before")
    @classmethod
    def validate_required_strings(cls, value: object) -> str:
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                raise ValueError("value cannot be empty")
            return stripped
        raise ValueError("value must be a string")

    @field_validator("location", "job_url", "salary", "notes", mode="before")
    @classmethod
    def validate_optional_strings(cls, value: object) -> Optional[str]:
        if value is None:
            return None
        if isinstance(value, str):
            stripped = value.strip()
            return stripped or None
        raise ValueError("value must be a string")


class JobApplicationCreate(JobApplicationBase):
    pass


class JobApplicationUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company_name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    job_title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    status: Optional[str] = Field(default=None, min_length=1, max_length=100)
    location: Optional[str] = Field(default=None, max_length=255)
    job_url: Optional[str] = Field(default=None, max_length=500)
    salary: Optional[str] = Field(default=None, max_length=100)
    applied_date: Optional[datetime] = None
    notes: Optional[str] = None

    @field_validator("company_name", "job_title", "status", mode="before")
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

    @field_validator("location", "job_url", "salary", "notes", mode="before")
    @classmethod
    def validate_optional_strings(cls, value: object) -> Optional[str]:
        if value is None:
            return None
        if isinstance(value, str):
            stripped = value.strip()
            return stripped or None
        raise ValueError("value must be a string")


class JobApplicationResponse(JobApplicationBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime


ApplicationBase = JobApplicationBase
ApplicationCreate = JobApplicationCreate
ApplicationUpdate = JobApplicationUpdate
ApplicationResponse = JobApplicationResponse
