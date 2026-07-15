from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserCreate


def create_user(db: Session, user_data: UserCreate) -> User:
    normalized_email = str(user_data.email).lower()

    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user_payload = user_data.model_dump(exclude={"password"})
    user_payload["email"] = normalized_email
    user_payload["password_hash"] = hash_password(user_data.password)

    user = User(**user_payload)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
