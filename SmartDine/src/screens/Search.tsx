import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { foodsAPI, restaurantsAPI } from '../services/api';
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

  const applyFilters = () => {
    setLoading(true);
    Promise.all([foodsAPI.getAll(), restaurantsAPI.getAll()])
      .then(([foodsRes, restaurantsRes]) => {
        console.log('Search - Foods loaded:', foodsRes.foods?.length || 0);
        console.log('Search - Restaurants loaded:', restaurantsRes.restaurants?.length || 0);

        let filteredFoods = foodsRes.foods || [];
        let filteredRestaurants = restaurantsRes.restaurants || [];

        if (query) {
          filteredFoods = filteredFoods.filter(f =>
            f.name.toLowerCase().includes(query.toLowerCase()) ||
            f.restaurant.toLowerCase().includes(query.toLowerCase())
          );
          filteredRestaurants = filteredRestaurants.filter(r =>
            r.name.toLowerCase().includes(query.toLowerCase()) ||
            r.cuisine.toLowerCase().includes(query.toLowerCase())
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
              if (cleanTaste === 'sweet') return food.name.toLowerCase().includes('sweet');
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

  const showFoods = query.length > 0 || filters.taste.length > 0;

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <Text style={styles.subtitle}>{showFoods ? 'Find foods' : 'Browse restaurants'}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search restaurants or foods..."
        />
      </View>

      {/* Filter Toggle - Expandable */}
      <TouchableOpacity
        style={styles.filterToggle}
        onPress={() => setShowFilters(!showFilters)}>
        <Icon name="filter-variant" size={20} color="#ff6b00" />
        <Text style={styles.filterToggleText}>Filters</Text>
        <Icon name={showFilters ? 'chevron-up' : 'chevron-down'} size={20} color="#ff6b00" />
      </TouchableOpacity>

      {/* Expandable Filters - Vertical Layout */}
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

      {/* Results */}
      <ScrollView style={styles.resultsScroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultsCount}>
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
                  onPress={() => navigation.navigate('Restaurant', {
                    name: item.restaurant,
                    cuisine: item.cuisine || 'Dining',
                    rating: item.rating || 4.5,
                    image: item.image,
                    location: { address: item.restaurant, latitude: 0, longitude: 0 }
                  })}
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
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#fff', borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  title: { fontSize: 28, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#666' },
  searchSection: { paddingHorizontal: 20, paddingVertical: 16 },
  filterToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginBottom: 12, paddingVertical: 12, backgroundColor: '#fff', borderRadius: 20, gap: 6, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  filterToggleText: { fontSize: 15, fontWeight: '600', color: '#ff6b00' },
  filtersContainer: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 16, padding: 16, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  filterSection: { marginBottom: 16 },
  filterLabel: { fontSize: 13, fontWeight: '700', color: '#333', marginBottom: 10, textTransform: 'uppercase' },
  filterChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: '#f5f5f5', borderWidth: 1.5, borderColor: '#e0e0e0' },
  filterChipActive: { backgroundColor: '#ff6b00', borderColor: '#ff6b00' },
  filterChipText: { fontSize: 13, color: '#666', fontWeight: '500' },
  filterChipTextActive: { color: '#fff', fontWeight: '600' },
  resultsScroll: { flex: 1, marginTop: 8 },
  resultsCount: { fontSize: 18, fontWeight: '700', color: '#333', paddingHorizontal: 20, marginBottom: 16 },
  foodsGrid: { paddingHorizontal: 10, paddingBottom: 20 },
  foodCardWrapper: { flex: 1, padding: 6 },
  restaurantsList: { paddingHorizontal: 20, paddingBottom: 20 },
});
