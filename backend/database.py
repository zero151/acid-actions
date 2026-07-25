from typing import Generator

from sqlalchemy import create_engine
from sqlmodel import Session
from backend.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, echo=True)

def get_db() -> Generator[Session,None,None]:
    with Session(engine) as session:
        yield session