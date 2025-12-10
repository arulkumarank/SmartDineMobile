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
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Animation values
  const searchBoxPosition = useRef(new Animated.Value(0)).current;

  // Load random food items on mount
  useEffect(() => {
    loadRandomFoods();
  }, []);

  const loadRandomFoods = async () => {
    try {
      const response = await foodsAPI.getAll();
      setFoods(response.foods || []);
    } catch (error) {
      console.error('Failed to load foods:', error);
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
      await loadRandomFoods();
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

        {searched && answer && (
          <View style={styles.messageContainer}>
            <Text style={styles.message}>
              Based on your preferences, here are specific food recommendations
            </Text>
            <Text style={styles.aiAnswer}>{answer}</Text>
          </View>
        )}

        <View style={styles.foodsContainer}>
          {!searched && (
            <Text style={styles.sectionTitle}>Discover Food</Text>
          )}
          {foods.length > 0 ? (
            foods.map((item, index) => (
              <FoodCard
                key={index}
                food={item}
                onPress={() => navigation.navigate('Restaurant', item)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>
              No food available at the moment
            </Text>
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
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 15,
    marginTop: 60,
    fontStyle: 'italic',
  },
});
