import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface SkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: any;
}

// Single skeleton box with breathing animation
export const SkeletonBox = ({
    width: boxWidth = '100%',
    height = 20,
    borderRadius = 8,
    style
}: SkeletonProps) => {
    const { isDark, colors } = useTheme();
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, []);

    return (
        <Animated.View
            style={[
                {
                    width: boxWidth,
                    height,
                    borderRadius,
                    backgroundColor: isDark ? '#3a3a3a' : '#e0e0e0',
                    opacity,
                },
                style,
            ]}
        />
    );
};

// Food card skeleton
export const FoodCardSkeleton = () => {
    const { isDark, colors } = useTheme();

    return (
        <View style={[styles.foodCard, { backgroundColor: isDark ? colors.card : '#fff' }]}>
            <SkeletonBox height={120} borderRadius={12} />
            <View style={styles.foodCardContent}>
                <SkeletonBox width="70%" height={18} style={{ marginBottom: 8 }} />
                <SkeletonBox width="50%" height={14} style={{ marginBottom: 8 }} />
                <View style={styles.row}>
                    <SkeletonBox width={60} height={14} />
                    <SkeletonBox width={40} height={14} />
                </View>
            </View>
        </View>
    );
};

// Restaurant card skeleton
export const RestaurantCardSkeleton = () => {
    const { isDark, colors } = useTheme();

    return (
        <View style={[styles.restaurantCard, { backgroundColor: isDark ? colors.card : '#fff' }]}>
            <SkeletonBox height={140} borderRadius={16} />
            <View style={styles.restaurantContent}>
                <SkeletonBox width="60%" height={20} style={{ marginBottom: 8 }} />
                <SkeletonBox width="40%" height={14} style={{ marginBottom: 8 }} />
                <View style={styles.row}>
                    <SkeletonBox width={50} height={24} borderRadius={12} />
                    <SkeletonBox width={80} height={14} />
                </View>
            </View>
        </View>
    );
};

// Horizontal list skeleton (for Discover Foods)
export const HorizontalListSkeleton = ({ count = 4 }: { count?: number }) => {
    return (
        <View style={styles.horizontalList}>
            {Array.from({ length: count }).map((_, i) => (
                <FoodCardSkeleton key={i} />
            ))}
        </View>
    );
};

// Grid skeleton (for restaurants)
export const GridSkeleton = ({ count = 4 }: { count?: number }) => {
    return (
        <View style={styles.grid}>
            {Array.from({ length: count }).map((_, i) => (
                <View key={i} style={styles.gridItem}>
                    <RestaurantCardSkeleton />
                </View>
            ))}
        </View>
    );
};

// Full page loading skeleton for Home screen
export const HomeScreenSkeleton = () => {
    const { isDark, colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.background : '#f8f9fa' }]}>
            {/* Search bar skeleton */}
            <View style={styles.searchSection}>
                <SkeletonBox height={50} borderRadius={25} />
            </View>

            {/* Discover Foods section */}
            <View style={styles.section}>
                <SkeletonBox width={150} height={24} style={{ marginBottom: 16 }} />
                <HorizontalListSkeleton count={3} />
            </View>

            {/* Discover Restaurants section */}
            <View style={styles.section}>
                <SkeletonBox width={180} height={24} style={{ marginBottom: 16 }} />
                <GridSkeleton count={2} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    searchSection: {
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    foodCard: {
        width: 160,
        marginRight: 12,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    foodCardContent: {
        padding: 12,
    },
    restaurantCard: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    restaurantContent: {
        padding: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    horizontalList: {
        flexDirection: 'row',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
    gridItem: {
        width: '50%',
        padding: 6,
    },
});

export default {
    SkeletonBox,
    FoodCardSkeleton,
    RestaurantCardSkeleton,
    HorizontalListSkeleton,
    GridSkeleton,
    HomeScreenSkeleton,
};
