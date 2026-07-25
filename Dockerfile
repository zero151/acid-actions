FROM python:3.12

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY backend ./backend
COPY static ./static

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]