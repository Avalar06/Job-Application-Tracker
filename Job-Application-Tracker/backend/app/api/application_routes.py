from fastapi import APIRouter, Depends, File, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationUpdate
from app.services.application_service import (
    create_application,
    delete_application,
    get_all_applications,
    get_application,
    update_application,
    update_application_file,
)

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application_route(
    application_data: ApplicationCreate,
    db: Session = Depends(get_db),
) -> ApplicationResponse:
    return create_application(db, application_data)


@router.get("/", response_model=list[ApplicationResponse])
def list_applications(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[ApplicationResponse]:
    applications = get_all_applications(db, page=page, size=size, search=search)
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


@router.post("/{application_id}/resume", status_code=status.HTTP_201_CREATED)
def upload_resume(
    application_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    return update_application_file(db, application_id, file, "resumes", "resume_name")


@router.post("/{application_id}/cover-letter", status_code=status.HTTP_201_CREATED)
def upload_cover_letter(
    application_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    return update_application_file(db, application_id, file, "cover_letters", "cover_letter_name")
