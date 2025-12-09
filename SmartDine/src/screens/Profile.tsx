import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

const Profile = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{
            uri: "https://i.pravatar.cc/200",
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>Guest User</Text>
        <Text style={styles.sub}>Sign in to unlock offers</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Saved Addresses</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Payment Methods</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Help & Support</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Login / Register</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    marginTop: 50,
    marginBottom: 30,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
  },
  sub: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    marginTop: 10,
  },
  option: {
    paddingVertical: 18,
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  logoutBtn: {
    marginTop: 60,
    padding: 15,
    backgroundColor: "#ff8a00",
    borderRadius: 10,
  },
  logoutText: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
