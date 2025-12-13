import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useNotifications, Notification } from '../context/NotificationsContext';

const iconConfig = {
    success: { name: 'check-circle', color: '#4CAF50' },
    error: { name: 'alert-circle', color: '#f44336' },
    warning: { name: 'alert', color: '#ff9800' },
    info: { name: 'information', color: '#2196f3' },
};

export default function Notifications() {
    const { colors } = useTheme();
    const { notifications, markAsRead, markAllAsRead, clearAll } = useNotifications();

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const renderNotification = ({ item }: { item: Notification }) => {
        const icon = iconConfig[item.type];
        return (
            <TouchableOpacity
                style={[
                    styles.notificationCard,
                    { backgroundColor: colors.card },
                    !item.read && styles.unreadCard,
                ]}
                onPress={() => markAsRead(item.id)}
            >
                <View style={[styles.iconContainer, { backgroundColor: `${icon.color}20` }]}>
                    <Icon name={icon.name} size={24} color={icon.color} />
                </View>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <Text style={[styles.time, { color: colors.textSecondary }]}>
                            {formatTime(item.timestamp)}
                        </Text>
                    </View>
                    <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={2}>
                        {item.message}
                    </Text>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.headerBar, { backgroundColor: colors.surface }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
                {notifications.length > 0 && (
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={markAllAsRead} style={styles.headerButton}>
                            <Text style={styles.headerButtonText}>Mark all read</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={clearAll} style={styles.headerButton}>
                            <Text style={[styles.headerButtonText, { color: '#ff4444' }]}>Clear all</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Notifications List */}
            {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Icon name="bell-off-outline" size={64} color={colors.textSecondary} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>No Notifications</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                        You're all caught up! Notifications will appear here.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderNotification}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    headerButton: {
        padding: 4,
    },
    headerButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#ff6b00',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    unreadCard: {
        borderLeftWidth: 3,
        borderLeftColor: '#ff6b00',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
    },
    time: {
        fontSize: 12,
        marginLeft: 8,
    },
    message: {
        fontSize: 14,
        lineHeight: 20,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ff6b00',
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: 15,
        textAlign: 'center',
        marginTop: 8,
    },
});
