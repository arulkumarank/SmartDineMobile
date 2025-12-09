import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
import axios from "axios";

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadRestaurants() {
    const res = await axios.get("http://10.164.233.54:8000/restaurants");
    setRestaurants(res.data);
  }

  useEffect(() => {
    loadRestaurants();
  }, []);

  async function askAI() {
    setLoading(true);
    try {
      const res = await axios.post("http://10.164.233.54:8000/ask", {
        question
      });
      setAnswer(res.data.answer);
    } finally {
      setLoading(false);
    }
  }



  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        Discover great food 🍔
      </Text>

      <View style={{ marginTop: 15, flexDirection: "row" }}>
        <TextInput
          placeholder="What are you craving?"
          value={question}
          onChangeText={setQuestion}
          style={{
            flex: 1,
            backgroundColor: "#f3f3f3",
            padding: 12,
            borderRadius: 12,
          }}
        />
        <TouchableOpacity
          onPress={askAI}
          style={{
            backgroundColor: "#ff8a00",
            padding: 12,
            marginLeft: 8,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>Go</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={{ marginTop: 15 }}>Thinking...</Text>
      ) : answer ? (
        <Text style={{ marginTop: 15, fontWeight: "600" }}>{answer}</Text>
      ) : null}
    </View>
    );
};

export default Home;
