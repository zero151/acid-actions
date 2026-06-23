# Acid Actions

Кислотно-чёрный киберпанк-сервис для хранения и случайного выбора действий.

Проект построен на FastAPI и позволяет хранить общий список действий, получать случайные действия, удалять их и управлять списком через REST API или современный веб-интерфейс.
<img width="1578" height="931" alt="image" src="https://github.com/user-attachments/assets/90c4a84e-1274-49f8-bfeb-2749d509941f" />

## 🌐 Онлайн-версия

https://acid-actions.onrender.com

## ✨ Возможности

- Просмотр всех действий
- Добавление новых действий
- Удаление отдельных действий
- Очистка всего списка
- Получение случайных действий
- Режим без повторений
- Адаптивный интерфейс для ПК и мобильных устройств
- Cyberpunk / Acid Black дизайн

## 📋 Требования

- Python 3.8+
- FastAPI
- Uvicorn

## 🚀 Установка

```bash
git clone <repository-url>
cd <repository-name>

python -m venv venv

# Linux/macOS
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

## ▶️ Запуск

```bash
uvicorn random_main:app --reload
```

После запуска приложение будет доступно по адресу:

```text
http://127.0.0.1:8000
```

## 📚 Документация API

Swagger UI:

```text
http://127.0.0.1:8000/docs
```
Для онлайн-версии:

```text
https://acid-actions.onrender.com/docs
```

## 📁 Структура проекта

```text
.
├── random_main.py
├── action.json
├── requirements.txt
├── static/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
└── README.md
```

## 📚 API Эндпоинты

| Метод | Эндпоинт | Описание |
| :--- | :--- | :--- |
| GET | `/` | Проверка работы API |
| GET | `/random` | Получить случайные действия |
| POST | `/add/{text}` | Добавить действие |
| GET | `/all` | Получить весь список |
| DELETE | `/del/{index}` | Удалить действие по номеру |
| DELETE | `/del/all` | Очистить весь список |

## 🔧 Примеры запросов

Получить случайные действия:

```http
GET /random?count=3&unique=true
```

Добавить действие:

```http
POST /add/Пойти%20гулять
```

Удалить действие:

```http
DELETE /del/2
```

Очистить список:

```http
DELETE /del/all
```

## ⚙️ Особенности

- Данные сохраняются в `action.json`
- Все пользователи работают с одним общим списком
- Изменения сразу видны всем пользователям
- Поддерживается случайный выбор без повторений
- Реализована обработка ошибок сервера и сети
- Фронтенд работает через Fetch API
- Интерфейс адаптирован для мобильных устройств

## 🌍 Deploy на Render

Команда установки:

```bash
pip install -r requirements.txt
```

Команда запуска:

```bash
uvicorn random_main:app --host 0.0.0.0 --port $PORT
```

После деплоя приложение доступно по адресу:

https://acid-actions.onrender.com
