import React from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";

const Restaurant = ({ route }: any) => {

  const restaurant = route?.params;

  const menu = [
    { id: 1, name: "Chicken Biryani", price: 180, img: "https://i.imgur.com/Vla3j8Z.jpg" },
    { id: 2, name: "Paneer Butter Masala", price: 160, img: "https://i.imgur.com/uf7aQZR.jpg" },
    { id: 3, name: "Veg Noodles", price: 120, img: "https://i.imgur.com/Dxr4R2N.jpg" },
  ];

  return (
    <ScrollView style={styles.container}>
      
      <Image
        source={{ uri: restaurant?.image || "https://source.unsplash.com/600x300/?restaurant" }}
        style={styles.coverImage}
      />

      <View style={styles.infoContainer}>
        <Text style={styles.title}>{restaurant?.name || "Restaurant"}</Text>
        <Text style={styles.sub}>{restaurant?.rating || "4.2 ⭐"} · 30 mins</Text>
        <Text style={styles.address}>Near your location</Text>
      </View>

      <Text style={styles.menuTitle}>Recommended Dishes</Text>

      {menu.map(item => (
        <View key={item.id} style={styles.menuCard}>
          <Image source={{ uri: item.img }} style={styles.foodImg} />
          <View style={styles.details}>
            <Text style={styles.foodName}>{item.name}</Text>
            <Text style={styles.price}>₹ {item.price}</Text>
          </View>

          <TouchableOpacity style={styles.addBtn}>
            <Text style={styles.addTxt}>ADD</Text>
          </TouchableOpacity>
        </View>
      ))}

    </ScrollView>
  );
};

export default Restaurant;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  coverImage: { width: "100%", height: 200 },
  infoContainer: { padding: 15 },
  title: { fontSize: 24, fontWeight: "700" },
  sub: { fontSize: 14, color: "#666", marginTop: 4 },
  address: { color: "#999", marginTop: 4 },
  menuTitle: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "700",
    padding: 15,
  },
  menuCard: {
    flexDirection: "row",
    padding: 15,
    alignItems: "center",
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  foodImg: { width: 70, height: 70, borderRadius: 10 },
  details: { flex: 1, marginLeft: 10 },
  foodName: { fontSize: 16, fontWeight: "600" },
  price: { marginTop: 5, fontSize: 14, color: "#444" },
  addBtn: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ff8a00",
    borderRadius: 8,
  },
  addTxt: { color: "#ff8a00", fontWeight: "700" },
});
