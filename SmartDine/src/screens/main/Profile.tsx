import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { profileAPI } from '../../services/api';
import type { UserProfile } from '../../types';
import StyledAlert from '../../components/common/StyledAlert';

export default function Profile() {
  const { isDark, colors } = useTheme();
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
  const [alert, setAlert] = useState<{ visible: boolean; type: 'error' | 'success'; title: string; message: string }>({
    visible: false, type: 'success', title: '', message: ''
  });

  const tasteOptions = [
    { label: '🌶️ Spicy', value: 'spicy' },
    { label: '🍯 Sweet', value: 'sweet' },
    { label: '🍋 Sour', value: 'sour' },
    { label: '🧂 Savory', value: 'savory' },
    { label: '😊 Mild', value: 'mild' },
  ];

  const cuisineOptions = [
    { label: '🍕 Italian', value: 'italian' },
    { label: '🍛 Indian', value: 'indian' },
    { label: '🌮 Mexican', value: 'mexican' },
    { label: '🍜 Chinese', value: 'chinese' },
    { label: '🍣 Japanese', value: 'japanese' },
    { label: '🍔 American', value: 'american' },
  ];

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
        taste_preferences: profile.taste_preferences,
        cuisine_preferences: profile.cuisine_preferences,
        dietary_restrictions: profile.dietary_restrictions,
      });
      setAlert({ visible: true, type: 'success', title: 'Success', message: 'Profile updated successfully' });
    } catch (error: any) {
      setAlert({ visible: true, type: 'error', title: 'Error', message: error.response?.data?.detail || 'Failed to update profile' });
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

  const toggleTastePreference = (value: string) => {
    const current = profile.taste_preferences || [];
    if (current.includes(value)) {
      setProfile({
        ...profile,
        taste_preferences: current.filter(item => item !== value),
      });
    } else {
      setProfile({
        ...profile,
        taste_preferences: [...current, value],
      });
    }
  };

  const toggleCuisinePreference = (value: string) => {
    const current = profile.cuisine_preferences || [];
    if (current.includes(value)) {
      setProfile({
        ...profile,
        cuisine_preferences: current.filter(item => item !== value),
      });
    } else {
      setProfile({
        ...profile,
        cuisine_preferences: [...current, value],
      });
    }
  };

  // Theme-aware styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    loadingContainer: { backgroundColor: colors.background },
    header: { backgroundColor: colors.surface },
    title: { color: colors.text },
    subtitle: { color: colors.textSecondary },
    label: { color: colors.text },
    inputContainer: { backgroundColor: colors.card, borderColor: colors.border },
    input: { color: colors.text },
    chip: { backgroundColor: colors.card, borderColor: colors.border },
    chipText: { color: colors.textSecondary },
    logoutButton: { backgroundColor: isDark ? colors.card : '#fff5ed', borderColor: isDark ? colors.border : '#ff6b0030' },
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, themedStyles.loadingContainer]}>
        <ActivityIndicator size="large" color="#ff6b00" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, themedStyles.container]} showsVerticalScrollIndicator={false}>
      {/* Header with Curvy Design */}
      <View style={[styles.header, themedStyles.header]}>
        <Icon name="account-circle" size={60} color="#ff6b00" />
        <Text style={[styles.title, themedStyles.title]}>My Profile</Text>
        <Text style={[styles.subtitle, themedStyles.subtitle]}>Personalize your experience</Text>
      </View>

      {/* Profile Form */}
      <View style={styles.formContainer}>
        <View style={styles.section}>
          <Text style={[styles.label, themedStyles.label]}>Name</Text>
          <View style={[styles.inputContainer, themedStyles.inputContainer]}>
            <Icon name="account" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, themedStyles.input]}
              value={profile.name}
              onChangeText={text => setProfile({ ...profile, name: text })}
              placeholder="Your name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, themedStyles.label]}>Email</Text>
          <View style={[styles.inputContainer, themedStyles.inputContainer]}>
            <Icon name="email" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, themedStyles.input]}
              value={profile.email}
              onChangeText={text => setProfile({ ...profile, email: text })}
              placeholder="your@email.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, themedStyles.label]}>Taste Preferences (Select Multiple)</Text>
          <View style={styles.chipsContainer}>
            {tasteOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.chip,
                  profile.taste_preferences?.includes(option.value) && styles.chipActive,
                ]}
                onPress={() => toggleTastePreference(option.value)}>
                <Text
                  style={[
                    styles.chipText,
                    profile.taste_preferences?.includes(option.value) && styles.chipTextActive,
                  ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, themedStyles.label]}>Cuisine Preferences (Select Multiple)</Text>
          <View style={styles.chipsContainer}>
            {cuisineOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.chip,
                  profile.cuisine_preferences?.includes(option.value) && styles.chipActive,
                ]}
                onPress={() => toggleCuisinePreference(option.value)}>
                <Text
                  style={[
                    styles.chipText,
                    profile.cuisine_preferences?.includes(option.value) && styles.chipTextActive,
                  ]}>
                  {option.label}
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
            <>
              <Icon name="check-circle" size={22} color="#fff" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={[styles.logoutButton, themedStyles.logoutButton]} onPress={logout}>
          <Icon name="logout" size={20} color="#ff6b00" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <StyledAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert({ ...alert, visible: false })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  header: { backgroundColor: '#fff', paddingTop: 60, paddingBottom: 30, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#1a1a1a', marginTop: 12 },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  formContainer: { padding: 20 },
  section: { marginBottom: 24 },
  label: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, borderWidth: 1.5, borderColor: '#e5e5e5' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#333', paddingVertical: 14 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: '#e0e0e0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  chipActive: { backgroundColor: '#ff6b00', borderColor: '#ff6b00', shadowColor: '#ff6b00', shadowOpacity: 0.3, shadowRadius: 6 },
  chipText: { fontSize: 14, color: '#666', textTransform: 'capitalize', fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  saveButton: { backgroundColor: '#ff6b00', marginTop: 10, padding: 16, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, shadowColor: '#ff6b00', shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, padding: 14, gap: 8, backgroundColor: '#fff5ed', borderRadius: 16, borderWidth: 1.5, borderColor: '#ff6b0030' },
  logoutButtonText: { color: '#ff6b00', fontSize: 16, fontWeight: '600' },
});
