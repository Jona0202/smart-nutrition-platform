import { create } from 'zustand';
import { UserProfile, MetabolicProfile } from '../types';

interface UserStore {
    profile: UserProfile | null;
    metabolicProfile: MetabolicProfile | null;
    isOnboarded: boolean;
    onboardingStep: number;
    syncStatus: 'none' | 'syncing' | 'synced' | 'error';
    lastSyncAt: string | null;

    setProfile: (profile: UserProfile) => void;
    setMetabolicProfile: (metabolicProfile: MetabolicProfile) => void;
    completeOnboarding: () => void;
    setOnboardingStep: (step: number) => void;
    resetUser: () => void;
}

// Helper to save state to localStorage
const saveToStorage = (state: UserStore) => {
    localStorage.setItem('nutrition-user-storage', JSON.stringify({
        profile: state.profile,
        metabolicProfile: state.metabolicProfile,
        isOnboarded: state.isOnboarded,
        onboardingStep: state.onboardingStep,
        syncStatus: state.syncStatus,
        lastSyncAt: state.lastSyncAt,
    }));
};

// Load initial state from localStorage
const loadFromStorage = (): Partial<UserStore> => {
    try {
        const stored = localStorage.getItem('nutrition-user-storage');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading from storage:', error);
    }
    return {
        profile: null,
        metabolicProfile: null,
        isOnboarded: false,
        onboardingStep: 0,
        syncStatus: 'none' as const,
        lastSyncAt: null,
    };
};

const initialState = loadFromStorage();

export const useUserStore = create<UserStore>((set, get) => ({
    profile: initialState.profile || null,
    metabolicProfile: initialState.metabolicProfile || null,
    isOnboarded: initialState.isOnboarded || false,
    onboardingStep: initialState.onboardingStep || 0,
    syncStatus: (initialState.syncStatus as any) || 'none',
    lastSyncAt: initialState.lastSyncAt || null,

    setProfile: (profile) => {
        set({ profile });
        saveToStorage(get());
    },

    setMetabolicProfile: (metabolicProfile) => {
        set({ metabolicProfile });
        saveToStorage(get());
    },

    completeOnboarding: () => {
        set({ isOnboarded: true, onboardingStep: 0 });
        saveToStorage(get());
    },

    setOnboardingStep: (step) => {
        set({ onboardingStep: step });
        saveToStorage(get());
    },

    resetUser: () => {
        set({ profile: null, metabolicProfile: null, isOnboarded: false, onboardingStep: 0 });
        localStorage.removeItem('nutrition-user-storage');
    },
}));
