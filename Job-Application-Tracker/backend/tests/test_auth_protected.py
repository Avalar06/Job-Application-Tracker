import pytest
from fastapi.testclient import TestClient

from app.database.database import Base, engine
from app.main import app
from app.models.user import User
from app.schemas.user import UserCreate
from app.services.auth_service import create_user
from app.database.database import SessionLocal


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


def _get_token(client: TestClient) -> str:
    response = client.post(
        "/auth/login",
        json={"email": "jane@example.com", "password": "strongpassword"},
    )
    return response.json()["access_token"]


def test_authenticated_request_succeeds(client: TestClient) -> None:
    _create_user()
    token = _get_token(client)

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "jane@example.com"
    assert data["full_name"] == "Jane Doe"
    assert "password" not in data
    assert "password_hash" not in data


def test_missing_token_returns_401(client: TestClient) -> None:
    response = client.get("/auth/me")

    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"


def test_invalid_token_returns_401(client: TestClient) -> None:
    response = client.get("/auth/me", headers={"Authorization": "Bearer invalid-token"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"


def test_malformed_authorization_header_returns_401(client: TestClient) -> None:
    response = client.get("/auth/me", headers={"Authorization": "Token invalid-token"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"
