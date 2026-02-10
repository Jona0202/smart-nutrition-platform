// Enhanced TypeScript type definitions

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Goal = 'cutting' | 'maintenance' | 'bulking';
export type DietType = 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UserProfile {
    // Basic info
    name: string;
    gender: Gender;
    dateOfBirth: string;

    // Physical measurements
    heightCm: number;
    currentWeightKg: number;
    targetWeightKg?: number;
    bodyFatPercentage?: number;

    // Goals and timeline
    goal: Goal;
    targetDate?: string; // When they want to reach their goal
    activityLevel: ActivityLevel;

    // Diet preferences
    dietType: DietType;
    restrictions: string[]; // ['gluten', 'lactose', 'nuts', etc.]
    mealsPerDay: number;

    // Lifestyle
    experienceLevel: ExperienceLevel;
    cookingTime: number; // minutes per day available for cooking
    budgetLevel: 'low' | 'medium' | 'high';

    // Motivation (optional)
    motivation?: string;
}

export interface MetabolicProfile {
    bmr: number;
    tdee: number;
    targetCalories: number;
    targetProteinG: number;
    targetCarbsG: number;
    targetFatG: number;
    macroPercentages: {
        protein: number;
        carbs: number;
        fat: number;
    };
    calculationMethod: string;

    // Enhanced calculations
    weeklyWeightChange?: number; // kg per week
    estimatedTimeToGoal?: number; // weeks
    waterIntake?: number; // liters per day
}

export interface CalculateProfileResponse {
    user_profile: {
        age: number;
        gender: string;
        height_cm: number;
        weight_kg: number;
        bmi: number;
        goal: string;
        activity_level: string;
    };
    bmr: number;
    tdee: number;
    target_calories: number;
    target_protein_g: number;
    target_carbs_g: number;
    target_fat_g: number;
    macro_percentages: {
        protein: number;
        carbs: number;
        fat: number;
    };
    calculation_method: string;
}
