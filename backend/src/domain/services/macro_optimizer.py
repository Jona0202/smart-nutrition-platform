"""
Domain Service - Macro Optimizer

Implements food recommendation algorithm using knapsack problem approach.
Suggests foods to complete remaining macros for the day.

Algorithm:
1. Calculate remaining macros needed for the day
2. Use dynamic programming or greedy heuristic to find optimal food combinations
3. Consider user preferences and food availability
"""

from decimal import Decimal
from typing import Optional
from dataclasses import dataclass

from ..entities.food import Food, NutritionalInfo


@dataclass
class MacroTarget:
    """Remaining macro targets for the day."""

    calories: Decimal
    protein_g: Decimal
    carbs_g: Decimal
    fat_g: Decimal

    def is_complete(self, tolerance: Decimal = Decimal("5")) -> bool:
        """
        Check if macro targets are substantially met.

        Args:
            tolerance: Acceptable deviation percentage (default 5%)

        Returns:
            True if all macros within tolerance
        """
        targets = [self.calories, self.protein_g, self.carbs_g, self.fat_g]
        return all(abs(val) <= tolerance for val in targets)


@dataclass
class FoodRecommendation:
    """Recommended food with portion size."""

    food: Food
    grams: Decimal
    score: Decimal  # How well it fits remaining macros
    nutritional_info: NutritionalInfo

    def __repr__(self) -> str:
        return (
            f"{self.food.name}: {self.grams}g "
            f"(score: {self.score:.2f}, {self.nutritional_info})"
        )


