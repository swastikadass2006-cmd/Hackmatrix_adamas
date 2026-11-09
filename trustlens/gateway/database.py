import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger(__name__)

# Fetch database URL from environment
RAW_DB_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://trustlens:hackathon2026@localhost:5432/trustlensdb"
)

# Convert asyncpg scheme to standard postgresql scheme for synchronous SQLAlchemy
SYNC_DB_URL = RAW_DB_URL.replace("postgresql+asyncpg://", "postgresql://")

# Primary synchronous engine with fallback to SQLite for zero-failure resilience
try:
    if "postgresql" in SYNC_DB_URL:
        engine = create_engine(
            SYNC_DB_URL,
            pool_pre_ping=True,
            connect_args={"connect_timeout": 3}
        )
        # Test connection
        with engine.connect() as conn:
            pass
        logger.info("Connected to PostgreSQL successfully.")
    else:
        engine = create_engine(
            SYNC_DB_URL,
            connect_args={"check_same_thread": False} if "sqlite" in SYNC_DB_URL else {}
        )
except Exception as e:
    logger.warning(f"PostgreSQL connection failed ({e}). Falling back to local SQLite database.")
    SYNC_DB_URL = "sqlite:///./trustlens.db"
    engine = create_engine(SYNC_DB_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    """Dependency for FastAPI routes to obtain a synchronous DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
