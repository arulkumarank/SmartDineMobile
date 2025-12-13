import React, { useState, useEffect, useRef } from 'react';
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
import { useTheme } from '../context/ThemeContext';
import type { Food } from '../types';

const { width } = Dimensions.get('window');
const SURPRISE_STORAGE_KEY = '@surprise_last_loaded';
const TAPS_TO_REVEAL = 5;

export default function SurpriseMe({ navigation }: any) {
    const { isDark, colors } = useTheme();
    const [food, setFood] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [tapCount, setTapCount] = useState(0);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const confettiAnim = useRef(new Animated.Value(0)).current;
    const shineAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const revealAnim = useRef(new Animated.Value(0)).current;
    const shineAnimRef = useRef<Animated.CompositeAnimation | null>(null);
    const pulseAnimRef = useRef<Animated.CompositeAnimation | null>(null);

    // Start breathing shine animation - always running for special effect
    useEffect(() => {
        // Stop pulse when revealed (keep shine for special look)
        if (revealed) {
            pulseAnimRef.current?.stop();
            pulseAnim.setValue(1);
        }

        // Breathing shine effect - slower for polish look
        shineAnimRef.current = Animated.loop(
            Animated.sequence([
                Animated.timing(shineAnim, {
                    toValue: 1,
                    duration: 4000, // Slower: 4 seconds
                    useNativeDriver: true,
                }),
                Animated.timing(shineAnim, {
                    toValue: 0,
                    duration: 4000,
                    useNativeDriver: true,
                }),
            ])
        );

        // Gentle pulse effect for mystery card
        pulseAnimRef.current = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.02, // Subtler pulse
                    duration: 2500, // Slower: 2.5 seconds
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2500,
                    useNativeDriver: true,
                }),
            ])
        );

        shineAnimRef.current.start();
        pulseAnimRef.current.start();

        return () => {
            shineAnimRef.current?.stop();
            pulseAnimRef.current?.stop();
        };
    }, [revealed]);

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
                    console.log('Restoring saved surprise:', data.food.name);
                    setFood(data.food);
                    setRevealed(data.revealed || false);
                    setTapCount(data.tapCount || 0);

                    // If already revealed, set revealAnim to 1 so content is visible
                    if (data.revealed) {
                        revealAnim.setValue(1);
                    }

                    animateEntry();
                    return;
                }
            }

            // New day - fetch new surprise
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
        ]).start();
    };

    const animateReveal = () => {
        // Celebration animation on reveal
        Animated.parallel([
            Animated.timing(confettiAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.spring(revealAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
        ]).start();
    };

    const getRandomFood = async () => {
        setLoading(true);
        setRevealed(false);
        setTapCount(0);

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
                await AsyncStorage.setItem(SURPRISE_STORAGE_KEY, JSON.stringify({
                    date: today,
                    food: details,
                    revealed: false,
                    tapCount: 0,
                }));

                // Reset and animate
                fadeAnim.setValue(0);
                scaleAnim.setValue(0.8);
                animateEntry();
            }
        } catch (error) {
            console.error('Failed to get random food:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCardTap = async () => {
        if (revealed) {
            // Already revealed - go to details
            navigation.navigate('FoodDetail', { food });
            return;
        }

        const newTapCount = tapCount + 1;
        setTapCount(newTapCount);

        // Bounce feedback on tap
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, tension: 300, friction: 10, useNativeDriver: true }),
        ]).start();

        if (newTapCount >= TAPS_TO_REVEAL) {
            // Reveal the surprise!
            setRevealed(true);
            animateReveal();

            // Save revealed state
            const today = new Date().toDateString();
            await AsyncStorage.setItem(SURPRISE_STORAGE_KEY, JSON.stringify({
                date: today,
                food: food,
                revealed: true,
                tapCount: newTapCount,
            }));
        }
    };

    // Theme-aware styles
    const themedStyles = {
        container: { backgroundColor: isDark ? colors.background : '#fef5e7' },
        gradientBg: { backgroundColor: isDark ? colors.surface : '#fff9e6' },
        title: { color: colors.text },
        subtitle: { color: colors.textSecondary },
        foodCard: { backgroundColor: colors.card },
        foodName: { color: colors.text },
        restaurantName: { color: colors.textSecondary },
        description: { color: colors.textSecondary },
        loadingText: { color: colors.textSecondary },
        mysteryText: { color: isDark ? '#fff' : '#1a1a1a' },
        tapHint: { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)' },
    };

    // Shine interpolation
    const shineTranslate = shineAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-width, width],
    });

    const shineOpacity = shineAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0.7, 0],  // Higher intensity: 0.7 instead of 0.3
    });

    return (
        <View style={[styles.container, themedStyles.container]}>
            {/* Celebratory Background */}
            <View style={[styles.gradientBg, themedStyles.gradientBg]} />

            {/* Confetti Elements - Show on reveal */}
            {revealed && (
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
            )}

            {/* Header */}
            <View style={styles.header}>
                <Icon name="party-popper" size={36} color="#ff6b00" />
                <Text style={[styles.title, themedStyles.title]}>Surprise</Text>
                <Text style={[styles.subtitle, themedStyles.subtitle]}>
                    {revealed ? 'Your serendipitous meal awaits!' : 'Tap the card to reveal your surprise!'}
                </Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#ff6b00" />
                        <Text style={[styles.loadingText, themedStyles.loadingText]}>Creating magic...</Text>
                    </View>
                )}

                {food && !loading && (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handleCardTap}
                    >
                        <Animated.View
                            style={[
                                styles.foodCard,
                                themedStyles.foodCard,
                                {
                                    opacity: fadeAnim,
                                    transform: [
                                        { scale: revealed ? scaleAnim : Animated.multiply(scaleAnim, pulseAnim) },
                                    ],
                                },
                            ]}
                        >
                            {/* Breathing Shine Effect - Always visible for special look */}
                            <Animated.View
                                style={[
                                    styles.shineOverlay,
                                    {
                                        opacity: shineOpacity,
                                        transform: [{ translateX: shineTranslate }],
                                    },
                                ]}
                            />

                            {/* Mystery Card (before reveal) */}
                            {!revealed ? (
                                <View style={styles.mysteryCard}>
                                    <View style={styles.mysteryContent}>
                                        <Icon name="gift-outline" size={80} color="#ff6b00" />
                                        <Text style={[styles.mysteryText, themedStyles.mysteryText]}>
                                            Mystery Dish
                                        </Text>
                                        <Text style={[styles.tapHint, themedStyles.tapHint]}>
                                            Tap {TAPS_TO_REVEAL - tapCount} more times to reveal
                                        </Text>

                                        {/* Progress dots */}
                                        <View style={styles.progressDots}>
                                            {Array.from({ length: TAPS_TO_REVEAL }).map((_, i) => (
                                                <View
                                                    key={i}
                                                    style={[
                                                        styles.progressDot,
                                                        i < tapCount && styles.progressDotActive,
                                                    ]}
                                                />
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                /* Revealed Food Card */
                                <Animated.View style={{ opacity: revealAnim }}>
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
                                        <Text style={[styles.foodName, themedStyles.foodName]}>{food.name}</Text>

                                        <View style={styles.restaurantRow}>
                                            <Icon name="store" size={16} color={colors.textSecondary} />
                                            <Text style={[styles.restaurantName, themedStyles.restaurantName]}>
                                                {food.restaurant}
                                            </Text>
                                        </View>

                                        {/* Taste Profile Chips */}
                                        {food.taste_profile && (
                                            <View style={styles.tasteRow}>
                                                {food.taste_profile.spiciness && (
                                                    <View style={[styles.tasteChip, { backgroundColor: isDark ? colors.surface : '#fff5ed' }]}>
                                                        <Icon name="chili-hot" size={14} color="#ff6b00" />
                                                        <Text style={styles.tasteText}>{food.taste_profile.spiciness}</Text>
                                                    </View>
                                                )}
                                                {food.taste_profile.texture && (
                                                    <View style={[styles.tasteChip, { backgroundColor: isDark ? colors.surface : '#fff5ed' }]}>
                                                        <Icon name="hand" size={14} color="#ff6b00" />
                                                        <Text style={styles.tasteText}>{food.taste_profile.texture}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        )}

                                        {/* Description */}
                                        {food.description && (
                                            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={3}>
                                                {food.description}
                                            </Text>
                                        )}

                                        {/* Why Popular */}
                                        {food.why_popular && (
                                            <View style={[styles.popularBadge, { backgroundColor: isDark ? colors.surface : '#fce4ec' }]}>
                                                <Icon name="heart" size={16} color="#e91e63" />
                                                <Text style={[styles.popularText, { color: colors.textSecondary }]} numberOfLines={2}>
                                                    {food.why_popular}
                                                </Text>
                                            </View>
                                        )}

                                        {/* Footer with price and action */}
                                        <View style={styles.footer}>
                                            <Text style={styles.price}>₹{food.price || '0'}</Text>
                                            <View style={styles.tapHintSmall}>
                                                <Text style={styles.tapHintText}>Tap for details</Text>
                                                <Icon name="arrow-right" size={16} color="#ff6b00" />
                                            </View>
                                        </View>
                                    </View>
                                </Animated.View>
                            )}
                        </Animated.View>
                    </TouchableOpacity>
                )}
            </View>
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
        textAlign: 'center',
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
    foodCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#ff6b00',
        shadowOpacity: 0.4,
        shadowRadius: 30,
        shadowOffset: { width: 0, height: 12 },
        elevation: 25,
    },
    shineOverlay: {
        position: 'absolute',
        top: -30,
        bottom: -30,
        width: 120,
        backgroundColor: 'rgba(255,255,255,0.6)',  // Much brighter
        zIndex: 10,
        transform: [{ skewX: '-20deg' }],
    },
    mysteryCard: {
        height: 350,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'linear-gradient(135deg, #ff6b00 0%, #ff9e4a 100%)',
    },
    mysteryContent: {
        alignItems: 'center',
        padding: 40,
    },
    mysteryText: {
        fontSize: 28,
        fontWeight: '900',
        marginTop: 20,
        marginBottom: 10,
    },
    tapHint: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 8,
    },
    progressDots: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 8,
    },
    progressDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'rgba(255,107,0,0.3)',
        borderWidth: 2,
        borderColor: '#ff6b00',
    },
    progressDotActive: {
        backgroundColor: '#ff6b00',
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
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    price: {
        fontSize: 28,
        fontWeight: '900',
        color: '#ff6b00',
    },
    tapHintSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    tapHintText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ff6b00',
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    popularBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 8,
        marginBottom: 12,
    },
    popularText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
});

