from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes
from app.database import engine, Base
from app.models import pollution

# Create tables if not using migrations
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AetherAI API",
    description="Pollution Control Strategy Optimizer",
    version="1.0.0"
)

# Set up CORS
origins = [
    "http://localhost",
    "http://localhost:5173", # Vite default
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router, prefix="/api")

@app.get("/")
def read_root():
    return {"status": "success", "message": "AetherAI Backend is running."}
