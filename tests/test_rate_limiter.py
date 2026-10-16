from app.main import SlidingWindowRateLimiter


def test_rate_limiter_blocks_requests_after_the_configured_limit():
    limiter = SlidingWindowRateLimiter()

    assert limiter.allow("user:auth", limit=2)
    assert limiter.allow("user:auth", limit=2)
    assert not limiter.allow("user:auth", limit=2)
