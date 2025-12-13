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
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import StyledAlert from '../components/StyledAlert';
import { API_BASE_URL } from '../config/api';

type SignupStep = 'email' | 'otp' | 'details';

export default function Signup({ navigation }: any) {
    const { colors } = useTheme();
    const { signup } = useAuth();

    // Form state
    const [step, setStep] = useState<SignupStep>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<{ visible: boolean; type: 'error' | 'success'; title: string; message: string }>({
        visible: false, type: 'error', title: '', message: ''
    });

    // Step 1: Send OTP to email
    const handleSendOtp = async () => {
        if (!email.trim()) {
            setAlert({ visible: true, type: 'error', title: 'Error', message: 'Please enter your email' });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setAlert({ visible: true, type: 'error', title: 'Error', message: 'Please enter a valid email' });
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/auth/send-otp`, { email });
            setAlert({ visible: true, type: 'success', title: 'OTP Sent!', message: 'Check your email for the verification code' });
            setStep('otp');
        } catch (error: any) {
            let errorMessage = 'Could not send OTP';
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data?.detail || errorMessage;
            }
            setAlert({ visible: true, type: 'error', title: 'Error', message: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async () => {
        if (!otp.trim() || otp.length !== 6) {
            setAlert({ visible: true, type: 'error', title: 'Error', message: 'Please enter the 6-digit OTP' });
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/auth/verify-otp`, { email, otp });
            setAlert({ visible: true, type: 'success', title: 'Verified!', message: 'Email verified successfully' });
            setStep('details');
        } catch (error: any) {
            let errorMessage = 'Invalid OTP';
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data?.detail || errorMessage;
            }
            setAlert({ visible: true, type: 'error', title: 'Error', message: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Complete signup
    const handleSignup = async () => {
        if (!name.trim() || !username.trim() || !password.trim()) {
            setAlert({ visible: true, type: 'error', title: 'Error', message: 'Please fill in all fields' });
            return;
        }

        if (password.length < 6) {
            setAlert({ visible: true, type: 'error', title: 'Error', message: 'Password must be at least 6 characters' });
            return;
        }

        setLoading(true);
        try {
            await signup({ username, email, password, otp, name });
        } catch (error: any) {
            let errorMessage = 'Could not create account';
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data?.detail || errorMessage;
            }
            setAlert({ visible: true, type: 'error', title: 'Signup Failed', message: errorMessage });
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
        stepIndicator: { color: colors.textSecondary },
    };

    const renderStep = () => {
        switch (step) {
            case 'email':
                return (
                    <>
                        <Text style={[styles.stepText, themedStyles.stepIndicator]}>Step 1 of 3: Enter Email</Text>
                        <TextInput
                            style={[styles.input, themedStyles.input]}
                            placeholder="Email Address"
                            placeholderTextColor={colors.textSecondary}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            autoFocus
                        />
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSendOtp}
                            disabled={loading}>
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Send Verification Code</Text>
                            )}
                        </TouchableOpacity>
                    </>
                );

            case 'otp':
                return (
                    <>
                        <Text style={[styles.stepText, themedStyles.stepIndicator]}>Step 2 of 3: Verify Email</Text>
                        <Text style={[styles.otpInfo, themedStyles.subtitle]}>
                            Enter the 6-digit code sent to {email}
                        </Text>
                        <TextInput
                            style={[styles.input, styles.otpInput, themedStyles.input]}
                            placeholder="000000"
                            placeholderTextColor={colors.textSecondary}
                            value={otp}
                            onChangeText={setOtp}
                            keyboardType="number-pad"
                            maxLength={6}
                            autoFocus
                        />
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleVerifyOtp}
                            disabled={loading}>
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Verify OTP</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.resendButton}
                            onPress={handleSendOtp}
                            disabled={loading}>
                            <Text style={[styles.resendText, { color: colors.primary }]}>Resend Code</Text>
                        </TouchableOpacity>
                    </>
                );

            case 'details':
                return (
                    <>
                        <Text style={[styles.stepText, themedStyles.stepIndicator]}>Step 3 of 3: Create Account</Text>
                        <View style={styles.verifiedBadge}>
                            <Text style={styles.verifiedText}>✓ {email} verified</Text>
                        </View>
                        <TextInput
                            style={[styles.input, themedStyles.input]}
                            placeholder="Full Name"
                            placeholderTextColor={colors.textSecondary}
                            value={name}
                            onChangeText={setName}
                            autoFocus
                        />
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
                                <Text style={styles.buttonText}>Create Account</Text>
                            )}
                        </TouchableOpacity>
                    </>
                );
        }
    };

    return (
        <View style={[styles.container, themedStyles.container]}>
            <View style={styles.content}>
                <Text style={[styles.title, themedStyles.title]}>Create Account</Text>
                <Text style={[styles.subtitle, themedStyles.subtitle]}>Join SmartDine today</Text>

                {renderStep()}

                <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => navigation.navigate('Login')}>
                    <Text style={[styles.linkText, themedStyles.linkText]}>
                        Already have an account? <Text style={styles.linkBold}>Login</Text>
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
        marginBottom: 30,
    },
    stepText: {
        fontSize: 14,
        marginBottom: 20,
        fontWeight: '500',
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
    otpInput: {
        textAlign: 'center',
        fontSize: 24,
        letterSpacing: 10,
        fontWeight: '600',
    },
    otpInfo: {
        fontSize: 14,
        marginBottom: 15,
        textAlign: 'center',
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
    resendButton: {
        marginTop: 15,
        alignItems: 'center',
    },
    resendText: {
        fontSize: 15,
        fontWeight: '500',
    },
    verifiedBadge: {
        backgroundColor: '#e8f5e9',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        alignItems: 'center',
    },
    verifiedText: {
        color: '#2e7d32',
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
