import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import scan, reports, export, analyze
from routes.voting import router as voting_router

# Create FastAPI application
app = FastAPI(
    title="TrustLens API",
    description="Explainable Multi-Signal Web Threat Intelligence Platform",
    version="1.0.0"
)

# Refined CORS configuration for Vercel production, preview environments, and local development
ALLOWED_ORIGINS = [
    "https://hackmatrixadamas.vercel.app",
    "https://hackmatrixadamas-barun20saha-5660.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
custom_origins = os.getenv("ALLOWED_ORIGINS")
if custom_origins:
    ALLOWED_ORIGINS.extend([o.strip() for o in custom_origins.split(",") if o.strip()])

is_production = os.getenv("ENVIRONMENT", "").lower() == "production"

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if is_production else ["*"],
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$" if is_production else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect API routes
app.include_router(scan.router, tags=["Website Scanning"])
app.include_router(scan.router, prefix="/api/v1", tags=["Website Scanning"])
app.include_router(analyze.router, tags=["Scam Message Analysis"])
app.include_router(analyze.router, prefix="/api/v1", tags=["Scam Message Analysis"])
app.include_router(reports.router, tags=["Community Reports"])
app.include_router(voting_router, tags=["Threat Voting"])
app.include_router(export.router, tags=["Threat Intelligence Export"])


@app.on_event("startup")
async def startup_event():
    """Asynchronously create database tables on startup if they don't already exist"""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all, checkfirst=True)
    except Exception as e:
        print(f"Database startup info: {e}")


@app.get("/")
def home():
    return {
        "message": "Welcome to TrustLens Digital Trust Platform",
        "status": "Online",
        "version": "1.0.0"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }
