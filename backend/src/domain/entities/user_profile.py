"""
Domain Entities - User Profile

Core business entities for user anthropometric data and metabolic profiles.
Following Clean Architecture principles: framework-agnostic, pure business logic.
"""

from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4


class Gender(str, Enum):
    """Gender enum for metabolic calculations."""

    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class ActivityLevel(str, Enum):
    """Physical activity levels for TDEE calculation."""

    SEDENTARY = "sedentary"  # 1.2x multiplier
    LIGHT = "light"  # 1.375x
    MODERATE = "moderate"  # 1.55x
    ACTIVE = "active"  # 1.725x
    VERY_ACTIVE = "very_active"  # 1.9x


class Goal(str, Enum):
    """User fitness goals."""

    CUTTING = "cutting"  # Weight loss
    MAINTENANCE = "maintenance"  # Maintain current weight
    BULKING = "bulking"  # Muscle gain


class DietType(str, Enum):
    """Dietary restrictions/preferences."""

    OMNIVORE = "omnivore"
    VEGETARIAN = "vegetarian"
    VEGAN = "vegan"
    PESCATARIAN = "pescatarian"
    KETO = "keto"


class UserProfile:
    """
    User anthropometric profile entity.

    Represents the current state of a user's biometric data and preferences.
    Immutable - updates create new history entries.
    """

    def __init__(
        self,
        user_id: UUID,
        gender: Gender,
        date_of_birth: date,
        height_cm: Decimal,
        current_weight_kg: Decimal,
        activity_level: ActivityLevel,
        goal: Goal,
        body_fat_percentage: Optional[Decimal] = None,
        target_weight_kg: Optional[Decimal] = None,
        diet_type: DietType = DietType.OMNIVORE,
        food_allergies: Optional[list[str]] = None,
        id: Optional[UUID] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ):
        """
        Initialize user profile with validation.

        Args:
            user_id: Reference to user entity
            gender: Biological gender for metabolic calculations
            date_of_birth: Birth date for age calculation
            height_cm: Height in centimeters (100-250)
            current_weight_kg: Current weight in kilograms (30-300)
            activity_level: Physical activity level
            goal: Fitness goal (cutting/maintenance/bulking)
            body_fat_percentage: Body fat % (3-60), optional but enables Katch-McArdle
            target_weight_kg: Target weight goal
            diet_type: Dietary preferences
            food_allergies: List of allergens to avoid

        Raises:
            ValueError: If validation fails
        """
        self.id = id or uuid4()
        self.user_id = user_id
        self.gender = gender
        self.date_of_birth = date_of_birth
        self.activity_level = activity_level
        self.goal = goal
        self.diet_type = diet_type
        self.food_allergies = food_allergies or []

        # Validate and set height
        if not (Decimal("100") <= height_cm <= Decimal("250")):
            raise ValueError("Height must be between 100 and 250 cm")
        self.height_cm = height_cm

        # Validate and set weight
        if not (Decimal("30") <= current_weight_kg <= Decimal("300")):
            raise ValueError("Weight must be between 30 and 300 kg")
        self.current_weight_kg = current_weight_kg

        # Validate and set body fat percentage
        if body_fat_percentage is not None:
            if not (Decimal("3") <= body_fat_percentage <= Decimal("60")):
                raise ValueError("Body fat percentage must be between 3 and 60%")
        self.body_fat_percentage = body_fat_percentage

        # Validate target weight
        if target_weight_kg is not None:
            if not (Decimal("30") <= target_weight_kg <= Decimal("300")):
                raise ValueError("Target weight must be between 30 and 300 kg")
        self.target_weight_kg = target_weight_kg

        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()

    @property
    def age(self) -> int:
        """Calculate current age in years."""
        today = date.today()
        return (
            today.year
            - self.date_of_birth.year
            - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
        )

    @property
    def lean_mass_kg(self) -> Optional[Decimal]:
        """Calculate lean body mass if body fat percentage is available."""
        if self.body_fat_percentage is None:
            return None
        return self.current_weight_kg * (Decimal("1") - self.body_fat_percentage / Decimal("100"))

    @property
    def bmi(self) -> Decimal:
        """Calculate Body Mass Index."""
        height_m = self.height_cm / Decimal("100")
        return self.current_weight_kg / (height_m * height_m)

    def has_body_composition_data(self) -> bool:
        """Check if user has body fat percentage for advanced calculations."""
        return self.body_fat_percentage is not None

    def __repr__(self) -> str:
        return (
            f"UserProfile(id={self.id}, user_id={self.user_id}, "
            f"age={self.age}, weight={self.current_weight_kg}kg, "
            f"height={self.height_cm}cm, goal={self.goal.value})"
        )


class MetabolicProfile:
    """
    Calculated metabolic profile for user.

    Contains BMR, TDEE, and macro targets based on user profile.
    This is a value object - calculated from UserProfile, not stored directly.
    """

    def __init__(
        self,
        user_profile: UserProfile,
        bmr: Decimal,
        tdee: Decimal,
        target_calories: int,
        target_protein_g: Decimal,
        target_carbs_g: Decimal,
        target_fat_g: Decimal,
        calculation_method: str,
    ):
        """
        Initialize metabolic profile with calculated values.

        Args:
            user_profile: Associated user profile
            bmr: Basal Metabolic Rate in calories
            tdee: Total Daily Energy Expenditure
            target_calories: Daily calorie target adjusted for goal
            target_protein_g: Daily protein target in grams
            target_carbs_g: Daily carbohydrate target in grams
            target_fat_g: Daily fat target in grams
            calculation_method: Method used (mifflin_st_jeor or katch_mcardle)
        """
        self.user_profile = user_profile
        self.bmr = bmr
        self.tdee = tdee
        self.target_calories = target_calories
        self.target_protein_g = target_protein_g
        self.target_carbs_g = target_carbs_g
        self.target_fat_g = target_fat_g
        self.calculation_method = calculation_method

    @property
    def protein_calories(self) -> Decimal:
        """Calculate calories from protein (4 cal/g)."""
        return self.target_protein_g * Decimal("4")

    @property
    def carbs_calories(self) -> Decimal:
        """Calculate calories from carbohydrates (4 cal/g)."""
        return self.target_carbs_g * Decimal("4")

    @property
    def fat_calories(self) -> Decimal:
        """Calculate calories from fat (9 cal/g)."""
        return self.target_fat_g * Decimal("9")

    @property
    def protein_percentage(self) -> Decimal:
        """Protein as percentage of total calories."""
        return (self.protein_calories / Decimal(self.target_calories)) * Decimal("100")

    @property
    def carbs_percentage(self) -> Decimal:
        """Carbohydrates as percentage of total calories."""
        return (self.carbs_calories / Decimal(self.target_calories)) * Decimal("100")

    @property
    def fat_percentage(self) -> Decimal:
        """Fat as percentage of total calories."""
        return (self.fat_calories / Decimal(self.target_calories)) * Decimal("100")

    def __repr__(self) -> str:
        return (
            f"MetabolicProfile(bmr={self.bmr:.0f}, tdee={self.tdee:.0f}, "
            f"target={self.target_calories}cal, "
            f"P={self.target_protein_g}g/{self.protein_percentage:.0f}%, "
            f"C={self.target_carbs_g}g/{self.carbs_percentage:.0f}%, "
            f"F={self.target_fat_g}g/{self.fat_percentage:.0f}%)"
        )
