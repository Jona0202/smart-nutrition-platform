import { create } from 'zustand';
import { foodDatabase, FoodItem } from '../data/foods';

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface PlannedMeal {
    foodId: string;
    foodName: string;
    emoji: string;
    grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    done: boolean;
}

export interface DayPlan {
    date: string; // YYYY-MM-DD
    breakfast: PlannedMeal | null;
    lunch: PlannedMeal | null;
    dinner: PlannedMeal | null;
    snack: PlannedMeal | null;
}

export interface WeekPlan {
    generatedAt: string;
    targetCalories: number;
    days: DayPlan[];
}

interface MealPlanStore {
    plan: WeekPlan | null;
    generateWeekPlan: (targetCalories: number) => void;
    regenerateDayPlan: (dayIndex: number, targetCalories: number) => void;
    toggleMealDone: (dayIndex: number, slot: MealSlot) => void;
    clearPlan: () => void;
}

const STORAGE_KEY = 'nutrition-meal-plan-v1';

const saveToStorage = (plan: WeekPlan | null) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
};

const loadFromStorage = (): WeekPlan | null => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch {
        console.error('Error loading meal plan');
    }
    return null;
};

const getDateStr = (daysFromToday: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Distribution percentages per meal
const MEAL_DISTRIBUTION: Record<MealSlot, number> = {
    breakfast: 0.25,
    lunch: 0.35,
    dinner: 0.30,
    snack: 0.10,
};

// Good breakfast candidates
const BREAKFAST_CATEGORIES = ['dairy', 'fruits', 'carbs'];
const LUNCH_CATEGORIES = ['peruvian', 'protein', 'carbs'];
const DINNER_CATEGORIES = ['protein', 'vegetables', 'carbs'];
const SNACK_CATEGORIES = ['fruits', 'snacks', 'fats'];

function pickBestFood(
    categories: string[],
    targetCalories: number,
    exclude: Set<string>
): { food: FoodItem; grams: number } | null {
    // Filter by category and not already used
    const candidates = foodDatabase.filter(
        (f) => categories.includes(f.category) && !exclude.has(f.id)
    );

    if (candidates.length === 0) return null;

    // Shuffle candidates slightly for variety
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);

    for (const food of shuffled) {
        // Find grams that match target calories
        const grams = Math.round((targetCalories / food.caloriesPer100g) * 100);

        // Use typical serving sizes as bounds (50g – 600g)
        if (grams < 30 || grams > 700) continue;

        return { food, grams };
    }

    // Fallback: use first candidate with servingSizes[1] or grams=150
    const food = shuffled[0];
    const grams = food.servingSizes[1]?.grams ?? food.servingSizes[0]?.grams ?? 150;
    return { food, grams };
}

function buildPlannedMeal(food: FoodItem, grams: number): PlannedMeal {
    const ratio = grams / 100;
    return {
        foodId: food.id,
        foodName: food.name,
        emoji: food.emoji,
        grams,
        calories: Math.round(food.caloriesPer100g * ratio),
        protein: Math.round(food.proteinPer100g * ratio * 10) / 10,
        carbs: Math.round(food.carbsPer100g * ratio * 10) / 10,
        fat: Math.round(food.fatPer100g * ratio * 10) / 10,
        done: false,
    };
}

function generateDayPlan(date: string, targetCalories: number): DayPlan {
    const used = new Set<string>();

    const pickMeal = (categories: string[], slot: MealSlot): PlannedMeal | null => {
        const cal = targetCalories * MEAL_DISTRIBUTION[slot];
        const result = pickBestFood(categories, cal, used);
        if (!result) return null;
        used.add(result.food.id);
        return buildPlannedMeal(result.food, result.grams);
    };

    return {
        date,
        breakfast: pickMeal(BREAKFAST_CATEGORIES, 'breakfast'),
        lunch: pickMeal(LUNCH_CATEGORIES, 'lunch'),
        dinner: pickMeal(DINNER_CATEGORIES, 'dinner'),
        snack: pickMeal(SNACK_CATEGORIES, 'snack'),
    };
}

export const useMealPlanStore = create<MealPlanStore>((set, get) => ({
    plan: loadFromStorage(),

    generateWeekPlan: (targetCalories: number) => {
        const days: DayPlan[] = [];
        // Start from today (day 0) through day 6
        for (let i = 0; i < 7; i++) {
            days.push(generateDayPlan(getDateStr(i), targetCalories));
        }
        const plan: WeekPlan = {
            generatedAt: new Date().toISOString(),
            targetCalories,
            days,
        };
        set({ plan });
        saveToStorage(plan);
    },

    regenerateDayPlan: (dayIndex: number, targetCalories: number) => {
        const plan = get().plan;
        if (!plan) return;
        const currentDay = plan.days[dayIndex];
        const newDay = generateDayPlan(currentDay.date, targetCalories);
        const newDays = [...plan.days];
        newDays[dayIndex] = newDay;
        const newPlan = { ...plan, days: newDays };
        set({ plan: newPlan });
        saveToStorage(newPlan);
    },

    toggleMealDone: (dayIndex: number, slot: MealSlot) => {
        const plan = get().plan;
        if (!plan) return;
        const day = plan.days[dayIndex];
        const meal = day[slot];
        if (!meal) return;
        const updatedMeal = { ...meal, done: !meal.done };
        const updatedDay = { ...day, [slot]: updatedMeal };
        const newDays = [...plan.days];
        newDays[dayIndex] = updatedDay;
        const newPlan = { ...plan, days: newDays };
        set({ plan: newPlan });
        saveToStorage(newPlan);
    },

    clearPlan: () => {
        set({ plan: null });
        saveToStorage(null);
    },
}));
