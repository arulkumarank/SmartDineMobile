import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Signup({ navigation }: any) {
    const { colors } = useTheme();
    const { signup } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!username.trim() || !email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await signup({ username, email, password });
            // Navigation will happen automatically via AuthContext
        } catch (error: any) {
            let errorMessage = 'Could not create account';

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // Server responded with error
                    errorMessage = error.response.data?.detail || 'Account creation failed';
                } else if (error.request) {
                    // No response from server
                    errorMessage = 'Cannot connect to server. Please check your internet connection.';
                } else {
                    // Other axios errors
                    errorMessage = 'Network error occurred';
                }
            }

            Alert.alert('Signup Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const themedStyles = {
        container: { backgroundColor: colors.background },
        title: { color: colors.primary },
        subtitle: { color: colors.textSecondary },
        input: { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
        linkText: { color: colors.textSecondary },
    };

    return (
        <View style={[styles.container, themedStyles.container]}>
            <View style={styles.content}>
                <Text style={[styles.title, themedStyles.title]}>Create Account</Text>
                <Text style={[styles.subtitle, themedStyles.subtitle]}>Join SmartDine today</Text>

                <TextInput
                    style={[styles.input, themedStyles.input]}
                    placeholder="Username"
                    placeholderTextColor={colors.textSecondary}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />

                <TextInput
                    style={[styles.input, themedStyles.input]}
                    placeholder="Email"
                    placeholderTextColor={colors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput
                    style={[styles.input, themedStyles.input]}
                    placeholder="Password (min 6 characters)"
                    placeholderTextColor={colors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSignup}
                    disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Sign Up</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => navigation.navigate('Login')}>
                    <Text style={[styles.linkText, themedStyles.linkText]}>
                        Already have an account? <Text style={styles.linkBold}>Login</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#ff6b00',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 40,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#eee',
    },
    button: {
        backgroundColor: '#ff6b00',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    linkButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    linkText: {
        color: '#666',
        fontSize: 15,
    },
    linkBold: {
        color: '#ff6b00',
        fontWeight: '600',
    },
});
