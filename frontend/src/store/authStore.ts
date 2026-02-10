import { create } from 'zustand';
import api from '../api/client';

interface User {
    id: number;
    email: string;
    username: string;
    createdAt: string;
}

interface AuthStore {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isReturningUser: boolean; //flag to show welcome screen

    register: (email: string, username: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
    setReturningUser: (value: boolean) => void;
}

// Load from localStorage
const loadAuthState = () => {
    try {
        const token = localStorage.getItem('auth-token');
        const userStr = localStorage.getItem('auth-user');
        const isReturningStr = localStorage.getItem('is-returning-user');

        if (token && userStr) {
            return {
                token,
                user: JSON.parse(userStr),
                isAuthenticated: true,
                isReturningUser: isReturningStr === 'true',
            };
        }
    } catch (error) {
        console.error('Error loading auth state:', error);
    }

    return {
        token: null,
        user: null,
        isAuthenticated: false,
        isReturningUser: false,
    };
};

// Save to localStorage
const saveAuthState = (token: string | null, user: User | null) => {
    if (token && user) {
        localStorage.setItem('auth-token', token);
        localStorage.setItem('auth-user', JSON.stringify(user));
    } else {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('auth-user');
    }
};

export const useAuthStore = create<AuthStore>((set, get) => ({
    ...loadAuthState(),

    register: async (email: string, username: string, password: string) => {
        try {
            const response = await api.post('/api/auth/register', {
                email,
                username,
                password,
            });

            const { access_token, user } = response.data;
            set({ token: access_token, user, isAuthenticated: true });
            saveAuthState(access_token, user);
        } catch (error: any) {
            const message = error.response?.data?.detail || 'Registration failed';
            throw new Error(message);
        }
    },

    login: async (email: string, password: string) => {
        try {
            const response = await api.post('/api/auth/login', {
                email,
                password,
            });

            const { access_token, user } = response.data;
            set({ token: access_token, user, isAuthenticated: true, isReturningUser: true });
            saveAuthState(access_token, user);
            localStorage.setItem('is-returning-user', 'true');
        } catch (error: any) {
            const message = error.response?.data?.detail || 'Login failed';
            throw new Error(message);
        }
    },

    logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
        saveAuthState(null, null);
    },

    checkAuth: async () => {
        const { token } = get();
        if (!token) {
            set({ isAuthenticated: false, user: null });
            return;
        }

        try {
            const response = await api.get('/api/auth/me');
            set({ user: response.data, isAuthenticated: true });
        } catch (error) {
            // Token invalid, clear auth
            set({ token: null, user: null, isAuthenticated: false });
            saveAuthState(null, null);
        }
    },

    setReturningUser: (value: boolean) => {
        set({ isReturningUser: value });
        localStorage.setItem('is-returning-user', value.toString());
    },
}));
