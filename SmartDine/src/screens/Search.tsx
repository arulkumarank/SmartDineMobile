// src/screens/SearchScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Animated,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "axios";
import RestaurantCard from "../components/RestaurantCard";
import SearchBox from "../components/SearchBar";

type RestaurantType = {
  name: string;
  rating: number;
  image: string;
  cuisine: string;
  deliveryTime: string;
};

const POPULAR_SEARCHES = [
  "Italian",
  "Chinese",
  "Pizza",
  "Burgers",
  "Vegan",
  "Spicy",
];

export default function SearchScreen({ navigation }: any) {
  const [query, setQuery] = useState("");
  const [restaurants, setRestaurants] = useState<RestaurantType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  async function loadRestaurants() {
    try {
      const res = await axios.get("http://10.164.233.54:8000/restaurants");
      setRestaurants(res.data);
    } catch (error) {
      console.error("API ERROR:", error);
    }
  }

  useEffect(() => {
    loadRestaurants();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    setIsSearching(query.length > 0);
  }, [query]);

  const filtered = restaurants.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.cuisine.toLowerCase().includes(query.toLowerCase())
  );

  function handlePopularSearch(term: string) {
    setQuery(term);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Search</Text>
          <Text style={styles.subtitle}>Find your favorite restaurants</Text>
        </View>

        <SearchBox
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery("")}
        />

        {!isSearching && (
          <View style={styles.popularContainer}>
            <Text style={styles.sectionTitle}>Popular Searches</Text>
            <View style={styles.chipsContainer}>
              {POPULAR_SEARCHES.map((term, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.chip}
                  onPress={() => handlePopularSearch(term)}
                >
                  <Text style={styles.chipText}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {isSearching && (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {filtered.length}{" "}
              {filtered.length === 1 ? "result" : "results"} found
            </Text>
          </View>
        )}

        <FlatList
          data={isSearching ? filtered : restaurants}
          keyExtractor={(item, idx) => idx.toString()}
          renderItem={({ item }) => (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [
                  {
                    translateX: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              }}
            >
              <RestaurantCard
                name={item.name}
                rating={item.rating}
                image={item.image}
                cuisine={item.cuisine}
                deliveryTime={item.deliveryTime}
                onPress={() =>
                  navigation.navigate("RestaurantDetail", { restaurant: item })
                }
              />
            </Animated.View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Icon name="food-off" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No restaurants found</Text>
              <Text style={styles.emptySubtext}>
                Try a different search term
              </Text>
            </View>
          )}
        />
      </Animated.View>
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
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  popularContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  chipText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  resultsHeader: {
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#bbb",
  },
});
