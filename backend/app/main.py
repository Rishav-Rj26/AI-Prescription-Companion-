import logging
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from .api import auth, health
from .config import settings

app = FastAPI(title="AI Prescription Companion API")
logger = logging.getLogger(__name__)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add baseline browser protections without logging sensitive request data."""
    started = time.perf_counter()
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Cache-Control"] = "no-store"
    response.headers["Permissions-Policy"] = "camera=(self), microphone=(self), geolocation=()"
    response.headers["Cross-Origin-Resource-Policy"] = "same-site"
    logger.info("%s %s -> %s in %dms", request.method, request.url.path,
                response.status_code, (time.perf_counter() - started) * 1000)
    return response

# Include routers
app.include_router(health.router)
app.include_router(auth.router, prefix="/auth", tags=["auth"])
from .api import prescriptions, chat, sources, schedules, admin
app.include_router(prescriptions.router, prefix="/prescriptions", tags=["prescriptions"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(sources.router, prefix="/sources", tags=["sources"])
app.include_router(schedules.router, prefix="/schedules", tags=["schedules"])
app.include_router(admin.router, prefix="/admin/dashboard", tags=["admin"])
