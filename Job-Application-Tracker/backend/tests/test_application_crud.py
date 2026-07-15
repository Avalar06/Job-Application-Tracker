import pytest
from fastapi.testclient import TestClient

from app.database.database import Base, SessionLocal, engine
from app.main import app
from app.models.user import User
from app.schemas.user import UserCreate
from app.services.auth_service import create_user
from app.core.jwt_handler import create_access_token


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


def _create_user(email: str, full_name: str = "Test User") -> User:
    with SessionLocal() as db:
        return create_user(
            db,
            UserCreate(full_name=full_name, email=email, password="strongpassword"),
        )


def _auth_headers(user: User) -> dict[str, str]:
    token = create_access_token({"sub": str(user.id)})
    return {"Authorization": f"Bearer {token}"}


def test_create_application_requires_authentication(client: TestClient) -> None:
    response = client.post(
        "/applications",
        json={
            "company_name": "Acme",
            "job_title": "Backend Engineer",
            "status": "pending",
        },
    )

    assert response.status_code == 401


def test_create_application_success(client: TestClient) -> None:
    user = _create_user("jane@example.com")

    response = client.post(
        "/applications",
        json={
            "company_name": "Acme",
            "job_title": "Backend Engineer",
            "status": "pending",
            "location": "Remote",
            "salary": "$120k",
            "applied_date": "2026-07-15T12:00:00",
            "notes": "Needs follow-up",
        },
        headers=_auth_headers(user),
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["company_name"] == "Acme"
    assert payload["job_title"] == "Backend Engineer"
    assert payload["status"] == "pending"
    assert payload["user_id"] == user.id


def test_create_application_validation_failure(client: TestClient) -> None:
    user = _create_user("jane@example.com")

    response = client.post(
        "/applications",
        json={"company_name": "", "job_title": "", "status": ""},
        headers=_auth_headers(user),
    )

    assert response.status_code == 422


def test_list_applications_returns_only_current_user_items(client: TestClient) -> None:
    user_one = _create_user("jane@example.com")
    user_two = _create_user("john@example.com", full_name="John Doe")

    first_response = client.post(
        "/applications",
        json={"company_name": "Acme", "job_title": "Engineer", "status": "pending"},
        headers=_auth_headers(user_one),
    )
    second_response = client.post(
        "/applications",
        json={"company_name": "Beta", "job_title": "Designer", "status": "applied"},
        headers=_auth_headers(user_two),
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 201

    list_response = client.get("/applications", headers=_auth_headers(user_one))

    assert list_response.status_code == 200
    payload = list_response.json()
    assert len(payload) == 1
    assert payload[0]["company_name"] == "Acme"
    assert payload[0]["user_id"] == user_one.id


def test_get_application_returns_owned_application(client: TestClient) -> None:
    user = _create_user("jane@example.com")

    create_response = client.post(
        "/applications",
        json={"company_name": "Acme", "job_title": "Engineer", "status": "pending"},
        headers=_auth_headers(user),
    )

    application_id = create_response.json()["id"]
    get_response = client.get(f"/applications/{application_id}", headers=_auth_headers(user))

    assert get_response.status_code == 200
    assert get_response.json()["id"] == application_id


def test_update_application_updates_owned_application(client: TestClient) -> None:
    user = _create_user("jane@example.com")

    create_response = client.post(
        "/applications",
        json={"company_name": "Acme", "job_title": "Engineer", "status": "pending"},
        headers=_auth_headers(user),
    )

    application_id = create_response.json()["id"]
    update_response = client.put(
        f"/applications/{application_id}",
        json={"status": "interview", "notes": "Great fit"},
        headers=_auth_headers(user),
    )

    assert update_response.status_code == 200
    payload = update_response.json()
    assert payload["status"] == "interview"
    assert payload["notes"] == "Great fit"


def test_delete_application_removes_owned_application(client: TestClient) -> None:
    user = _create_user("jane@example.com")

    create_response = client.post(
        "/applications",
        json={"company_name": "Acme", "job_title": "Engineer", "status": "pending"},
        headers=_auth_headers(user),
    )

    application_id = create_response.json()["id"]
    delete_response = client.delete(f"/applications/{application_id}", headers=_auth_headers(user))

    assert delete_response.status_code == 200
    assert client.get(f"/applications/{application_id}", headers=_auth_headers(user)).status_code == 404


def test_ownership_protection_returns_not_found_for_other_user_application(client: TestClient) -> None:
    owner = _create_user("jane@example.com")
    other_user = _create_user("john@example.com", full_name="John Doe")

    create_response = client.post(
        "/applications",
        json={"company_name": "Acme", "job_title": "Engineer", "status": "pending"},
        headers=_auth_headers(owner),
    )

    application_id = create_response.json()["id"]
    response = client.get(f"/applications/{application_id}", headers=_auth_headers(other_user))

    assert response.status_code == 404
    assert response.json()["detail"] == "Application not found"
