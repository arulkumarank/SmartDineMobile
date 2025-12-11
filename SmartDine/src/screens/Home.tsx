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

      // Extract only the first descriptive paragraph (before recommendations)
      const fullText = aiRes.answer || '';
      const lines = fullText.split('\n');
      const descText = lines.slice(0, 3).join(' ').replace(/\*\*/g, '').trim();
      setAiText(descText);

      // Get all data
      const [foodsRes, restaurantsRes] = await Promise.all([
        foodsAPI.getAll(),
        restaurantsAPI.getAll()
      ]);

      console.log('Foods Response:', foodsRes);
      console.log('Restaurants Response:', restaurantsRes);

      // Filter foods - match any part of the query
      const queryLower = question.toLowerCase();
      const allFoods = foodsRes.foods || [];
      const allRestaurants = restaurantsRes.restaurants || [];

      // Try to find matching foods based on query keywords
      const queryWords = queryLower.split(' ').filter(word => word.length > 2);

      let matchedFoods = allFoods.filter((f: Food) => {
        const nameMatch = f.name.toLowerCase().includes(queryLower);
        const restaurantMatch = f.restaurant.toLowerCase().includes(queryLower);
        const cuisineMatch = f.cuisine && f.cuisine.toLowerCase().includes(queryLower);

        // Check if any query word matches
        const wordMatch = queryWords.some(word =>
          f.name.toLowerCase().includes(word) ||
          f.restaurant.toLowerCase().includes(word) ||
          (f.cuisine && f.cuisine.toLowerCase().includes(word)) ||
          (f.tags && f.tags.some(tag => tag.toLowerCase().includes(word)))
        );

        return nameMatch || restaurantMatch || cuisineMatch || wordMatch;
      });

      // If no matches found, show all foods (AI will still provide relevant context)
      if (matchedFoods.length === 0) {
        console.log('No exact matches found, showing all available foods');
        matchedFoods = allFoods;
      }

      const matchedRestaurants = allRestaurants.filter((r: Restaurant) =>
        r.name.toLowerCase().includes(queryLower) ||
        r.cuisine.toLowerCase().includes(queryLower) ||
        queryWords.some(word =>
          r.name.toLowerCase().includes(word) ||
          r.cuisine.toLowerCase().includes(word)
        )
      );

      console.log('Matched Foods:', matchedFoods.length);
      console.log('Matched Restaurants:', matchedRestaurants.length);

      setSuggestedFoods(matchedFoods.slice(0, 10));
      setSuggestedRestaurants(matchedRestaurants.slice(0, 3));
    } catch (error) {
      console.error('AI error:', error);
      setAiText('Could not get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* STICKY HEADER - Only search bar */}
      <View style={styles.stickyHeader}>
        <View style={styles.brandingContainer}>
          <Text style={styles.branding}>Smart Dine</Text>
          <Text style={styles.tagline}>AI-Powered Food Discovery</Text>
        </View>

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
      </View>

      {/* SCROLLABLE CONTENT - Everything scrolls together */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* AI Text - Simple inline text, no container */}
        {searched && aiText && (
          <Text style={styles.aiText}>{aiText}</Text>
        )}

        {/* AI Suggested Foods - Horizontal Scroll */}
        {searched && suggestedFoods.length > 0 && (
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
        )}

        {/* AI Suggested Restaurants - Full Width Cards */}
        {searched && suggestedRestaurants.length > 0 && (
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
        )}

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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  stickyHeader: { backgroundColor: '#fff', paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 10, zIndex: 10 },
  brandingContainer: { marginBottom: 14 },
  branding: { fontSize: 32, fontWeight: '900', color: '#ff6b00', letterSpacing: -1 },
  tagline: { fontSize: 13, color: '#666', marginTop: 2 },
  searchBox: { backgroundColor: '#f8f8f8', borderRadius: 28, height: 52, flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 4, borderWidth: 2, borderColor: '#ff6b0015' },
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
  foodCardWrapper: { width: 150, marginRight: 12 },
  restaurantCardWrapper: { marginBottom: 16 },
});
