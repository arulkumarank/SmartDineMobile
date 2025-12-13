import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { aiAPI, foodsAPI, restaurantsAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import FoodCard from '../components/FoodCard';
import RestaurantCard from '../components/RestaurantCard';
import ProfileHeader from '../components/ProfileHeader';
import { FoodCardSkeleton, RestaurantCardSkeleton } from '../components/Skeleton';
import type { Food, Restaurant } from '../types';
import { isFuzzyMatch } from '../utils/search';

export default function Home({ navigation }: any) {
  const { isDark, colors } = useTheme();
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [aiText, setAiText] = useState('');
  const [suggestedFoods, setSuggestedFoods] = useState<Food[]>([]);
  const [suggestedRestaurants, setSuggestedRestaurants] = useState<Restaurant[]>([]);
  const [discoverFoods, setDiscoverFoods] = useState<Food[]>([]);
  const [discoverRestaurants, setDiscoverRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searched, setSearched] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Force FlatList re-render

  useEffect(() => {
    loadDiscoverData();
  }, []);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const loadDiscoverData = async () => {
    try {
      const [foodsRes, restaurantsRes] = await Promise.all([
        foodsAPI.getAll(),
        restaurantsAPI.getPersonalized()  // Use personalized endpoint for dietary-aware sorting
      ]);
      // Randomize foods, but keep restaurants in preference order
      setDiscoverFoods(shuffleArray(foodsRes.foods || []));
      setDiscoverRestaurants(restaurantsRes.restaurants || []);  // Keep preference order
    } catch (error) {
      console.error('Failed to load discover data:', error);
      // Fallback to regular endpoint if personalized fails
      try {
        const fallback = await restaurantsAPI.getAll();
        setDiscoverRestaurants(shuffleArray(fallback.restaurants || []));
      } catch (e) {
        console.error('Failed to load fallback restaurants:', e);
      }
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  };

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Clear previous search results
    setSearched(false);
    setAiText('');
    setSuggestedFoods([]);
    setSuggestedRestaurants([]);
    setQuestion('');
    // Increment refresh key to force FlatList re-render
    setRefreshKey(prev => prev + 1);
    // Reload discover data
    await loadDiscoverData();
  }, []);

  const handleSearch = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      // Get AI response
      const aiRes = await aiAPI.ask(question);
      console.log('AI Response:', aiRes);

      // Display AI message (no food names)
      setAiText((aiRes.answer || '').replace(/\*\*/g, '').trim());

      // Get suggested food names from backend
      const suggestedFoodNames: string[] = aiRes.foods || [];
      console.log('AI suggested foods:', suggestedFoodNames);

      // Get all foods from backend
      const [foodsRes, restaurantsRes] = await Promise.all([
        foodsAPI.getAll(),
        restaurantsAPI.getAll()
      ]);

      const allFoods = foodsRes.foods || [];
      const allRestaurants = restaurantsRes.restaurants || [];

      let matchedFoods: Food[] = [];

      // Match foods by name from AI suggestions
      if (suggestedFoodNames.length > 0) {
        matchedFoods = allFoods.filter((food: Food) =>
          suggestedFoodNames.some(suggestedName =>
            food.name.toLowerCase() === suggestedName.toLowerCase() ||
            food.name.toLowerCase().includes(suggestedName.toLowerCase()) ||
            suggestedName.toLowerCase().includes(food.name.toLowerCase())
          )
        );
        console.log(`Matched ${matchedFoods.length} foods from AI suggestions`);

        // DEDUPLICATE: Keep only ONE of each dish name (highest rated)
        const foodByName = new Map<string, Food>();
        matchedFoods.forEach((food: Food) => {
          const nameLower = food.name.toLowerCase();
          const existing = foodByName.get(nameLower);
          if (!existing || (food.rating || 0) > (existing.rating || 0)) {
            foodByName.set(nameLower, food);
          }
        });
        matchedFoods = Array.from(foodByName.values());
        console.log(`After deduplication: ${matchedFoods.length} unique dishes`);
      }

      // Fallback: semantic/fuzzy search if no matches
      if (matchedFoods.length === 0) {
        matchedFoods = allFoods.filter((f: Food) => {
          // Strong match first
          const nameMatch = isFuzzyMatch(f.name, question, 1);
          const cuisineMatch = f.cuisine && isFuzzyMatch(f.cuisine, question, 1);

          if (nameMatch || cuisineMatch) return true;

          // Check individual words if strict match fails
          const queryLower = question.toLowerCase();
          const queryWords = queryLower.split(' ').filter(w => w.length > 2);

          const wordMatch = queryWords.some(word =>
            isFuzzyMatch(f.name, word, 1) ||
            (f.cuisine && isFuzzyMatch(f.cuisine, word, 1))
          );

          return wordMatch;
        });
        console.log(`Fallback: Found ${matchedFoods.length} foods via fuzzy/semantic search`);
      }

      // Final fallback: show top rated
      if (matchedFoods.length === 0) {
        console.log('No matches, showing top rated foods');
        matchedFoods = [...allFoods].sort((a: Food, b: Food) =>
          (b.rating || 0) - (a.rating || 0)
        );
      }

      setSuggestedFoods(matchedFoods.slice(0, 10));

      // Only show restaurants if query is about cuisines/restaurants
      const cuisineKeywords = ['restaurant', 'cuisine', 'place', 'restaurant', 'dine', 'dining',
        'indian', 'chinese', 'italian', 'mexican', 'thai', 'japanese', 'korean', 'american',
        'south indian', 'north indian', 'continental', 'asian', 'mediterranean', 'middle eastern'];
      const queryLower = question.toLowerCase();
      const isCuisineQuery = cuisineKeywords.some(keyword => queryLower.includes(keyword));

      if (isCuisineQuery) {
        // Filter restaurants by matching cuisine
        const matchedRestaurants = allRestaurants.filter((r: Restaurant) =>
          r.cuisine && queryLower.includes(r.cuisine.toLowerCase()) ||
          r.name && queryLower.includes(r.name.toLowerCase())
        );
        setSuggestedRestaurants(matchedRestaurants.length > 0 ? matchedRestaurants.slice(0, 3) : allRestaurants.slice(0, 3));
      } else {
        // No restaurant cards for food-only queries
        setSuggestedRestaurants([]);
      }

    } catch (error: any) {
      console.error('Search error:', error);
      setAiText(error.response?.data?.detail || 'Unable to get recommendations. Please try again.');
      setSuggestedFoods([]);
      setSuggestedRestaurants([]);
    } finally {
      setLoading(false);
    }
  };


  // Theme-aware dynamic styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    brandingContainer: { backgroundColor: colors.surface },
    title: { color: colors.text },
    subtitle: { color: colors.textSecondary },
    searchBox: { backgroundColor: colors.surface },
    sectionTitle: { color: colors.text },
    aiCard: { backgroundColor: colors.surface },
    aiText: { color: colors.text },
    discoverSection: { backgroundColor: colors.surface },
    restaurantsSection: { backgroundColor: colors.background },
  };

  return (
    <View style={[styles.container, themedStyles.container]}>
      {/* SCROLLABLE CONTENT - Search bar becomes sticky */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]} // Index 1 is the searchBox container
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ff6b00']}
            tintColor="#ff6b00"
            title="Pull to refresh..."
          />
        }
      >
        {/* Branding with Profile */}
        < View style={[styles.brandingContainer, themedStyles.brandingContainer]} >
          <View>
            <Text style={[styles.branding, themedStyles.title]}>Smart Dine</Text>
            <Text style={[styles.tagline, themedStyles.subtitle]}>AI-Powered Food Discovery</Text>
          </View>
          <ProfileHeader navigation={navigation} username={user?.username} />
        </View >

        {/* Search Box - Sticks to top */}
        < View style={[styles.stickySearchContainer, themedStyles.searchBox]} >
          <View style={[styles.searchBox, themedStyles.searchBox]}>
            <Icon name="magnify" size={24} color="#ff6b00" style={styles.searchIcon} />
            <TextInput
              placeholder="What are you craving today?"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { color: colors.text }]}
              value={question}
              onChangeText={setQuestion}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={handleSearch} disabled={loading} style={styles.searchButton}>
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Icon name="arrow-right" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View >

        {/* AI Message Box - Themed card */}
        {
          searched && aiText && (
            <View style={[styles.aiMessageBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.aiText, themedStyles.aiText]}>{aiText}</Text>
            </View>
          )
        }

        {/* AI Suggested Foods - Horizontal Scroll */}
        {
          searched && suggestedFoods.length > 0 && (
            <View style={styles.section}>
              <FlatList
                horizontal
                data={suggestedFoods}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => `suggested-${index}`}
                renderItem={({ item }) => (
                  <View style={styles.foodCardWrapper}>
                    <FoodCard
                      food={item}
                      compact
                      onPress={() => navigation.navigate('FoodDetail', { food: item })}
                    />
                  </View>
                )}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )
        }

        {/* AI Suggested Restaurants - Full Width Cards */}
        {
          searched && suggestedRestaurants.length > 0 && (
            <View style={styles.restaurantsContainer}>
              {suggestedRestaurants.map((restaurant, index) => (
                <View key={index} style={styles.restaurantCardWrapper}>
                  <RestaurantCard
                    name={restaurant.name}
                    rating={restaurant.rating || 0}
                    image={restaurant.image || 'https://source.unsplash.com/600x400/?restaurant'}
                    cuisine={restaurant.cuisine}
                    onPress={() => navigation.navigate('Restaurant', restaurant)}
                  />
                </View>
              ))}
            </View>
          )
        }

        {/* Discover Food Section */}
        <View style={[styles.discoverSection, themedStyles.discoverSection]}>
          <Text style={[styles.sectionTitle, themedStyles.sectionTitle]}>Discover Food</Text>
          {initialLoading ? (
            <FlatList
              horizontal
              data={[1, 2, 3, 4]}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => `skeleton-food-${item}`}
              renderItem={() => (
                <View style={styles.foodCardWrapper}>
                  <FoodCardSkeleton />
                </View>
              )}
              contentContainerStyle={styles.horizontalList}
            />
          ) : (
            <FlatList
              key={`discover-foods-${refreshKey}`}
              horizontal
              data={discoverFoods}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => `food-${item.name}-${item.restaurant}-${index}-${refreshKey}`}
              extraData={refreshKey}
              renderItem={({ item }) => (
                <View style={styles.foodCardWrapper}>
                  <FoodCard
                    food={item}
                    compact
                    onPress={() => navigation.navigate('FoodDetail', { food: item })}
                  />
                </View>
              )}
              contentContainerStyle={styles.horizontalList}
            />
          )}
        </View>

        {/* Discover Restaurants Section - All scroll together */}
        <View style={[styles.restaurantsSection, themedStyles.restaurantsSection]}>
          <Text style={[styles.sectionTitle, themedStyles.sectionTitle]}>Discover Restaurants</Text>
          {initialLoading ? (
            [1, 2, 3].map((item) => (
              <View key={`skeleton-restaurant-${item}`} style={styles.restaurantCardWrapper}>
                <RestaurantCardSkeleton />
              </View>
            ))
          ) : (
            discoverRestaurants.map((restaurant, index) => (
              <View key={index} style={styles.restaurantCardWrapper}>
                <RestaurantCard
                  name={restaurant.name}
                  rating={restaurant.rating || 0}
                  image={restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600'}
                  cuisine={restaurant.cuisine}
                  onPress={() => navigation.navigate('Restaurant', restaurant)}
                />
              </View>
            ))
          )}
        </View>
      </ScrollView >
    </View >
  );
}

