import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationsContext';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface StyledAlertProps {
    visible: boolean;
    type?: AlertType;
    title: string;
    message: string;
    onClose: () => void;
    buttonText?: string;
    saveToNotifications?: boolean;
}

const alertConfig = {
    success: {
        icon: 'check-circle',
        iconColor: '#4CAF50',
        bgColor: '#e8f5e9',
    },
    error: {
        icon: 'alert-circle',
        iconColor: '#f44336',
        bgColor: '#ffebee',
    },
    warning: {
        icon: 'alert',
        iconColor: '#ff9800',
        bgColor: '#fff3e0',
    },
    info: {
        icon: 'information',
        iconColor: '#2196f3',
        bgColor: '#e3f2fd',
    },
};

export default function StyledAlert({
    visible,
    type = 'info',
    title,
    message,
    onClose,
    buttonText = 'OK',
    saveToNotifications = true,
}: StyledAlertProps) {
    const { colors } = useTheme();
    const { addNotification } = useNotifications();
    const config = alertConfig[type];
    const hasAddedRef = useRef(false);

    // Save to notifications when alert becomes visible
    useEffect(() => {
        if (visible && saveToNotifications && title && message && !hasAddedRef.current) {
            addNotification(type, title, message);
            hasAddedRef.current = true;
        }
        if (!visible) {
            hasAddedRef.current = false;
        }
    }, [visible, type, title, message, saveToNotifications, addNotification]);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.content, { backgroundColor: colors.surface }]}>
                    <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
                        <Icon name={config.icon} size={50} color={config.iconColor} />
                    </View>
                    <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                    <Text style={[styles.message, { color: colors.textSecondary }]}>
                        {message}
                    </Text>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: config.iconColor }]}
                        onPress={onClose}
                    >
                        <Text style={styles.buttonText}>{buttonText}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 28,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 10,
    },
    iconContainer: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    button: {
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 25,
        minWidth: 120,
        alignItems: 'center',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
