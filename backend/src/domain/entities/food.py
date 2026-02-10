"""
Domain Entities - Food

Core business entities for food items and nutritional information.
"""

from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4


class FoodCategory(str, Enum):
    """Food categories for organization and filtering."""

    PROTEIN = "protein"
    CARBS = "carbs"
    VEGETABLES = "vegetables"
    FRUITS = "fruits"
    FATS = "fats"
    DAIRY = "dairy"
    GRAINS = "grains"
    LEGUMES = "legumes"
    PREPARED_DISHES = "prepared_dishes"
    BEVERAGES = "beverages"


class Food:
    """
    Food entity with complete nutritional information.

    All nutritional values are per 100g for consistency.
    """

    def __init__(
        self,
        name: str,
        category: FoodCategory,
        calories_per_100g: Decimal,
        protein_g: Decimal,
        carbs_g: Decimal,
        fat_g: Decimal,
        fiber_g: Decimal = Decimal("0"),
        name_es: Optional[str] = None,
        sodium_mg: Optional[Decimal] = None,
        sugar_g: Optional[Decimal] = None,
        glycemic_index: Optional[int] = None,
        glycemic_load: Optional[Decimal] = None,
        amino_acid_profile: Optional[dict[str, Decimal]] = None,
        is_custom: bool = False,
        created_by: Optional[UUID] = None,
        verified: bool = False,
        source: str = "custom",
        id: Optional[UUID] = None,
        created_at: Optional[datetime] = None,
    ):
        """
        Initialize food entity with nutritional data.

        Args:
            name: Food name in English
            category: Food category
            calories_per_100g: Calories per 100g
            protein_g: Protein in grams per 100g
            carbs_g: Carbohydrates in grams per 100g
            fat_g: Fat in grams per 100g
            fiber_g: Dietary fiber in grams per 100g
            name_es: Spanish name (for Peruvian cuisine)
            sodium_mg: Sodium in milligrams per 100g
            sugar_g: Sugar in grams per 100g
            glycemic_index: Glycemic index (0-100)
            glycemic_load: Glycemic load
            amino_acid_profile: Dict of amino acids and their values
            is_custom: Whether this is user-created
            created_by: User who created (if custom)
            verified: Admin-verified for accuracy
            source: Data source (USDA, custom, etc.)

        Raises:
            ValueError: If nutritional values are invalid
        """
        self.id = id or uuid4()
        self.name = name
        self.name_es = name_es or name
        self.category = category
        self.is_custom = is_custom
        self.created_by = created_by
        self.verified = verified
        self.source = source
        self.created_at = created_at or datetime.utcnow()

        # Validate nutritional values
        if calories_per_100g < 0:
            raise ValueError("Calories cannot be negative")
        if any(val < 0 for val in [protein_g, carbs_g, fat_g, fiber_g]):
            raise ValueError("Macronutrients cannot be negative")

        self.calories_per_100g = calories_per_100g
        self.protein_g = protein_g
        self.carbs_g = carbs_g
        self.fat_g = fat_g
        self.fiber_g = fiber_g

        # Optional nutritional data
        self.sodium_mg = sodium_mg
        self.sugar_g = sugar_g

        # Advanced metrics
        if glycemic_index is not None and not (0 <= glycemic_index <= 100):
            raise ValueError("Glycemic index must be between 0 and 100")
        self.glycemic_index = glycemic_index
        self.glycemic_load = glycemic_load
        self.amino_acid_profile = amino_acid_profile or {}

    @property
    def net_carbs_g(self) -> Decimal:
        """Calculate net carbs (total carbs - fiber)."""
        return max(Decimal("0"), self.carbs_g - self.fiber_g)

    @property
    def caloric_density(self) -> Decimal:
        """Calories per gram (useful for volume eating strategies)."""
        return self.calories_per_100g / Decimal("100")

    def calculate_for_portion(self, grams: Decimal) -> "NutritionalInfo":
        """
        Calculate nutritional info for a specific portion size.

        Args:
            grams: Portion size in grams

        Returns:
            NutritionalInfo value object with scaled values
        """
        multiplier = grams / Decimal("100")

        return NutritionalInfo(
            calories=self.calories_per_100g * multiplier,
            protein_g=self.protein_g * multiplier,
            carbs_g=self.carbs_g * multiplier,
            fat_g=self.fat_g * multiplier,
            fiber_g=self.fiber_g * multiplier,
        )

    def __repr__(self) -> str:
        return (
            f"Food(name='{self.name}', category={self.category.value}, "
            f"{self.calories_per_100g}cal, "
            f"P:{self.protein_g}g C:{self.carbs_g}g F:{self.fat_g}g per 100g)"
        )


class NutritionalInfo:
    """
    Value object representing nutritional information for a specific portion.
    """

    def __init__(
        self,
        calories: Decimal,
        protein_g: Decimal,
        carbs_g: Decimal,
        fat_g: Decimal,
        fiber_g: Decimal = Decimal("0"),
    ):
        self.calories = calories
        self.protein_g = protein_g
        self.carbs_g = carbs_g
        self.fat_g = fat_g
        self.fiber_g = fiber_g

    @property
    def net_carbs_g(self) -> Decimal:
        """Net carbs (total carbs - fiber)."""
        return max(Decimal("0"), self.carbs_g - self.fiber_g)

    def __add__(self, other: "NutritionalInfo") -> "NutritionalInfo":
        """Allow summing nutritional info."""
        return NutritionalInfo(
            calories=self.calories + other.calories,
            protein_g=self.protein_g + other.protein_g,
            carbs_g=self.carbs_g + other.carbs_g,
            fat_g=self.fat_g + other.fat_g,
            fiber_g=self.fiber_g + other.fiber_g,
        )

    def __repr__(self) -> str:
        return (
            f"NutritionalInfo({self.calories:.1f}cal, "
            f"P:{self.protein_g:.1f}g C:{self.carbs_g:.1f}g F:{self.fat_g:.1f}g)"
        )


class FoodUnit:
    """
    Unit of measure for food (cup, tablespoon, portion, etc.).
    """

    def __init__(
        self,
        food_id: UUID,
        unit_name: str,
        grams_per_unit: Decimal,
        unit_name_es: Optional[str] = None,
        is_default: bool = False,
        id: Optional[UUID] = None,
    ):
        """
        Initialize food unit.

        Args:
            food_id: Associated food ID
            unit_name: Unit name (e.g., "cup", "tablespoon")
            grams_per_unit: Grams per one unit
            unit_name_es: Spanish translation
            is_default: Whether this is the default unit for this food
        """
        if grams_per_unit <= 0:
            raise ValueError("Grams per unit must be positive")

        self.id = id or uuid4()
        self.food_id = food_id
        self.unit_name = unit_name
        self.unit_name_es = unit_name_es or unit_name
        self.grams_per_unit = grams_per_unit
        self.is_default = is_default

    def __repr__(self) -> str:
        return f"FoodUnit(unit_name='{self.unit_name}', {self.grams_per_unit}g)"