import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  brandingContainer: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 10, backgroundColor: '#f8f9fa', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  branding: { fontSize: 32, fontWeight: '900', color: '#ff6b00', letterSpacing: -1 },
  tagline: { fontSize: 13, color: '#666', marginTop: 2 },

  // Container for the sticky search bar
  stickySearchContainer: {
    backgroundColor: '#f8f9fa', // Match background so it covers content when scrolling
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 10,
    zIndex: 100,
  },

  searchBox: {
    backgroundColor: '#fff',
    borderRadius: 28,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 4,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8
  },
  searchIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#333', fontWeight: '500' },
  searchButton: { backgroundColor: '#ff6b00', borderRadius: 24, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', shadowColor: '#ff6b00', shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },

  scrollView: { flex: 1 },
  aiMessageBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  aiText: { flex: 1, fontSize: 15, color: '#555', lineHeight: 22 },
  section: { marginTop: 8, marginBottom: 16 },
  discoverSection: { paddingTop: 24, paddingBottom: 20, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: 20 },
  restaurantsContainer: { paddingHorizontal: 16, marginTop: 16, marginBottom: 12 },
  restaurantsSection: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 16, paddingHorizontal: 20 },
  horizontalList: { paddingLeft: 20, paddingRight: 10, paddingBottom: 8 },

  // Responsive Width for Food Cards
  foodCardWrapper: {
    width: width * 0.42, // 42% of screen width for compact cards
    marginRight: 12
  },
  restaurantCardWrapper: { marginBottom: 16 },
});