class MacroOptimizer:
    """
    Service for optimizing food selections to meet macro targets.

    Uses greedy heuristic for real-time performance (<100ms).
    For complex optimization, consider implementing OR-Tools integration.
    """

    def __init__(self, min_portion_g: Decimal = Decimal("20")):
        """
        Initialize optimizer.

        Args:
            min_portion_g: Minimum portion size to recommend (default 20g)
        """
        self.min_portion_g = min_portion_g

    def calculate_macro_score(
        self, food: Food, portion_g: Decimal, remaining: MacroTarget
    ) -> Decimal:
        """
        Calculate how well a food portion matches remaining macros.

        Score is based on weighted distance from ideal ratios.
        Lower score = better fit.

        Args:
            food: Food to evaluate
            portion_g: Portion size in grams
            remaining: Remaining macro targets

        Returns:
            Score (lower is better)
        """
        nutrition = food.calculate_for_portion(portion_g)

        # Calculate differences (positive = over target, negative = under)
        cal_diff = nutrition.calories - remaining.calories
        protein_diff = nutrition.protein_g - remaining.protein_g
        carbs_diff = nutrition.carbs_g - remaining.carbs_g
        fat_diff = nutrition.fat_g - remaining.fat_g

        # Weighted scoring (protein most important, then calories)
        score = (
            abs(cal_diff) * Decimal("0.1")  # Calories weight
            + abs(protein_diff) * Decimal("4")  # Protein weight (highly valuable)
            + abs(carbs_diff) * Decimal("1")  # Carbs weight
            + abs(fat_diff) * Decimal("2")  # Fat weight
        )

        # Penalize going over targets more than going under
        if cal_diff > 0:
            score *= Decimal("1.5")

        return score

    def optimize_portion_size(
        self, food: Food, remaining: MacroTarget, max_portion_g: Decimal = Decimal("500")
    ) -> tuple[Decimal, Decimal]:
        """
        Find optimal portion size for a given food.

        Uses binary search to find best portion within constraints.

        Args:
            food: Food to optimize portion for
            remaining: Remaining macro targets
            max_portion_g: Maximum portion size (default 500g)

        Returns:
            Tuple of (optimal_portion_g, score)
        """
        best_portion = self.min_portion_g
        best_score = Decimal("inf")

        # Try portions from min to max in 10g increments
        current = self.min_portion_g
        step = Decimal("10")

        while current <= max_portion_g:
            score = self.calculate_macro_score(food, current, remaining)

            if score < best_score:
                best_score = score
                best_portion = current

            current += step

            # Early exit if we found perfect match
            if best_score < Decimal("5"):
                break

        return best_portion, best_score

    def recommend_foods(
        self,
        available_foods: list[Food],
        remaining: MacroTarget,
        max_recommendations: int = 5,
    ) -> list[FoodRecommendation]:
        """
        Recommend foods to complete remaining macros.

        Greedy algorithm:
        1. Score all foods with optimized portions
        2. Select top N by score
        3. Ensure variety (different categories)

        Args:
            available_foods: List of foods to choose from
            remaining: Remaining macro targets
            max_recommendations: Maximum number of recommendations

        Returns:
            List of food recommendations sorted by score (best first)
        """
        if remaining.is_complete():
            return []

        recommendations: list[FoodRecommendation] = []

        for food in available_foods:
            # Skip if zero calories
            if food.calories_per_100g == 0:
                continue

            # Find optimal portion
            portion_g, score = self.optimize_portion_size(food, remaining)

            # Calculate nutrition for this portion
            nutrition = food.calculate_for_portion(portion_g)

            recommendations.append(
                FoodRecommendation(
                    food=food, grams=portion_g, score=score, nutritional_info=nutrition
                )
            )

        # Sort by score (best first)
        recommendations.sort(key=lambda x: x.score)

        # Ensure category diversity - don't recommend 5 chicken dishes
        diverse_recommendations = self._ensure_diversity(
            recommendations, max_recommendations
        )

        return diverse_recommendations[:max_recommendations]

    def _ensure_diversity(
        self, recommendations: list[FoodRecommendation], max_count: int
    ) -> list[FoodRecommendation]:
        """
        Ensure recommendations span different food categories.

        Args:
            recommendations: Sorted list of recommendations
            max_count: Maximum recommendations to return

        Returns:
            List with diverse food categories
        """
        diverse: list[FoodRecommendation] = []
        seen_categories: set[str] = set()

        # First pass: one from each category
        for rec in recommendations:
            if len(diverse) >= max_count:
                break

            category = rec.food.category.value
            if category not in seen_categories:
                diverse.append(rec)
                seen_categories.add(category)

        # Second pass: fill remaining slots with best scores
        if len(diverse) < max_count:
            for rec in recommendations:
                if len(diverse) >= max_count:
                    break
                if rec not in diverse:
                    diverse.append(rec)

        return diverse

    def suggest_meal_completion(
        self,
        remaining: MacroTarget,
        protein_foods: list[Food],
        carb_foods: list[Food],
        fat_foods: list[Food],
    ) -> dict[str, Optional[FoodRecommendation]]:
        """
        Suggest a complete meal to hit remaining macros.

        Strategy:
        1. Select best protein source
        2. Select best carb source
        3. Select best fat source

        Args:
            remaining: Remaining macro targets
            protein_foods: Available protein sources
            carb_foods: Available carb sources
            fat_foods: Available fat sources

        Returns:
            Dict with 'protein', 'carb', 'fat' recommendations
        """
        meal: dict[str, Optional[FoodRecommendation]] = {
            "protein": None,
            "carb": None,
            "fat": None,
        }

        # 1. Select protein
        if protein_foods:
            protein_recs = self.recommend_foods(protein_foods, remaining, max_recommendations=1)
            if protein_recs:
                meal["protein"] = protein_recs[0]

                # Update remaining macros
                nutrition = protein_recs[0].nutritional_info
                remaining = MacroTarget(
                    calories=remaining.calories - nutrition.calories,
                    protein_g=remaining.protein_g - nutrition.protein_g,
                    carbs_g=remaining.carbs_g - nutrition.carbs_g,
                    fat_g=remaining.fat_g - nutrition.fat_g,
                )

        # 2. Select carb
        if carb_foods:
            carb_recs = self.recommend_foods(carb_foods, remaining, max_recommendations=1)
            if carb_recs:
                meal["carb"] = carb_recs[0]

                nutrition = carb_recs[0].nutritional_info
                remaining = MacroTarget(
                    calories=remaining.calories - nutrition.calories,
                    protein_g=remaining.protein_g - nutrition.protein_g,
                    carbs_g=remaining.carbs_g - nutrition.carbs_g,
                    fat_g=remaining.fat_g - nutrition.fat_g,
                )

        # 3. Select fat source
        if fat_foods:
            fat_recs = self.recommend_foods(fat_foods, remaining, max_recommendations=1)
            if fat_recs:
                meal["fat"] = fat_recs[0]

        return meal
