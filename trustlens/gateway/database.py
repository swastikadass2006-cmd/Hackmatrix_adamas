import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

# Fetch from environment (set in docker-compose.yml)
# Note: asyncpg requires postgresql+asyncpg:// prefix
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://trustlens:hackathon2026@localhost:5432/trustlensdb"
).replace("postgresql://", "postgresql+asyncpg://")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

async def get_db():
    """Dependency for FastAPI routes to get a DB session."""
    async with AsyncSessionLocal() as session:
        yield session
