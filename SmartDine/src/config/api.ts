// API Configuration - Production (Render)
export const API_BASE_URL = 'http://13.201.21.44:8000/';

// API Endpoints
export const API_ENDPOINTS = {
    // Auth
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    ME: '/auth/me',
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',

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
