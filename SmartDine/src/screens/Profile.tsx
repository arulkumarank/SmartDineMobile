import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import type { UserProfile } from '../types';

export default function Profile() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    username: '',
    name: '',
    email: '',
    taste_preference: '',
    dietary_restrictions: [],
  });

  const tasteOptions = ['modern', 'comfort', 'traditional'];
  const dietaryOptions = [
    'vegetarian',
    'vegan',
    'gluten-free',
    'dairy-free',
    'nut-free',
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await profileAPI.get();
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileAPI.update({
        name: profile.name,
        email: profile.email,
        taste_preference: profile.taste_preference,
        dietary_restrictions: profile.dietary_restrictions,
      });
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleDietaryRestriction = (option: string) => {
    const current = profile.dietary_restrictions || [];
    if (current.includes(option)) {
      setProfile({
        ...profile,
        dietary_restrictions: current.filter(item => item !== option),
      });
    } else {
      setProfile({
        ...profile,
        dietary_restrictions: [...current, option],
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6b00" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={profile.name}
          onChangeText={text => setProfile({ ...profile, name: text })}
          placeholder="Your name"
          placeholderTextColor="#888"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={profile.email}
          onChangeText={text => setProfile({ ...profile, email: text })}
          placeholder="your@email.com"
          placeholderTextColor="#888"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Taste Preference</Text>
        <View style={styles.chipsContainer}>
          {tasteOptions.map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.chip,
                profile.taste_preference === option && styles.chipActive,
              ]}
              onPress={() =>
                setProfile({ ...profile, taste_preference: option })
              }>
              <Text
                style={[
                  styles.chipText,
                  profile.taste_preference === option && styles.chipTextActive,
                ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Dietary Restrictions</Text>
        <View style={styles.chipsContainer}>
          {dietaryOptions.map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.chip,
                profile.dietary_restrictions?.includes(option) &&
                styles.chipActive,
              ]}
              onPress={() => toggleDietaryRestriction(option)}>
              <Text
                style={[
                  styles.chipText,
                  profile.dietary_restrictions?.includes(option) &&
                  styles.chipTextActive,
                ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Icon name="logout" size={20} color="#ff6b00" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#222',
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  chipActive: {
    backgroundColor: '#ff6b00',
    borderColor: '#ff6b00',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#ff6b00',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    marginTop: 10,
    padding: 16,
    gap: 8,
  },
  logoutButtonText: {
    color: '#ff6b00',
    fontSize: 16,
    fontWeight: '600',
  },
});
