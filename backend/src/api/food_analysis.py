"""Food Analysis API - AI-powered food recognition from images"""
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from ..services.gemini_vision import GeminiVisionService, DetectedFood
from ..services.food_matcher import FoodMatcher


router = APIRouter(prefix="/api", tags=["food-analysis"])


# Load food database (from frontend foods.ts converted to JSON)
# In production, this could be stored in the database
FOOD_DATABASE_PATH = os.path.join(
    os.path.dirname(__file__), 
    '..', '..', 
    'food_database.json'
)


class MatchedFood(BaseModel):
    """Food matched with database and nutrition calculated"""
    detected_name: str
    matched_food_id: Optional[str]
    matched_food_name: Optional[str]
    estimated_grams: int
    preparation: str
    confidence: float
    match_confidence: Optional[float]
    calories: float
    protein: float
    carbs: float
    fat: float
    emoji: str = "🍽️"


class FoodAnalysisResponse(BaseModel):
    """Response from food image analysis"""
    success: bool
    matched_foods: List[MatchedFood]
    meal_description: str
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float
    image_base64: Optional[str] = None


# Initialize services
gemini_service = None
food_matcher = None


def get_gemini_service() -> GeminiVisionService:
    """Dependency to get Gemini service instance"""
    global gemini_service
    if gemini_service is None:
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
        gemini_service = GeminiVisionService(api_key)
    return gemini_service


def get_food_matcher() -> FoodMatcher:
    """Dependency to get food matcher instance"""
    global food_matcher
    if food_matcher is None:
        # Load food database
        try:
            with open(FOOD_DATABASE_PATH, 'r', encoding='utf-8') as f:
                food_db = json.load(f)
            food_matcher = FoodMatcher(food_db)
        except FileNotFoundError:
            # Fallback to minimal database if file not found
            food_matcher = FoodMatcher([])
    return food_matcher


@router.post("/analyze-food", response_model=FoodAnalysisResponse)
async def analyze_food_image(
    image: UploadFile = File(...),
    gemini: GeminiVisionService = Depends(get_gemini_service),
    matcher: FoodMatcher = Depends(get_food_matcher)
):
    """
    Analyze food image using Gemini Vision AI
    
    - Detects foods in image
    - Estimates portions in grams
    - Matches with food database
    - Calculates nutritional values
    """
    try:
        # Read image bytes
        image_bytes = await image.read()
        
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty image file")
        
        # Analyze with Gemini Vision
        analysis_result = await gemini.analyze_food_image(image_bytes)
        
        # Match detected foods with database
        matched_foods = []
        total_calories = 0.0
        total_protein = 0.0
        total_carbs = 0.0
        total_fat = 0.0
        
        for detected in analysis_result.foods:
            # Try to match with database
            match_result = matcher.match_food(
                detected.name,
                detected.preparation,
                min_confidence=0.4  # Lower threshold for better coverage
            )
            
            if match_result:
                food_item, match_conf = match_result
                
                # Calculate nutrition for detected grams
                nutrition = matcher.calculate_nutrition(food_item, detected.estimated_grams)
                
                matched_food = MatchedFood(
                    detected_name=detected.name,
                    matched_food_id=food_item.get('id', food_item['name'].lower().replace(' ', '-')),
                    matched_food_name=food_item['name'],
                    estimated_grams=detected.estimated_grams,
                    preparation=detected.preparation,
                    confidence=detected.confidence,
                    match_confidence=match_conf,
                    calories=nutrition['calories'],
                    protein=nutrition['protein'],
                    carbs=nutrition['carbs'],
                    fat=nutrition['fat'],
                    emoji=food_item.get('emoji', '🍽️')
                )
            else:
                # No match found - create custom entry with estimated values
                # Use rough estimates: 1g = ~1.5 kcal, 20% protein, 50% carbs, 30% fat
                est_calories = detected.estimated_grams * 1.5
                
                matched_food = MatchedFood(
                    detected_name=detected.name,
                    matched_food_id=None,
                    matched_food_name=None,
                    estimated_grams=detected.estimated_grams,
                    preparation=detected.preparation,
                    confidence=detected.confidence,
                    match_confidence=None,
                    calories=est_calories,
                    protein=est_calories * 0.20 / 4,  # 20% protein (4 kcal/g)
                    carbs=est_calories * 0.50 / 4,    # 50% carbs (4 kcal/g)
                    fat=est_calories * 0.30 / 9,      # 30% fat (9 kcal/g)
                    emoji="🍽️"
                )
            
            matched_foods.append(matched_food)
            
            # Add to totals
            total_calories += matched_food.calories
            total_protein += matched_food.protein
            total_carbs += matched_food.carbs
            total_fat += matched_food.fat
        
        # Encode image for frontend display (optional)
        image_base64 = None
        # image_base64 = gemini.encode_image_to_base64(image_bytes)
        
        return FoodAnalysisResponse(
            success=True,
            matched_foods=matched_foods,
            meal_description=analysis_result.meal_description,
            total_calories=round(total_calories, 1),
            total_protein=round(total_protein, 1),
            total_carbs=round(total_carbs, 1),
            total_fat=round(total_fat, 1),
            image_base64=image_base64
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Food analysis failed: {str(e)}"
        )
