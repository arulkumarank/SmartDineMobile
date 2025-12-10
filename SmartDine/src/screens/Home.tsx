import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { aiAPI, foodsAPI } from '../services/api';
import FoodCard from '../components/FoodCard';
import type { Food } from '../types';

export default function Home({ navigation }: any) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);

  // Animation values
  const searchBoxPosition = useRef(new Animated.Value(0)).current;

  // Load random food items on mount
  useEffect(() => {
    console.log('Home: Loading foods on mount...');
    loadRandomFoods();
  }, []);

  const loadRandomFoods = async () => {
    console.log('Home: Fetching foods from API...');
    setLoading(true);
    try {
      const response = await foodsAPI.getAll();
      console.log('Home: API Response:', response);
      console.log('Home: Foods count:', response.foods?.length || 0);
      setFoods(response.foods || []);
    } catch (error) {
      console.error('Home: Failed to load foods:', error);
      setFoods([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setSearched(true);

    // Animate search box to top
    Animated.timing(searchBoxPosition, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    try {
      const response = await aiAPI.ask(question);
      setAnswer(response.answer);

      // Reload foods to show recommendations
      const foodsResponse = await foodsAPI.getAll();
      setFoods(foodsResponse.foods || []);
    } catch (error: any) {
      console.error('AI error:', error);
      setAnswer('Sorry, could not get recommendations at this time.');
    } finally {
      setLoading(false);
    }
  };

  const searchBoxTop = searchBoxPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [120, 20], // Start lower (120px), move to top (20px)
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">

        <Animated.View
          style={[
            styles.searchContainer,
            {
              marginTop: searchBoxTop,
            },
          ]}>
          <View style={styles.searchBox}>
            <TextInput
              placeholder="What are you craving today?"
              placeholderTextColor="#888"
              style={styles.input}
              value={question}
              onChangeText={setQuestion}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={handleSearch} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#ff6b00" />
              ) : (
                <Icon name="magnify" size={28} color="#ff6b00" />
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* AI Message - Only show after search */}
        {searched && answer && (
          <View style={styles.messageContainer}>
            <Text style={styles.message}>
              Based on your preferences, here are specific food recommendations
            </Text>
            <Text style={styles.aiAnswer}>{answer}</Text>
          </View>
        )}

        {/* Food Cards Section */}
        <View style={styles.foodsContainer}>
          {/* Section Title */}
          <Text style={styles.sectionTitle}>
            {searched ? 'Recommended For You' : 'Discover Food'}
          </Text>

          {/* Loading State */}
          {loading && (
            <ActivityIndicator
              size="large"
              color="#ff6b00"
              style={styles.loader}
            />
          )}

          {/* Food Cards */}
          {!loading && foods.length > 0 && (
            <>
              {foods.map((item, index) => (
                <FoodCard
                  key={index}
                  food={item}
                  onPress={() => {
                    // Navigate to Restaurant screen with enriched data
                    const restaurantData = {
                      name: item.restaurant,
                      cuisine: item.cuisine || 'Food & Dining',
                      rating: item.rating || 4.5,
                      image: item.image || 'https://source.unsplash.com/600x400/?restaurant',
                      location: {
                        address: `${item.restaurant} - Visit us today!`,
                        latitude: 0,
                        longitude: 0,
                      },
                    };
                    navigation.navigate('Restaurant', restaurantData);
                  }}
                />
              ))}
            </>
          )}

          {/* Empty State */}
          {!loading && foods.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="food-off" size={64} color="#ddd" />
              <Text style={styles.emptyText}>No food available</Text>
              <Text style={styles.emptySubtext}>
                Check your internet connection
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  searchBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  messageContainer: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#ff6b00',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b00',
  },
  message: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ff6b00',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  aiAnswer: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  foodsContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 18,
    letterSpacing: -0.5,
  },
  loader: {
    marginTop: 40,
    marginBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
    textAlign: 'center',
  },
});
