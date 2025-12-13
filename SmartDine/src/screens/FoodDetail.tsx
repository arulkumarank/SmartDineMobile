import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { foodsAPI, restaurantsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export default function FoodDetail({ route, navigation }: any) {
    const { isDark, colors } = useTheme();
    const { food } = route?.params || {};
    const [details, setDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showCartModal, setShowCartModal] = useState(false);
    const { addToCart } = useCart();

    useEffect(() => {
        if (food) {
            loadFoodDetails();
        }
    }, [food]);

    const loadFoodDetails = async () => {
        try {
            setLoading(true);
            console.log('Loading food details:', food?.name, 'from', food?.restaurant);

            // Call the food detail API for AI-enhanced info
            const response = await foodsAPI.getDetail(food.name, food.restaurant);
            console.log('API response:', response);

            if (response && response.name) {
                setDetails(response);
            } else {
                console.log('API did not return valid food data, using basic food data');
                // Use basic info if API doesn't return valid data
                setDetails(food);
            }
        } catch (error) {
            console.error('Failed to load food details:', error);
            // Use basic info from route params as fallback
            setDetails(food);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (details) {
            addToCart({
                name: details.name,
                restaurant: details.restaurant,
                price: details.price || 0,
                image: details.image,
                cuisine: details.cuisine,
                rating: details.rating,
            });
            // Show styled modal
            setShowCartModal(true);
            // Auto-hide after 2 seconds
            setTimeout(() => setShowCartModal(false), 2000);
        }
    };

    const handleRestaurantPress = async () => {
        try {
            const response = await restaurantsAPI.getAll();
            const restaurant = response.restaurants?.find(
                (r: any) => r.name === details.restaurant
            );
            if (restaurant) {
                navigation.navigate('Restaurant', restaurant);
            }
        } catch (error) {
            console.error('Failed to navigate to restaurant:', error);
        }
    };

    // Theme-aware styles
    const themedStyles = {
        container: { backgroundColor: colors.background },
        centerContainer: { backgroundColor: colors.background },
        content: { backgroundColor: colors.surface },
        foodName: { color: colors.text },
        sectionTitle: { color: colors.text },
        description: { color: colors.textSecondary },
        loadingText: { color: colors.textSecondary },
        errorText: { color: colors.textSecondary },
        tasteChip: { backgroundColor: isDark ? colors.card : '#fff5ed' },
        tasteText: { color: colors.primary },
        infoCard: { backgroundColor: colors.card },
        infoLabel: { color: colors.textSecondary },
        infoValue: { color: colors.text },
        nutritionItem: { backgroundColor: colors.card },
        nutritionValue: { color: colors.text },
        nutritionLabel: { color: colors.textSecondary },
        popularCard: { backgroundColor: isDark ? colors.card : '#fce4ec' },
        popularText: { color: colors.textSecondary },
        sideChip: { backgroundColor: colors.card, borderColor: colors.border },
        sideText: { color: colors.textSecondary },
        footer: { backgroundColor: colors.surface },
        priceLabel: { color: colors.textSecondary },
    };

    if (loading) {
        return (
            <View style={[styles.centerContainer, themedStyles.centerContainer]}>
                <ActivityIndicator size="large" color="#ff6b00" />
                <Text style={[styles.loadingText, themedStyles.loadingText]}>Loading details...</Text>
            </View>
        );
    }

    if (!details) {
        return (
            <View style={[styles.centerContainer, themedStyles.centerContainer]}>
                <Icon name="alert-circle-outline" size={64} color="#ff6b00" />
                <Text style={[styles.errorText, themedStyles.errorText]}>Food details not available</Text>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, themedStyles.container]} contentContainerStyle={styles.scrollContent}>
            {/* Food Image - 1/4 height */}
            <Image
                source={{ uri: details.image || 'https://source.unsplash.com/600x400/?food' }}
                style={styles.foodImage}
            />

            {/* Content */}
            <View style={[styles.content, themedStyles.content]}>
                {/* Food Name & Restaurant */}
                <Text style={[styles.foodName, themedStyles.foodName]}>{details.name}</Text>
                <TouchableOpacity
                    style={styles.restaurantRow}
                    onPress={() => handleRestaurantPress()}
                >
                    <Icon name="store" size={18} color="#ff6b00" />
                    <Text style={styles.restaurantNameLink}>{details.restaurant}</Text>
                    <Icon name="chevron-right" size={18} color="#ff6b00" />
                </TouchableOpacity>

                {/* Taste Profile */}
                {details.taste_profile && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, themedStyles.sectionTitle]}>Taste Profile</Text>
                        <View style={styles.tasteGrid}>
                            {details.taste_profile.spiciness && (
                                <View style={[styles.tasteChip, themedStyles.tasteChip]}>
                                    <Icon name="chili-hot" size={16} color="#ff6b00" />
                                    <Text style={[styles.tasteText, themedStyles.tasteText]}>{details.taste_profile.spiciness}</Text>
                                </View>
                            )}
                            {details.taste_profile.sweetness && details.taste_profile.sweetness !== 'none' && (
                                <View style={[styles.tasteChip, themedStyles.tasteChip]}>
                                    <Icon name="candy" size={16} color="#ff6b00" />
                                    <Text style={[styles.tasteText, themedStyles.tasteText]}>{details.taste_profile.sweetness}</Text>
                                </View>
                            )}
                            {details.taste_profile.texture && (
                                <View style={[styles.tasteChip, themedStyles.tasteChip]}>
                                    <Icon name="hand" size={16} color="#ff6b00" />
                                    <Text style={[styles.tasteText, themedStyles.tasteText]}>{details.taste_profile.texture}</Text>
                                </View>
                            )}
                            {details.taste_profile.richness && (
                                <View style={[styles.tasteChip, themedStyles.tasteChip]}>
                                    <Icon name="star" size={16} color="#ff6b00" />
                                    <Text style={[styles.tasteText, themedStyles.tasteText]}>{details.taste_profile.richness}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Description */}
                {details.description && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, themedStyles.sectionTitle]}>Description</Text>
                        <Text style={[styles.description, themedStyles.description]}>{details.description}</Text>
                    </View>
                )}

                {/* Cooking Style & Best Time */}
                <View style={styles.infoRow}>
                    {details.cooking_style && (
                        <View style={[styles.infoCard, themedStyles.infoCard]}>
                            <Icon name="chef-hat" size={24} color="#ff6b00" />
                            <Text style={[styles.infoLabel, themedStyles.infoLabel]}>Cooking</Text>
                            <Text style={[styles.infoValue, themedStyles.infoValue]}>{details.cooking_style}</Text>
                        </View>
                    )}
                    {details.best_time && (
                        <View style={[styles.infoCard, themedStyles.infoCard]}>
                            <Icon name="clock-outline" size={24} color="#ff6b00" />
                            <Text style={[styles.infoLabel, themedStyles.infoLabel]}>Best Time</Text>
                            <Text style={[styles.infoValue, themedStyles.infoValue]}>{details.best_time}</Text>
                        </View>
                    )}
                </View>

                {/* Nutritional Info */}
                {details.nutritional_info && Object.keys(details.nutritional_info).length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, themedStyles.sectionTitle]}>Nutritional Information</Text>
                        <View style={styles.nutritionGrid}>
                            {details.nutritional_info.protein != null && (
                                <View style={[styles.nutritionItem, themedStyles.nutritionItem]}>
                                    <Text style={[styles.nutritionValue, themedStyles.nutritionValue]}>{details.nutritional_info.protein}g</Text>
                                    <Text style={[styles.nutritionLabel, themedStyles.nutritionLabel]}>Protein</Text>
                                </View>
                            )}
                            {details.nutritional_info.fiber != null && (
                                <View style={[styles.nutritionItem, themedStyles.nutritionItem]}>
                                    <Text style={[styles.nutritionValue, themedStyles.nutritionValue]}>{details.nutritional_info.fiber}g</Text>
                                    <Text style={[styles.nutritionLabel, themedStyles.nutritionLabel]}>Fiber</Text>
                                </View>
                            )}
                            {details.nutritional_info.calories != null && (
                                <View style={[styles.nutritionItem, themedStyles.nutritionItem]}>
                                    <Text style={[styles.nutritionValue, themedStyles.nutritionValue]}>{details.nutritional_info.calories}</Text>
                                    <Text style={[styles.nutritionLabel, themedStyles.nutritionLabel]}>Calories</Text>
                                </View>
                            )}
                            {details.nutritional_info.carbs != null && (
                                <View style={[styles.nutritionItem, themedStyles.nutritionItem]}>
                                    <Text style={[styles.nutritionValue, themedStyles.nutritionValue]}>{details.nutritional_info.carbs}g</Text>
                                    <Text style={[styles.nutritionLabel, themedStyles.nutritionLabel]}>Carbs</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Why Popular */}
                {details.why_popular && (
                    <View style={[styles.popularCard, themedStyles.popularCard]}>
                        <Icon name="heart" size={20} color="#ff6b00" />
                        <Text style={[styles.popularText, themedStyles.popularText]}>{details.why_popular}</Text>
                    </View>
                )}

                {/* Recommended Sides */}
                {details.recommended_sides && details.recommended_sides.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, themedStyles.sectionTitle]}>Goes Well With</Text>
                        <View style={styles.sidesContainer}>
                            {details.recommended_sides.map((side: string, index: number) => (
                                <View key={index} style={[styles.sideChip, themedStyles.sideChip]}>
                                    <Text style={[styles.sideText, themedStyles.sideText]}>{side}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Price & Add to Cart Button */}
                <View style={[styles.footer, themedStyles.footer]}>
                    <View>
                        <Text style={[styles.priceLabel, themedStyles.priceLabel]}>Price</Text>
                        <Text style={styles.price}>₹{details.price || '0'}</Text>
                    </View>
                    <TouchableOpacity style={styles.orderButton} onPress={handleAddToCart}>
                        <Icon name="cart-plus" size={20} color="#fff" />
                        <Text style={styles.orderButtonText}>Add to Cart</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Styled Add to Cart Modal */}
            <Modal
                visible={showCartModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowCartModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={styles.modalIconContainer}>
                            <Icon name="check-circle" size={60} color="#4CAF50" />
                        </View>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Added to Cart!</Text>
                        <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
                            {details?.name} has been added to your cart
                        </Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setShowCartModal(false)}
                        >
                            <Text style={styles.modalButtonText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContent: {
        paddingBottom: 100,
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
        height: 200,
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
        backgroundColor: '#fff5ed',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
    },
    restaurantName: {
        fontSize: 16,
        color: '#666',
        marginLeft: 6,
        fontWeight: '600',
    },
    restaurantNameLink: {
        fontSize: 16,
        color: '#ff6b00',
        marginLeft: 6,
        fontWeight: '700',
        flex: 1,
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
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 10,
    },
    modalIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    modalMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    modalButton: {
        backgroundColor: '#ff6b00',
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 25,
        shadowColor: '#ff6b00',
        shadowOpacity: 0.4,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
