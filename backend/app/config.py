from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Core LLM
    GROQ_API_KEY: str
    # Database
    DATABASE_URL: str = "sqlite:///./content_db.db"
    # Task Queue — OPTIONAL (only needed for Celery mode)
    REDIS_URL: Optional[str] = "redis://localhost:6379"
    # Research
    TAVILY_API_KEY: str
    # Social Media Integrations (all optional)
    TWITTER_API_KEY: Optional[str] = None
    TWITTER_API_SECRET: Optional[str] = None
    TWITTER_ACCESS_TOKEN: Optional[str] = None
    TWITTER_ACCESS_SECRET: Optional[str] = None
    LINKEDIN_ACCESS_TOKEN: Optional[str] = None
    LINKEDIN_PERSON_URN: Optional[str] = None
    # App
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
