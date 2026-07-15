from fastapi import HTTPException, UploadFile
from sqlalchemy import or_
from sqlalchemy.orm import Session
from sqlalchemy.sql import expression

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


def get_all_applications(
    db: Session,
    page: int = 1,
    size: int = 10,
    search: str | None = None,
    sort_by: str = "created_at",
    order: str = "desc",
    status: str | None = None,
    job_type: str | None = None,
) -> list[Application]:
    allowed_sort_fields = {"company_name", "application_date", "status", "created_at"}
    if sort_by not in allowed_sort_fields:
        raise HTTPException(status_code=400, detail=f"Invalid sort_by value: {sort_by}")

    allowed_orders = {"asc", "desc"}
    if order.lower() not in allowed_orders:
        raise HTTPException(status_code=400, detail=f"Invalid order value: {order}")

    query = db.query(Application)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Application.company_name.ilike(search_term),
                Application.job_title.ilike(search_term),
                Application.location.ilike(search_term),
            )
        )

    if status:
        query = query.filter(Application.status.ilike(status.strip()))

    if job_type:
        query = query.filter(Application.job_type.ilike(job_type.strip()))

    sort_column = getattr(Application, sort_by)
    if order.lower() == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

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
