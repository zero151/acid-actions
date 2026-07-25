from contextlib import asynccontextmanager
import random
from typing import List
from fastapi import Depends, FastAPI, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select, delete
from fastapi.middleware.cors import CORSMiddleware
# Импортируем наши слои
from backend.database import create_db_and_tables
from backend.models import User, Action
from backend.schemas import ActionOut, MessageResponse, UserRegister, UserOut, TokenResponse, ActionCreate
from backend.auth import get_db, password_hash, create_access_token, get_current_user

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan = lifespan, summary="Рандомайзер с авторизацией")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # для разработки
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register",summary="Регистрация", response_model=UserOut ,status_code=201)
def add_user(register: UserRegister,db: Session = Depends(get_db)):
    user: User = User(username= register.username, password= password_hash.hash(register.password))
    query = select(User).where(User.username == register.username)
    user_exist = db.exec(query).first()
    if user_exist:
        raise HTTPException( status_code=400, detail="Пользователь уже существует")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(),db: Session = Depends(get_db)):
    query = select(User).where(User.username == form_data.username)
    user = db.exec(query).first()
    if not user or not password_hash.verify(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Неверное имя или пароль пользователя")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/users/me", response_model=UserOut)
def read_user_me(current_user: User = Depends(get_current_user)):
    return current_user


@app.post("/action",summary="Добавление действия",response_model=MessageResponse)
def create_action(action_data: ActionCreate, current_user: User = Depends(get_current_user),db: Session = Depends(get_db)):
    action = Action(text=action_data.text, owner_id=current_user.id)
    db.add(action)
    db.commit()
    return {"message": "Действие успешно добавлено"}

@app.delete("/action/{action_id}",summary="Удаление действия", response_model=MessageResponse)
def delete_action(action_id : int, current_user: User = Depends(get_current_user),db: Session = Depends(get_db)):
    action = db.get(Action, action_id)
    if not action:
        raise HTTPException(status_code=404, detail="Действие не найдено")
    if action.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет прав на удаление этого действия")
    db.delete(action)
    db.commit()
    return {"message": f"Действие {action_id} успешно удалено"}

@app.delete("/actions",summary="Удаление действий",response_model=MessageResponse)
def delete_actions(current_user: User = Depends(get_current_user),db: Session = Depends(get_db)):
    query = delete(Action).where(Action.owner_id == current_user.id)
    db.exec(query)
    db.commit()
    return {"message": "Действие успешно удалено"}

#даёт все действия пользователя
@app.get("/actions",summary="Все действия пользователя", response_model=List[ActionOut])
def get_user_actions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return current_user.actions

@app.get("/random",summary="Случайное действие",response_model=ActionOut)
def random_action(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.actions:
        raise HTTPException(status_code=404, detail="Нет действий")
    random_action = random.choice(current_user.actions)
    return random_action

app.mount("/", StaticFiles(directory="static", html=True), name="static")