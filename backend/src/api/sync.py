from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime
import json
from ..infrastructure.database.database import get_db
from ..infrastructure.database.models import User, UserProfile, MetabolicProfile, LoggedMeal
from ..api.auth import get_current_user_dependency
from ..api.schemas import (
    SyncProfileRequest,
    SyncProfileResponse,
    ProfileResponse,
    ProfileData,
    MetabolicProfileData,
    SyncMealsRequest,
    SyncMealsResponse,
    MealsResponse,
    MealData
)

router = APIRouter(prefix="/api/sync", tags=["sync"])

@router.post("/profile", response_model=SyncProfileResponse)
def sync_profile(
    data: SyncProfileRequest,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Sync user profile and metabolic profile to cloud."""
    
    # Update or create user profile
    user_profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    
    profile_data = data.profile.dict()
    profile_data['restrictions'] = json.dumps(profile_data['restrictions'])
    profile_data['user_id'] = current_user.id
    
    # Convert camelCase to snake_case for database
    db_profile_data = {
        'user_id': current_user.id,
        'name': profile_data.get('name'),
        'gender': profile_data.get('gender'),
        'birth_date': profile_data.get('birthDate'),
        'current_weight_kg': profile_data.get('currentWeightKg'),
        'height_cm': profile_data.get('heightCm'),
        'body_fat_percentage': profile_data.get('bodyFatPercentage'),
        'goal': profile_data.get('goal'),
        'activity_level': profile_data.get('activityLevel'),
        'diet_type': profile_data.get('dietType'),
        'restrictions': profile_data.get('restrictions'),
        'target_weight_kg': profile_data.get('targetWeightKg'),
        'target_date': profile_data.get('targetDate'),
        'meals_per_day': profile_data.get('mealsPerDay'),
        'cooking_time': profile_data.get('cookingTime'),
        'experience_level': profile_data.get('experienceLevel'),
        'motivation': profile_data.get('motivation'),
    }
    
    if user_profile:
        # Update existing
        for key, value in db_profile_data.items():
            if key != 'user_id':
                setattr(user_profile, key, value)
        user_profile.updated_at = datetime.utcnow()
    else:
        # Create new
        user_profile = UserProfile(**db_profile_data)
        db.add(user_profile)
    
    # Update or create metabolic profile
    metabolic_profile = db.query(MetabolicProfile).filter(MetabolicProfile.user_id == current_user.id).first()
    
    metabolic_data = data.metabolicProfile.dict()
    metabolic_data['macro_percentages'] = json.dumps(metabolic_data['macroPercentages'])
    
    db_metabolic_data = {
        'user_id': current_user.id,
        'bmr': metabolic_data.get('bmr'),
        'tdee': metabolic_data.get('tdee'),
        'target_calories': metabolic_data.get('targetCalories'),
        'target_protein_g': metabolic_data.get('targetProteinG'),
        'target_carbs_g': metabolic_data.get('targetCarbsG'),
        'target_fat_g': metabolic_data.get('targetFatG'),
        'calculation_method': metabolic_data.get('calculationMethod'),
        'macro_percentages': metabolic_data.get('macro_percentages'),
    }
    
    if metabolic_profile:
        # Update existing
        for key, value in db_metabolic_data.items():
            if key != 'user_id':
                setattr(metabolic_profile, key, value)
        metabolic_profile.updated_at = datetime.utcnow()
    else:
        # Create new
        metabolic_profile = MetabolicProfile(**db_metabolic_data)
        db.add(metabolic_profile)
    
    db.commit()
    
    return SyncProfileResponse(success=True, message="Profile synced successfully")

@router.get("/profile", response_model=ProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Get user profile and metabolic profile from cloud."""
    
    user_profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    metabolic_profile = db.query(MetabolicProfile).filter(MetabolicProfile.user_id == current_user.id).first()
    
    response = ProfileResponse()
    
    if user_profile:
        profile_dict = {
            'name': user_profile.name,
            'gender': user_profile.gender,
            'birthDate': user_profile.birth_date,
            'currentWeightKg': user_profile.current_weight_kg,
            'heightCm': user_profile.height_cm,
            'bodyFatPercentage': user_profile.body_fat_percentage,
            'goal': user_profile.goal,
            'activityLevel': user_profile.activity_level,
            'dietType': user_profile.diet_type,
            'restrictions': json.loads(user_profile.restrictions) if user_profile.restrictions else [],
            'targetWeightKg': user_profile.target_weight_kg,
            'targetDate': user_profile.target_date,
            'mealsPerDay': user_profile.meals_per_day,
            'cookingTime': user_profile.cooking_time,
            'experienceLevel': user_profile.experience_level,
            'motivation': user_profile.motivation,
        }
        response.profile = ProfileData(**profile_dict)
    
    if metabolic_profile:
        metabolic_dict = {
            'bmr': metabolic_profile.bmr,
            'tdee': metabolic_profile.tdee,
            'targetCalories': metabolic_profile.target_calories,
            'targetProteinG': metabolic_profile.target_protein_g,
            'targetCarbsG': metabolic_profile.target_carbs_g,
            'targetFatG': metabolic_profile.target_fat_g,
            'calculationMethod': metabolic_profile.calculation_method,
            'macroPercentages': json.loads(metabolic_profile.macro_percentages) if metabolic_profile.macro_percentages else {},
        }
        response.metabolicProfile = MetabolicProfileData(**metabolic_dict)
    
    return response

@router.post("/meals", response_model=SyncMealsResponse)
def sync_meals(
    data: SyncMealsRequest,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Sync meals to cloud (bulk insert/update)."""
    
    synced_count = 0
    
    for meal_data in data.meals:
        # Check if meal already exists (by timestamp and food_id)
        existing_meal = db.query(LoggedMeal).filter(
            LoggedMeal.user_id == current_user.id,
            LoggedMeal.food_id == meal_data.foodId,
            LoggedMeal.logged_at == datetime.fromisoformat(meal_data.timestamp.replace('Z', '+00:00'))
        ).first()
        
        meal_dict = {
            'user_id': current_user.id,
            'food_id': meal_data.foodId,
            'food_name': meal_data.foodName,
            'emoji': meal_data.emoji,
            'grams': meal_data.grams,
            'calories': meal_data.calories,
            'protein': meal_data.protein,
            'carbs': meal_data.carbs,
            'fat': meal_data.fat,
            'meal_type': meal_data.mealType,
            'logged_at': datetime.fromisoformat(meal_data.timestamp.replace('Z', '+00:00'))
        }
        
        if not existing_meal:
            new_meal = LoggedMeal(**meal_dict)
            db.add(new_meal)
            synced_count += 1
    
    db.commit()
    
    return SyncMealsResponse(success=True, synced=synced_count)

@router.get("/meals", response_model=MealsResponse)
def get_meals(
    from_date: str = Query(None),
    to_date: str = Query(None),
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Get meals from cloud within date range."""
    
    query = db.query(LoggedMeal).filter(LoggedMeal.user_id == current_user.id)
    
    if from_date:
        query = query.filter(LoggedMeal.logged_at >= datetime.fromisoformat(from_date))
    
    if to_date:
        query = query.filter(LoggedMeal.logged_at <= datetime.fromisoformat(to_date))
    
    meals = query.order_by(LoggedMeal.logged_at.desc()).all()
    
    meals_data = []
    for meal in meals:
        meal_dict = {
            'id': str(meal.id),
            'foodId': meal.food_id,
            'foodName': meal.food_name,
            'emoji': meal.emoji,
            'grams': meal.grams,
            'calories': meal.calories,
            'protein': meal.protein,
            'carbs': meal.carbs,
            'fat': meal.fat,
            'mealType': meal.meal_type,
            'timestamp': meal.logged_at.isoformat()
        }
        meals_data.append(MealData(**meal_dict))
    
    return MealsResponse(meals=meals_data)

@router.delete("/meals/{meal_id}", response_model=SyncMealsResponse)
def delete_meal(
    meal_id: int,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Delete a specific meal."""
    
    meal = db.query(LoggedMeal).filter(
        LoggedMeal.id == meal_id,
        LoggedMeal.user_id == current_user.id
    ).first()
    
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal not found"
        )
    
    db.delete(meal)
    db.commit()
    
    return SyncMealsResponse(success=True, synced=1)
