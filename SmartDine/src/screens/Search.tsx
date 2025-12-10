import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { foodsAPI, restaurantsAPI } from '../services/api';
import type { Food, Restaurant } from '../types';
import FoodCard from '../components/FoodCard';
import RestaurantCard from '../components/RestaurantCard';
import SearchBar from '../components/SearchBar';

type FilterType = {
  price: string[];
  taste: string[];
  dietary: string[];
};

export default function Search({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [allFoods, setAllFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchMode, setSearchMode] = useState<'restaurants' | 'foods'>('restaurants');

  const [filters, setFilters] = useState<FilterType>({
    price: [],
    taste: [],
    dietary: [],
  });

  const priceOptions = ['₹0-150', '₹150-300', '₹300+'];
  const tasteOptions = ['spicy', 'sweet', 'sour', 'savory', 'mild'];
  const dietaryOptions = ['vegetarian', 'gluten-free', 'high-protein', 'high-fiber'];

  // Load restaurants on mount
  useEffect(() => {
    loadRestaurants();
    loadAllFoods();
  }, []);

  const loadRestaurants = async () => {
    setLoading(true);
    try {
      const response = await restaurantsAPI.getAll();
      console.log('Search: Restaurants loaded:', response.restaurants?.length || 0);
      setRestaurants(response.restaurants || []);
    } catch (error) {
      console.error('Search: Failed to load restaurants:', error);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllFoods = async () => {
    try {
      const response = await foodsAPI.getAll();
      console.log('Search: Foods loaded:', response.foods?.length || 0);
      setAllFoods(response.foods || []);
    } catch (error) {
      console.error('Search: Failed to load foods:', error);
      setAllFoods([]);
    }
  };

  // Smart search: detect if searching for food or restaurant
  useEffect(() => {
    if (!query.trim()) {
      setSearchMode('restaurants');
      setFoods([]);
      return;
    }

    // Check if query matches food names
    const matchingFoods = allFoods.filter(food =>
      food.name.toLowerCase().includes(query.toLowerCase())
    );

    // Check if query matches restaurant names
    const matchingRestaurants = restaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(query.toLowerCase())
    );

    // Switch mode based on what matches better
    if (matchingFoods.length > matchingRestaurants.length) {
      setSearchMode('foods');
      applyFoodFilters(matchingFoods);
    } else {
      setSearchMode('restaurants');
    }
  }, [query, allFoods, restaurants]);

  // Apply filters when they change
  useEffect(() => {
    if (searchMode === 'foods' && query) {
      const matchingFoods = allFoods.filter(food =>
        food.name.toLowerCase().includes(query.toLowerCase())
      );
      applyFoodFilters(matchingFoods);
    }
  }, [filters]);

  const applyFoodFilters = (foodList: Food[]) => {
    let result = foodList;

    // Price filter
    if (filters.price.length > 0) {
      result = result.filter(food => {
        const price = food.price || 0;
        return filters.price.some(range => {
          if (range === '₹0-150') return price <= 150;
          if (range === '₹150-300') return price > 150 && price <= 300;
          if (range === '₹300+') return price > 300;
          return false;
        });
      });
    }

    // Taste filter
    if (filters.taste.length > 0) {
      result = result.filter(food => {
        return filters.taste.some(taste => {
          // Map taste to food properties
          if (taste === 'spicy') {
            return food.tags?.includes('spicy') || (food as any).spicy === 'hot' || (food as any).spicy === 'medium';
          }
          if (taste === 'sweet') {
            return food.tags?.includes('sweet') || food.name.toLowerCase().includes('sweet');
          }
          if (taste === 'sour') {
            return food.tags?.includes('sour') || food.tags?.includes('tangy');
          }
          if (taste === 'savory') {
            return food.tags?.includes('savory') || !(food as any).spicy;
          }
          if (taste === 'mild') {
            return (food as any).spicy === 'mild' || !(food as any).spicy;
          }
          return false;
        });
      });
    }

    // Dietary filters
    if (filters.dietary.length > 0) {
      result = result.filter(food => {
        return filters.dietary.some(dietary => {
          if (dietary === 'vegetarian') return food.is_vegetarian;
          if (dietary === 'gluten-free') return food.is_gluten_free;
          if (dietary === 'high-protein') return (food.nutritional_info?.protein || 0) >= 20;
          if (dietary === 'high-fiber') return (food.nutritional_info?.fiber || 0) >= 5;
          return false;
        });
      });
    }

    setFoods(result);
  };

  const toggleFilter = (type: 'price' | 'taste' | 'dietary', value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value],
    }));
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
    restaurant.cuisine.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Search</Text>
          <Text style={styles.subtitle}>
            {searchMode === 'restaurants' ? 'Browse restaurants' : 'Find foods'}
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search restaurants or foods..."
          />
        </View>

        {/* Filter Toggle */}
        {searchMode === 'foods' && (
          <TouchableOpacity
            style={styles.filterToggle}
            onPress={() => setShowFilters(!showFilters)}>
            <Icon name="filter-variant" size={20} color="#ff6b00" />
            <Text style={styles.filterToggleText}>Filters</Text>
            <Icon
              name={showFilters ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#ff6b00"
            />
          </TouchableOpacity>
        )}

        {/* Filters Section */}
        {showFilters && searchMode === 'foods' && (
          <View style={styles.filtersContainer}>
            {/* Price Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Price Range</Text>
              <View style={styles.filterChips}>
                {priceOptions.map(price => (
                  <TouchableOpacity
                    key={price}
                    style={[
                      styles.filterChip,
                      filters.price.includes(price) && styles.filterChipActive,
                    ]}
                    onPress={() => toggleFilter('price', price)}>
                    <Text
                      style={[
                        styles.filterChipText,
                        filters.price.includes(price) && styles.filterChipTextActive,
                      ]}>
                      {price}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Taste Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Taste Preference</Text>
              <View style={styles.filterChips}>
                {tasteOptions.map(taste => (
                  <TouchableOpacity
                    key={taste}
                    style={[
                      styles.filterChip,
                      filters.taste.includes(taste) && styles.filterChipActive,
                    ]}
                    onPress={() => toggleFilter('taste', taste)}>
                    <Text
                      style={[
                        styles.filterChipText,
                        filters.taste.includes(taste) && styles.filterChipTextActive,
                      ]}>
                      {taste === 'spicy' && '🌶️ '}
                      {taste === 'sweet' && '🍯 '}
                      {taste === 'sour' && '🍋 '}
                      {taste === 'savory' && '🧂 '}
                      {taste === 'mild' && '😊 '}
                      {taste}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Dietary Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Health & Dietary</Text>
              <View style={styles.filterChips}>
                {dietaryOptions.map(dietary => (
                  <TouchableOpacity
                    key={dietary}
                    style={[
                      styles.filterChip,
                      filters.dietary.includes(dietary) && styles.filterChipActive,
                    ]}
                    onPress={() => toggleFilter('dietary', dietary)}>
                    <Text
                      style={[
                        styles.filterChipText,
                        filters.dietary.includes(dietary) && styles.filterChipTextActive,
                      ]}>
                      {dietary}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Results Count */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {searchMode === 'restaurants'
              ? `${filteredRestaurants.length} Restaurants`
              : `${foods.length} Foods`}
          </Text>
        </View>

        {/* Loading State */}
        {loading && <ActivityIndicator size="large" color="#ff6b00" style={styles.loader} />}

        {/* Restaurant Cards */}
        {!loading && searchMode === 'restaurants' && (
          <View style={styles.restaurantsList}>
            {filteredRestaurants.map((restaurant, index) => (
              <RestaurantCard
                key={index}
                name={restaurant.name}
                rating={restaurant.rating || 0}
                image={restaurant.image || 'https://source.unsplash.com/600x400/?restaurant'}
                cuisine={restaurant.cuisine}
                onPress={() => navigation.navigate('Restaurant', restaurant)}
              />
            ))}
            {filteredRestaurants.length === 0 && (
              <View style={styles.emptyState}>
                <Icon name="store-off" size={64} color="#ddd" />
                <Text style={styles.emptyText}>No restaurants found</Text>
              </View>
            )}
          </View>
        )}

        {/* Food Cards Grid - 2 columns */}
        {!loading && searchMode === 'foods' && (
          <View style={styles.foodsGrid}>
            {foods.map((food, index) => (
              <View key={index} style={styles.foodCardWrapper}>
                <FoodCard
                  food={food}
                  compact
                  onPress={() => {
                    const restaurantData = {
                      name: food.restaurant,
                      cuisine: food.cuisine || 'Food & Dining',
                      rating: food.rating || 4.5,
                      image: food.image || 'https://source.unsplash.com/600x400/?restaurant',
                      location: {
                        address: `${food.restaurant} - Visit us!`,
                        latitude: 0,
                        longitude: 0,
                      },
                    };
                    navigation.navigate('Restaurant', restaurantData);
                  }}
                />
              </View>
            ))}
            {foods.length === 0 && (
              <View style={styles.emptyState}>
                <Icon name="food-off" size={64} color="#ddd" />
                <Text style={styles.emptyText}>No foods found</Text>
                <Text style={styles.emptySubtext}>Try different search or filters</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollView: { flex: 1 },
  header: { padding: 20, paddingTop: 60, paddingBottom: 20 },
  title: { fontSize: 32, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#666' },
  searchBarContainer: { paddingHorizontal: 20, marginBottom: 15 },
  filterToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginBottom: 15, paddingVertical: 12, backgroundColor: '#fff', borderRadius: 12, gap: 8 },
  filterToggleText: { fontSize: 16, fontWeight: '600', color: '#ff6b00' },
  filtersContainer: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 20, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  filterSection: { marginBottom: 20 },
  filterLabel: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  filterChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#e0e0e0' },
  filterChipActive: { backgroundColor: '#ff6b00', borderColor: '#ff6b00' },
  filterChipText: { fontSize: 14, color: '#666', fontWeight: '500', textTransform: 'capitalize' },
  filterChipTextActive: { color: '#fff', fontWeight: '600' },
  resultsHeader: { paddingHorizontal: 20, paddingVertical: 12 },
  resultsCount: { fontSize: 18, fontWeight: '700', color: '#333' },
  loader: { marginTop: 40, marginBottom: 40 },
  restaurantsList: { paddingHorizontal: 20, paddingBottom: 30 },
  foodsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, paddingBottom: 30 },
  foodCardWrapper: { width: '50%', padding: 10 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, width: '100%' },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#999', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: '#bbb', marginTop: 4, textAlign: 'center' },
});
