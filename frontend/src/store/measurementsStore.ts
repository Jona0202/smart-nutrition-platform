import { create } from 'zustand';

export interface BodyMeasurement {
    id: string;
    date: string; // YYYY-MM-DD
    waist?: number;   // Cintura (cm)
    hip?: number;     // Cadera (cm)
    chest?: number;   // Pecho (cm)
    arm?: number;     // Brazo (cm)
    thigh?: number;   // Muslo (cm)
    calf?: number;    // Pantorrilla (cm)
    note?: string;
}

export const MEASUREMENT_LABELS: Record<keyof Omit<BodyMeasurement, 'id' | 'date' | 'note'>, string> = {
    waist: 'Cintura',
    hip: 'Cadera',
    chest: 'Pecho',
    arm: 'Brazo',
    thigh: 'Muslo',
    calf: 'Pantorrilla',
};

export const MEASUREMENT_EMOJIS: Record<keyof Omit<BodyMeasurement, 'id' | 'date' | 'note'>, string> = {
    waist: '⊙',
    hip: '◎',
    chest: '♦',
    arm: '💪',
    thigh: '🦵',
    calf: '🦶',
};

interface MeasurementsStore {
    entries: BodyMeasurement[];
    addEntry: (data: Omit<BodyMeasurement, 'id' | 'date'> & { date?: string }) => void;
    removeEntry: (id: string) => void;
    getLatest: () => BodyMeasurement | null;
    getHistory: (field: keyof Omit<BodyMeasurement, 'id' | 'date' | 'note'>, limit?: number) => { date: string; value: number }[];
}

const STORAGE_KEY = 'nutrition-measurements-v1';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const saveToStorage = (entries: BodyMeasurement[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

const loadFromStorage = (): BodyMeasurement[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch {
        console.error('Error loading measurements');
    }
    return [];
};

export const useMeasurementsStore = create<MeasurementsStore>((set, get) => ({
    entries: loadFromStorage(),

    addEntry: (data) => {
        const date = data.date ?? getTodayStr();
        // Replace existing entry for same date
        const existing = get().entries.filter(e => e.date !== date);
        const newEntry: BodyMeasurement = {
            id: generateId(),
            date,
            ...data,
        };
        const newEntries = [...existing, newEntry].sort((a, b) => a.date.localeCompare(b.date));
        set({ entries: newEntries });
        saveToStorage(newEntries);
    },

    removeEntry: (id) => {
        const newEntries = get().entries.filter(e => e.id !== id);
        set({ entries: newEntries });
        saveToStorage(newEntries);
    },

    getLatest: () => {
        const entries = get().entries;
        if (entries.length === 0) return null;
        return entries[entries.length - 1];
    },

    getHistory: (field, limit = 20) => {
        return get()
            .entries
            .filter(e => e[field] !== undefined && e[field] !== null)
            .slice(-limit)
            .map(e => ({ date: e.date, value: e[field] as number }));
    },
}));
