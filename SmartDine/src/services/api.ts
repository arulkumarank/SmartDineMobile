import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import type {
    LoginCredentials,
    SignupData,
    AuthResponse,
    UserProfile,
    FoodsResponse,
    RestaurantsResponse,
    AIResponse,
    SearchHistoryResponse,
    FilterOptions,
} from '../types';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async config => {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    },
);

// Response interceptor for error handling
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear storage
            AsyncStorage.removeItem('auth_token');
        }
        return Promise.reject(error);
    },
);

// Auth APIs
export const authAPI = {
    signup: async (data: SignupData) => {
        const response = await api.post(API_ENDPOINTS.SIGNUP, data);
        return response.data;
    },

    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>(
            API_ENDPOINTS.LOGIN,
            credentials,
        );
        // Store token
        await AsyncStorage.setItem('auth_token', response.data.access_token);
        return response.data;
    },

    getMe: async () => {
        const response = await api.get(API_ENDPOINTS.ME);
        return response.data;
    },

    logout: async () => {
        await AsyncStorage.removeItem('auth_token');
    },
};

// Profile APIs
export const profileAPI = {
    get: async (): Promise<UserProfile> => {
        const response = await api.get<UserProfile>(API_ENDPOINTS.PROFILE);
        return response.data;
    },

    update: async (data: Partial<UserProfile>) => {
        const response = await api.put(API_ENDPOINTS.PROFILE, data);
        return response.data;
    },

    getHistory: async (): Promise<SearchHistoryResponse> => {
        const response = await api.get<SearchHistoryResponse>(
            API_ENDPOINTS.SEARCH_HISTORY,
        );
        return response.data;
    },
};

// Foods APIs
export const foodsAPI = {
    getAll: async (filters?: FilterOptions): Promise<FoodsResponse> => {
        const response = await api.get<FoodsResponse>(API_ENDPOINTS.FOODS, {
            params: filters,
        });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(API_ENDPOINTS.FOOD_BY_ID(id));
        return response.data;
    },

    getDetail: async (foodName: string, restaurant: string) => {
        const response = await api.post(`${API_BASE_URL}/foods/detail`, null, {
            params: { food_name: foodName, restaurant }
        });
        return response.data;
    },
};

// Restaurants APIs
export const restaurantsAPI = {
    getAll: async (): Promise<RestaurantsResponse> => {
        const response = await api.get<RestaurantsResponse>(
            API_ENDPOINTS.RESTAURANTS,
        );
        return response.data;
    },

    getPersonalized: async (): Promise<RestaurantsResponse> => {
        const response = await api.get<RestaurantsResponse>(
            '/restaurants/personalized',
        );
        return response.data;
    },
};

// AI APIs
export const aiAPI = {
    ask: async (question: string): Promise<AIResponse> => {
        const response = await api.post<AIResponse>(API_ENDPOINTS.AI_ASK, {
            question,
        });
        return response.data;
    },
};

// Feedback APIs (RL tracking)
export const feedbackAPI = {
    trackClick: async (foodName: string, restaurantName?: string) => {
        const response = await api.post('/feedback/click', {
            food_name: foodName,
            restaurant_name: restaurantName
        });
        return response.data;
    },

    trackCartAdd: async (foodName: string, restaurantName?: string) => {
        const response = await api.post('/feedback/cart', {
            food_name: foodName,
            restaurant_name: restaurantName
        });
        return response.data;
    },

    rateFood: async (foodName: string, rating: number, restaurantName?: string) => {
        const response = await api.post('/feedback/rate', {
            food_name: foodName,
            rating,
            restaurant_name: restaurantName
        });
        return response.data;
    },

    getSurprise: async () => {
        const response = await api.get('/feedback/surprise');
        return response.data;
    },

    getForYou: async () => {
        const response = await api.get('/feedback/for-you');
        return response.data;
    },

    getTopRated: async (limit: number = 10) => {
        const response = await api.get(`/feedback/top-rated?limit=${limit}`);
        return response.data;
    }
};

export default api;
