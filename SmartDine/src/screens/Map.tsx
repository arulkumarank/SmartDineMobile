import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { restaurantsAPI } from '../services/api';
import type { Restaurant } from '../types';

const { width, height } = Dimensions.get('window');

export default function Map({ navigation, route }: any) {
    const selectedRestaurant = route?.params?.restaurant; // Get selected restaurant from navigation
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [region, setRegion] = useState({
        latitude: 40.7128,
        longitude: -74.0060,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    });

    useEffect(() => {
        loadRestaurants();
    }, []);

    const loadRestaurants = async () => {
        try {
            setLoading(true);
            const response = await restaurantsAPI.getAll();
            const restaurantsWithLocation = (response.restaurants || []).filter(
                (r: Restaurant) => r.location && r.location.latitude && r.location.longitude
            );

            setRestaurants(restaurantsWithLocation);

            // If we have a selected restaurant, center on it
            if (selectedRestaurant?.location) {
                setRegion({
                    latitude: selectedRestaurant.location.latitude,
                    longitude: selectedRestaurant.location.longitude,
                    latitudeDelta: 0.05, // Zoomed in more for selected restaurant
                    longitudeDelta: 0.05,
                });
            } else if (restaurantsWithLocation.length > 0) {
                // Calculate center of all restaurants
                const avgLat = restaurantsWithLocation.reduce((sum, r) => sum + (r.location?.latitude || 0), 0) / restaurantsWithLocation.length;
                const avgLng = restaurantsWithLocation.reduce((sum, r) => sum + (r.location?.longitude || 0), 0) / restaurantsWithLocation.length;

                setRegion({
                    latitude: avgLat,
                    longitude: avgLng,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                });
            }

            setError('');
        } catch (err) {
            console.error('Failed to load restaurants:', err);
            setError('Failed to load restaurants. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkerPress = (restaurant: Restaurant) => {
        console.log('Marker pressed:', restaurant.name);
    };

    const handleViewDetails = (restaurant: Restaurant) => {
        navigation.navigate('Restaurant', restaurant);
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#ff6b00" />
                <Text style={styles.loadingText}>Loading restaurants...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Icon name="alert-circle-outline" size={64} color="#ff6b00" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadRestaurants}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header - Shows selected restaurant name if available */}
            <View style={styles.header}>
                <Icon name="map-marker-radius" size={28} color="#ff6b00" />
                <Text style={styles.headerTitle}>
                    {selectedRestaurant ? selectedRestaurant.name : 'Nearby Restaurants'}
                </Text>
            </View>

            {/* Map */}
            <MapView
                style={styles.map}
                initialRegion={region}
                region={region}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                {restaurants.map((restaurant, index) => {
                    const isSelected = selectedRestaurant && restaurant.name === selectedRestaurant.name;

                    return (
                        <Marker
                            key={index}
                            coordinate={{
                                latitude: restaurant.location?.latitude || 0,
                                longitude: restaurant.location?.longitude || 0,
                            }}
                            onPress={() => handleMarkerPress(restaurant)}
                        >
                            <View style={styles.markerContainer}>
                                <View style={[
                                    styles.marker,
                                    isSelected && styles.markerSelected
                                ]}>
                                    <Icon
                                        name="silverware-fork-knife"
                                        size={isSelected ? 30 : 20}
                                        color="#fff"
                                    />
                                </View>
                                <View style={[
                                    styles.markerArrow,
                                    isSelected && styles.markerArrowSelected
                                ]} />
                                {/* Restaurant Name Label */}
                                <View style={[
                                    styles.markerLabel,
                                    isSelected && styles.markerLabelSelected
                                ]}>
                                    <Text style={[
                                        styles.markerLabelText,
                                        isSelected && styles.markerLabelTextSelected
                                    ]} numberOfLines={1}>
                                        {restaurant.name}
                                    </Text>
                                </View>
                            </View>

                            <Callout
                                style={styles.calloutContainer}
                                onPress={() => handleViewDetails(restaurant)}
                            >
                                <View style={styles.callout}>
                                    <Text style={styles.calloutTitle}>{restaurant.name}</Text>
                                    <View style={styles.calloutDetails}>
                                        <Icon name="food" size={14} color="#666" />
                                        <Text style={styles.calloutCuisine}>{restaurant.cuisine}</Text>
                                    </View>
                                    <View style={styles.calloutDetails}>
                                        <Icon name="star" size={14} color="#ffd700" />
                                        <Text style={styles.calloutRating}>{restaurant.rating?.toFixed(1) || 'N/A'}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.viewButton}
                                        onPress={() => handleViewDetails(restaurant)}
                                    >
                                        <Text style={styles.viewButtonText}>View Details</Text>
                                        <Icon name="arrow-right" size={16} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </Callout>
                        </Marker>
                    );
                })}
            </MapView>

            {/* Restaurant Count Badge */}
            <View style={styles.badge}>
                <Icon name="store" size={18} color="#ff6b00" />
                <Text style={styles.badgeText}>{restaurants.length} Restaurants</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 30,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#ff6b00',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 24,
        shadowColor: '#ff6b00',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 10,
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1a1a1a',
        marginLeft: 12,
    },
    map: {
        flex: 1,
        width: width,
        height: height,
    },
    markerContainer: {
        alignItems: 'center',
    },
    marker: {
        backgroundColor: '#ff6b00',
        borderRadius: 25,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 8,
    },
    markerSelected: {
        width: 60,  // 50% larger
        height: 60,
        borderRadius: 30,
        borderWidth: 4,
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 12,
    },
    markerArrow: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#fff',
        marginTop: -2,
    },
    markerArrowSelected: {
        borderLeftWidth: 9,
        borderRightWidth: 9,
        borderTopWidth: 12,
    },
    markerLabel: {
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 6,
        maxWidth: 120,
    },
    markerLabelSelected: {
        backgroundColor: '#ff6b00',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        maxWidth: 150,
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    markerLabelText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#1a1a1a',
        textAlign: 'center',
    },
    markerLabelTextSelected: {
        fontSize: 13,
        fontWeight: '800',
        color: '#fff',
    },
    calloutContainer: {
        width: 200,
    },
    callout: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        minWidth: 180,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },
    calloutTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    calloutDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    calloutCuisine: {
        fontSize: 13,
        color: '#666',
        marginLeft: 6,
        fontWeight: '500',
    },
    calloutRating: {
        fontSize: 13,
        color: '#666',
        marginLeft: 6,
        fontWeight: '600',
    },
    viewButton: {
        backgroundColor: '#ff6b00',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: '#ff6b00',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },
    viewButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
        marginRight: 6,
    },
    badge: {
        position: 'absolute',
        top: 130,
        right: 20,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },
    badgeText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1a1a1a',
        marginLeft: 8,
    },
});

