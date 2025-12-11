// API Types and Interfaces

// User & Authentication
export interface User {
    username: string;
    email: string;
    created_at?: string;  // Optional - returned by backend but not always used
}

export interface UserProfile {
    username?: string;  // Optional - backend doesn't return this
    name: string;
    email: string;
    taste_preference?: string | null; // modern, comfort, traditional (legacy)
    taste_preferences?: string[]; // spicy, sweet, sour, savory, mild
    cuisine_preferences?: string[]; // italian, indian, mexican, chinese, etc.
    dietary_restrictions?: string[]; // vegetarian, gluten-free, etc.
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface SignupData {
    username: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

// Food & Nutrition
export interface NutritionalInfo {
    protein?: number;
    fiber?: number;
    calories?: number;
    carbs?: number;
    fat?: number;
}

export interface Food {
    name: string;
    restaurant: string;
    restaurant_id?: string;
    price: number;
    cuisine?: string;
    image?: string;
    rating?: number;
    nutritional_info?: NutritionalInfo;
    tags?: string[];
    allergens?: string[];
    is_vegetarian?: boolean;
    is_vegan?: boolean;
    is_gluten_free?: boolean;
}

// Restaurant & Location
export interface Location {
    latitude: number;
    longitude: number;
    address: string;
}

export interface Restaurant {
    name: string;
    cuisine: string;
    rating?: number;
    image?: string;
    location?: Location;
    menu?: string[];
}

// API Responses
export interface FoodsResponse {
    foods: Food[];
    count: number;
}

export interface RestaurantsResponse {
    restaurants: Restaurant[];
    count: number;
}

export interface AIResponse {
    answer: string;
}

export interface SearchHistoryItem {
    user_id: string;
    query: string;
    timestamp: string;
}

export interface SearchHistoryResponse {
    history: SearchHistoryItem[];
}

// Filter Options
export interface FilterOptions {
    min_price?: number;
    max_price?: number;
    high_protein?: boolean;
    high_fiber?: boolean;
    gluten_free?: boolean;
    vegetarian?: boolean;
    taste?: string;
}
