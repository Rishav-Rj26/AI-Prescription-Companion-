from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Prescription Companion"
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
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

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip().rstrip("/") for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
