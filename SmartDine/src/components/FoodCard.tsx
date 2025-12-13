import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import type { Food } from '../types';

interface Props {
    food: Food;
    onPress: () => void;
    compact?: boolean; // For 2-column grid layout
}

export default function FoodCard({ food, onPress, compact = false }: Props) {
    const { colors } = useTheme();

    const renderNutritionBadges = () => {
        const badges = [];

        if (food.nutritional_info?.protein && food.nutritional_info.protein >= 20) {
            badges.push('High Protein');
        }
        if (food.nutritional_info?.fiber && food.nutritional_info.fiber >= 5) {
            badges.push('High Fiber');
        }
        if (food.is_gluten_free) {
            badges.push('Gluten-Free');
        }
        if (food.is_vegetarian) {
            badges.push('Vegetarian');
        }

        return badges;
    };

    const badges = renderNutritionBadges();

    const themedStyles = {
        card: { backgroundColor: colors.card },
        foodName: { color: colors.text },
        restaurant: { color: colors.textSecondary },
    };

    return (
        <TouchableOpacity style={[styles.card, compact && styles.cardCompact, themedStyles.card]} onPress={onPress}>
            <Image
                source={{ uri: food.image || 'https://source.unsplash.com/600x400/?food' }}
                style={compact ? styles.imageCompact : styles.image}
            />

            <View style={compact ? styles.infoCompact : styles.info}>
                <Text style={[compact ? styles.foodNameCompact : styles.foodName, themedStyles.foodName]} numberOfLines={1}>
                    {food.name}
                </Text>
                <Text style={[compact ? styles.restaurantCompact : styles.restaurant, themedStyles.restaurant]} numberOfLines={1}>
                    {food.restaurant}
                </Text>

                <View style={styles.row}>
                    <Text style={compact ? styles.priceCompact : styles.price}>
                        ₹{typeof food.price === 'number' ? food.price.toFixed(0) : food.price}
                    </Text>
                </View>

                {!compact && badges.length > 0 && (
                    <View style={styles.badgesContainer}>
                        {badges.slice(0, 2).map((badge, index) => (
                            <View key={index} style={styles.badge}>
                                <Icon name="check-circle" size={12} color="#ff6b00" />
                                <Text style={styles.badgeText}>{badge}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        marginBottom: 20,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
    },
    cardCompact: {
        marginBottom: 0,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    image: {
        width: '100%',
        height: 180,
    },
    imageCompact: {
        width: '100%',
        height: 100,
    },
    info: {
        padding: 14,
    },
    infoCompact: {
        padding: 10,
    },
    foodName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#222',
        marginBottom: 4,
    },
    foodNameCompact: {
        fontSize: 14,
        fontWeight: '700',
        color: '#222',
        marginBottom: 3,
    },
    restaurant: {
        fontSize: 15,
        color: '#666',
        marginBottom: 8,
    },
    restaurantCompact: {
        fontSize: 12,
        color: '#666',
        marginBottom: 6,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    price: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ff6b00',
    },
    priceCompact: {
        fontSize: 15,
        fontWeight: '700',
        color: '#ff6b00',
    },
    cuisine: {
        fontSize: 14,
        color: '#888',
        fontStyle: 'italic',
    },
    badgesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff5ed',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
        gap: 3,
    },
    badgeText: {
        fontSize: 10,
        color: '#ff6b00',
        fontWeight: '500',
    },
});
