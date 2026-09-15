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
from .api import prescriptions, chat, sources, schedules, admin
app.include_router(prescriptions.router, prefix="/prescriptions", tags=["prescriptions"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(sources.router, prefix="/sources", tags=["sources"])
app.include_router(schedules.router, prefix="/schedules", tags=["schedules"])
app.include_router(admin.router, prefix="/admin/dashboard", tags=["admin"])
