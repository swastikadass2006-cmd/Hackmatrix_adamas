from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import scan, reports, export
from routes.voting import router as voting_router

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

@app.on_event("startup")
async def startup_event():
    """Asynchronously create database tables on startup if they don't already exist"""
    try:
        async with engine.begin() as conn:
            # run_sync with checkfirst=True prevents attempting to recreate existing tables/indexes
            await conn.run_sync(Base.metadata.create_all, checkfirst=True)
    except Exception as e:
        # Log or pass if tables are already fully initialized
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
