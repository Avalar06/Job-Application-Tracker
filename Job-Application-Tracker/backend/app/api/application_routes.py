from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.application import JobApplicationCreate, JobApplicationResponse, JobApplicationUpdate
from app.services.application_service import (
    create_application,
    delete_application,
    get_all_applications,
    get_application,
    update_application,
)

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("", response_model=JobApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application_route(
    application_data: JobApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> JobApplicationResponse:
    return create_application(db, current_user.id, application_data)


@router.get("", response_model=list[JobApplicationResponse])
def list_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[JobApplicationResponse]:
    return get_all_applications(db, current_user.id)


@router.get("/{application_id}", response_model=JobApplicationResponse)
def get_application_route(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> JobApplicationResponse:
    return get_application(db, current_user.id, application_id)


@router.put("/{application_id}", response_model=JobApplicationResponse)
def update_application_route(
    application_id: int,
    application_data: JobApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> JobApplicationResponse:
    return update_application(db, current_user.id, application_id, application_data)


@router.delete("/{application_id}")
def delete_application_route(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    delete_application(db, current_user.id, application_id)
    return {"message": "Application deleted successfully"}
