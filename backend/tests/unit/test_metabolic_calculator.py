"""
Unit Tests - Metabolic Calculator

Critical tests for health calculations - must be precise and validated.
"""

import pytest
from decimal import Decimal
from datetime import date

from src.domain.entities.user_profile import (
    UserProfile,
    Gender,
    ActivityLevel,
    Goal,
    DietType,
)
from src.domain.services.metabolic_calculator import MetabolicCalculator


class TestMetabolicCalculator:
    """Test suite for metabolic calculations."""

    @pytest.fixture
    def calculator(self) -> MetabolicCalculator:
        """Fixture providing calculator instance."""
        return MetabolicCalculator()

    @pytest.fixture
    def male_profile(self) -> UserProfile:
        """Sample male user profile."""
        return UserProfile(
            user_id="00000000-0000-0000-0000-000000000001",  # type: ignore
            gender=Gender.MALE,
            date_of_birth=date(1990, 1, 1),  # 36 years old (as of 2026)
            height_cm=Decimal("180"),
            current_weight_kg=Decimal("80"),
            activity_level=ActivityLevel.MODERATE,
            goal=Goal.MAINTENANCE,
        )

    @pytest.fixture
    def female_profile_with_bf(self) -> UserProfile:
        """Sample female user profile with body fat percentage."""
        return UserProfile(
            user_id="00000000-0000-0000-0000-000000000002",  # type: ignore
            gender=Gender.FEMALE,
            date_of_birth=date(1995, 6, 15),  # 30 years old
            height_cm=Decimal("165"),
            current_weight_kg=Decimal("60"),
            body_fat_percentage=Decimal("25"),  # 25% BF
            activity_level=ActivityLevel.LIGHT,
            goal=Goal.CUTTING,
        )

    def test_bmr_mifflin_male(self, calculator: MetabolicCalculator):
        """Test Mifflin-St Jeor for male."""
        # Expected: 10*80 + 6.25*180 - 5*36 + 5 = 800 + 1125 - 180 + 5 = 1750
        bmr = calculator.calculate_bmr_mifflin_st_jeor(
            weight_kg=Decimal("80"),
            height_cm=Decimal("180"),
            age=36,
            gender=Gender.MALE,
        )

        assert bmr == Decimal("1750.00")

    def test_bmr_mifflin_female(self, calculator: MetabolicCalculator):
        """Test Mifflin-St Jeor for female."""
        # Expected: 10*60 + 6.25*165 - 5*30 - 161 = 600 + 1031.25 - 150 - 161 = 1320.25
        bmr = calculator.calculate_bmr_mifflin_st_jeor(
            weight_kg=Decimal("60"),
            height_cm=Decimal("165"),
            age=30,
            gender=Gender.FEMALE,
        )

        assert bmr == Decimal("1320.25")

    def test_bmr_katch_mcardle(self, calculator: MetabolicCalculator):
        """Test Katch-McArdle equation."""
        # 60kg at 25% BF = 45kg lean mass
        # Expected: 370 + (21.6 * 45) = 370 + 972 = 1342
        bmr = calculator.calculate_bmr_katch_mcardle(
            weight_kg=Decimal("60"), body_fat_pct=Decimal("25")
        )

        assert bmr == Decimal("1342.0")

    def test_tdee_calculation(self, calculator: MetabolicCalculator):
        """Test TDEE calculation with activity multipliers."""
        bmr = Decimal("1750")

        # Sedentary: 1750 * 1.2 = 2100
        tdee_sedentary = calculator.calculate_tdee(bmr, ActivityLevel.SEDENTARY)
        assert tdee_sedentary == Decimal("2100.0")

        # Moderate: 1750 * 1.55 = 2712.5
        tdee_moderate = calculator.calculate_tdee(bmr, ActivityLevel.MODERATE)
        assert tdee_moderate == Decimal("2712.5")

        # Very Active: 1750 * 1.9 = 3325
        tdee_very_active = calculator.calculate_tdee(bmr, ActivityLevel.VERY_ACTIVE)
        assert tdee_very_active == Decimal("3325.0")

    def test_goal_adjustments(self, calculator: MetabolicCalculator):
        """Test caloric adjustments for different goals."""
        tdee = Decimal("2500")

        # Cutting: 2500 * 0.8 = 2000
        cutting = calculator.adjust_for_goal(tdee, Goal.CUTTING)
        assert cutting == 2000

        # Maintenance: 2500 * 1.0 = 2500
        maintenance = calculator.adjust_for_goal(tdee, Goal.MAINTENANCE)
        assert maintenance == 2500

        # Bulking: 2500 * 1.1 = 2750
        bulking = calculator.adjust_for_goal(tdee, Goal.BULKING)
        assert bulking == 2750

    def test_macro_distribution_cutting(self, calculator: MetabolicCalculator):
        """Test macro distribution for cutting phase."""
        # 2000 cal target, 80kg bodyweight
        protein, carbs, fat = calculator.calculate_macro_targets(
            target_calories=2000,
            weight_kg=Decimal("80"),
            goal=Goal.CUTTING,
        )

        # Protein: 80kg * 2.2 = 176g
        assert protein == Decimal("176.0")

        # Fat: 80kg * 0.8 = 64g
        assert fat == Decimal("64.0")

        # Carbs: (2000 - 176*4 - 64*9) / 4 = (2000 - 704 - 576) / 4 = 720 / 4 = 180g
        assert carbs == Decimal("180.0")

    def test_macro_distribution_bulking(self, calculator: MetabolicCalculator):
        """Test macro distribution for bulking phase."""
        # 2750 cal target, 80kg bodyweight
        protein, carbs, fat = calculator.calculate_macro_targets(
            target_calories=2750,
            weight_kg=Decimal("80"),
            goal=Goal.BULKING,
        )

        # Protein: 80kg * 2.0 = 160g
        assert protein == Decimal("160.0")

        # Fat: 80kg * 0.8 = 64g
        assert fat == Decimal("64.0")

        # Carbs: (2750 - 160*4 - 64*9) / 4 = (2750 - 640 - 576) / 4 = 1534 / 4 = 383.5g
        assert carbs == Decimal("383.5")

    def test_full_profile_with_body_fat(
        self, calculator: MetabolicCalculator, female_profile_with_bf: UserProfile
    ):
        """Test complete profile calculation using Katch-McArdle."""
        profile = calculator.calculate_full_profile(female_profile_with_bf)

        # Should use Katch-McArdle (has BF%)
        assert profile.calculation_method == "katch_mcardle"

        # BMR should be calculated
        assert profile.bmr > 0

        # TDEE should be BMR * activity multiplier
        expected_tdee = profile.bmr * Decimal("1.375")  # Light activity
        assert profile.tdee == expected_tdee.quantize(Decimal("0.1"))

        # Calorie target should be adjusted for cutting (20% deficit)
        expected_target = int(profile.tdee * Decimal("0.8"))
        assert profile.target_calories == expected_target

        # Macros should sum close to target calories
        protein_cal = profile.target_protein_g * Decimal("4")
        carbs_cal = profile.target_carbs_g * Decimal("4")
        fat_cal = profile.target_fat_g * Decimal("9")
        total_cal = protein_cal + carbs_cal + fat_cal

        # Allow 5% deviation due to rounding
        assert abs(total_cal - Decimal(profile.target_calories)) <= Decimal("100")

    def test_full_profile_without_body_fat(
        self, calculator: MetabolicCalculator, male_profile: UserProfile
    ):
        """Test complete profile calculation using Mifflin-St Jeor."""
        profile = calculator.calculate_full_profile(male_profile)

        # Should use Mifflin-St Jeor (no BF%)
        assert profile.calculation_method == "mifflin_st_jeor"

        # BMR for 180cm, 80kg, 36yo male
        expected_bmr = Decimal("1750.0")
        assert profile.bmr == expected_bmr

        # TDEE for moderate activity
        expected_tdee = expected_bmr * Decimal("1.55")
        assert profile.tdee == expected_tdee.quantize(Decimal("0.1"))

        # Maintenance goal = no adjustment
        expected_target = int(profile.tdee)
        assert profile.target_calories == expected_target

    def test_weight_loss_timeframe(self, calculator: MetabolicCalculator):
        """Test weight loss estimation."""
        # Want to lose 10kg with 500 cal/day deficit
        # 10kg = 77,000 cal deficit needed
        # 77,000 / 500 = 154 days
        days = calculator.estimate_weight_loss_timeframe(
            current_weight_kg=Decimal("80"),
            target_weight_kg=Decimal("70"),
            daily_deficit=500,
        )

        assert days == 154

    def test_minimum_carbs_floor(self, calculator: MetabolicCalculator):
        """Test that carbs never go below 50g (brain function minimum)."""
        # Extreme cut scenario: very low calories but high protein/fat
        protein, carbs, fat = calculator.calculate_macro_targets(
            target_calories=1200,
            weight_kg=Decimal("80"),
            goal=Goal.CUTTING,
        )

        # Carbs should be at least 50g
        assert carbs >= Decimal("50")

    def test_metabolic_profile_percentages(
        self, calculator: MetabolicCalculator, male_profile: UserProfile
    ):
        """Test macro split percentages are calculated correctly."""
        profile = calculator.calculate_full_profile(male_profile)

        # Percentages should sum to ~100% (allow small rounding error)
        total_pct = (
            profile.protein_percentage + profile.carbs_percentage + profile.fat_percentage
        )

        assert Decimal("99") <= total_pct <= Decimal("101")


