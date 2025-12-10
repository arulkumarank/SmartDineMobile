import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChangeText, placeholder, onSubmit }: Props) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 10,
        alignItems: "center",
        marginTop: 20,
        elevation: 5,
        width: "100%",
      }}
    >
      <TouchableOpacity onPress={onSubmit}>
        <Icon name="magnify" size={24} color="#ff6b00" />
      </TouchableOpacity>

      <TextInput
        style={{
          flex: 1,
          fontSize: 16,
          marginLeft: 10,
          color: "#333",
        }}
        placeholder={placeholder || "Search for restaurant, item or more"}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    flex:1
  },
  input: {
    marginLeft: 10,
    flex: 1,
    fontSize: 15,
  },
});
