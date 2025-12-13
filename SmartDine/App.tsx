import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { ActivityIndicator, View } from 'react-native';

import Login from './src/screens/Login';
import Signup from './src/screens/Signup';
import BottomTabs from './src/navigation/BottomTabs';
import Restaurant from './src/screens/Restaurant';
import Map from './src/screens/Map';
import FoodDetail from './src/screens/FoodDetail';
import Profile from './src/screens/Profile';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ff6b00" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={BottomTabs} />
          <Stack.Screen
            name="Restaurant"
            component={Restaurant}
            options={{ headerShown: true, title: 'Restaurant Details' }}
          />
          <Stack.Screen
            name="Map"
            component={Map}
            options={{ headerShown: true, title: 'Location' }}
          />
          <Stack.Screen
            name="FoodDetail"
            component={FoodDetail}
            options={{ headerShown: true, title: 'Food Details' }}
          />
          <Stack.Screen
            name="Profile"
            component={Profile}
            options={{ headerShown: true, title: 'My Profile' }}
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
      <CartProvider>
        <AppNavigator />
      </CartProvider>
    </AuthProvider>
  );
}
