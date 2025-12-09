// src/components/SearchBox.tsx
import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export default function SearchBox({ value, onChangeText, placeholder, onClear }: Props) {
  return (
    <View style={styles.container}>
      <Icon name="magnify" size={24} color="#ff8a00" />

      <TextInput
        style={styles.input}
        placeholder={placeholder || "Search restaurants or cuisines..."}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#999"
      />

      {value.length > 0 && (
        <TouchableOpacity onPress={onClear}>
          <Icon name="close-circle" size={22} color="#999" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
});
