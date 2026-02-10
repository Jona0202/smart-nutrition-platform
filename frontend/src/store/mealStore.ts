import { create } from 'zustand';

export interface LoggedMeal {
    id: string;
    foodId: string;
    foodName: string;
    emoji: string;
    grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    timestamp: string;
    date: string; // Format: YYYY-MM-DD
}

interface MealStore {
    meals: LoggedMeal[];
    currentDate: string;

    addMeal: (meal: LoggedMeal) => void;
    removeMeal: (mealId: string) => void;
    getMealsForToday: () => LoggedMeal[];
    getTodayTotals: () => {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    clearOldMeals: () => void;
}

const getTodayDate = () => {
    // Use local date, not UTC to avoid timezone issues
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Helper to save to localStorage
const saveToStorage = (meals: LoggedMeal[]) => {
    localStorage.setItem('nutrition-meals-storage', JSON.stringify(meals));
};

// Load from localStorage
const loadFromStorage = (): LoggedMeal[] => {
    try {
        const stored = localStorage.getItem('nutrition-meals-storage');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading meals:', error);
    }
    return [];
};

// Migrate old meals to add date field if missing
const migrateOldMeals = (meals: LoggedMeal[]): LoggedMeal[] => {
    return meals.map(meal => {
        // If meal doesn't have date field, extract it from timestamp using LOCAL time
        if (!meal.date && meal.timestamp) {
            const localDate = new Date(meal.timestamp);
            const year = localDate.getFullYear();
            const month = String(localDate.getMonth() + 1).padStart(2, '0');
            const day = String(localDate.getDate()).padStart(2, '0');
            return {
                ...meal,
                date: `${year}-${month}-${day}`
            };
        }
        return meal;
    });
};

export const useMealStore = create<MealStore>((set, get) => {
    // Load and migrate meals on initialization
    const loadedMeals = loadFromStorage();
    const migratedMeals = migrateOldMeals(loadedMeals);

    // Save migrated meals if any changes were made
    if (migratedMeals.some((meal, i) => meal.date !== loadedMeals[i]?.date)) {
        saveToStorage(migratedMeals);
    }

    return {
        meals: migratedMeals,
        currentDate: getTodayDate(),

        addMeal: (meal) => {
            const newMeals = [...get().meals, meal];
            set({ meals: newMeals });
            saveToStorage(newMeals);

            // Auto-sync to cloud if authenticated (async, no await)
            import('../store/authStore').then(({ useAuthStore }) => {
                const { isAuthenticated } = useAuthStore.getState();
                if (isAuthenticated) {
                    import('../services/syncService').then(({ syncService }) => {
                        syncService.syncMealsToCloud().catch(console.error);
                    });
                }
            });
        },

        removeMeal: (mealId) => {
            const newMeals = get().meals.filter(m => m.id !== mealId);
            set({ meals: newMeals });
            saveToStorage(newMeals);

            // Auto-sync to cloud if authenticated
            import('../store/authStore').then(({ useAuthStore }) => {
                const { isAuthenticated } = useAuthStore.getState();
                if (isAuthenticated) {
                    import('../services/syncService').then(({ syncService }) => {
                        syncService.syncMealsToCloud().catch(console.error);
                    });
                }
            });
        },

        getMealsForToday: () => {
            const today = getTodayDate();
            return get().meals.filter(meal => meal.date === today);
        },

        getTodayTotals: () => {
            const todayMeals = get().getMealsForToday();
            return todayMeals.reduce(
                (totals, meal) => ({
                    calories: totals.calories + meal.calories,
                    protein: totals.protein + meal.protein,
                    carbs: totals.carbs + meal.carbs,
                    fat: totals.fat + meal.fat,
                }),
                { calories: 0, protein: 0, carbs: 0, fat: 0 }
            );
        },

        clearOldMeals: () => {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const cutoffDate = sevenDaysAgo.toISOString().split('T')[0];

            const newMeals = get().meals.filter(meal => meal.date >= cutoffDate);
            set({ meals: newMeals });
            saveToStorage(newMeals);
        },
    };
});
