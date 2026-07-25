from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Описываем, какие переменные мы ждем. Pydantic сам найдет их в файле .env
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Указываем Pydantic читать данные из файла .env
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

# Создаем объект настроек
settings = Settings()