"""
Configuration Settings

Centralized configuration using Pydantic Settings for type safety.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "Smart Nutrition Platform"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/nutrition_db"
    DATABASE_URL_SYNC: str = "postgresql://postgres:password@localhost:5432/nutrition_db"

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Claude API
    ANTHROPIC_API_KEY: str = ""
    
    # Gemini API
    GEMINI_API_KEY: str = ""

    # CORS - Allow all for debugging
    ALLOWED_ORIGINS: List[str] = ["*"]

    # Redis (optional)
    REDIS_URL: str = "redis://localhost:6379/0"

    # Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
