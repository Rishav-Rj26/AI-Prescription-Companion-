import urllib.parse
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.config import settings

def get_normalized_database_url(raw_url: str) -> str:
    """
    Ensure compatibility with asyncpg driver:
    - Replace postgresql:// or postgres:// with postgresql+asyncpg://
    - Strip channel_binding (unsupported by asyncpg)
    - Map sslmode to ssl
    """
    url = raw_url.strip()
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)

    parts = urllib.parse.urlsplit(url)
    q = urllib.parse.parse_qs(parts.query)
    q.pop("channel_binding", None)
    if "sslmode" in q:
        q.pop("sslmode")
        q["ssl"] = ["require"]
    new_query = urllib.parse.urlencode(q, doseq=True)
    return urllib.parse.urlunsplit((parts.scheme, parts.netloc, parts.path, new_query, parts.fragment))

engine = create_async_engine(get_normalized_database_url(settings.DATABASE_URL), echo=False)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
