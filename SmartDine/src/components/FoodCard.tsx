import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { Food } from '../types';

interface Props {
    food: Food;
    onPress: () => void;
}

export default function FoodCard({ food, onPress }: Props) {
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

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <Image
                source={{ uri: food.image || 'https://source.unsplash.com/600x400/?food' }}
                style={styles.image}
            />

            <View style={styles.info}>
                <Text style={styles.foodName}>{food.name}</Text>
                <Text style={styles.restaurant}>{food.restaurant}</Text>

                <View style={styles.row}>
                    <Text style={styles.price}>${food.price.toFixed(2)}</Text>
                    {food.cuisine && (
                        <Text style={styles.cuisine}>{food.cuisine}</Text>
                    )}
                </View>

                {badges.length > 0 && (
                    <View style={styles.badgesContainer}>
                        {badges.map((badge, index) => (
                            <View key={index} style={styles.badge}>
                                <Icon name="check-circle" size={14} color="#ff6b00" />
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
        borderRadius: 15,
        marginBottom: 20,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
    },
    image: {
        width: '100%',
        height: 180,
    },
    info: {
        padding: 14,
    },
    foodName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#222',
        marginBottom: 4,
    },
    restaurant: {
        fontSize: 15,
        color: '#666',
        marginBottom: 8,
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
    cuisine: {
        fontSize: 14,
        color: '#888',
        fontStyle: 'italic',
    },
    badgesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff5ed',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    badgeText: {
        fontSize: 12,
        color: '#ff6b00',
        fontWeight: '500',
    },
});
