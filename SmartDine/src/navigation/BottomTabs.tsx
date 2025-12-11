import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import Search from '../screens/Search';
import SurpriseMe from '../screens/SurpriseMe';
import Map from '../screens/Map';
import Profile from '../screens/Profile';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { View, StyleSheet, TouchableOpacity, Platform, Text } from 'react-native';

const Tab = createBottomTabNavigator();

// Tab bar config
const TABS_CONFIG = [
  { name: 'Home', icon: 'silverware-fork-knife', label: 'Discover' },
  { name: 'Search', icon: 'magnify', label: 'Search' },
  { name: 'SurpriseMe', icon: null, label: null }, // Center - handled separately
  { name: 'Map', icon: 'map-marker', label: 'Map' },
  { name: 'Profile', icon: 'account-circle-outline', label: 'Profile' },
];

// Custom Tab Bar with Enhanced Curve
function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.tabBarContainer}>
      {/* White Background with Curve */}
      <View style={styles.tabBarBackground}>
        {/* Left section */}
        <View style={styles.leftSection} />

        {/* Center curve cutout */}
        <View style={styles.centerCurve}>
          <View style={styles.curveLeft} />
          <View style={styles.curveGap} />
          <View style={styles.curveRight} />
        </View>

        {/* Right section */}
        <View style={styles.rightSection} />
      </View>

      {/* Tab Items */}
      <View style={styles.tabItemsContainer}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const isCenter = route.name === 'SurpriseMe';
          const config = TABS_CONFIG.find(t => t.name === route.name);

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
                activeOpacity={0.7}
              >
                <View style={[styles.centerButton, isFocused && styles.centerButtonActive]}>
                  <Icon name="star-four-points" size={30} color="#fff" />
                  {/* Small sparkle accent */}
                  <View style={styles.sparkleAccent}>
                    <Icon name="sparkle" size={12} color="#ffeb3b" />
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
              activeOpacity={0.7}
            >
              <Icon
                name={config?.icon || 'help-circle'}
                size={24}
                color={isFocused ? '#ff6b00' : '#999'}
              />
              <Text style={[
                styles.tabLabel,
                isFocused && styles.tabLabelActive
              ]}>
                {config?.label}
              </Text>
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
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Search" component={Search} />
      <Tab.Screen name="SurpriseMe" component={SurpriseMe} />
      <Tab.Screen name="Map" component={Map} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
  },
  tabBarBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  leftSection: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 25,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: -2 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  centerCurve: {
    width: 100,
    flexDirection: 'row',
  },
  curveLeft: {
    width: 50,
    backgroundColor: '#ffffff',
    borderTopRightRadius: 50,
    ...Platform.select({
      android: { elevation: 8 },
    }),
  },
  curveGap: {
    width: 0,
  },
  curveRight: {
    width: 50,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 50,
    ...Platform.select({
      android: { elevation: 8 },
    }),
  },
  rightSection: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopRightRadius: 25,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: -2 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabItemsContainer: {
    flexDirection: 'row',
    height: 75,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#ff6b00',
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -45,
  },
  centerButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ff6b00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff6b00',
    shadowOpacity: 0.6,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 15,
    borderWidth: 5,
    borderColor: '#ffffff',
  },
  centerButtonActive: {
    transform: [{ scale: 1.08 }],
    shadowOpacity: 0.8,
    shadowRadius: 22,
    elevation: 18,
  },
  sparkleAccent: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
});
