from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationUpdate
from app.services.application_service import (
    create_application,
    delete_application,
    get_all_applications,
    get_application,
    update_application,
)

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application_route(
    application_data: ApplicationCreate,
    db: Session = Depends(get_db),
) -> ApplicationResponse:
    return create_application(db, application_data)


@router.get("/", response_model=list[ApplicationResponse])
def list_applications(db: Session = Depends(get_db)) -> list[ApplicationResponse]:
    applications = get_all_applications(db)
    return applications


@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application_route(application_id: int, db: Session = Depends(get_db)) -> ApplicationResponse:
    return get_application(db, application_id)


@router.put("/{application_id}", response_model=ApplicationResponse)
def update_application_route(
    application_id: int,
    application_data: ApplicationUpdate,
    db: Session = Depends(get_db),
) -> ApplicationResponse:
    return update_application(db, application_id, application_data)


@router.delete("/{application_id}")
def delete_application_route(application_id: int, db: Session = Depends(get_db)) -> dict[str, str]:
    delete_application(db, application_id)
    return {"message": "Application deleted successfully"}
