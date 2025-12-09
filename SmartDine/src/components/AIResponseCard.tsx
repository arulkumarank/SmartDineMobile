import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface AIResponseCardProps {
  answer: string;
  onClose: () => void;
}

export default function AIResponseCard({ answer, onClose }: AIResponseCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="sparkles" size={20} color="#ff8a00" />
          <Text style={styles.headerTitle}>AI Recommendation</Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <Icon name="close-circle" size={24} color="#999" />
        </TouchableOpacity>
      </View>
      <Text style={styles.answer}>{answer}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#ff8a00',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginLeft: 8,
  },
  answer: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
  },
});