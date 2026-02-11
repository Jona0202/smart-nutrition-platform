"""Gemini Vision Service for Food Recognition"""
import base64
import json
import io
from typing import List, Dict, Optional
from PIL import Image
import google.generativeai as genai
from pydantic import BaseModel


class DetectedFood(BaseModel):
    """Detected food item from image analysis"""
    name: str
    estimated_grams: int
    preparation: str
    confidence: float


class FoodAnalysisResult(BaseModel):
    """Result from Gemini Vision analysis"""
    foods: List[DetectedFood]
    meal_description: str


class GeminiVisionService:
    """Service to analyze food images using Gemini Vision API"""
    
    def __init__(self, api_key: str):
        """Initialize Gemini Vision service with API key"""
        genai.configure(api_key=api_key)
        # Using Gemini 2.5 Flash - confirmed available for this API key
        self.model = genai.GenerativeModel('models/gemini-2.5-flash')
    
    def _prepare_image(self, image_bytes: bytes, max_size: int = 1024) -> Image.Image:
        """
        Prepare image for analysis: resize if needed to save bandwidth
        
        Args:
            image_bytes: Raw image bytes
            max_size: Maximum dimension (width or height) in pixels
            
        Returns:
            PIL Image object
        """
        # Create BytesIO from bytes and ensure position is at start
        img_io = io.BytesIO(image_bytes)
        img_io.seek(0)
        img = Image.open(img_io)
        
        # Convert to RGB if needed (handle PNG with alpha, etc.)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize if too large
        if max(img.size) > max_size:
            ratio = max_size / max(img.size)
            new_size = tuple(int(dim * ratio) for dim in img.size)
            img = img.resize(new_size, Image.Resampling.LANCZOS)
        
        return img
    
    def _build_analysis_prompt(self) -> str:
        """Build the prompt for Gemini to analyze food images - optimized for consistency"""
        return """
Eres un nutricionista profesional con amplio conocimiento en porciones estándar latinoamericanas.
Analiza esta imagen de comida siguiendo ESTRICTAMENTE este proceso paso a paso.

## PASO 1: Identificar Referencias de Tamaño
- Observa el plato, recipiente o cubiertos visibles
- Un plato estándar mide ~26cm de diámetro
- Un vaso estándar contiene ~250ml
- Una cuchara sopera contiene ~15ml

## PASO 2: Identificar Cada Alimento
- Nombra cada alimento en español
- Si es un plato peruano (ceviche, lomo saltado, ají de gallina, arroz con pollo, etc.), nómbralo correctamente
- Especifica la preparación (cocido, frito, a la plancha, crudo, sancochado, al horno, salteado)

## PASO 3: Estimar Gramos (SÉ CONSISTENTE)
Usa estas REFERENCIAS ESTÁNDAR para estimar gramos:
- Arroz cocido: porción estándar = 150-200g (cubre ~1/3 del plato)
- Pollo/carne: porción estándar = 120-150g (tamaño palma de la mano)
- Ensalada/verduras: porción estándar = 80-120g
- Papa/tubérculo cocido: porción estándar = 150-200g
- Menestras/legumbres cocidas: porción estándar = 120-160g
- Pan: una unidad = 30-50g
- Huevo: una unidad = 50-60g
- Pasta cocida: porción estándar = 180-220g
- Sopa/caldo: un plato = 300-400ml

REGLA DE ORO: Si el alimento cubre ~1/4 del plato, usa el extremo inferior del rango. Si cubre ~1/2, usa el extremo superior.

## PASO 4: Asignar Confianza
- 0.9-1.0: Alimento claramente visible y reconocible
- 0.7-0.8: Alimento reconocible pero parcialmente oculto
- 0.5-0.6: Alimento difícil de identificar con certeza

## FORMATO DE RESPUESTA (SOLO JSON, SIN TEXTO):
{
  "foods": [
    {
      "name": "nombre del alimento en español",
      "estimated_grams": número_entero,
      "preparation": "tipo de preparación",
      "confidence": 0.0 a 1.0
    }
  ],
  "meal_description": "descripción breve del plato"
}

## EJEMPLO - Almuerzo peruano típico:
{
  "foods": [
    {"name": "arroz blanco", "estimated_grams": 180, "preparation": "cocido", "confidence": 0.95},
    {"name": "pollo guisado", "estimated_grams": 140, "preparation": "guisado", "confidence": 0.85},
    {"name": "papa amarilla", "estimated_grams": 120, "preparation": "sancochado", "confidence": 0.80},
    {"name": "ensalada criolla", "estimated_grams": 60, "preparation": "crudo", "confidence": 0.75}
  ],
  "meal_description": "Almuerzo de arroz con pollo guisado, papa y ensalada"
}

IMPORTANTE: Sé CONSERVADOR y CONSISTENTE. Ante la duda, usa las porciones estándar listadas arriba.
SOLO devuelve el JSON. Sin explicaciones ni texto adicional.
"""
    
    async def analyze_food_image(self, image_bytes: bytes) -> FoodAnalysisResult:
        """
        Analyze food image using Gemini Vision
        
        Args:
            image_bytes: Raw image bytes
            
        Returns:
            FoodAnalysisResult with detected foods
            
        Raises:
            Exception: If analysis fails
        """
        try:
            # Prepare image
            img = self._prepare_image(image_bytes)
            
            # Build prompt
            prompt = self._build_analysis_prompt()
            
            # Call Gemini Vision API
            response = self.model.generate_content([prompt, img])
            
            # Extract JSON from response
            response_text = response.text.strip()
            
            # Remove markdown code blocks if present
            if response_text.startswith('```json'):
                response_text = response_text.replace('```json', '').replace('```', '').strip()
            elif response_text.startswith('```'):
                response_text = response_text.replace('```', '').strip()
            
            # Parse JSON
            try:
                result_dict = json.loads(response_text)
            except json.JSONDecodeError as e:
                raise Exception(f"Failed to parse Gemini response as JSON: {response_text[:200]}")
            
            # Validate and create result object
            result = FoodAnalysisResult(**result_dict)
            
            return result
            
        except Exception as e:
            raise Exception(f"Food analysis failed: {str(e)}")
    
    def encode_image_to_base64(self, image_bytes: bytes) -> str:
        """Encode image to base64 for frontend display"""
        return base64.b64encode(image_bytes).decode('utf-8')
