import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';

interface Restaurant {
  name: string;
  rating: number;
  cuisine: string;
  deliveryTime: string;
  latitude?: number;
  longitude?: number;
}

export default function MapScreen({ navigation }: any) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [userLocation, setUserLocation] = useState({
    latitude: 11.1085,
    longitude: 77.3411,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserLocation();
    loadRestaurants();
  }, []);

  async function getUserLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to show nearby restaurants');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadRestaurants() {
    try {
      const res = await axios.get('http://10.164.233.54:8000/restaurants');
      
      // Add mock coordinates near user location (Tiruppur area)
      const restaurantsWithLocation = res.data.map((restaurant: Restaurant, index: number) => ({
        ...restaurant,
        latitude: 11.1085 + (Math.random() - 0.5) * 0.04,
        longitude: 77.3411 + (Math.random() - 0.5) * 0.04,
      }));
      
      setRestaurants(restaurantsWithLocation);
    } catch (error) {
      console.error('Error loading restaurants:', error);
    }
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff8a00" />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      ) : (
        <>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={userLocation}
            showsUserLocation
            showsMyLocationButton
          >
            {restaurants.map((restaurant, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: restaurant.latitude || 0,
                  longitude: restaurant.longitude || 0,
                }}
                title={restaurant.name}
                description={`${restaurant.cuisine} • ${restaurant.rating}⭐`}
                onPress={() => setSelectedRestaurant(restaurant)}
              >
                <View style={styles.markerContainer}>
                  <Icon name="silverware-fork-knife" size={20} color="#fff" />
                </View>
              </Marker>
            ))}
          </MapView>

          {selectedRestaurant && (
            <View style={styles.bottomSheet}>
              <View style={styles.sheetHeader}>
                <View style={styles.sheetHandle} />
              </View>
              <View style={styles.sheetContent}>
                <Text style={styles.restaurantName}>{selectedRestaurant.name}</Text>
                <View style={styles.restaurantDetails}>
                  <View style={styles.detailItem}>
                    <Icon name="star" size={16} color="#ffc107" />
                    <Text style={styles.detailText}>{selectedRestaurant.rating}</Text>
                  </View>
                  <View style={styles.dot} />
                  <Text style={styles.detailText}>{selectedRestaurant.cuisine}</Text>
                  <View style={styles.dot} />
                  <View style={styles.detailItem}>
                    <Icon name="clock-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{selectedRestaurant.deliveryTime}</Text>
                  </View>
                </View>
                <View style={styles.sheetActions}>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() =>
                      navigation.navigate('RestaurantDetail', { restaurant: selectedRestaurant })
                    }
                  >
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSelectedRestaurant(null)}
                  >
                    <Icon name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.listButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="format-list-bulleted" size={24} color="#fff" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff8a00',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetHeader: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
  },
  sheetContent: {
    padding: 20,
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  restaurantDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#999',
    marginHorizontal: 8,
  },
  sheetActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#ff8a00',
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 12,
  },
  viewButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listButton: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ff8a00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});