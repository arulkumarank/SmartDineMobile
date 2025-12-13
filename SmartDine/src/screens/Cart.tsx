import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import StyledAlert from '../components/StyledAlert';

const Cart = ({ navigation }: any) => {
  const { isDark, colors } = useTheme();
  const { items, removeFromCart, updateQuantity, getSubtotal, getTax, getTotal, clearCart } = useCart();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [alert, setAlert] = useState<{ visible: boolean; type: 'error' | 'success' | 'warning'; title: string; message: string }>({
    visible: false, type: 'success', title: '', message: ''
  });

  const handlePlaceOrder = () => {
    if (items.length === 0) {
      setAlert({ visible: true, type: 'warning', title: 'Empty Cart', message: 'Please add items to your cart first.' });
      return;
    }

    setAlert({
      visible: true,
      type: 'success',
      title: 'Order Placed! 🎉',
      message: `Your order of ₹${getTotal()} has been placed successfully!\n\nThis is a demo - no actual order was made.`
    });
  };

  const handleAlertClose = () => {
    if (alert.type === 'success' && alert.title.includes('Order')) {
      clearCart();
      setOrderPlaced(true);
    }
    setAlert({ ...alert, visible: false });
  };

  // Theme-aware styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    header: { backgroundColor: colors.surface },
    title: { color: colors.text },
    cartItem: { backgroundColor: colors.card },
    itemName: { color: colors.text },
    itemRestaurant: { color: colors.textSecondary },
    quantity: { color: colors.text },
    quantityButton: { backgroundColor: isDark ? colors.surface : '#fff5ed' },
    billingSummary: { backgroundColor: colors.surface },
    billingTitle: { color: colors.text },
    billingLabel: { color: colors.textSecondary },
    billingValue: { color: colors.text },
    emptyContainer: { backgroundColor: colors.background },
    emptyTitle: { color: colors.text },
    emptySubtitle: { color: colors.textSecondary },
  };

  const renderCartItem = ({ item }: any) => (
    <View style={[styles.cartItem, themedStyles.cartItem]}>
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/80' }}
        style={styles.itemImage}
      />
      <View style={styles.itemDetails}>
        <Text style={[styles.itemName, themedStyles.itemName]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.itemRestaurant, themedStyles.itemRestaurant]}>{item.restaurant}</Text>
        <Text style={styles.itemPrice}>₹{item.price}</Text>
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={[styles.quantityButton, themedStyles.quantityButton]}
          onPress={() => updateQuantity(item.cartId, item.quantity - 1)}
        >
          <Icon name="minus" size={16} color="#ff6b00" />
        </TouchableOpacity>
        <Text style={[styles.quantity, themedStyles.quantity]}>{item.quantity}</Text>
        <TouchableOpacity
          style={[styles.quantityButton, themedStyles.quantityButton]}
          onPress={() => updateQuantity(item.cartId, item.quantity + 1)}
        >
          <Icon name="plus" size={16} color="#ff6b00" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromCart(item.cartId)}
      >
        <Icon name="trash-can-outline" size={20} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  if (items.length === 0 && !orderPlaced) {
    return (
      <View style={[styles.emptyContainer, themedStyles.emptyContainer]}>
        <Icon name="cart-outline" size={80} color={colors.textSecondary} />
        <Text style={[styles.emptyTitle, themedStyles.emptyTitle]}>Your Cart is Empty</Text>
        <Text style={[styles.emptySubtitle, themedStyles.emptySubtitle]}>Add some delicious food to get started!</Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.browseButtonText}>Browse Food</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (orderPlaced) {
    return (
      <View style={[styles.emptyContainer, themedStyles.emptyContainer]}>
        <Icon name="check-circle" size={80} color="#4CAF50" />
        <Text style={[styles.emptyTitle, themedStyles.emptyTitle]}>Order Placed!</Text>
        <Text style={[styles.emptySubtitle, themedStyles.emptySubtitle]}>Thank you for your demo order.</Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => {
            setOrderPlaced(false);
            navigation.navigate('Home');
          }}
        >
          <Text style={styles.browseButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, themedStyles.container]}>
      {/* Header */}
      <View style={[styles.header, themedStyles.header]}>
        <View style={styles.headerLeft}>
          {navigation.canGoBack() && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
          <Text style={[styles.title, themedStyles.title]}>Your Cart</Text>
        </View>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Cart Items */}
      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.cartId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Billing Summary */}
      <View style={[styles.billingSummary, themedStyles.billingSummary]}>
        <Text style={[styles.billingTitle, themedStyles.billingTitle]}>Billing Summary</Text>

        <View style={styles.billingRow}>
          <Text style={[styles.billingLabel, themedStyles.billingLabel]}>Subtotal</Text>
          <Text style={[styles.billingValue, themedStyles.billingValue]}>₹{getSubtotal()}</Text>
        </View>

        <View style={styles.billingRow}>
          <Text style={[styles.billingLabel, themedStyles.billingLabel]}>Tax (5%)</Text>
          <Text style={[styles.billingValue, themedStyles.billingValue]}>₹{getTax()}</Text>
        </View>

        <View style={[styles.divider, { borderColor: colors.border }]} />

        <View style={styles.billingRow}>
          <Text style={[styles.totalLabel, themedStyles.billingTitle]}>Total</Text>
          <Text style={styles.totalValue}>₹{getTotal()}</Text>
        </View>

        {/* Place Order Button */}
        <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
          <Text style={styles.placeOrderText}>Place Order</Text>
          <Icon name="arrow-right" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <StyledAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={handleAlertClose}
      />
    </View>
  );
};

export default Cart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  clearText: {
    fontSize: 14,
    color: '#ff4444',
    fontWeight: '600',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 280,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  itemRestaurant: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ff6b00',
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 12,
    color: '#1a1a1a',
  },
  removeButton: {
    marginLeft: 12,
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  browseButton: {
    backgroundColor: '#ff6b00',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
    marginTop: 24,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  billingSummary: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 100,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 20,
  },
  billingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  billingLabel: {
    fontSize: 15,
    color: '#666',
  },
  billingValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ff6b00',
  },
  placeOrderButton: {
    flexDirection: 'row',
    backgroundColor: '#ff6b00',
    paddingVertical: 16,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
    shadowColor: '#ff6b00',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  placeOrderText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
});
