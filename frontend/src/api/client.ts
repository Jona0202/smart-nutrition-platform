import axios from 'axios';

// const API_BASE_URL = 'http://10.0.2.2:8000/api/v1'; // Android Emulator
const API_BASE_URL = 'https://smart-nutrition-platform.onrender.com'; // Production Render
// const API_BASE_URL = 'http://localhost:8000'; // Browser Localhost

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth-token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
