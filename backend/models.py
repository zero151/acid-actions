from typing import List
from sqlmodel import SQLModel,Relationship,Field


class User(SQLModel, table = True):
    __tablename__ = "users"
    id: int | None = Field(default=None, primary_key=True)
    username: str
    password: str
    actions: List["Action"] = Relationship(back_populates="owner")

class Action(SQLModel, table = True):
    __tablename__ = "actions"
    id: int | None = Field(default=None, primary_key=True)
    text: str
    owner_id: int = Field(foreign_key="users.id")
    owner: User = Relationship(back_populates="actions")