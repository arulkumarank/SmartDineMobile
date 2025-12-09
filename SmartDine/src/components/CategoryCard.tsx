import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

interface Props {
  title: string;
  image: string;
  onPress: () => void;
}

export default function CategoryCard({ title, image, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.icon} />
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginRight: 18,
  },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: "#fff",
    resizeMode: "cover",
    elevation: 4,
  },
  text: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#444",
  }
});
