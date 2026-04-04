from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# Auth schemas
class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Profile schemas
class ProfileData(BaseModel):
    name: Optional[str] = None
    gender: Optional[str] = None
    birthDate: Optional[str] = None
    currentWeightKg: Optional[float] = None
    heightCm: Optional[float] = None
    bodyFatPercentage: Optional[float] = None
    goal: Optional[str] = None
    activityLevel: Optional[str] = None
    dietType: Optional[str] = None
    restrictions: List[str] = []
    targetWeightKg: Optional[float] = None
    targetDate: Optional[str] = None
    mealsPerDay: Optional[int] = None
    cookingTime: Optional[int] = None
    experienceLevel: Optional[str] = None
    motivation: Optional[str] = None

class MetabolicProfileData(BaseModel):
    bmr: float
    tdee: float
    targetCalories: int
    targetProteinG: float
    targetCarbsG: float
    targetFatG: float
    calculationMethod: str
    macroPercentages: dict

class SyncProfileRequest(BaseModel):
    profile: ProfileData
    metabolicProfile: MetabolicProfileData

class SyncProfileResponse(BaseModel):
    success: bool
    message: str

class ProfileResponse(BaseModel):
    profile: Optional[ProfileData] = None
    metabolicProfile: Optional[MetabolicProfileData] = None

# Meal schemas
class MealData(BaseModel):
    id: str
    foodId: str
    foodName: str
    emoji: str
    grams: float
    calories: float
    protein: float
    carbs: float
    fat: float
    mealType: str
    timestamp: str

class SyncMealsRequest(BaseModel):
    meals: List[MealData]

class SyncMealsResponse(BaseModel):
    success: bool
    synced: int

class MealsResponse(BaseModel):
    meals: List[MealData]


# Hydration schemas
class HydrationSyncRequest(BaseModel):
    date: str           # YYYY-MM-DD
    glasses: int        # number of glasses
    ml_total: float     # total ml

class HydrationResponse(BaseModel):
    date: str
    glasses: int
    ml_total: float
    updated_at: Optional[str] = None

class HydrationHistoryResponse(BaseModel):
    logs: List[HydrationResponse]


# Weight History schemas
class WeightEntryRequest(BaseModel):
    weight_kg: float
    body_fat_percentage: Optional[float] = None
    notes: Optional[str] = None
    recorded_at: Optional[str] = None  # ISO datetime string; defaults to now

class WeightEntryResponse(BaseModel):
    id: int
    weight_kg: float
    body_fat_percentage: Optional[float] = None
    notes: Optional[str] = None
    recorded_at: str

    class Config:
        from_attributes = True

class WeightHistoryResponse(BaseModel):
    entries: List[WeightEntryResponse]
