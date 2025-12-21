import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { restaurantsAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import FoodCard from '../../components/FoodCard';
import type { Food } from '../../types';

export default function Restaurant({ route, navigation }: any) {
  const { isDark, colors } = useTheme();

  // Handle different navigation patterns:
  // - From Map: { restaurant: {...} }
  // - From Home/Other: params is the restaurant directly
  const params = route?.params || {};
  const restaurant = params.restaurant || params || {
    name: 'Restaurant Name',
    cuisine: 'Cuisine',
    rating: 4.5,
    image: 'https://source.unsplash.com/600x400/?restaurant',
    location: null,
  };

  // Generate address from coordinates if not available
  const getAddress = () => {
    if (restaurant.location?.address) {
      return restaurant.location.address;
    }
    // Fallback: show coordinates or restaurant name
    if (restaurant.location?.latitude && restaurant.location?.longitude) {
      return `${restaurant.name}, Chennai`;
    }
    return 'View on Map';
  };

  const [menuItems, setMenuItems] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      // Get all restaurants and find this one
      const response = await restaurantsAPI.getAll();
      const foundRestaurant = response.restaurants.find(
        (r: any) => r.name === restaurant.name
      );

      if (foundRestaurant && foundRestaurant.menu) {
        // Convert menu items to Food format
        const foods: Food[] = foundRestaurant.menu.map((item: any) => ({
          name: item.name,
          restaurant: restaurant.name,
          price: item.price,
          image: item.image || restaurant.image,
          cuisine: restaurant.cuisine,
          rating: restaurant.rating,
          is_vegetarian: item.diet === 'veg',
          nutritional_info: item.nutritional_info || {},
        }));
        setMenuItems(foods);
      }
    } catch (error) {
      console.error('Failed to load menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const openGoogleMaps = () => {
    if (restaurant.location) {
      const { latitude, longitude, address } = restaurant.location;

      // Create Google Maps URL
      let mapsUrl = '';
      if (latitude && longitude && latitude !== 0 && longitude !== 0) {
        mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      } else {
        // Use address for search
        const query = encodeURIComponent(`${restaurant.name} ${address || ''}`);
        mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
      }

      Linking.openURL(mapsUrl).catch(err => {
        console.error('Failed to open maps:', err);
        // Fallback: navigate to in-app map
        navigation.navigate('Map', { restaurant });
      });
    }
  };

  const handleAddressClick = () => {
    if (restaurant.location) {
      // Navigate to Map screen with restaurant location
      navigation.navigate('Map', { restaurant });
    }
  };

  // Theme-aware styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    content: { backgroundColor: colors.surface },
    title: { color: colors.text },
    rating: { color: colors.textSecondary },
    cuisine: { color: colors.textSecondary },
    addressContainer: { backgroundColor: colors.card },
    address: { color: colors.text },
    menuTitle: { color: colors.text },
    menuNote: { color: colors.textSecondary },
  };

  return (
    <ScrollView style={[styles.container, themedStyles.container]}>
      {/* Cover Image with Floating Maps Button */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: restaurant.image }} style={styles.coverImage} />

        {/* Floating Google Maps Button - Top Right */}
        <TouchableOpacity
          style={styles.mapsButton}
          onPress={openGoogleMaps}
          activeOpacity={0.8}
        >
          <Icon name="google-maps" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.content, themedStyles.content]}>
        <Text style={[styles.title, themedStyles.title]}>{restaurant.name}</Text>

        <View style={styles.row}>
          <Icon name="star" size={20} color="#ff6b00" />
          <Text style={[styles.rating, themedStyles.rating]}>{restaurant.rating}</Text>
          <Text style={[styles.cuisine, themedStyles.cuisine]}>• {restaurant.cuisine}</Text>
        </View>

        {/* Address section - always show with fallback */}
        <TouchableOpacity
          style={[styles.addressContainer, themedStyles.addressContainer]}
          onPress={handleAddressClick}>
          <Icon name="map-marker" size={20} color="#ff6b00" />
          <Text style={[styles.address, themedStyles.address]}>{getAddress()}</Text>
          <Icon name="chevron-right" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <Text style={[styles.menuTitle, themedStyles.menuTitle]}>Menu</Text>

        {/* Menu Items in 2-column Grid */}
        {menuItems.length > 0 ? (
          <View style={styles.menuGrid}>
            {menuItems.map((item, index) => (
              <View key={index} style={styles.menuCardWrapper}>
                <FoodCard
                  food={item}
                  onPress={() => navigation.navigate('FoodDetail', { food: item })}
                  compact
                />
              </View>
            ))}
          </View>
        ) : (
          <Text style={[styles.menuNote, themedStyles.menuNote]}>
            {loading ? 'Loading menu...' : 'No menu items available'}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  imageContainer: {
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: 250,
  },
  mapsButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ff6b00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rating: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
    marginLeft: 5,
  },
  cuisine: {
    fontSize: 17,
    color: '#666',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  address: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 15,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -10,
  },
  menuCardWrapper: {
    width: '50%',
    padding: 10,
  },
  menuNote: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});
