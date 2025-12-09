import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

interface RestaurantCardProps {
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
}: RestaurantCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Icon name="star" size={14} color="#ffc107" />
            <Text style={styles.rating}>{rating}</Text>
          </View>
          <View style={styles.dot} />
          <Text style={styles.cuisine}>{cuisine}</Text>
          <View style={styles.dot} />
          <View style={styles.detailItem}>
            <Icon name="time-outline" size={14} color="#666" />
            <Text style={styles.deliveryTime}>{deliveryTime}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 180,
    backgroundColor: "#f0f0f0",
  },
  info: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 4,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#999",
    marginHorizontal: 8,
  },
  cuisine: {
    fontSize: 14,
    color: "#666",
  },
  deliveryTime: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
});
