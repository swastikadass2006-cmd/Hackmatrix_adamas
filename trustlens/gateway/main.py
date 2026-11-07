from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routes import scan, reports, export
from routes.voting import router as voting_router

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI application
app = FastAPI(
    title="TrustLens API",
    description="Explainable Multi-Signal Web Threat Intelligence Platform",
    version="1.0.0"
)

# Enable CORS for Frontend & Chrome Extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect API routes
app.include_router(scan.router, tags=["Website Scanning"])
app.include_router(reports.router, tags=["Community Reports"])
app.include_router(voting_router, tags=["Threat Voting"])
app.include_router(export.router, tags=["Threat Intelligence Export"])


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
