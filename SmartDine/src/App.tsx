import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { ActivityIndicator, View } from 'react-native';

import Login from './screens/auth/Login';
import Signup from './screens/auth/Signup';
import BottomTabs from './navigation/BottomTabs';
import Restaurant from './screens/details/Restaurant';
import Map from './screens/main/Map';
import FoodDetail from './screens/details/FoodDetail';
import Profile from './screens/main/Profile';
import Settings from './screens/settings/Settings';
import Notifications from './screens/settings/Notifications';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark, colors } = useTheme();

  // Theme-aware header options with smooth animations
  const themedHeaderOptions = {
    headerStyle: {
      backgroundColor: colors.surface,
    },
    headerTintColor: colors.text,
    headerTitleStyle: {
      fontWeight: '700' as const,
      color: colors.text,
    },
    headerShadowVisible: false,
    headerBackTitleVisible: false,
    // Smooth morph animation
    animation: 'fade_from_bottom' as const,
    animationDuration: 250,
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color="#ff6b00" />
      </View>
    );
  }

  // Navigation theme for bottom elements
  const navigationTheme = isDark ? {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      primary: '#ff6b00',
    },
  } : {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      primary: '#ff6b00',
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      {isAuthenticated ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={BottomTabs} />
          <Stack.Screen
            name="Restaurant"
            component={Restaurant}
            options={{ headerShown: true, title: 'Restaurant Details', ...themedHeaderOptions }}
          />
          <Stack.Screen
            name="Map"
            component={Map}
            options={{ headerShown: true, title: 'Location', ...themedHeaderOptions }}
          />
          <Stack.Screen
            name="FoodDetail"
            component={FoodDetail}
            options={{ headerShown: true, title: 'Food Details', ...themedHeaderOptions }}
          />
          <Stack.Screen
            name="Profile"
            component={Profile}
            options={{ headerShown: true, title: 'My Profile', ...themedHeaderOptions }}
          />
          <Stack.Screen
            name="Settings"
            component={Settings}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Notifications"
            component={Notifications}
            options={{ headerShown: true, title: 'Notifications', ...themedHeaderOptions }}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationsProvider>
          <CartProvider>
            <AppNavigator />
          </CartProvider>
        </NotificationsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

