// API Configuration
export const API_BASE_URL = 'http://10.203.12.54:8000';

// API Endpoints
export const API_ENDPOINTS = {
    // Auth
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    ME: '/auth/me',

    // Profile
    PROFILE: '/profile',
    SEARCH_HISTORY: '/profile/history',

    // Foods
    FOODS: '/foods',
    FOOD_BY_ID: (id: string) => `/foods/${id}`,

    // Restaurants
    RESTAURANTS: '/restaurants',

    // AI
    AI_ASK: '/ai/ask',

    // Health
    HEALTH: '/health',
};
