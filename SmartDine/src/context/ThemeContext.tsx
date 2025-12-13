import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    card: string;
    mapStyle: 'standard' | 'dark';
}

interface ThemeContextType {
    mode: ThemeMode;
    isDark: boolean;
    colors: ThemeColors;
    setMode: (mode: ThemeMode) => void;
}

const lightColors: ThemeColors = {
    background: '#f8f9fa',
    surface: '#ffffff',
    text: '#1a1a1a',
    textSecondary: '#666666',
    border: '#eeeeee',
    primary: '#ff6b00',
    card: '#ffffff',
    mapStyle: 'standard',
};

const darkColors: ThemeColors = {
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    textSecondary: '#aaaaaa',
    border: '#333333',
    primary: '#ff8533',
    card: '#2a2a2a',
    mapStyle: 'dark',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [mode, setModeState] = useState<ThemeMode>('system');

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedMode = await AsyncStorage.getItem('theme_mode');
            if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
                setModeState(savedMode as ThemeMode);
            }
        } catch (error) {
            console.error('Failed to load theme:', error);
        }
    };

    const setMode = async (newMode: ThemeMode) => {
        setModeState(newMode);
        try {
            await AsyncStorage.setItem('theme_mode', newMode);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    const isDark = mode === 'dark' || (mode === 'system' && systemColorScheme === 'dark');
    const colors = isDark ? darkColors : lightColors;

    return (
        <ThemeContext.Provider value={{ mode, isDark, colors, setMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
