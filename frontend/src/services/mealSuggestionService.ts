/**
 * Meal Suggestion Service
 * 
 * Generates daily meal plans based on user's calorie/macro targets,
 * selected protein preference, and suggestion history (anti-repetition).
 */

import { recipes, Recipe, ProteinBase, MealType, proteinOptions } from '../data/recipes';

export interface MealPlan {
    breakfast: Recipe;
    lunch: Recipe;
    dinner: Recipe;
    snack: Recipe;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    scaleFactor: number; // multiplier to adjust portions to target
}

const HISTORY_KEY = 'meal-suggestion-history';

/**
 * Get protein options list
 */
export const getProteinOptions = () => proteinOptions;

/**
 * Get recipes filtered by protein and meal type
 */
const getRecipesForType = (protein: ProteinBase, mealType: MealType): Recipe[] => {
    return recipes.filter(r => r.proteinBase === protein && r.mealType === mealType);
};

/**
 * Load suggestion history from localStorage
 * Returns map of date -> array of recipe IDs used that day
 */
const loadHistory = (): Record<string, string[]> => {
    try {
        const stored = localStorage.getItem(HISTORY_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.error('Error loading suggestion history:', e);
    }
    return {};
};

/**
 * Save suggestion history, keeping only last 7 days
 */
const saveHistory = (history: Record<string, string[]>) => {
    // Clean up entries older than 7 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    const cleaned: Record<string, string[]> = {};
    for (const [date, ids] of Object.entries(history)) {
        if (date >= cutoffStr) {
            cleaned[date] = ids;
        }
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(cleaned));
};

/**
 * Get recently used recipe IDs (last N days)
 */
const getRecentlyUsedIds = (days: number): Set<string> => {
    const history = loadHistory();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    const usedIds = new Set<string>();
    for (const [date, ids] of Object.entries(history)) {
        if (date >= cutoffStr) {
            ids.forEach(id => usedIds.add(id));
        }
    }
    return usedIds;
};

/**
 * Pick a random recipe avoiding recently used ones
 */
const pickRecipe = (
    available: Recipe[],
    recentlyUsed: Set<string>,
    excluded: Set<string>
): Recipe | null => {
    // First: try recipes NOT used recently and NOT excluded
    const fresh = available.filter(r => !recentlyUsed.has(r.id) && !excluded.has(r.id));
    if (fresh.length > 0) {
        return fresh[Math.floor(Math.random() * fresh.length)];
    }

    // Second: allow recently used but not excluded
    const notExcluded = available.filter(r => !excluded.has(r.id));
    if (notExcluded.length > 0) {
        return notExcluded[Math.floor(Math.random() * notExcluded.length)];
    }

    // Last resort: any recipe
    if (available.length > 0) {
        return available[Math.floor(Math.random() * available.length)];
    }

    return null;
};

/**
 * Generate a daily meal plan for a given protein base
 * 
 * @param protein - Selected protein base (chicken, beef, etc.)
 * @param targetCalories - Total daily calorie target
 * @param alreadyEatenCalories - Calories already consumed today
 * @returns MealPlan with 4 meals adjusted to remaining calories
 */
export const generateDailyPlan = (
    protein: ProteinBase,
    targetCalories: number,
    alreadyEatenCalories: number = 0
): MealPlan | null => {
    const remainingCalories = Math.max(targetCalories - alreadyEatenCalories, 500);
    const recentlyUsed = getRecentlyUsedIds(2); // Avoid last 2 days
    const excluded = new Set<string>();

    // Pick one recipe per meal type
    const breakfast = pickRecipe(getRecipesForType(protein, 'breakfast'), recentlyUsed, excluded);
    if (breakfast) excluded.add(breakfast.id);

    const lunch = pickRecipe(getRecipesForType(protein, 'lunch'), recentlyUsed, excluded);
    if (lunch) excluded.add(lunch.id);

    const dinner = pickRecipe(getRecipesForType(protein, 'dinner'), recentlyUsed, excluded);
    if (dinner) excluded.add(dinner.id);

    const snack = pickRecipe(getRecipesForType(protein, 'snack'), recentlyUsed, excluded);

    if (!breakfast || !lunch || !dinner || !snack) {
        console.error('Not enough recipes for protein:', protein);
        return null;
    }

    // Calculate raw total
    const rawTotal = breakfast.totalCalories + lunch.totalCalories + dinner.totalCalories + snack.totalCalories;

    // Scale factor to adjust portions to remaining calories
    const scaleFactor = Math.max(0.5, Math.min(2.0, remainingCalories / rawTotal));

    const plan: MealPlan = {
        breakfast,
        lunch,
        dinner,
        snack,
        totalCalories: Math.round(rawTotal * scaleFactor),
        totalProtein: Math.round((breakfast.totalProtein + lunch.totalProtein + dinner.totalProtein + snack.totalProtein) * scaleFactor),
        totalCarbs: Math.round((breakfast.totalCarbs + lunch.totalCarbs + dinner.totalCarbs + snack.totalCarbs) * scaleFactor),
        totalFat: Math.round((breakfast.totalFat + lunch.totalFat + dinner.totalFat + snack.totalFat) * scaleFactor),
        scaleFactor,
    };

    // Save to history
    const today = new Date().toISOString().split('T')[0];
    const history = loadHistory();
    history[today] = [
        ...(history[today] || []),
        breakfast.id, lunch.id, dinner.id, snack.id,
    ];
    saveHistory(history);

    return plan;
};

/**
 * Build YouTube search URL for a recipe
 */
export const getYouTubeSearchUrl = (recipe: Recipe): string => {
    const query = encodeURIComponent(recipe.youtubeSearch);
    return `https://www.youtube.com/results?search_query=${query}`;
};

/**
 * Scale ingredient grams based on the plan's scale factor
 */
export const scaleGrams = (grams: number, scaleFactor: number): number => {
    return Math.round(grams * scaleFactor);
};

/**
 * Scale calories based on the plan's scale factor
 */
export const scaleCalories = (calories: number, scaleFactor: number): number => {
    return Math.round(calories * scaleFactor);
};
