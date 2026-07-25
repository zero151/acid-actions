from collections.abc import Generator

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import jwt
from datetime import datetime, timedelta, timezone
from pwdlib import PasswordHash
from sqlmodel import Session
from backend.config import settings
from backend.database import get_db
from backend.models import User

# Наш современный Argon2 хэшер
password_hash = PasswordHash.recommended()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({"exp": expire})
    
    # Берем SECRET_KEY и ALGORITHM из нашего слоя настроек
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_jwt(token : str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms = [settings.ALGORITHM])
        return payload
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None
    
def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
    status_code=401,  # Теперь это число!
    detail="Не удалось валидировать учетные данные",
    headers={"WWW-Authenticate": "Bearer"}, # Секретный бонус: по стандарту OAuth2 защищенные эндпоинты должны возвращать этот заголовок при ошибке 401
)
    payload = decode_jwt(token)
    if payload is None:
        raise credentials_exception
    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    user = db.get(User,int(user_id))
    if user is None:
        raise credentials_exception
    return user


