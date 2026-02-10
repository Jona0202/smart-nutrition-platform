"""
Domain Service - Metabolic Calculator

Implements BMR and TDEE calculations using industry-standard formulas:
- Mifflin-St Jeor equation (recommended for most users)
- Katch-McArdle equation (requires body fat percentage)

Includes TEF (Thermic Effect of Food) adjustments and goal-based modifications.
"""

from decimal import Decimal
from typing import Literal

from ..entities.user_profile import ActivityLevel, Gender, Goal, MetabolicProfile, UserProfile


class MetabolicCalculator:
    """
    Service for calculating metabolic rates and macro targets.

    All calculations use Decimal for precision with health-related data.
    """

    # Activity level multipliers for TDEE
    ACTIVITY_MULTIPLIERS = {
        ActivityLevel.SEDENTARY: Decimal("1.2"),  # Little/no exercise
        ActivityLevel.LIGHT: Decimal("1.375"),  # Light exercise 1-3 days/week
        ActivityLevel.MODERATE: Decimal("1.55"),  # Moderate exercise 3-5 days/week
        ActivityLevel.ACTIVE: Decimal("1.725"),  # Heavy exercise 6-7 days/week
        ActivityLevel.VERY_ACTIVE: Decimal("1.9"),  # Very heavy exercise, physical job
    }

    # Goal-based caloric adjustments (percentage of TDEE)
    GOAL_ADJUSTMENTS = {
        Goal.CUTTING: Decimal("-0.20"),  # 20% deficit
        Goal.MAINTENANCE: Decimal("0"),  # No adjustment
        Goal.BULKING: Decimal("0.10"),  # 10% surplus
    }

    # Thermic Effect of Food (TEF) - percentage of calories burned during digestion
    TEF_PROTEIN = Decimal("0.25")  # 25% of protein calories
    TEF_CARBS = Decimal("0.10")  # 10% of carb calories
    TEF_FAT = Decimal("0.03")  # 3% of fat calories
    TEF_MIXED_DIET = Decimal("0.10")  # ~10% for typical mixed diet

    def calculate_bmr_mifflin_st_jeor(
        self, weight_kg: Decimal, height_cm: Decimal, age: int, gender: Gender
    ) -> Decimal:
        """
        Calculate Basal Metabolic Rate using Mifflin-St Jeor equation.

        Most accurate equation for general population (validated 2005).

        Formula:
            Men:   BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) + 5
            Women: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) - 161

        Args:
            weight_kg: Current weight in kilograms
            height_cm: Height in centimeters
            age: Age in years
            gender: Biological gender

        Returns:
            BMR in calories per day
        """
        base = (
            Decimal("10") * weight_kg
            + Decimal("6.25") * height_cm
            - Decimal("5") * Decimal(age)
        )

        if gender == Gender.MALE:
            return base + Decimal("5")
        else:  # FEMALE or OTHER - use female formula as conservative baseline
            return base - Decimal("161")

    def calculate_bmr_katch_mcardle(self, weight_kg: Decimal, body_fat_pct: Decimal) -> Decimal:
        """
        Calculate BMR using Katch-McArdle equation (requires body composition).

        More accurate for individuals with known body fat percentage.
        Uses lean body mass instead of total weight.

        Formula:
            BMR = 370 + (21.6 * lean_mass_kg)
            lean_mass_kg = weight_kg * (1 - body_fat_pct / 100)

        Args:
            weight_kg: Current weight in kilograms
            body_fat_pct: Body fat percentage (3-60)

        Returns:
            BMR in calories per day
        """
        lean_mass_kg = weight_kg * (Decimal("1") - body_fat_pct / Decimal("100"))
        return Decimal("370") + (Decimal("21.6") * lean_mass_kg)

    def calculate_tdee(self, bmr: Decimal, activity_level: ActivityLevel) -> Decimal:
        """
        Calculate Total Daily Energy Expenditure.

        TDEE = BMR * Activity Multiplier

        Args:
            bmr: Basal Metabolic Rate
            activity_level: User's activity level

        Returns:
            TDEE in calories per day
        """
        multiplier = self.ACTIVITY_MULTIPLIERS[activity_level]
        return bmr * multiplier

    def adjust_for_goal(self, tdee: Decimal, goal: Goal) -> int:
        """
        Adjust TDEE based on user's goal (cutting/maintenance/bulking).

        Args:
            tdee: Total Daily Energy Expenditure
            goal: User's fitness goal

        Returns:
            Target calories per day (rounded to nearest int)
        """
        adjustment = self.GOAL_ADJUSTMENTS[goal]
        target = tdee * (Decimal("1") + adjustment)
        return int(target.quantize(Decimal("1")))

    def calculate_macro_targets(
        self,
        target_calories: int,
        weight_kg: Decimal,
        goal: Goal,
    ) -> tuple[Decimal, Decimal, Decimal]:
        """
        Calculate optimal macro distribution based on goal.

        Protein targets:
            - Cutting: 2.2g/kg (preserve muscle in deficit)
            - Maintenance: 1.8g/kg
            - Bulking: 2.0g/kg (support muscle growth)

        Fat minimum: 0.8g/kg (hormone production, nutrient absorption)

        Carbs: Remaining calories after protein & fat

        Args:
            target_calories: Daily calorie target
            weight_kg: Current weight in kilograms
            goal: User's fitness goal

        Returns:
            Tuple of (protein_g, carbs_g, fat_g)
        """
        # Protein targets by goal (grams per kg body weight)
        protein_multipliers = {
            Goal.CUTTING: Decimal("2.2"),
            Goal.MAINTENANCE: Decimal("1.8"),
            Goal.BULKING: Decimal("2.0"),
        }

        protein_g = weight_kg * protein_multipliers[goal]

        # Fat minimum for health
        fat_g = weight_kg * Decimal("0.8")

        # Calculate remaining calories for carbs
        protein_calories = protein_g * Decimal("4")  # 4 cal/g
        fat_calories = fat_g * Decimal("9")  # 9 cal/g
        remaining_calories = Decimal(target_calories) - protein_calories - fat_calories

        # Allocate remaining to carbs
        carbs_g = remaining_calories / Decimal("4")  # 4 cal/g

        # Ensure carbs are not negative (can happen in aggressive cuts)
        carbs_g = max(Decimal("50"), carbs_g)  # Minimum 50g for brain function

        return (
            protein_g.quantize(Decimal("0.1")),
            carbs_g.quantize(Decimal("0.1")),
            fat_g.quantize(Decimal("0.1")),
        )

    def calculate_full_profile(self, user_profile: UserProfile) -> MetabolicProfile:
        """
        Calculate complete metabolic profile for user.

        Automatically selects best BMR formula:
        - Katch-McArdle if body fat % available (more accurate)
        - Mifflin-St Jeor otherwise (general population)

        Args:
            user_profile: User's anthropometric profile

        Returns:
            Complete metabolic profile with BMR, TDEE, and macro targets
        """
        # Choose appropriate BMR calculation method
        if user_profile.has_body_composition_data():
            bmr = self.calculate_bmr_katch_mcardle(
                user_profile.current_weight_kg, user_profile.body_fat_percentage  # type: ignore
            )
            calculation_method = "katch_mcardle"
        else:
            bmr = self.calculate_bmr_mifflin_st_jeor(
                user_profile.current_weight_kg,
                user_profile.height_cm,
                user_profile.age,
                user_profile.gender,
            )
            calculation_method = "mifflin_st_jeor"

        # Calculate TDEE
        tdee = self.calculate_tdee(bmr, user_profile.activity_level)

        # Adjust for goal
        target_calories = self.adjust_for_goal(tdee, user_profile.goal)

        # Calculate macros
        protein_g, carbs_g, fat_g = self.calculate_macro_targets(
            target_calories, user_profile.current_weight_kg, user_profile.goal
        )

        return MetabolicProfile(
            user_profile=user_profile,
            bmr=bmr.quantize(Decimal("0.1")),
            tdee=tdee.quantize(Decimal("0.1")),
            target_calories=target_calories,
            target_protein_g=protein_g,
            target_carbs_g=carbs_g,
            target_fat_g=fat_g,
            calculation_method=calculation_method,
        )

    def estimate_weight_loss_timeframe(
        self, current_weight_kg: Decimal, target_weight_kg: Decimal, daily_deficit: int
    ) -> int:
        """
        Estimate days to reach target weight.

        Assumes 1 kg fat = ~7700 calories

        Args:
            current_weight_kg: Current weight
            target_weight_kg: Target weight
            daily_deficit: Daily caloric deficit

        Returns:
            Estimated days to goal
        """
        weight_to_lose = current_weight_kg - target_weight_kg
        if weight_to_lose <= 0:
            return 0

        total_deficit_needed = weight_to_lose * Decimal("7700")  # Calories
        days = total_deficit_needed / Decimal(abs(daily_deficit))

        return int(days.quantize(Decimal("1")))
