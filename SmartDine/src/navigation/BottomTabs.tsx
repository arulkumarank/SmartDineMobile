// src/navigation/BottomTabs.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/Home';
import SearchScreen from '../screens/Search';
import CartScreen from '../screens/Cart';
import ProfileScreen from '../screens/Profile';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTopWidth: 0,
          position: 'absolute',
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 20,
        },
        tabBarActiveTintColor: "#ff8a00",
        tabBarInactiveTintColor: "#999",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Icon 
              name={focused ? "home" : "home-outline"} 
              color={color} 
              size={28} 
            />
          ),
          tabBarLabel: "Home"
        }}
      />

      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Icon 
              name={focused ? "magnify" : "magnify"} 
              color={color} 
              size={28} 
            />
          ),
        }}
      />

      <Tab.Screen 
        name="Cart" 
        component={CartScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Icon 
              name={focused ? "cart" : "cart-outline"} 
              color={color} 
              size={28} 
            />
          ),
          tabBarBadge: 2,
          tabBarBadgeStyle: {
            backgroundColor: "#ff8a00",
            color: "#fff",
            fontSize: 10,
            fontWeight: "700",
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            marginTop: 4,
          },
        }}
      />

      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Icon 
              name={focused ? "account-circle" : "account-circle-outline"} 
              color={color} 
              size={28} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}