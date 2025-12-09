import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const userData = await AsyncStorage.getItem('@user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    // Simulate API call - replace with your actual backend
    const mockUser: User = {
      id: '1',
      name: email.split('@')[0],
      email,
      avatar: 'https://i.pravatar.cc/200',
    };
    
    await AsyncStorage.setItem('@user', JSON.stringify(mockUser));
    setUser(mockUser);
  }

  async function signup(name: string, email: string, password: string) {
    // Simulate API call - replace with your actual backend
    const mockUser: User = {
      id: Date.now().toString(),
      name,
      email,
      avatar: 'https://i.pravatar.cc/200',
    };
    
    await AsyncStorage.setItem('@user', JSON.stringify(mockUser));
    setUser(mockUser);
  }

  async function logout() {
    await AsyncStorage.removeItem('@user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}