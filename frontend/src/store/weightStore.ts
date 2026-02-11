import { create } from 'zustand';

export interface WeightEntry {
    id: string;
    date: string;       // YYYY-MM-DD
    weightKg: number;
    note?: string;
}

interface WeightStore {
    entries: WeightEntry[];
    addEntry: (weightKg: number, note?: string) => void;
    removeEntry: (id: string) => void;
    getEntries: () => WeightEntry[];
    getLatestWeight: () => number | null;
    getWeightChange: (days: number) => { change: number; percentage: number } | null;
    getTrend: () => 'up' | 'down' | 'stable' | null;
}

const STORAGE_KEY = 'nutrition-weight-storage';

const saveToStorage = (entries: WeightEntry[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

const loadFromStorage = (): WeightEntry[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.error('Error loading weight data:', e);
    }
    return [];
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const getTodayDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const useWeightStore = create<WeightStore>((set, get) => ({
    entries: loadFromStorage(),

    addEntry: (weightKg: number, note?: string) => {
        const today = getTodayDate();
        const existing = get().entries.filter(e => e.date !== today);
        const newEntry: WeightEntry = {
            id: generateId(),
            date: today,
            weightKg: Math.round(weightKg * 10) / 10,
            note,
        };
        const newEntries = [...existing, newEntry].sort((a, b) => a.date.localeCompare(b.date));
        set({ entries: newEntries });
        saveToStorage(newEntries);
    },

    removeEntry: (id: string) => {
        const newEntries = get().entries.filter(e => e.id !== id);
        set({ entries: newEntries });
        saveToStorage(newEntries);
    },

    getEntries: () => get().entries,

    getLatestWeight: () => {
        const entries = get().entries;
        if (entries.length === 0) return null;
        return entries[entries.length - 1].weightKg;
    },

    getWeightChange: (days: number) => {
        const entries = get().entries;
        if (entries.length < 2) return null;

        const now = new Date();
        const cutoff = new Date(now);
        cutoff.setDate(cutoff.getDate() - days);
        const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(cutoff.getDate()).padStart(2, '0')}`;

        const oldEntries = entries.filter(e => e.date <= cutoffStr);
        if (oldEntries.length === 0) return null;

        const oldWeight = oldEntries[oldEntries.length - 1].weightKg;
        const currentWeight = entries[entries.length - 1].weightKg;
        const change = Math.round((currentWeight - oldWeight) * 10) / 10;
        const percentage = Math.round((change / oldWeight) * 1000) / 10;

        return { change, percentage };
    },

    getTrend: () => {
        const entries = get().entries;
        if (entries.length < 3) return null;

        const last3 = entries.slice(-3);
        const diffs = [];
        for (let i = 1; i < last3.length; i++) {
            diffs.push(last3[i].weightKg - last3[i - 1].weightKg);
        }
        const avgDiff = diffs.reduce((s, d) => s + d, 0) / diffs.length;

        if (avgDiff > 0.15) return 'up';
        if (avgDiff < -0.15) return 'down';
        return 'stable';
    },
}));
