from fastapi import HTTPException, UploadFile
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.application import Application
from app.schemas.application import ApplicationCreate, ApplicationUpdate
from app.utils.file_utils import save_uploaded_file


def create_application(db: Session, application_data: ApplicationCreate) -> Application:
    application = Application(**application_data.model_dump())
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


def get_application(db: Session, application_id: int) -> Application:
    application = db.query(Application).filter(Application.id == application_id).first()
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return application


def get_all_applications(db: Session, page: int = 1, size: int = 10, search: str | None = None) -> list[Application]:
    query = db.query(Application).order_by(Application.created_at.desc())

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Application.company_name.ilike(search_term),
                Application.job_title.ilike(search_term),
                Application.location.ilike(search_term),
            )
        )

    return query.offset((page - 1) * size).limit(size).all()


def update_application(db: Session, application_id: int, application_data: ApplicationUpdate) -> Application:
    application = get_application(db, application_id)
    update_data = application_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(application, field, value)

    db.commit()
    db.refresh(application)
    return application


def delete_application(db: Session, application_id: int) -> None:
    application = get_application(db, application_id)
    db.delete(application)
    db.commit()


def update_application_file(
    db: Session,
    application_id: int,
    file: UploadFile,
    folder_name: str,
    field_name: str,
) -> dict[str, str]:
    application = get_application(db, application_id)
    stored_name, relative_path = save_uploaded_file(file, folder_name, application_id)

    setattr(application, field_name, stored_name)
    db.commit()
    db.refresh(application)

    return {
        "message": "File uploaded successfully",
        "filename": stored_name,
        "path": relative_path,
    }
