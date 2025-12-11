import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { foodsAPI } from '../services/api';

export default function FoodDetail({ route, navigation }: any) {
    const { food } = route?.params || {};
    const [details, setDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (food) {
            loadFoodDetails();
        }
    }, [food]);

    const loadFoodDetails = async () => {
        try {
            setLoading(true);
            // Call the food detail API we created in Phase 1
            const response = await foodsAPI.getDetail(food.name, food.restaurant);
            setDetails(response);
        } catch (error) {
            console.error('Failed to load food details:', error);
            // Use basic info if API fails
            setDetails(food);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#ff6b00" />
                <Text style={styles.loadingText}>Loading details...</Text>
            </View>
        );
    }

    if (!details) {
        return (
            <View style={styles.centerContainer}>
                <Icon name="alert-circle-outline" size={64} color="#ff6b00" />
                <Text style={styles.errorText}>Food details not available</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Food Image - 1/4 height */}
            <Image
                source={{ uri: details.image || 'https://source.unsplash.com/600x400/?food' }}
                style={styles.foodImage}
            />

            {/* Content */}
            <View style={styles.content}>
                {/* Food Name & Restaurant */}
                <Text style={styles.foodName}>{details.name}</Text>
                <View style={styles.restaurantRow}>
                    <Icon name="store" size={18} color="#666" />
                    <Text style={styles.restaurantName}>{details.restaurant}</Text>
                    <Text style={styles.cuisine}>• {details.cuisine}</Text>
                </View>

                {/* Taste Profile */}
                {details.taste_profile && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Taste Profile</Text>
                        <View style={styles.tasteGrid}>
                            {details.taste_profile.spiciness && (
                                <View style={styles.tasteChip}>
                                    <Icon name="chili-hot" size={16} color="#ff6b00" />
                                    <Text style={styles.tasteText}>{details.taste_profile.spiciness}</Text>
                                </View>
                            )}
                            {details.taste_profile.sweetness && details.taste_profile.sweetness !== 'none' && (
                                <View style={styles.tasteChip}>
                                    <Icon name="candy" size={16} color="#ff6b00" />
                                    <Text style={styles.tasteText}>{details.taste_profile.sweetness}</Text>
                                </View>
                            )}
                            {details.taste_profile.texture && (
                                <View style={styles.tasteChip}>
                                    <Icon name="hand" size={16} color="#ff6b00" />
                                    <Text style={styles.tasteText}>{details.taste_profile.texture}</Text>
                                </View>
                            )}
                            {details.taste_profile.richness && (
                                <View style={styles.tasteChip}>
                                    <Icon name="star" size={16} color="#ff6b00" />
                                    <Text style={styles.tasteText}>{details.taste_profile.richness}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Description */}
                {details.description && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{details.description}</Text>
                    </View>
                )}

                {/* Cooking Style & Best Time */}
                <View style={styles.infoRow}>
                    {details.cooking_style && (
                        <View style={styles.infoCard}>
                            <Icon name="chef-hat" size={24} color="#ff6b00" />
                            <Text style={styles.infoLabel}>Cooking</Text>
                            <Text style={styles.infoValue}>{details.cooking_style}</Text>
                        </View>
                    )}
                    {details.best_time && (
                        <View style={styles.infoCard}>
                            <Icon name="clock-outline" size={24} color="#ff6b00" />
                            <Text style={styles.infoLabel}>Best Time</Text>
                            <Text style={styles.infoValue}>{details.best_time}</Text>
                        </View>
                    )}
                </View>

                {/* Nutritional Info */}
                {details.nutritional_info && Object.keys(details.nutritional_info).length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Nutritional Information</Text>
                        <View style={styles.nutritionGrid}>
                            {details.nutritional_info.protein && (
                                <View style={styles.nutritionItem}>
                                    <Text style={styles.nutritionValue}>{details.nutritional_info.protein}g</Text>
                                    <Text style={styles.nutritionLabel}>Protein</Text>
                                </View>
                            )}
                            {details.nutritional_info.fiber && (
                                <View style={styles.nutritionItem}>
                                    <Text style={styles.nutritionValue}>{details.nutritional_info.fiber}g</Text>
                                    <Text style={styles.nutritionLabel}>Fiber</Text>
                                </View>
                            )}
                            {details.nutritional_info.calories && (
                                <View style={styles.nutritionItem}>
                                    <Text style={styles.nutritionValue}>{details.nutritional_info.calories}</Text>
                                    <Text style={styles.nutritionLabel}>Calories</Text>
                                </View>
                            )}
                            {details.nutritional_info.carbs && (
                                <View style={styles.nutritionItem}>
                                    <Text style={styles.nutritionValue}>{details.nutritional_info.carbs}g</Text>
                                    <Text style={styles.nutritionLabel}>Carbs</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Why Popular */}
                {details.why_popular && (
                    <View style={styles.popularCard}>
                        <Icon name="heart" size={20} color="#ff6b00" />
                        <Text style={styles.popularText}>{details.why_popular}</Text>
                    </View>
                )}

                {/* Recommended Sides */}
                {details.recommended_sides && details.recommended_sides.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Goes Well With</Text>
                        <View style={styles.sidesContainer}>
                            {details.recommended_sides.map((side: string, index: number) => (
                                <View key={index} style={styles.sideChip}>
                                    <Text style={styles.sideText}>{side}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Price & Order Button */}
                <View style={styles.footer}>
                    <View>
                        <Text style={styles.priceLabel}>Price</Text>
                        <Text style={styles.price}>₹{details.price || '0'}</Text>
                    </View>
                    <TouchableOpacity style={styles.orderButton}>
                        <Text style={styles.orderButtonText}>Order Now</Text>
                        <Icon name="arrow-right" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
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
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    foodImage: {
        width: '100%',
        height: 200, // 1/4 of typical screen height
    },
    content: {
        padding: 20,
    },
    foodName: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    restaurantRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    restaurantName: {
        fontSize: 16,
        color: '#666',
        marginLeft: 6,
        fontWeight: '600',
    },
    cuisine: {
        fontSize: 16,
        color: '#888',
        marginLeft: 4,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 12,
    },
    tasteGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    tasteChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 6,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    tasteText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textTransform: 'capitalize',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#555',
    },
    infoRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    infoCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },
    infoLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 8,
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 14,
        color: '#333',
        marginTop: 4,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    nutritionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    nutritionItem: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        minWidth: 80,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    nutritionValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#ff6b00',
    },
    nutritionLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        fontWeight: '600',
    },
    popularCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff5ed',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
        gap: 12,
    },
    popularText: {
        flex: 1,
        fontSize: 15,
        color: '#555',
        lineHeight: 22,
    },
    sidesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    sideChip: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    sideText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        marginTop: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    priceLabel: {
        fontSize: 13,
        color: '#888',
        marginBottom: 4,
    },
    price: {
        fontSize: 28,
        fontWeight: '900',
        color: '#ff6b00',
    },
    orderButton: {
        flexDirection: 'row',
        backgroundColor: '#ff6b00',
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 28,
        alignItems: 'center',
        gap: 8,
        shadowColor: '#ff6b00',
        shadowOpacity: 0.4,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },
    orderButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
    },
});
