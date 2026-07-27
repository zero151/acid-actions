# Acid Actions

Кислотно-чёрный киберпанк-сервис для хранения и случайного выбора действий с авторизацией.

Проект построен на **FastAPI** (бэкенд) и **чистом HTML/CSS/JS** (фронтенд). Данные хранятся в **PostgreSQL**, пароли хэшируются **Argon2**, авторизация по **JWT**.

## 🌐 Онлайн-версия

[https://acid-actions.onrender.com](https://acid-actions.onrender.com)

<img width="600" alt="image" src="https://github.com/user-attachments/assets/07aceb5f-43db-43c7-a11e-e5749fbe3106" />
<img width="600" alt="image" src="https://github.com/user-attachments/assets/375a6327-72e3-4dca-b3e3-a475a7c3747e" />

## ✨ Возможности

- Регистрация и вход (JWT)
- Добавление действий (только для авторизованных)
- Удаление одного или всех своих действий
- Получение случайных действий из своего списка (с повторениями или без)
- Гостевой режим (данные хранятся в `localStorage`)
- Адаптивный киберпанк-дизайн
- Полная документация API (Swagger)

## 🚀 Запуск через Docker (рекомендуемый способ)

Самый простой способ — использовать Docker Compose.

### 1. Клонируйте репозиторий
```bash
git clone https://github.com/ваш-аккаунт/ваш-репозиторий.git
cd ваш-репозиторий
```

### 2. Создайте файл `.env` в корне проекта
Пример содержимого:
```env
DATABASE_URL=postgresql://postgres:password@db:5432/random
SECRET_KEY=supersecretkeychangeit
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```
> **Важно:** Пароль `12345` в `DATABASE_URL` **обязательно должен совпадать** с паролем в `docker-compose.yml` (в сервисе `db` у `POSTGRES_PASSWORD`). Если вы меняете пароль там – поменяйте и здесь. Хост `db` менять **не нужно** – это имя контейнера.

### 3. Запустите контейнеры
```bash
docker compose up -d --build
```

После этого приложение будет доступно по адресу [http://localhost:8000](http://localhost:8000).

### 4. Остановка
```bash
docker compose down
```

## ▶️ Запуск без Docker (для разработки)

### Требования
- Python 3.12+
- PostgreSQL (установленный локально или удалённый)

### Установка
```bash
python -m venv venv
source venv/bin/activate  # или venv\Scripts\activate на Windows
pip install -r requirements.txt
```

### Настройка базы данных
Создайте базу данных (например, `random`) и укажите её в `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/random
SECRET_KEY=ваш_секретный_ключ
```

### Запуск
```bash
uvicorn backend.main:app --reload
```

Откройте [http://127.0.0.1:8000](http://127.0.0.1:8000) в браузере.

## 🔧 Переменные окружения

| Переменная | Описание | Пример |
|------------|----------|--------|
| `DATABASE_URL` | Строка подключения к PostgreSQL | `postgresql://postgres:12345@db:5432/random` |
| `SECRET_KEY` | Секретный ключ для JWT | `my_secret_key` |
| `ALGORITHM` | Алгоритм подписи JWT (по умолчанию `HS256`) | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Время жизни токена (мин) | `30` |

## 📚 Документация API

Swagger UI доступен по адресу:
- Локально: [http://localhost:8000/docs](http://localhost:8000/docs)
- Онлайн: [https://acid-actions.onrender.com/docs](https://acid-actions.onrender.com/docs)

Основные эндпоинты:
- `POST /register` – регистрация
- `POST /login` – вход (получение JWT)
- `GET /users/me` – данные текущего пользователя
- `POST /action` – добавить действие
- `GET /actions` – получить все свои действия
- `DELETE /action/{id}` – удалить действие по ID
- `DELETE /actions` – удалить все свои действия
- `GET /random` – получить случайное действие

## 📁 Структура проекта

```
.
├── backend/
│   ├── main.py          # FastAPI приложение
│   ├── config.py        # Настройки (pydantic-settings)
│   ├── database.py      # Подключение к БД
│   ├── models.py        # SQLModel модели
│   ├── schemas.py       # Pydantic схемы
│   └── auth.py          # JWT, хэширование
├── static/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── README.md
```
