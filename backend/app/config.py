from functools import lru_cache
from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Prescription Companion"
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ENVIRONMENT: Literal["development", "test", "production"] = "development"
    SESSION_COOKIE_NAME: str = "prescription_session"
    CSRF_COOKIE_NAME: str = "prescription_csrf"
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: Literal["lax", "strict", "none"] = "lax"
    AUTH_RATE_LIMIT_PER_MINUTE: int = 10
    API_RATE_LIMIT_PER_MINUTE: int = 120
    
    # Cloudinary Settings
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    
    # AI Settings
    GOOGLE_API_KEY: str
    AI_CONFIDENCE_THRESHOLD: float = 0.75
    AI_MODEL_NAME: str = "gemini-3.8-flash"
    EMBEDDING_MODEL_NAME: str = "models/text-embedding-004"
    AI_REQUEST_TIMEOUT: int = 60
    RAG_TOP_K: int = 5
    CORS_ORIGINS: str = "http://localhost:3000"
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024
    MAX_PDF_PAGES: int = 10

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    @model_validator(mode="after")
    def validate_production_security(self) -> "Settings":
        if self.COOKIE_SAMESITE == "none" and not self.COOKIE_SECURE:
            raise ValueError("COOKIE_SECURE must be true when COOKIE_SAMESITE is none")
        if self.ENVIRONMENT == "production":
            if not self.COOKIE_SECURE:
                raise ValueError("COOKIE_SECURE must be true in production")
            if len(self.JWT_SECRET) < 32 or self.JWT_SECRET.startswith("replace-with-"):
                raise ValueError("JWT_SECRET must be a unique value of at least 32 characters in production")
        return self

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip().rstrip("/") for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
