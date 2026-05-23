import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# 1. Inspect the Database URL to apply driver-specific connection settings
if settings.DATABASE_URL.startswith("sqlite"):
    # SQLite requires disabling identical thread checks for asynchronous request handling
    engine = create_engine(
        settings.DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
else:
    # Production-grade connection pooling optimizations for PostgreSQL
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,  # Proactively checks connections to eliminate stale/dropped socket errors
        pool_recycle=3600,   # Automatically recycles open connections every hour
        pool_size=10,        # Default baseline pool size for standard concurrent traffic
        max_overflow=20      # Upper threshold of temporary overflow connections under sudden traffic spikes
    )

# 2. Construct the localized database session builder factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. Formulate the declarative base architectural mapper class for tables
Base = declarative_base()

def get_db():
    """
    Contextual dependency generator to handle clean lifecycle tracking of database transactions.
    Ensures that connections are safely closed after each FastAPI request lifecycle, preventing memory leaks.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()