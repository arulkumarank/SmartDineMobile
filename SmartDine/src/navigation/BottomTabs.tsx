import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import Search from '../screens/Search';
import SurpriseMe from '../screens/SurpriseMe';
import Map from '../screens/Map';
import Profile from '../screens/Profile';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { View, StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          height: 70,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          elevation: 20,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#ff6b00',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="silverware-fork-knife" color={color} size={26} />
          ),
          tabBarLabel: 'Discover',
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

      {/* Center Tab - Surprise Me */}
      <Tab.Screen
        name="SurpriseMe"
        component={SurpriseMe}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.centerTab, focused && styles.centerTabActive]}>
              <Icon name="dice-5" color="#fff" size={30} />
            </View>
          ),
          tabBarLabel: 'Surprise',
        }}
      />

      <Tab.Screen
        name="Map"
        component={Map}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="map-marker" color={color} size={26} />
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

const styles = StyleSheet.create({
  centerTab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff6b00',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#ff6b00',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  centerTabActive: {
    transform: [{ scale: 1.1 }],
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 14,
  },
});
