"""
FastAPI Main Application

Entry point for the Smart Nutrition Platform API.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
import os

from src.infrastructure.config.settings import settings
from src.domain.services.metabolic_calculator import MetabolicCalculator
from src.domain.services.macro_optimizer import MacroOptimizer
from src.api.auth import router as auth_router
from src.api.sync import router as sync_router
from src.api.food_analysis import router as food_analysis_router
from src.infrastructure.database.database import Base, engine

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Advanced nutrition management platform with metabolic calculations and intelligent food optimization",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Dependency instances (will be moved to proper DI later)
metabolic_calculator = MetabolicCalculator()
macro_optimizer = MacroOptimizer()

# Include routers
app.include_router(auth_router)
app.include_router(sync_router)
app.include_router(food_analysis_router)


@app.get("/")
async def root():
    """Root endpoint - serves frontend if available, otherwise API info."""
    index_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "static", "index.html"
    )
    if os.path.exists(index_path):
        return FileResponse(index_path, media_type="text/html")
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational",
        "documentation": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "services": {
            "api": "operational",
            "database": "not_configured",  # Will update when DB is connected
            "nlp": "not_configured",
        },
    }


# Demo endpoints for testing core functionality
from fastapi import HTTPException
from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import date
from typing import Optional
from src.domain.entities.user_profile import (
    Gender,
    ActivityLevel,
    Goal,
    UserProfile,
)
from uuid import uuid4


class CalculateBMRRequest(BaseModel):
    """Request model for BMR calculation."""

    weight_kg: float = Field(..., gt=30, lt=300, description="Weight in kilograms")
    height_cm: float = Field(..., gt=100, lt=250, description="Height in centimeters")
    age: int = Field(..., gt=10, lt=120, description="Age in years")
    gender: Gender
    body_fat_percentage: Optional[float] = Field(
        None, gt=3, lt=60, description="Body fat percentage (optional)"
    )


class CalculateBMRResponse(BaseModel):
    """Response model for BMR calculation."""

    bmr: float
    method: str
    tdee_estimates: dict[str, float]


@app.post("/demo/calculate-bmr", response_model=CalculateBMRResponse)
async def calculate_bmr_demo(request: CalculateBMRRequest):
    """
    Demo endpoint: Calculate BMR and TDEE estimates.

    This demonstrates the metabolic calculation engine without requiring authentication.
    """
    # Choose calculation method
    if request.body_fat_percentage:
        bmr = metabolic_calculator.calculate_bmr_katch_mcardle(
            weight_kg=Decimal(str(request.weight_kg)),
            body_fat_pct=Decimal(str(request.body_fat_percentage)),
        )
        method = "katch_mcardle"
    else:
        bmr = metabolic_calculator.calculate_bmr_mifflin_st_jeor(
            weight_kg=Decimal(str(request.weight_kg)),
            height_cm=Decimal(str(request.height_cm)),
            age=request.age,
            gender=request.gender,
        )
        method = "mifflin_st_jeor"

    # Calculate TDEE for all activity levels
    tdee_estimates = {}
    for activity in ActivityLevel:
        tdee = metabolic_calculator.calculate_tdee(bmr, activity)
        tdee_estimates[activity.value] = float(tdee)

    return CalculateBMRResponse(
        bmr=float(bmr), method=method, tdee_estimates=tdee_estimates
    )


class CreateProfileRequest(BaseModel):
    """Request model for creating user profile."""

    gender: Gender
    date_of_birth: date
    height_cm: float = Field(..., gt=100, lt=250)
    current_weight_kg: float = Field(..., gt=30, lt=300)
    body_fat_percentage: Optional[float] = Field(None, gt=3, lt=60)
    activity_level: ActivityLevel
    goal: Goal


class MetabolicProfileResponse(BaseModel):
    """Response model for metabolic profile."""

    user_profile: dict
    bmr: float
    tdee: float
    target_calories: int
    target_protein_g: float
    target_carbs_g: float
    target_fat_g: float
    macro_percentages: dict[str, float]
    calculation_method: str


@app.post("/demo/calculate-profile", response_model=MetabolicProfileResponse)
async def calculate_full_profile_demo(request: CreateProfileRequest):
    """
    Demo endpoint: Calculate complete metabolic profile with macro targets.

    This demonstrates the full calculation pipeline.
    """
    # Create user profile entity
    user_profile = UserProfile(
        user_id=uuid4(),
        gender=request.gender,
        date_of_birth=request.date_of_birth,
        height_cm=Decimal(str(request.height_cm)),
        current_weight_kg=Decimal(str(request.current_weight_kg)),
        body_fat_percentage=(
            Decimal(str(request.body_fat_percentage))
            if request.body_fat_percentage
            else None
        ),
        activity_level=request.activity_level,
        goal=request.goal,
    )

    # Calculate metabolic profile
    metabolic_profile = metabolic_calculator.calculate_full_profile(user_profile)

    return MetabolicProfileResponse(
        user_profile={
            "age": user_profile.age,
            "gender": user_profile.gender.value,
            "height_cm": float(user_profile.height_cm),
            "weight_kg": float(user_profile.current_weight_kg),
            "bmi": float(user_profile.bmi),
            "goal": user_profile.goal.value,
            "activity_level": user_profile.activity_level.value,
        },
        bmr=float(metabolic_profile.bmr),
        tdee=float(metabolic_profile.tdee),
        target_calories=metabolic_profile.target_calories,
        target_protein_g=float(metabolic_profile.target_protein_g),
        target_carbs_g=float(metabolic_profile.target_carbs_g),
        target_fat_g=float(metabolic_profile.target_fat_g),
        macro_percentages={
            "protein": float(metabolic_profile.protein_percentage),
            "carbs": float(metabolic_profile.carbs_percentage),
            "fat": float(metabolic_profile.fat_percentage),
        },
        calculation_method=metabolic_profile.calculation_method,
    )


# ─── Serve Frontend Static Files (Live Updates) ───
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")

if os.path.exists(STATIC_DIR):
    # Serve static assets (JS, CSS, images)
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

    # Serve other static files (manifest, sw, icons)
    @app.get("/manifest.webmanifest")
    @app.get("/sw.js")
    @app.get("/workbox-{rest_of_path:path}")
    @app.get("/registerSW.js")
    async def serve_pwa_files(request: Request):
        file_path = os.path.join(STATIC_DIR, request.url.path.lstrip("/"))
        if os.path.exists(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))

    # SPA fallback: any non-API route serves index.html
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API routes or docs
        if full_path.startswith(("api/", "docs", "redoc", "openapi", "demo/", "health")):
            return None
        file_path = os.path.join(STATIC_DIR, full_path)
        if os.path.exists(file_path) and not os.path.isdir(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
