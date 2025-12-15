import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';

const APP_VERSION = '1.0.0';
const NOTIFICATION_SETTINGS_KEY = '@notification_settings';

export default function Settings({ navigation }: any) {
    const { mode, isDark, colors, setMode } = useTheme();

    // Notification settings state
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [notificationSound, setNotificationSound] = useState(true);

    // Load notification settings on mount
    useEffect(() => {
        loadNotificationSettings();
    }, []);

    const loadNotificationSettings = async () => {
        try {
            const settingsStr = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
            if (settingsStr) {
                const settings = JSON.parse(settingsStr);
                setNotificationsEnabled(settings.enabled ?? true);
                setNotificationSound(settings.sound ?? true);
            }
        } catch (error) {
            console.error('Failed to load notification settings:', error);
        }
    };

    const saveNotificationSettings = async (enabled: boolean, sound: boolean) => {
        try {
            await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify({
                enabled,
                sound,
            }));
        } catch (error) {
            console.error('Failed to save notification settings:', error);
        }
    };

    const toggleNotifications = () => {
        const newValue = !notificationsEnabled;
        setNotificationsEnabled(newValue);
        saveNotificationSettings(newValue, notificationSound);
    };

    const toggleNotificationSound = () => {
        const newValue = !notificationSound;
        setNotificationSound(newValue);
        saveNotificationSettings(notificationsEnabled, newValue);
    };

    interface SettingItem {
        icon: string;
        label: string;
        description?: string;
        type: 'toggle' | 'navigate' | 'info';
        value?: boolean | string;
        onToggle?: () => void;
        onPress?: () => void;
        disabled?: boolean;
    }

    interface SettingSection {
        title: string;
        items: SettingItem[];
    }

    const settingsSections: SettingSection[] = [
        {
            title: 'Appearance',
            items: [
                {
                    icon: 'theme-light-dark',
                    label: 'Dark Mode',
                    type: 'toggle',
                    value: isDark,
                    onToggle: () => setMode(isDark ? 'light' : 'dark'),
                },
                {
                    icon: 'cellphone',
                    label: 'Use System Theme',
                    type: 'toggle',
                    value: mode === 'system',
                    onToggle: () => setMode(mode === 'system' ? 'light' : 'system'),
                },
            ],
        },
        {
            title: 'Notifications',
            items: [
                {
                    icon: 'bell-outline',
                    label: 'Surprise Notifications',
                    description: 'Get daily surprise food recommendations',
                    type: 'toggle',
                    value: notificationsEnabled,
                    onToggle: toggleNotifications,
                },
                {
                    icon: 'volume-high',
                    label: 'Notification Sound',
                    description: 'Play sound with notifications',
                    type: 'toggle',
                    value: notificationSound,
                    onToggle: toggleNotificationSound,
                    disabled: !notificationsEnabled,
                },
            ],
        },
        {
            title: 'Preferences',
            items: [
                {
                    icon: 'heart-outline',
                    label: 'Food Preferences',
                    type: 'navigate',
                    onPress: () => navigation.navigate('Profile'),
                },
            ],
        },
        {
            title: 'About',
            items: [
                {
                    icon: 'information-outline',
                    label: 'App Version',
                    type: 'info',
                    value: APP_VERSION,
                },
                {
                    icon: 'file-document-outline',
                    label: 'Terms of Service',
                    type: 'navigate',
                    onPress: () => { },
                },
                {
                    icon: 'shield-check-outline',
                    label: 'Privacy Policy',
                    type: 'navigate',
                    onPress: () => { },
                },
            ],
        },
    ];

    const dynamicStyles = {
        container: { backgroundColor: colors.background },
        surface: { backgroundColor: colors.surface },
        text: { color: colors.text },
        textSecondary: { color: colors.textSecondary },
        border: { borderColor: colors.border },
    };

    return (
        <ScrollView style={[styles.container, dynamicStyles.container]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, dynamicStyles.text]}>Settings</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Settings Sections */}
            {settingsSections.map((section, sectionIndex) => (
                <View key={sectionIndex} style={styles.section}>
                    <Text style={[styles.sectionTitle, dynamicStyles.textSecondary]}>
                        {section.title}
                    </Text>
                    <View style={[styles.sectionCard, dynamicStyles.surface]}>
                        {section.items.map((item, itemIndex) => (
                            <TouchableOpacity
                                key={itemIndex}
                                style={[
                                    styles.settingItem,
                                    itemIndex < section.items.length - 1 && styles.itemBorder,
                                    itemIndex < section.items.length - 1 && dynamicStyles.border,
                                    item.disabled && styles.disabledItem,
                                ]}
                                onPress={item.type === 'navigate' ? item.onPress : undefined}
                                activeOpacity={item.type === 'navigate' ? 0.7 : 1}
                                disabled={item.disabled}
                            >
                                <View style={styles.itemLeft}>
                                    <View style={[
                                        styles.iconContainer,
                                        { backgroundColor: colors.primary + '20' },
                                        item.disabled && { opacity: 0.4 }
                                    ]}>
                                        <Icon name={item.icon} size={20} color={colors.primary} />
                                    </View>
                                    <View style={styles.labelContainer}>
                                        <Text style={[
                                            styles.itemLabel,
                                            dynamicStyles.text,
                                            item.disabled && { opacity: 0.4 }
                                        ]}>
                                            {item.label}
                                        </Text>
                                        {item.description && (
                                            <Text style={[styles.itemDescription, dynamicStyles.textSecondary]}>
                                                {item.description}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                                <View style={styles.itemRight}>
                                    {item.type === 'toggle' && (
                                        <Switch
                                            value={item.value as boolean}
                                            onValueChange={item.onToggle}
                                            trackColor={{ false: '#ddd', true: colors.primary + '80' }}
                                            thumbColor={item.value ? colors.primary : '#fff'}
                                            disabled={item.disabled}
                                        />
                                    )}
                                    {item.type === 'navigate' && (
                                        <Icon name="chevron-right" size={22} color={colors.textSecondary} />
                                    )}
                                    {item.type === 'info' && (
                                        <Text style={[styles.infoValue, dynamicStyles.textSecondary]}>
                                            {item.value}
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            ))}

            {/* App Info Footer */}
            <View style={styles.footer}>
                <Text style={[styles.footerText, dynamicStyles.textSecondary]}>
                    SmartDine v{APP_VERSION}
                </Text>
                <Text style={[styles.footerSubtext, dynamicStyles.textSecondary]}>
                    AI-Powered Food Discovery
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    placeholder: {
        width: 40,
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    sectionCard: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    itemBorder: {
        borderBottomWidth: 1,
    },
    disabledItem: {
        opacity: 0.6,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        flex: 1,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    labelContainer: {
        flex: 1,
    },
    itemLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    itemDescription: {
        fontSize: 12,
        marginTop: 2,
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '500',
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    footerText: {
        fontSize: 14,
        fontWeight: '600',
    },
    footerSubtext: {
        fontSize: 12,
        marginTop: 4,
    },
});

