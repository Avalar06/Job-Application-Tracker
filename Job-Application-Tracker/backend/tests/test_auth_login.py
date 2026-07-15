import pytest
from fastapi.testclient import TestClient

from app.database.database import Base, SessionLocal, engine
from app.main import app
from app.models.user import User
from app.services.auth_service import create_user
from app.schemas.user import UserCreate


@pytest.fixture(autouse=True)
def reset_db() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client


def _create_user() -> User:
    with SessionLocal() as db:
        return create_user(
            db,
            UserCreate(full_name="Jane Doe", email="jane@example.com", password="strongpassword"),
        )


def test_login_returns_access_token_for_valid_credentials(client: TestClient) -> None:
    _create_user()

    response = client.post(
        "/auth/login",
        json={"email": "jane@example.com", "password": "strongpassword"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["token_type"] == "bearer"
    assert isinstance(data["access_token"], str)
    assert data["access_token"]


def test_login_returns_unauthorized_for_wrong_password(client: TestClient) -> None:
    _create_user()

    response = client.post(
        "/auth/login",
        json={"email": "jane@example.com", "password": "wrongpassword"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


def test_login_returns_unauthorized_for_unknown_email(client: TestClient) -> None:
    response = client.post(
        "/auth/login",
        json={"email": "missing@example.com", "password": "strongpassword"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


def test_login_validation_failure_for_invalid_request(client: TestClient) -> None:
    response = client.post(
        "/auth/login",
        json={"email": "not-an-email", "password": ""},
    )

    assert response.status_code == 422
