"""Food matching utilities to match detected foods with database"""
from typing import List, Dict, Optional, Tuple
from difflib import SequenceMatcher


class FoodMatcher:
    """Match AI-detected foods with database entries"""
    
    def __init__(self, food_database: List[Dict]):
        """
        Initialize matcher with food database
        
        Args:
            food_database: List of food items from frontend database
        """
        self.food_database = food_database
        self._build_search_index()
    
    def _build_search_index(self):
        """Build keyword index for faster searching"""
        self.search_index = {}
        
        for food in self.food_database:
            # Extract searchable keywords from food name
            keywords = self._extract_keywords(food['name'])
            food_id = food.get('id', food['name'].lower().replace(' ', '-'))
            
            for keyword in keywords:
                if keyword not in self.search_index:
                    self.search_index[keyword] = []
                self.search_index[keyword].append({
                    'id': food_id,
                    'name': food['name'],
                    'food': food
                })
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract searchable keywords from text"""
        # Normalize and split
        text = text.lower()
        
        # Common words to ignore
        stop_words = {'de', 'con', 'en', 'la', 'el', 'a', 'al', 'y', 'o'}
        
        words = text.split()
        keywords = [w for w in words if w not in stop_words and len(w) > 2]
        
        return keywords
    
    def _calculate_similarity(self, str1: str, str2: str) -> float:
        """Calculate similarity ratio between two strings"""
        return SequenceMatcher(None, str1.lower(), str2.lower()).ratio()
    
    def match_food(
        self, 
        detected_name: str, 
        preparation: str = "", 
        min_confidence: float = 0.5
    ) -> Optional[Tuple[Dict, float]]:
        """
        Match a detected food name with database entry
        
        Args:
            detected_name: Name from AI detection
            preparation: Preparation method (fried, grilled, etc.)
            min_confidence: Minimum confidence threshold
            
        Returns:
            Tuple of (food_dict, confidence_score) or None if no match
        """
        detected_keywords = self._extract_keywords(detected_name)
        candidates = []
        
        # Find candidates that share keywords
        for keyword in detected_keywords:
            if keyword in self.search_index:
                candidates.extend(self.search_index[keyword])
        
        # Remove duplicates
        seen = set()
        unique_candidates = []
        for candidate in candidates:
            if candidate['id'] not in seen:
                seen.add(candidate['id'])
                unique_candidates.append(candidate)
        
        # Score each candidate
        best_match = None
        best_score = 0.0
        
        for candidate in unique_candidates:
            # Calculate base similarity
            name_similarity = self._calculate_similarity(detected_name, candidate['name'])
            
            # Boost score if preparation matches category
            prep_boost = 0.0
            if preparation:
                food = candidate['food']
                category = food.get('category', [])
                
                # If detected as fried and food is in "fats" or has "frito" in name
                if 'frito' in preparation and (
                    'fats' in category or 'frito' in candidate['name'].lower()
                ):
                    prep_boost = 0.1
                
                # If detected as grilled and food is protein
                if ('plancha' in preparation or 'asado' in preparation) and 'protein' in category:
                    prep_boost = 0.1
            
            final_score = min(name_similarity + prep_boost, 1.0)
            
            if final_score > best_score:
                best_score = final_score
                best_match = candidate['food']
        
        # Return match only if above threshold
        if best_match and best_score >= min_confidence:
            return (best_match, best_score)
        
        return None
    
    def calculate_nutrition(self, food: Dict, grams: int) -> Dict:
        """
        Calculate nutritional values for given grams
        
        Args:
            food: Food database entry
            grams: Amount in grams
            
        Returns:
            Dict with calories, protein, carbs, fat
        """
        # Food database has values per 100g
        ratio = grams / 100.0
        
        return {
            'calories': round(food['calories'] * ratio, 1),
            'protein': round(food['protein'] * ratio, 1),
            'carbs': round(food['carbs'] * ratio, 1),
            'fat': round(food['fat'] * ratio, 1),
        }
