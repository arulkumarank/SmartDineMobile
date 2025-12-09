import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';

export default function SignupScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signup } = useAuth();

  async function handleSignup() {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      await signup(name, email, password);
    } catch (error) {
      Alert.alert('Error', 'Failed to create account');
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={28} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          <View style={styles.inputContainer}>
            <Icon name="account-outline" size={24} color="#666" style={styles.icon} />
            <TextInput
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="email-outline" size={24} color="#666" style={styles.icon} />
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock-outline" size={24} color="#666" style={styles.icon} />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock-check-outline" size={24} color="#666" style={styles.icon} />
            <TextInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              secureTextEntry={!showPassword}
            />
          </View>

          <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
  },
  signupButton: {
    backgroundColor: '#ff8a00',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#ff8a00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  signupButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#666',
    fontSize: 16,
  },
  loginLink: {
    color: '#ff8a00',
    fontSize: 16,
    fontWeight: '700',
  },
});