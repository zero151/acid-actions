from typing import Generator

from sqlalchemy import create_engine
from sqlmodel import SQLModel, Session
from backend.config import settings
from backend.models import User, Action

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_db() -> Generator[Session,None,None]:
    with Session(engine) as session:
        yield session