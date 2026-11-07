from fastapi import FastAPI

from database import engine, Base
from routes import scan, reports, export

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI application
app = FastAPI(
    title="TrustLens API",
    description="Phishing Detection and Threat Intelligence Platform",
    version="1.0.0"
)

# Connect API routes
app.include_router(scan.router, tags=["Website Scanning"])
app.include_router(reports.router, tags=["Community Reports"])
app.include_router(export.router, tags=["Threat Intelligence Export"])


@app.get("/")
def home():
    return {
        "message": "Welcome to TrustLens",
        "status": "Backend is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }