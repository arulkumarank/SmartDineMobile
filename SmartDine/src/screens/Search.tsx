import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { foodsAPI, restaurantsAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import type { Food, Restaurant } from '../types';
import FoodCard from '../components/FoodCard';
import RestaurantCard from '../components/RestaurantCard';
import SearchBar from '../components/SearchBar';

type FilterState = {
  price: string[];
  taste: string[];
  dietary: string[];
};

export default function Search({ navigation }: any) {
  const { isDark, colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ foods: Food[]; restaurants: Restaurant[] }>({ foods: [], restaurants: [] });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ price: [], taste: [], dietary: [] });

  const priceOptions = ['₹0-150', '₹150-300', '₹300+'];
  const tasteOptions = ['🌶️ spicy', '🍯 sweet', '🍋 sour', '🧂 savory', '😊 mild'];
  const dietaryOptions = ['vegetarian', 'gluten-free', 'high-protein'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, query]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [foodsRes, restaurantsRes] = await Promise.all([
        foodsAPI.getAll(),
        restaurantsAPI.getAll()
      ]);
      setResults({
        foods: foodsRes.foods || [],
        restaurants: restaurantsRes.restaurants || []
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fuzzy search helper - allows typos using Levenshtein distance
  const fuzzyMatch = (str: string, query: string): boolean => {
    if (!str || !query) return false;

    const strLower = str.toLowerCase();
    const queryLower = query.toLowerCase();

    // Exact or substring match
    if (strLower.includes(queryLower)) return true;

    // Levenshtein distance for typo tolerance
    const getDistance = (a: string, b: string): number => {
      const matrix: number[][] = [];

      for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
      }

      for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
      }

      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }

      return matrix[b.length][a.length];
    };

    // Allow 1-2 character difference based on query length
    const maxDistance = queryLower.length <= 4 ? 1 : 2;
    const distance = getDistance(strLower, queryLower);

    return distance <= maxDistance;
  };

  const applyFilters = () => {
    setLoading(true);
    Promise.all([foodsAPI.getAll(), restaurantsAPI.getAll()])
      .then(([foodsRes, restaurantsRes]) => {
        console.log('Search - Foods loaded:', foodsRes.foods?.length || 0);
        console.log('Search - Restaurants loaded:', restaurantsRes.restaurants?.length || 0);

        let filteredFoods = foodsRes.foods || [];
        let filteredRestaurants = restaurantsRes.restaurants || [];

        if (query) {
          // Use fuzzy matching for typo tolerance
          filteredFoods = filteredFoods.filter(f =>
            fuzzyMatch(f.name, query) ||
            fuzzyMatch(f.restaurant, query) ||
            fuzzyMatch(f.cuisine || '', query)
          );
          filteredRestaurants = filteredRestaurants.filter(r =>
            fuzzyMatch(r.name, query) ||
            fuzzyMatch(r.cuisine, query)
          );
        }

        if (filters.price.length > 0) {
          filteredFoods = filteredFoods.filter(food => {
            const price = food.price || 0;
            return filters.price.some(range => {
              if (range === '₹0-150') return price <= 150;
              if (range === '₹150-300') return price > 150 && price <= 300;
              if (range === '₹300+') return price > 300;
              return false;
            });
          });
        }

        if (filters.taste.length > 0) {
          filteredFoods = filteredFoods.filter(food => {
            return filters.taste.some(taste => {
              const cleanTaste = taste.replace(/[🌶️🍯🍋🧂😊]/g, '').trim();
              if (cleanTaste === 'spicy') return (food as any).spicy === 'hot' || (food as any).spicy === 'medium';
              // Sweet filter - includes desserts, cakes, ice cream, etc.
              if (cleanTaste === 'sweet') {
                const name = food.name.toLowerCase();
                const tags = (food.tags || []).map(t => t.toLowerCase());
                const sweetKeywords = ['sweet', 'dessert', 'cake', 'ice cream', 'brownie', 'cookie', 'pastry', 'pudding', 'cheesecake', 'chocolate', 'tiramisu', 'panna cotta', 'kulfi', 'gulab jamun', 'rasmalai', 'jalebi', 'halwa', 'kheer', 'mango sticky', 'waffle', 'pancake', 'macaron', 'truffle', 'scoop', 'sundae', 'milkshake'];
                return sweetKeywords.some(kw => name.includes(kw)) || tags.includes('dessert') || tags.includes('sweet');
              }
              if (cleanTaste === 'sour') return food.tags?.includes('sour');
              if (cleanTaste === 'savory') return !(food as any).spicy;
              if (cleanTaste === 'mild') return (food as any).spicy === 'mild' || !(food as any).spicy;
              return false;
            });
          });
        }

        if (filters.dietary.length > 0) {
          filteredFoods = filteredFoods.filter(food => {
            return filters.dietary.some(dietary => {
              if (dietary === 'vegetarian') return food.is_vegetarian;
              if (dietary === 'gluten-free') return food.is_gluten_free;
              if (dietary === 'high-protein') return (food.nutritional_info?.protein || 0) >= 20;
              return false;
            });
          });
        }

        console.log('Search - Filtered Foods:', filteredFoods.length);
        console.log('Search - Filtered Restaurants:', filteredRestaurants.length);

        setResults({ foods: filteredFoods, restaurants: filteredRestaurants });
      })
      .finally(() => setLoading(false));
  };

  const toggleFilter = (type: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((v: string) => v !== value)
        : [...prev[type], value]
    }));
  };

  const handleSearchFocus = () => {
    // Scroll to top when search box is focused
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const showFoods = query.length > 0 || filters.taste.length > 0;

  // Theme-aware dynamic styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    header: { backgroundColor: colors.surface },
    title: { color: colors.text },
    subtitle: { color: colors.textSecondary },
    filterContainer: { backgroundColor: colors.surface },
    filterLabel: { color: colors.text },
    resultsCount: { color: colors.text },
  };

  return (
    <View style={[styles.container, themedStyles.container]}>
      {/* Fixed Header with Search */}
      <View style={[styles.stickyHeader, themedStyles.header]}>
        <View style={[styles.header, themedStyles.header]}>
          <Text style={[styles.title, themedStyles.title]}>Search</Text>
          <Text style={[styles.subtitle, themedStyles.subtitle]}>{showFoods ? 'Find foods' : 'Browse restaurants'}</Text>
        </View>

        {/* Search Bar - Stays sticky */}
        <View style={styles.searchSection}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search restaurants or foods..."
            onFocus={handleSearchFocus}
          />
        </View>
      </View>

      {/* Results - All content in one scrollable area */}
      <ScrollView ref={scrollViewRef} style={styles.resultsScroll} showsVerticalScrollIndicator={false}>
        {/* Filter Toggle - Inside ScrollView */}
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}>
          <Icon name="filter-variant" size={20} color="#ff6b00" />
          <Text style={styles.filterToggleText}>Filters</Text>
          <Icon name={showFilters ? 'chevron-up' : 'chevron-down'} size={20} color="#ff6b00" />
        </TouchableOpacity>

        {/* Expandable Filters - Inside ScrollView */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Taste</Text>
              <View style={styles.filterChips}>
                {tasteOptions.map(taste => (
                  <TouchableOpacity
                    key={taste}
                    style={[styles.filterChip, filters.taste.includes(taste) && styles.filterChipActive]}
                    onPress={() => toggleFilter('taste', taste)}>
                    <Text style={[styles.filterChipText, filters.taste.includes(taste) && styles.filterChipTextActive]}>
                      {taste}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Price</Text>
              <View style={styles.filterChips}>
                {priceOptions.map(price => (
                  <TouchableOpacity
                    key={price}
                    style={[styles.filterChip, filters.price.includes(price) && styles.filterChipActive]}
                    onPress={() => toggleFilter('price', price)}>
                    <Text style={[styles.filterChipText, filters.price.includes(price) && styles.filterChipTextActive]}>
                      {price}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Dietary</Text>
              <View style={styles.filterChips}>
                {dietaryOptions.map(dietary => (
                  <TouchableOpacity
                    key={dietary}
                    style={[styles.filterChip, filters.dietary.includes(dietary) && styles.filterChipActive]}
                    onPress={() => toggleFilter('dietary', dietary)}>
                    <Text style={[styles.filterChipText, filters.dietary.includes(dietary) && styles.filterChipTextActive]}>
                      {dietary}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
        <Text style={[styles.resultsCount, themedStyles.resultsCount]}>
          {showFoods ? `${results.foods.length} Foods` : `${results.restaurants.length} Restaurants`}
        </Text>

        {loading && <ActivityIndicator size="large" color="#ff6b00" style={{ marginTop: 40 }} />}

        {!loading && showFoods && (
          <FlatList
            data={results.foods}
            numColumns={2}
            scrollEnabled={false}
            keyExtractor={(item, index) => `food-${index}`}
            renderItem={({ item }) => (
              <View style={styles.foodCardWrapper}>
                <FoodCard
                  food={item}
                  compact
                  onPress={() => navigation.navigate('FoodDetail', { food: item })}
                />
              </View>
            )}
            contentContainerStyle={styles.foodsGrid}
          />
        )}

        {!loading && !showFoods && (
          <View style={styles.restaurantsList}>
            {results.restaurants.map((restaurant, index) => (
              <RestaurantCard
                key={index}
                name={restaurant.name}
                rating={restaurant.rating || 0}
                image={restaurant.image || 'https://source.unsplash.com/600x400/?restaurant'}
                cuisine={restaurant.cuisine}
                onPress={() => navigation.navigate('Restaurant', restaurant)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  stickyHeader: {
    backgroundColor: '#fff',
    zIndex: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }
  },
  header: { paddingTop: 20, paddingHorizontal: 20, paddingBottom: 5 },
  title: { fontSize: 28, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#666' },
  searchSection: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
  filterToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginTop: 8, marginBottom: 12, paddingVertical: 12, backgroundColor: '#fff', borderRadius: 20, gap: 6, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 3, borderWidth: 1, borderColor: '#f0f0f0' },
  filterToggleText: { fontSize: 15, fontWeight: '600', color: '#ff6b00' },
  filtersContainer: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 16, padding: 16, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  filterSection: { marginBottom: 16 },
  filterLabel: { fontSize: 13, fontWeight: '700', color: '#333', marginBottom: 10, textTransform: 'uppercase' },
  filterChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: { paddingHorizontal: 4, paddingVertical: 8, borderRadius: 18, backgroundColor: '#f5f5f5', borderWidth: 1.5, borderColor: '#e0e0e0' },
  filterChipActive: { backgroundColor: '#ff6b00', borderColor: '#ff6b00' },
  filterChipText: { fontSize: 13, color: '#666', fontWeight: '500' },
  filterChipTextActive: { color: '#fff', fontWeight: '600' },
  resultsScroll: { flex: 1, marginTop: 8 },
  resultsCount: { fontSize: 18, fontWeight: '700', color: '#333', paddingHorizontal: 20, marginBottom: 16 },
  foodsGrid: { paddingHorizontal: 12, paddingBottom: 120 },
  foodCardWrapper: { width: (Dimensions.get('window').width - 24) / 2, paddingHorizontal: 4, paddingVertical: 6 },
  restaurantsList: { paddingHorizontal: 20, paddingBottom: 120 },
});
