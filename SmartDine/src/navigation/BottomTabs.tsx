import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import Search from '../screens/Search';
import Cart from '../screens/Cart';
import Profile from '../screens/Profile';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          height: 60,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          elevation: 15,
        },
        tabBarActiveTintColor: "#ff8a00",
        tabBarInactiveTintColor: "#888",
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={Home}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="silverware-fork-knife" color={color} size={26} />
          ),
          tabBarLabel: "Discover"
        }}
      />

      <Tab.Screen 
        name="Search" 
        component={Search}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="magnify" color={color} size={26} />
          ),
        }}
      />

      <Tab.Screen 
        name="Cart" 
        component={Cart}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="cart-outline" color={color} size={26} />
          ),
        }}
      />

      <Tab.Screen 
        name="Profile" 
        component={Profile}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-circle-outline" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
