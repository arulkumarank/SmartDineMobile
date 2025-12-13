import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

const APP_VERSION = '1.0.0';

export default function Settings({ navigation }: any) {
    const { mode, isDark, colors, setMode } = useTheme();

    interface SettingItem {
        icon: string;
        label: string;
        type: 'toggle' | 'navigate' | 'info';
        value?: boolean | string;
        onToggle?: () => void;
        onPress?: () => void;
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
            title: 'Preferences',
            items: [
                {
                    icon: 'heart-outline',
                    label: 'Food Preferences',
                    type: 'navigate',
                    onPress: () => navigation.navigate('Profile'),
                },
                {
                    icon: 'bell-outline',
                    label: 'Notifications',
                    type: 'navigate',
                    onPress: () => { },
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
                                ]}
                                onPress={item.type === 'navigate' ? item.onPress : undefined}
                                activeOpacity={item.type === 'navigate' ? 0.7 : 1}
                            >
                                <View style={styles.itemLeft}>
                                    <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                                        <Icon name={item.icon} size={20} color={colors.primary} />
                                    </View>
                                    <Text style={[styles.itemLabel, dynamicStyles.text]}>
                                        {item.label}
                                    </Text>
                                </View>
                                <View style={styles.itemRight}>
                                    {item.type === 'toggle' && (
                                        <Switch
                                            value={item.value as boolean}
                                            onValueChange={item.onToggle}
                                            trackColor={{ false: '#ddd', true: colors.primary + '80' }}
                                            thumbColor={item.value ? colors.primary : '#fff'}
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
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemLabel: {
        fontSize: 16,
        fontWeight: '500',
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
