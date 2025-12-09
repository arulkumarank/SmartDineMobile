import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons"; 

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import axios from "axios";
import RestaurantCard from "../components/RestaurantCard";


interface Restaurant {
  name: string;
  rating: number;
  image: string;
  cuisine: string;
  deliveryTime: string;
}

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadRestaurants() {
    const res = await axios.get<Restaurant[]>(
      "http://10.164.233.54:8000/restaurants"
    );
    setRestaurants(res.data);
  }

  useEffect(() => {
    loadRestaurants();
  }, []);

  async function askAI() {
    setLoading(true);
    try {
      const res = await axios.post<{ answer: string }>(
        "http://10.164.233.54:8000/ask",
        { question }
      );
      setAnswer(res.data.answer);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f6f6" }}> 
      <View style={{ padding: 16, flex: 1 ,marginTop:15 }}>
        <Text style={{
            fontSize: 26,
            fontWeight: "800",
            marginTop: 15,
            marginBottom: 5
          }}>
            Discover great food 🍔
        </Text>

        <View style={{
            flexDirection: "row",
            marginTop: 25,
            backgroundColor: "#f2f2f2",
            borderRadius: 14,
            paddingHorizontal: 12,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#e2e2e2"
          }}>
        <TextInput
            placeholder="What are you craving?"
            value={question}
            onChangeText={setQuestion}
            style={{
              flex: 1,
              paddingVertical: 12,
              fontSize: 16,
            }}
        />

        <TouchableOpacity
            onPress={() => {
              askAI();
              setQuestion(""); // 👈 clear box
            }}
          >
            <Icon name="send" size={22} color="#ff8a00" />
        </TouchableOpacity>
      </View>

      

        {/* AI answer */}
        {loading ? (
          <Text style={{ marginVertical: 15 }}>Thinking...</Text>
        ) : answer ? (
          <Text style={{ marginVertical: 15, fontWeight: "600" }}>{answer}</Text>
        ) : null}

        {/* Restaurant list */}
        <FlatList
          data={restaurants}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <RestaurantCard
              name={item.name}
              rating={item.rating}
              image={item.image}
              cuisine={item.cuisine}
              deliveryTime={item.deliveryTime}
              onPress={() => console.log("pressed", item.name)}
            />
          )}
          contentContainerStyle={{ paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
