import { create } from 'zustand';

interface WaterEntry {
    date: string;
    ml: number;
}

interface WaterStore {
    entries: WaterEntry[];
    addWater: (ml: number) => void;
    getTodayMl: () => number;
    getTarget: (weightKg: number) => number;
    resetToday: () => void;
}

const STORAGE_KEY = 'nutrition-water-storage';

const getTodayDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const saveToStorage = (entries: WaterEntry[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

const loadFromStorage = (): WaterEntry[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.error('Error loading water data:', e);
    }
    return [];
};

export const useWaterStore = create<WaterStore>((set, get) => ({
    entries: loadFromStorage(),

    addWater: (ml: number) => {
        const today = getTodayDate();
        const entries = [...get().entries];
        const todayIndex = entries.findIndex(e => e.date === today);

        if (todayIndex >= 0) {
            entries[todayIndex] = { ...entries[todayIndex], ml: entries[todayIndex].ml + ml };
        } else {
            entries.push({ date: today, ml });
        }

        // Keep only last 30 days
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(cutoff.getDate()).padStart(2, '0')}`;
        const filtered = entries.filter(e => e.date >= cutoffStr);

        set({ entries: filtered });
        saveToStorage(filtered);
    },

    getTodayMl: () => {
        const today = getTodayDate();
        const entry = get().entries.find(e => e.date === today);
        return entry?.ml || 0;
    },

    getTarget: (weightKg: number) => {
        // 35ml per kg body weight, rounded to nearest 100
        return Math.round((weightKg * 35) / 100) * 100;
    },

    resetToday: () => {
        const today = getTodayDate();
        const entries = get().entries.filter(e => e.date !== today);
        set({ entries });
        saveToStorage(entries);
    },
}));
