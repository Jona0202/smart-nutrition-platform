import { create } from 'zustand';

export interface FavoriteFood {
    foodId: string;
    foodName: string;
    emoji: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    defaultGrams: number;
    defaultMealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    timesUsed: number;
}

interface FavoritesStore {
    favorites: FavoriteFood[];
    addFavorite: (food: FavoriteFood) => void;
    removeFavorite: (foodId: string) => void;
    isFavorite: (foodId: string) => boolean;
    incrementUsage: (foodId: string) => void;
    getTopFavorites: (limit?: number) => FavoriteFood[];
}

const saveToStorage = (favorites: FavoriteFood[]) => {
    localStorage.setItem('nutrition-favorites', JSON.stringify(favorites));
};

const loadFromStorage = (): FavoriteFood[] => {
    try {
        const stored = localStorage.getItem('nutrition-favorites');
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.error('Error loading favorites:', e);
    }
    return [];
};

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
    favorites: loadFromStorage(),

    addFavorite: (food) => {
        const exists = get().favorites.find(f => f.foodId === food.foodId);
        if (exists) return;
        const newFavorites = [...get().favorites, { ...food, timesUsed: 0 }];
        set({ favorites: newFavorites });
        saveToStorage(newFavorites);
    },

    removeFavorite: (foodId) => {
        const newFavorites = get().favorites.filter(f => f.foodId !== foodId);
        set({ favorites: newFavorites });
        saveToStorage(newFavorites);
    },

    isFavorite: (foodId) => {
        return get().favorites.some(f => f.foodId === foodId);
    },

    incrementUsage: (foodId) => {
        const newFavorites = get().favorites.map(f =>
            f.foodId === foodId ? { ...f, timesUsed: f.timesUsed + 1 } : f
        );
        set({ favorites: newFavorites });
        saveToStorage(newFavorites);
    },

    getTopFavorites: (limit = 5) => {
        return [...get().favorites].sort((a, b) => b.timesUsed - a.timesUsed).slice(0, limit);
    },
}));
