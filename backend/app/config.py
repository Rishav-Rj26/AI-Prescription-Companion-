from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Prescription Companion"
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # AWS S3 Settings
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_S3_BUCKET_NAME: str
    AWS_S3_REGION: str = "us-east-1"
    
    # AI Settings
    GOOGLE_API_KEY: str
    AI_CONFIDENCE_THRESHOLD: float = 0.75
    AI_MODEL_NAME: str = "gemini-2.5-flash"
    EMBEDDING_MODEL_NAME: str = "models/text-embedding-004"
    AI_REQUEST_TIMEOUT: int = 60
    RAG_TOP_K: int = 5

    class Config:
        env_file = ".env"

settings = Settings()
