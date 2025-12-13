import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from '../context/ThemeContext';

interface Props {
  name: string;
  rating: number;
  image: string;
  cuisine: string;
  onPress: () => void;
}

export default function RestaurantCard({
  name,
  rating,
  image,
  cuisine,
  onPress,
}: Props) {
  const { colors } = useTheme();

  const themedStyles = {
    card: { backgroundColor: colors.card },
    title: { color: colors.text },
    rating: { color: colors.textSecondary },
    sub: { color: colors.textSecondary },
  };

  return (
    <TouchableOpacity style={[styles.card, themedStyles.card]} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.image} />

      <View style={styles.info}>
        <Text style={[styles.title, themedStyles.title]}>{name}</Text>

        <View style={styles.row}>
          <Icon name="star" size={16} color="#ff9500" />
          <Text style={[styles.rating, themedStyles.rating]}>{rating}</Text>
        </View>

        <Text style={[styles.sub, themedStyles.sub]}>{cuisine}</Text>

      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
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
