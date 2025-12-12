import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Animated,
    Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { foodsAPI } from '../services/api';
import type { Food } from '../types';

const { width } = Dimensions.get('window');
const SURPRISE_STORAGE_KEY = '@surprise_last_loaded';

export default function SurpriseMe({ navigation }: any) {
    const [food, setFood] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const fadeAnim = useState(new Animated.Value(0))[0];
    const scaleAnim = useState(new Animated.Value(0))[0];
    const confettiAnim = useState(new Animated.Value(0))[0];

    // Auto-fetch on mount
    useEffect(() => {
        checkAndLoadSurprise();
    }, []);

    const checkAndLoadSurprise = async () => {
        try {
            const dataStr = await AsyncStorage.getItem(SURPRISE_STORAGE_KEY);
            const today = new Date().toDateString();

            if (dataStr) {
                const data = JSON.parse(dataStr);
                if (data.date === today && data.food) {
                    // Loaded today! Restore food
                    console.log('Restoring saved surprise:', data.food.name);
                    setFood(data.food);
                    animateEntry();
                    return;
                }
            }

            // Not loaded today or data missing, fetch new
            await getRandomFood();
        } catch (error) {
            console.error('Error loading surprise:', error);
            getRandomFood();
        }
    };

    const animateEntry = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, tension: 40, friction: 7, useNativeDriver: true }),
            Animated.timing(confettiAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ]).start();
    };

    const getRandomFood = async () => {
        setLoading(true);

        try {
            const response = await foodsAPI.getAll();
            const foods = response.foods || [];

            if (foods.length > 0) {
                const randomIndex = Math.floor(Math.random() * foods.length);
                const randomFood = foods[randomIndex];
                const details = await foodsAPI.getDetail(randomFood.name, randomFood.restaurant);

                setFood(details);

                // Save to storage
                const today = new Date().toDateString();
                const savePayload = JSON.stringify({ date: today, food: details });
                await AsyncStorage.setItem(SURPRISE_STORAGE_KEY, savePayload);

                // Reset animations before playing
                fadeAnim.setValue(0);
                scaleAnim.setValue(0);
                confettiAnim.setValue(0);
                animateEntry();
            }
        } catch (error) {
            console.error('Failed to get random food:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        // Clear storage to force new fetch
        await AsyncStorage.removeItem(SURPRISE_STORAGE_KEY);
        setFood(null); // Reset UI
        await getRandomFood();
    };

    return (
        <View style={styles.container}>
            {/* Celebratory Background */}
            <View style={styles.gradientBg} />

            {/* Confetti Elements */}
            <Animated.View
                style={[
                    styles.confettiContainer,
                    {
                        opacity: confettiAnim,
                        transform: [{
                            translateY: confettiAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-50, 0],
                            }),
                        }],
                    },
                ]}
            >
                <Icon name="star-four-points" size={24} color="#ffeb3b" style={[styles.confetti, { top: 60, left: 30 }]} />
                <Icon name="star-four-points" size={18} color="#ff6b00" style={[styles.confetti, { top: 80, right: 50 }]} />
                <Icon name="sparkle" size={20} color="#4caf50" style={[styles.confetti, { top: 100, left: width - 60 }]} />
                <Icon name="star" size={16} color="#2196f3" style={[styles.confetti, { top: 120, left: 80 }]} />
                <Icon name="sparkle" size={22} color="#e91e63" style={[styles.confetti, { top: 140, right: 30 }]} />
            </Animated.View>

            {/* Header */}
            <View style={styles.header}>
                <Icon name="party-popper" size={36} color="#ff6b00" />
                <Text style={styles.title}>Surprise</Text>
                <Text style={styles.subtitle}>Your serendipitous meal awaits!</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#ff6b00" />
                        <Text style={styles.loadingText}>Creating magic...</Text>
                    </View>
                )}

                {!loading && !food && (
                    <View style={styles.emptyState}>
                        <Icon name="calendar-check" size={80} color="#ddd" />
                        <Text style={styles.emptyText}>You've already received your</Text>
                        <Text style={styles.emptyText}>surprise for today!</Text>
                        <Text style={styles.emptyHint}>Come back tomorrow or tap refresh ↻</Text>
                    </View>
                )}

                {food && !loading && (
                    <Animated.View
                        style={[
                            styles.foodCard,
                            {
                                opacity: fadeAnim,
                                transform: [{ scale: scaleAnim }],
                            },
                        ]}
                    >
                        {/* Food Image with Celebration Badge */}
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: food.image || 'https://source.unsplash.com/600x400/?food' }}
                                style={styles.foodImage}
                            />
                            <View style={styles.celebrationBadge}>
                                <Icon name="gift" size={20} color="#fff" />
                            </View>
                        </View>

                        <View style={styles.foodInfo}>
                            <Text style={styles.foodName}>{food.name}</Text>

                            <View style={styles.restaurantRow}>
                                <Icon name="store" size={16} color="#666" />
                                <Text style={styles.restaurantName}>{food.restaurant}</Text>
                            </View>

                            {/* Taste Profile Chips */}
                            {food.taste_profile && (
                                <View style={styles.tasteRow}>
                                    {food.taste_profile.spiciness && (
                                        <View style={styles.tasteChip}>
                                            <Icon name="chili-hot" size={14} color="#ff6b00" />
                                            <Text style={styles.tasteText}>{food.taste_profile.spiciness}</Text>
                                        </View>
                                    )}
                                    {food.taste_profile.texture && (
                                        <View style={styles.tasteChip}>
                                            <Icon name="hand" size={14} color="#ff6b00" />
                                            <Text style={styles.tasteText}>{food.taste_profile.texture}</Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Description */}
                            {food.description && (
                                <Text style={styles.description} numberOfLines={3}>
                                    {food.description}
                                </Text>
                            )}

                            {/* Why Popular */}
                            {food.why_popular && (
                                <View style={styles.popularBadge}>
                                    <Icon name="heart" size={16} color="#e91e63" />
                                    <Text style={styles.popularText} numberOfLines={2}>
                                        {food.why_popular}
                                    </Text>
                                </View>
                            )}

                            {/* Price & Action */}
                            <View style={styles.footer}>
                                <Text style={styles.price}>₹{food.price || '0'}</Text>
                                <TouchableOpacity
                                    style={styles.detailsButton}
                                    onPress={() => navigation.navigate('FoodDetail', { food })}
                                >
                                    <Text style={styles.detailsButtonText}>Full Details</Text>
                                    <Icon name="arrow-right" size={18} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animated.View>
                )}
            </View>

            {/* Refresh Button - Bottom Right */}
            <TouchableOpacity
                style={styles.refreshButton}
                onPress={handleRefresh}
                disabled={loading}
            >
                <Icon name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fef5e7',
    },
    gradientBg: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 300,
        backgroundColor: '#fff9e6',
    },
    confettiContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
    },
    confetti: {
        position: 'absolute',
    },
    header: {
        backgroundColor: 'transparent',
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 36,
        fontWeight: '900',
        color: '#1a1a1a',
        marginTop: 12,
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        marginTop: 6,
        fontStyle: 'italic',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.7,
    },
    emptyText: {
        fontSize: 18,
        color: '#888',
        marginTop: 16,
        textAlign: 'center',
    },
    emptyHint: {
        fontSize: 14,
        color: '#ff6b00',
        marginTop: 12,
        fontWeight: '600',
    },
    foodCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#ff6b00',
        shadowOpacity: 0.2,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 15,
    },
    imageContainer: {
        position: 'relative',
    },
    foodImage: {
        width: '100%',
        height: 200,
    },
    celebrationBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: '#ff6b00',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#ff6b00',
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 8,
    },
    foodInfo: {
        padding: 20,
    },
    foodName: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    restaurantRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    restaurantName: {
        fontSize: 14,
        color: '#666',
        marginLeft: 6,
        fontWeight: '600',
    },
    tasteRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    tasteChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff5ed',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    tasteText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ff6b00',
        textTransform: 'capitalize',
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        color: '#555',
        marginBottom: 12,
    },
    popularBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fce4ec',
        padding: 12,
        borderRadius: 12,
        gap: 8,
        marginBottom: 16,
    },
    popularText: {
        flex: 1,
        fontSize: 13,
        color: '#555',
        lineHeight: 18,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 28,
        fontWeight: '900',
        color: '#ff6b00',
    },
    detailsButton: {
        flexDirection: 'row',
        backgroundColor: '#ff6b00',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignItems: 'center',
        gap: 6,
        shadowColor: '#ff6b00',
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 6,
    },
    detailsButtonText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#fff',
    },
    refreshButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#ff6b00',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#ff6b00',
        shadowOpacity: 0.5,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 10,
    },
});
