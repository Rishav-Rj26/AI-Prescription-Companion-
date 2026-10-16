import logging
import secrets
import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .api import auth, health
from .config import settings

app = FastAPI(title="AI Prescription Companion API")
logger = logging.getLogger(__name__)


class SlidingWindowRateLimiter:
    """Small in-process safeguard for burst traffic; use a shared store when scaling out."""

    def __init__(self) -> None:
        self._requests: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def allow(self, key: str, limit: int, window_seconds: int = 60) -> bool:
        now = time.monotonic()
        with self._lock:
            bucket = self._requests[key]
            while bucket and bucket[0] <= now - window_seconds:
                bucket.popleft()
            if len(bucket) >= limit:
                return False
            bucket.append(now)
            return True


rate_limiter = SlidingWindowRateLimiter()
CSRF_EXEMPT_PATHS = {"/auth/login", "/auth/register"}

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "X-CSRF-Token"],
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Apply request safeguards and browser protections without logging sensitive data."""
    started = time.perf_counter()
    client_ip = request.client.host if request.client else "unknown"
    is_auth_attempt = request.url.path in CSRF_EXEMPT_PATHS
    rate_limit = settings.AUTH_RATE_LIMIT_PER_MINUTE if is_auth_attempt else settings.API_RATE_LIMIT_PER_MINUTE
    rate_key = f"{client_ip}:{'auth' if is_auth_attempt else 'api'}"
    if not rate_limiter.allow(rate_key, rate_limit):
        return JSONResponse(status_code=429, content={"detail": "Too many requests. Please try again shortly."})

    if request.method in {"POST", "PUT", "PATCH", "DELETE"} and request.url.path not in CSRF_EXEMPT_PATHS:
        expected_csrf = request.cookies.get(settings.CSRF_COOKIE_NAME)
        supplied_csrf = request.headers.get("X-CSRF-Token")
        if not expected_csrf or not supplied_csrf or not secrets.compare_digest(expected_csrf, supplied_csrf):
            return JSONResponse(status_code=403, content={"detail": "Invalid or missing CSRF token."})

    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Cache-Control"] = "no-store"
    response.headers["Permissions-Policy"] = "camera=(self), microphone=(self), geolocation=()"
    response.headers["Cross-Origin-Resource-Policy"] = "same-site"
    response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'; base-uri 'none'"
    if settings.ENVIRONMENT == "production":
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
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

import os
from fastapi.staticfiles import StaticFiles
uploads_path = os.path.join(os.getcwd(), "uploads")
os.makedirs(uploads_path, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")
