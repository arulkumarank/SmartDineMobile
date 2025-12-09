import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import RestaurantCard from "../components/RestaurantCard";
import AIResponseCard from "../components/AIResponseCard";

interface Restaurant {
  name: string;
  rating: number;
  image: string;
  cuisine: string;
  deliveryTime: string;
  diet?: string;
  spice?: string;
  mustTry?: string;
}

export default function HomeScreen({ navigation }: any) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAIResponse, setShowAIResponse] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  async function loadRestaurants() {
    try {
      const res = await axios.get<Restaurant[]>(
        "http://10.164.233.54:8000/restaurants"
      );
      setRestaurants(res.data);
      setFilteredRestaurants(res.data);
    } catch (error) {
      console.error("Error loading restaurants:", error);
    }
  }

  useEffect(() => {
    loadRestaurants();
  }, []);

  async function askAI() {
    if (!question.trim()) return;

    setLoading(true);
    setShowAIResponse(true);
    
    try {
      const res = await axios.post<{ answer: string }>(
        "http://10.164.233.54:8000/ask",
        { question }
      );
      
      setAnswer(res.data.answer);
      
      // Filter restaurants based on AI response
      const suggestedRestaurants = restaurants.filter((restaurant) => {
        const answerLower = res.data.answer.toLowerCase();
        return (
          answerLower.includes(restaurant.name.toLowerCase()) ||
          answerLower.includes(restaurant.cuisine.toLowerCase())
        );
      });

      if (suggestedRestaurants.length > 0) {
        setFilteredRestaurants(suggestedRestaurants);
      }

      // Animate AI response
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      
    } catch (error) {
      console.error("Error asking AI:", error);
      setAnswer("Sorry, I couldn't process your request. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function resetFilters() {
    setFilteredRestaurants(restaurants);
    setAnswer("");
    setShowAIResponse(false);
    setQuestion("");
    fadeAnim.setValue(0);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello! 👋</Text>
            <Text style={styles.title}>What are you craving?</Text>
          </View>
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => navigation.navigate('MapView')}
          >
            <Icon name="map-outline" size={24} color="#ff8a00" />
          </TouchableOpacity>
        </View>

        {/* AI Search Box */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Icon name="sparkles" size={20} color="#ff8a00" style={styles.searchIcon} />
            <TextInput
              placeholder="E.g., I want protein-rich food for my gym diet"
              value={question}
              onChangeText={setQuestion}
              style={styles.searchInput}
              multiline
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              onPress={() => {
                askAI();
                setQuestion("");
              }}
              disabled={loading}
            >
              <Icon 
                name={loading ? "hourglass-outline" : "send"} 
                size={22} 
                color="#ff8a00" 
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.aiHint}>✨ AI-powered recommendations</Text>
        </View>

        {/* AI Response */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#ff8a00" />
            <Text style={styles.loadingText}>Finding perfect matches...</Text>
          </View>
        )}

        {!loading && showAIResponse && answer && (
          <Animated.View style={[styles.aiResponseContainer, { opacity: fadeAnim }]}>
            <AIResponseCard 
              answer={answer} 
              onClose={resetFilters}
            />
          </Animated.View>
        )}

        {/* Restaurant List */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {showAIResponse && filteredRestaurants.length < restaurants.length
              ? `${filteredRestaurants.length} Recommendations`
              : 'All Restaurants'}
          </Text>
          {showAIResponse && filteredRestaurants.length < restaurants.length && (
            <TouchableOpacity onPress={resetFilters}>
              <Text style={styles.showAllButton}>Show All</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={filteredRestaurants}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <RestaurantCard
              name={item.name}
              rating={item.rating}
              image={item.image}
              cuisine={item.cuisine}
              deliveryTime={item.deliveryTime}
              onPress={() => navigation.navigate('RestaurantDetail', { restaurant: item })}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Icon name="restaurant-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No restaurants found</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 25,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
  },
  mapButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    maxHeight: 80,
  },
  aiHint: {
    fontSize: 12,
    color: '#ff8a00',
    marginTop: 8,
    marginLeft: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
  },
  aiResponseContainer: {
    marginBottom: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  showAllButton: {
    fontSize: 14,
    color: '#ff8a00',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
});