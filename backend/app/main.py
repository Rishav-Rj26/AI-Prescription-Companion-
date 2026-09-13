from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import auth, health

app = FastAPI(title="AI Prescription Companion API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(auth.router, prefix="/auth", tags=["auth"])
