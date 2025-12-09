import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface CartItem {
  id: string;
  name: string;
  restaurant: string;
  price: number;
  quantity: number;
  image: string;
}

const MOCK_CART_ITEMS: CartItem[] = [
  {
    id: "1",
    name: "Special Biryani",
    restaurant: "Biryani House",
    price: 250,
    quantity: 2,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400",
  },
  {
    id: "2",
    name: "Butter Chicken",
    restaurant: "Punjabi Dhaba",
    price: 280,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400",
  },
];

export default function CartScreen({ navigation }: any) {
  const [cartItems, setCartItems] = useState<CartItem[]>(MOCK_CART_ITEMS);

  function updateQuantity(id: string, delta: number) {
    setCartItems((items) =>
      items
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 40;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + tax;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cart</Text>
        <TouchableOpacity>
          <Icon name="delete-outline" size={24} color="#f44336" />
        </TouchableOpacity>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="cart-off" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>Add items to get started</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.browseButtonText}>Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.restaurantName}>{item.restaurant}</Text>
                  <Text style={styles.itemPrice}>₹{item.price}</Text>
                </View>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, -1)}
                  >
                    <Icon name="minus" size={18} color="#333" />
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, 1)}
                  >
                    <Icon name="plus" size={18} color="#333" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={styles.listContent}
          />

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{subtotal}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>₹{deliveryFee}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (5%)</Text>
              <Text style={styles.summaryValue}>₹{tax}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{total}</Text>
            </View>
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.checkoutButton}>
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
              <Icon name="arrow-right" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#333",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginTop: 24,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#999",
    marginTop: 8,
    marginBottom: 32,
  },
  browseButton: {
    backgroundColor: "#ff8a00",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  browseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  listContent: {
    padding: 16,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 13,
    color: "#999",
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ff8a00",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  quantity: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginHorizontal: 12,
  },
  summaryContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: "#666",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ff8a00",
  },
  bottomBar: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  checkoutButton: {
    flexDirection: "row",
    backgroundColor: "#ff8a00",
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8,
  },
});