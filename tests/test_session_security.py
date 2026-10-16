from fastapi import Response

from app.api.auth import establish_session
from app.config import settings


def test_session_cookie_is_httponly_and_has_a_matching_csrf_cookie():
    response = Response()
    establish_session(response, "test-session-token")

    cookies = response.headers.getlist("set-cookie")
    session_cookie = next(cookie for cookie in cookies if cookie.startswith(f"{settings.SESSION_COOKIE_NAME}="))
    csrf_cookie = next(cookie for cookie in cookies if cookie.startswith(f"{settings.CSRF_COOKIE_NAME}="))

    assert "HttpOnly" in session_cookie
    assert "HttpOnly" not in csrf_cookie
    assert f"SameSite={settings.COOKIE_SAMESITE}" in session_cookie
    assert "Max-Age=" in session_cookie
