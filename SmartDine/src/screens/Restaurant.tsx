import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { restaurantsAPI } from '../services/api';
import FoodCard from '../components/FoodCard';
import type { Food } from '../types';

export default function Restaurant({ route, navigation }: any) {
  const restaurant = route?.params || {
    name: 'Restaurant Name',
    cuisine: 'Cuisine',
    rating: 4.5,
    image: 'https://source.unsplash.com/600x400/?restaurant',
    location: {
      address: '123 Main St',
      latitude: 0,
      longitude: 0,
    },
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

  const handleAddressClick = () => {
    if (restaurant.location) {
      // Navigate to Map screen with restaurant location
      navigation.navigate('Map', { restaurant });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: restaurant.image }} style={styles.coverImage} />

      <View style={styles.content}>
        <Text style={styles.title}>{restaurant.name}</Text>

        <View style={styles.row}>
          <Icon name="star" size={20} color="#ff6b00" />
          <Text style={styles.rating}>{restaurant.rating}</Text>
          <Text style={styles.cuisine}>• {restaurant.cuisine}</Text>
        </View>

        {restaurant.location && (
          <TouchableOpacity
            style={styles.addressContainer}
            onPress={handleAddressClick}>
            <Icon name="map-marker" size={20} color="#ff6b00" />
            <Text style={styles.address}>{restaurant.location.address}</Text>
            <Icon name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>
        )}

        <Text style={styles.menuTitle}>Menu</Text>

        {/* Menu Items in 2-column Grid */}
        {menuItems.length > 0 ? (
          <View style={styles.menuGrid}>
            {menuItems.map((item, index) => (
              <View key={index} style={styles.menuCardWrapper}>
                <FoodCard food={item} onPress={() => { }} compact />
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.menuNote}>
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
  coverImage: {
    width: '100%',
    height: 250,
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
