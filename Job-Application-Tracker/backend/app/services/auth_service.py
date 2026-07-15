from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.jwt_handler import create_access_token
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.user import Token, UserCreate, UserLogin


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


def authenticate_user(db: Session, user_data: UserLogin) -> Token:
    normalized_email = str(user_data.email).lower()
    user = db.query(User).filter(User.email == normalized_email).first()

    if user is None or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    access_token = create_access_token({"sub": str(user.id)})
    return Token(access_token=access_token)
