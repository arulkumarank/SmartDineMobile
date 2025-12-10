import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Text, FlatList, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "axios";

type RestaurantType = {
  name: string;
  rating?: number;
  image?: string;
};

export default function Search({ navigation }: any) {
  const [query, setQuery] = useState("");
  const [restaurants, setRestaurants] = useState<RestaurantType[]>([]);

  async function loadRestaurants() {
    try {
      const res = await axios.get("http://10.164.233.54:8000/restaurants");
      // Backend returns {restaurants: [...], count: n}
      setRestaurants(res.data.restaurants || []);
    } catch (error) {
      console.log("API ERROR:", error);
      setRestaurants([]);
    }
  }

  useEffect(() => {
    loadRestaurants();
  }, []);

  const filtered = restaurants.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Icon name="magnify" size={24} color="#555" />
        <TextInput
          placeholder="Search for restaurants, dishes..."
          value={query}
          onChangeText={setQuery}
          style={styles.input}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate("Restaurant", item)}
          >
            <Text style={styles.result}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  searchBox: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    elevation: 4,
  },

  input: { marginLeft: 10, flex: 1 },
  result: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
    fontSize: 16,
  },
});
