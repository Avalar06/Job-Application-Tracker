from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.application_routes import router as application_router
from app.config.settings import settings
from app.database.database import Base, engine
from app.models import Application, User


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="A lightweight API for tracking job applications.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def create_tables() -> None:
        Base.metadata.create_all(bind=engine)

    @app.get("/")
    def read_root() -> dict[str, str]:
        return {"message": settings.APP_NAME}

    @app.get("/health")
    def health_check() -> dict[str, str]:
        return {"status": "healthy"}

    app.include_router(application_router)

    return app


app = create_app()
