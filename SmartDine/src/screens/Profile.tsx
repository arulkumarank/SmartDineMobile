import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: "receipt-text", label: "My Orders", color: "#ff8a00" },
    { icon: "heart", label: "Favorites", color: "#e91e63" },
    { icon: "map-marker", label: "Saved Addresses", color: "#4caf50" },
    { icon: "credit-card", label: "Payment Methods", color: "#2196f3" },
    { icon: "account-settings", label: "Account Settings", color: "#9c27b0" },
    { icon: "help-circle", label: "Help & Support", color: "#ff5722" },
    { icon: "information", label: "About", color: "#607d8b" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity>
            <Icon name="cog" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={{
              uri: user?.avatar || "https://i.pravatar.cc/200",
            }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.name || "Guest User"}</Text>
            <Text style={styles.email}>{user?.email || "guest@smartdine.com"}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Icon name="pencil" size={20} color="#ff8a00" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>₹2,450</Text>
            <Text style={styles.statLabel}>Spent</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                  <Icon name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Icon name="logout" size={20} color="#f44336" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
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
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#f0f0f0",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff3e0",
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#999",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 16,
  },
  menuContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f44336",
  },
  logoutText: {
    fontSize: 16,
    color: "#f44336",
    fontWeight: "700",
    marginLeft: 8,
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    color: "#999",
    marginTop: 24,
    marginBottom: 32,
  },
});