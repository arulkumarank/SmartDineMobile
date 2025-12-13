import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from '../context/ThemeContext';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  onFocus?: () => void;
}

export default function SearchBar({ value, onChangeText, placeholder, onSubmit, onFocus }: Props) {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: colors.surface }]}
    >
      <TouchableOpacity onPress={onSubmit}>
        <Icon name="magnify" size={24} color={colors.primary} />
      </TouchableOpacity>

      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder || "Search for restaurant, item or more"}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        onFocus={onFocus}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 20,
    elevation: 5,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
});
