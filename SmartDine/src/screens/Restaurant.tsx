import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Restaurant {
  name: string;
  rating: number;
  image: string;
  cuisine: string;
  deliveryTime: string;
  diet?: string;
  spice?: string;
  mustTry?: string;
}

const MENU_ITEMS = [
  { name: 'Special Biryani', price: '₹250', veg: false },
  { name: 'Butter Chicken', price: '₹280', veg: false },
  { name: 'Paneer Tikka', price: '₹220', veg: true },
  { name: 'Dal Makhani', price: '₹180', veg: true },
];

export default function RestaurantDetailScreen({ route, navigation }: any) {
  const { restaurant } = route.params as { restaurant: Restaurant };
  const [activeTab, setActiveTab] = useState('menu');
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {restaurant.name}
        </Text>
        <TouchableOpacity style={styles.favoriteButton}>
          <Icon name="heart-outline" size={24} color="#333" />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
      >
        {/* Restaurant Image */}
        <Image source={{ uri: restaurant.image }} style={styles.image} />

        {/* Floating Back Button */}
        <View style={styles.floatingButtons}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.floatingBackButton}
          >
            <Icon name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.floatingFavoriteButton}>
            <Icon name="heart-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Restaurant Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <Text style={styles.cuisine}>{restaurant.cuisine}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Icon name="star" size={20} color="#ffc107" />
              <Text style={styles.statText}>{restaurant.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Icon name="clock-outline" size={20} color="#ff8a00" />
              <Text style={styles.statText}>{restaurant.deliveryTime}</Text>
              <Text style={styles.statLabel}>Delivery</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Icon name="map-marker" size={20} color="#4caf50" />
              <Text style={styles.statText}>2.5 km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            {restaurant.diet && (
              <View style={styles.tag}>
                <Icon name="food-apple" size={16} color="#4caf50" />
                <Text style={styles.tagText}>{restaurant.diet}</Text>
              </View>
            )}
            {restaurant.spice && (
              <View style={styles.tag}>
                <Icon name="fire" size={16} color="#f44336" />
                <Text style={styles.tagText}>{restaurant.spice}</Text>
              </View>
            )}
            <View style={styles.tag}>
              <Icon name="silverware-fork-knife" size={16} color="#ff8a00" />
              <Text style={styles.tagText}>Fine Dining</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'menu' && styles.activeTab]}
              onPress={() => setActiveTab('menu')}
            >
              <Text style={[styles.tabText, activeTab === 'menu' && styles.activeTabText]}>
                Menu
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
              onPress={() => setActiveTab('reviews')}
            >
              <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
                Reviews
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'info' && styles.activeTab]}
              onPress={() => setActiveTab('info')}
            >
              <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
                Info
              </Text>
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          {activeTab === 'menu' && (
            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>Popular Items</Text>
              {MENU_ITEMS.map((item, index) => (
                <View key={index} style={styles.menuItem}>
                  <View style={styles.menuItemInfo}>
                    <View style={styles.menuItemHeader}>
                      <Icon
                        name={item.veg ? 'square-rounded' : 'square-rounded-outline'}
                        size={16}
                        color={item.veg ? '#4caf50' : '#f44336'}
                      />
                      <Text style={styles.menuItemName}>{item.name}</Text>
                    </View>
                    <Text style={styles.menuItemPrice}>{item.price}</Text>
                  </View>
                  <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Reviews */}
          {activeTab === 'reviews' && (
            <View style={styles.reviewsSection}>
              <Text style={styles.sectionTitle}>Customer Reviews</Text>
              <View style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>JD</Text>
                  </View>
                  <View style={styles.reviewInfo}>
                    <Text style={styles.reviewName}>John Doe</Text>
                    <View style={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon key={star} name="star" size={14} color="#ffc107" />
                      ))}
                    </View>
                  </View>
                </View>
                <Text style={styles.reviewText}>
                  Amazing food quality and great service! The biryani was exceptional.
                </Text>
              </View>
            </View>
          )}

          {/* Info */}
          {activeTab === 'info' && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Restaurant Information</Text>
              <View style={styles.infoItem}>
                <Icon name="map-marker" size={20} color="#666" />
                <Text style={styles.infoText}>123 Main Street, Tiruppur</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="phone" size={20} color="#666" />
                <Text style={styles.infoText}>+91 98765 43210</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="clock-outline" size={20} color="#666" />
                <Text style={styles.infoText}>Open: 10:00 AM - 11:00 PM</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Order Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.orderButton}>
          <Icon name="cart" size={20} color="#fff" />
          <Text style={styles.orderButtonText}>Order Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginHorizontal: 16,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  floatingButtons: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  floatingBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingFavoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  infoContainer: {
    padding: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
    marginBottom: 8,
  },
  cuisine: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#ff8a00',
  },
  tabText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#ff8a00',
  },
  menuSection: {
    marginBottom: 80,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  menuItemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ff8a00',
  },
  addButton: {
    backgroundColor: '#ff8a00',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  reviewsSection: {
    marginBottom: 80,
  },
  reviewCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff8a00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  reviewInfo: {
    flex: 1,
  },
  reviewName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reviewStars: {
    flexDirection: 'row',
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoSection: {
    marginBottom: 80,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#666',
    marginLeft: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  orderButton: {
    flexDirection: 'row',
    backgroundColor: '#ff8a00',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
});