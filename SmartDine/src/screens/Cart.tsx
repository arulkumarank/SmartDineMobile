import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Cart = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart 🛒</Text>

      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Browse Restaurants</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Cart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
  },
  emptyBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#777",
  },
  button: {
    backgroundColor: "#ff8a00",
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 40,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
