import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface Props {
  name: string;
  rating: number;
  image: string;
  cuisine: string;
  deliveryTime: string;
  onPress: () => void;
}

export default function RestaurantCard({
  name,
  rating,
  image,
  cuisine,
  deliveryTime,
  onPress,
}: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.image} />

      <View style={styles.info}>
        <Text style={styles.title}>{name}</Text>

        <View style={styles.row}>
          <Icon name="star" size={16} color="#ff9500" />
          <Text style={styles.rating}>{rating}</Text>
        </View>

        <Text style={styles.sub}>{cuisine}</Text>

        <Text style={styles.delivery}>{deliveryTime}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 5,
  },
  image: {
    width: "100%",
    height: 160,
  },
  info: {
    padding: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 3,
  },
  rating: {
    marginLeft: 4,
    color: "#444",
  },
  sub: {
    color: "#666",
    marginVertical: 2,
  },
  delivery: {
    color: "#ff8a00",
    fontWeight: "600",
    marginTop: 5,
  }
});
