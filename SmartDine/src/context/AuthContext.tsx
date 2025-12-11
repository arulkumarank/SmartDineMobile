import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import { authAPI } from '../services/api';
import type { User, LoginCredentials, SignupData } from '../types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    signup: (data: SignupData) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing session on app launch
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('auth_token');
            if (token) {
                const userData = await authAPI.getMe();
                setUser(userData);
            }
        } catch (error) {
            console.log('No existing session');
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials: LoginCredentials) => {
        try {
            console.log('Logging in user:', credentials.username);
            const authResponse = await authAPI.login(credentials);
            console.log('Login successful, fetching user data...');

            const userData = await authAPI.getMe();
            console.log('User data fetched:', userData);
            setUser(userData);
        } catch (error) {
            console.error('Login error:', error);
            if (axios.isAxiosError(error)) {
                console.error('Error response:', error.response?.data);
            }
            throw error;
        }
    };

    const signup = async (data: SignupData) => {
        try {
            console.log('Starting signup for:', data.username);
            const signupResponse = await authAPI.signup(data);
            console.log('Signup response:', signupResponse);

            // Auto login after signup
            console.log('Attempting auto-login...');
            await login({ username: data.username, password: data.password });
            console.log('Auto-login successful');
        } catch (error) {
            console.error('Signup error:', error);
            if (axios.isAxiosError(error)) {
                console.error('Error response:', error.response?.data);
            }
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                signup,
                logout,
            }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