class TestUserProfile:
    """Test user profile entity validation."""

    def test_invalid_height(self):
        """Test that invalid heights are rejected."""
        with pytest.raises(ValueError, match="Height must be between"):
            UserProfile(
                user_id="00000000-0000-0000-0000-000000000001",  # type: ignore
                gender=Gender.MALE,
                date_of_birth=date(1990, 1, 1),
                height_cm=Decimal("50"),  # Too short
                current_weight_kg=Decimal("80"),
                activity_level=ActivityLevel.MODERATE,
                goal=Goal.MAINTENANCE,
            )

    def test_invalid_weight(self):
        """Test that invalid weights are rejected."""
        with pytest.raises(ValueError, match="Weight must be between"):
            UserProfile(
                user_id="00000000-0000-0000-0000-000000000001",  # type: ignore
                gender=Gender.MALE,
                date_of_birth=date(1990, 1, 1),
                height_cm=Decimal("180"),
                current_weight_kg=Decimal("500"),  # Too heavy
                activity_level=ActivityLevel.MODERATE,
                goal=Goal.MAINTENANCE,
            )

    def test_invalid_body_fat(self):
        """Test that invalid body fat percentages are rejected."""
        with pytest.raises(ValueError, match="Body fat percentage must be between"):
            UserProfile(
                user_id="00000000-0000-0000-0000-000000000001",  # type: ignore
                gender=Gender.MALE,
                date_of_birth=date(1990, 1, 1),
                height_cm=Decimal("180"),
                current_weight_kg=Decimal("80"),
                body_fat_percentage=Decimal("80"),  # Impossible
                activity_level=ActivityLevel.MODERATE,
                goal=Goal.MAINTENANCE,
            )

    def test_bmi_calculation(self):
        """Test BMI calculation accuracy."""
        profile = UserProfile(
            user_id="00000000-0000-0000-0000-000000000001",  # type: ignore
            gender=Gender.MALE,
            date_of_birth=date(1990, 1, 1),
            height_cm=Decimal("180"),  # 1.8m
            current_weight_kg=Decimal("80"),
            activity_level=ActivityLevel.MODERATE,
            goal=Goal.MAINTENANCE,
        )

        # BMI = 80 / (1.8^2) = 80 / 3.24 = 24.69
        expected_bmi = Decimal("80") / (Decimal("1.8") ** 2)
        assert abs(profile.bmi - expected_bmi) < Decimal("0.01")

    def test_lean_mass_calculation(self):
        """Test lean body mass calculation."""
        profile = UserProfile(
            user_id="00000000-0000-0000-0000-000000000001",  # type: ignore
            gender=Gender.FEMALE,
            date_of_birth=date(1995, 1, 1),
            height_cm=Decimal("165"),
            current_weight_kg=Decimal("60"),
            body_fat_percentage=Decimal("25"),
            activity_level=ActivityLevel.LIGHT,
            goal=Goal.CUTTING,
        )

        # Lean mass = 60 * (1 - 0.25) = 60 * 0.75 = 45kg
        assert profile.lean_mass_kg == Decimal("45.00")
