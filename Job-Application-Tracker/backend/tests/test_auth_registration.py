import pytest
from fastapi.testclient import TestClient

from app.core.security import verify_password
from app.database.database import Base, SessionLocal, engine
from app.main import app
from app.models.user import User


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


def test_register_user_creates_account_and_hashes_password(client: TestClient) -> None:
    payload = {
        "full_name": "Jane Doe",
        "email": "jane@example.com",
        "password": "strongpassword",
    }

    response = client.post("/auth/register", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == payload["email"]
    assert data["full_name"] == payload["full_name"]
    assert "password" not in data
    assert "password_hash" not in data

    with SessionLocal() as db:
        saved_user = db.query(User).filter(User.email == payload["email"]).first()
        assert saved_user is not None
        assert saved_user.password_hash != payload["password"]
        assert verify_password(payload["password"], saved_user.password_hash)


def test_register_user_rejects_duplicate_email(client: TestClient) -> None:
    payload = {
        "full_name": "Jane Doe",
        "email": "jane@example.com",
        "password": "strongpassword",
    }

    first_response = client.post("/auth/register", json=payload)
    second_response = client.post("/auth/register", json=payload)

    assert first_response.status_code == 201
    assert second_response.status_code == 400
    assert second_response.json()["detail"] == "Email already registered"
