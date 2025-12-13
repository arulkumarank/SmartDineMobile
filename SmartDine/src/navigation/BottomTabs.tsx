import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import Search from '../screens/Search';
import SurpriseMe from '../screens/SurpriseMe';
import Map from '../screens/Map';
import Cart from '../screens/Cart';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { View, StyleSheet, TouchableOpacity, Platform, Text } from 'react-native';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

// Tab bar config - Cart replaces Profile
const TABS_CONFIG = [
  { name: 'Home', icon: 'silverware-fork-knife', label: 'Discover' },
  { name: 'Search', icon: 'magnify', label: 'Search' },
  { name: 'SurpriseMe', icon: null, label: null }, // Center - handled separately
  { name: 'Map', icon: 'map-marker', label: 'Map' },
  { name: 'Cart', icon: 'cart-outline', label: 'Cart' },
];

// Custom Tab Bar with Enhanced Curve - THEME AWARE
function CustomTabBar({ state, descriptors, navigation }: any) {
  const { colors, isDark } = useTheme();

  const tabBarBg = isDark ? colors.card : '#ffffff';
  const inactiveColor = colors.textSecondary;
  const borderColor = isDark ? colors.border : '#ffffff';
  const shadowColor = isDark ? '#000' : '#000';

  return (
    <View style={styles.tabBarContainer}>
      {/* Curved Background with Theme Support */}
      <View style={styles.tabBarBackground}>
        {/* Left section - more curvy */}
        <View style={[
          styles.leftSection,
          {
            backgroundColor: tabBarBg,
            shadowColor: shadowColor,
          }
        ]} />

        {/* Center curve cutout - deeper curve */}
        <View style={styles.centerCurve}>
          <View style={[styles.curveLeft, { backgroundColor: tabBarBg }]} />
          <View style={styles.curveGap} />
          <View style={[styles.curveRight, { backgroundColor: tabBarBg }]} />
        </View>

        {/* Right section - more curvy */}
        <View style={[
          styles.rightSection,
          {
            backgroundColor: tabBarBg,
            shadowColor: shadowColor,
          }
        ]} />
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
                <View style={[
                  styles.centerButton,
                  { borderColor: tabBarBg },
                  isFocused && styles.centerButtonActive
                ]}>
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
                color={isFocused ? '#ff6b00' : inactiveColor}
              />
              <Text style={[
                styles.tabLabel,
                { color: isFocused ? '#ff6b00' : inactiveColor },
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
        tabBarHideOnKeyboard: true,
        // Smooth fade animation for tab switches
        animation: 'fade',
      }}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Search" component={Search} />
      <Tab.Screen name="SurpriseMe" component={SurpriseMe} />
      <Tab.Screen name="Map" component={Map} />
      <Tab.Screen name="Cart" component={Cart} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  tabBarBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  leftSection: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 0,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.15,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: -4 },
      },
      android: {
        elevation: 12,
      },
    }),
  },
  centerCurve: {
    width: 90,
    flexDirection: 'row',
  },
  curveLeft: {
    width: 45,
    borderTopRightRadius: 45,
    ...Platform.select({
      android: { elevation: 12 },
    }),
  },
  curveGap: {
    width: 0,
  },
  curveRight: {
    width: 45,
    borderTopLeftRadius: 45,
    ...Platform.select({
      android: { elevation: 12 },
    }),
  },
  rightSection: {
    flex: 1,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 0,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.15,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: -4 },
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabItemsContainer: {
    flexDirection: 'row',
    height: 80,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: '#ff6b00',
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -50,
  },
  centerButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ff6b00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff6b00',
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 18,
    borderWidth: 5,
  },
  centerButtonActive: {
    transform: [{ scale: 1.1 }],
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 22,
  },
  sparkleAccent: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
});
