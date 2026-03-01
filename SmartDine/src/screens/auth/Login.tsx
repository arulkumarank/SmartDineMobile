import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import StyledAlert from '../../components/common/StyledAlert';

export default function Login({ navigation }: any) {
    const { colors } = useTheme();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<{ visible: boolean; type: 'error' | 'success'; title: string; message: string }>({
        visible: false, type: 'error', title: '', message: ''
    });

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            setAlert({ visible: true, type: 'error', title: 'Error', message: 'Please fill in all fields' });
            return;
        }

        setLoading(true);
        try {
            await login({ username, password });
            // Navigation will happen automatically via AuthContext
        } catch (error: any) {
            let errorMessage = 'Invalid credentials';

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // Server responded with error
                    errorMessage = error.response.data?.detail || 'Login failed';
                } else if (error.request) {
                    // No response from server
                    errorMessage = 'Cannot connect to server. Please check your internet connection.';
                } else {
                    // Other axios errors
                    errorMessage = 'Network error occurred';
                }
            }

            setAlert({ visible: true, type: 'error', title: 'Login Failed', message: errorMessage });
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
                <Text style={[styles.title, themedStyles.title]}>Welcome to SmartDine</Text>
                <Text style={[styles.subtitle, themedStyles.subtitle]}>Login to discover great food</Text>

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
                    placeholder="Password"
                    placeholderTextColor={colors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLogin}
                    disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Login</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => navigation.navigate('Signup')}>
                    <Text style={[styles.linkText, themedStyles.linkText]}>
                        Don't have an account? <Text style={styles.linkBold}>Sign up</Text>
                    </Text>
                </TouchableOpacity>
            </View>

            <StyledAlert
                visible={alert.visible}
                type={alert.type}
                title={alert.title}
                message={alert.message}
                onClose={() => setAlert({ ...alert, visible: false })}
            />
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
