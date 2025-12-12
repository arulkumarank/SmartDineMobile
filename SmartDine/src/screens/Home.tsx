import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { aiAPI, foodsAPI, restaurantsAPI } from '../services/api';
import FoodCard from '../components/FoodCard';
import RestaurantCard from '../components/RestaurantCard';
import type { Food, Restaurant } from '../types';

export default function Home({ navigation }: any) {
  const [question, setQuestion] = useState('');
  const [aiText, setAiText] = useState('');
  const [suggestedFoods, setSuggestedFoods] = useState<Food[]>([]);
  const [suggestedRestaurants, setSuggestedRestaurants] = useState<Restaurant[]>([]);
  const [discoverFoods, setDiscoverFoods] = useState<Food[]>([]);
  const [discoverRestaurants, setDiscoverRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    loadDiscoverData();
  }, []);

  const loadDiscoverData = async () => {
    try {
      const [foodsRes, restaurantsRes] = await Promise.all([
        foodsAPI.getAll(),
        restaurantsAPI.getAll()
      ]);
      setDiscoverFoods(foodsRes.foods || []);
      setDiscoverRestaurants(restaurantsRes.restaurants || []);
    } catch (error) {
      console.error('Failed to load discover data:', error);
    }
  };

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
      }

      import { isFuzzyMatch } from '../utils/search';

      // ... inside Home logic ...

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
      setSuggestedRestaurants(allRestaurants.slice(0, 3));

    } catch (error: any) {
      console.error('Search error:', error);
      setAiText(error.response?.data?.detail || 'Unable to get recommendations. Please try again.');
      setSuggestedFoods([]);
      setSuggestedRestaurants([]);
    } finally {
      setLoading(false);
    }
  };



  return (
    <View style={styles.container}>
      {/* SCROLLABLE CONTENT - Search bar becomes sticky */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]} // Index 1 is the searchBox container
      >
        {/* Branding - Scrolls away */}
        < View style={styles.brandingContainer} >
          <Text style={styles.branding}>Smart Dine</Text>
          <Text style={styles.tagline}>AI-Powered Food Discovery</Text>
        </View >

        {/* Search Box - Sticks to top */}
        < View style={styles.stickySearchContainer} >
          <View style={styles.searchBox}>
            <Icon name="magnify" size={24} color="#ff6b00" style={styles.searchIcon} />
            <TextInput
              placeholder="What are you craving today?"
              placeholderTextColor="#999"
              style={styles.input}
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

        {/* AI Text - Simple inline text, no container */}
        {
          searched && aiText && (
            <Text style={styles.aiText}>{aiText}</Text>
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
        <View style={styles.discoverSection}>
          <Text style={styles.sectionTitle}>Discover Food</Text>
          <FlatList
            horizontal
            data={discoverFoods}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => `discover-food-${index}`}
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
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Discover Restaurants Section - All scroll together */}
        <View style={styles.restaurantsSection}>
          <Text style={styles.sectionTitle}>Discover Restaurants</Text>
          {discoverRestaurants.map((restaurant, index) => (
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
      </ScrollView >
    </View >
  );
}

import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  brandingContainer: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 10, backgroundColor: '#f8f9fa' },
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
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  searchIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#333', fontWeight: '500' },
  searchButton: { backgroundColor: '#ff6b00', borderRadius: 24, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', shadowColor: '#ff6b00', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },

  scrollView: { flex: 1 },
  aiText: { fontSize: 15, color: '#555', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, lineHeight: 20 },
  section: { marginTop: 8, marginBottom: 16 },
  discoverSection: { paddingTop: 24, paddingBottom: 20, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: 20 },
  restaurantsContainer: { paddingHorizontal: 16, marginTop: 16, marginBottom: 12 },
  restaurantsSection: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 16, paddingHorizontal: 20 },
  horizontalList: { paddingLeft: 20, paddingRight: 10, paddingBottom: 8 },

  // Responsive Width for Food Cards
  foodCardWrapper: {
    width: width * 0.65, // 65% of screen width
    marginRight: 16
  },
  restaurantCardWrapper: { marginBottom: 16 },
});
