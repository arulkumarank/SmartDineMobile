import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import Search from '../screens/Search';
import SurpriseMe from '../screens/SurpriseMe';
import Map from '../screens/Map';
import Profile from '../screens/Profile';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const Tab = createBottomTabNavigator();

// Custom Tab Bar with Curve
function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.tabBarContainer}>
      {/* SVG Curve Background */}
      <Svg
        width="100%"
        height="70"
        viewBox="0 0 375 70"
        style={styles.svgCurve}
      >
        <Path
          d="M 0 20 Q 0 0 20 0 H 155 Q 165 0 170 10 C 175 20 180 25 187.5 25 C 195 25 200 20 205 10 Q 210 0 220 0 H 355 Q 375 0 375 20 V 70 H 0 Z"
          fill="#ffffff"
        />
      </Svg>

      {/* Tab Items */}
      <View style={styles.tabItemsContainer}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const isCenter = route.name === 'SurpriseMe';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (isCenter) {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.centerButtonContainer}
              >
                <View style={[styles.centerButton, isFocused && styles.centerButtonActive]}>
                  <Icon name="star-four-points" size={32} color="#fff" />
                  {/* Small star accent */}
                  <View style={styles.starAccent}>
                    <Icon name="star" size={10} color="#ffeb3b" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
            >
              {options.tabBarIcon?.({
                color: isFocused ? '#ff6b00' : '#888',
                size: 26,
                focused: isFocused
              })}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function BottomTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="silverware-fork-knife" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Search"
        component={Search}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="magnify" color={color} size={size} />
          ),
        }}
      />

      {/* Center Tab - Surprise Me */}
      <Tab.Screen
        name="SurpriseMe"
        component={SurpriseMe}
        options={{
          tabBarIcon: () => null, // Handled by custom tab bar
        }}
      />

      <Tab.Screen
        name="Map"
        component={Map}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="map-marker" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-circle-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
  },
  svgCurve: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: -3 },
      },
      android: {
        elevation: 10,
      },
    }),
  },
  tabItemsContainer: {
    flexDirection: 'row',
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -35,
  },
  centerButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#ff6b00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff6b00',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 12,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  centerButtonActive: {
    transform: [{ scale: 1.05 }],
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 16,
  },
  starAccent: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});

