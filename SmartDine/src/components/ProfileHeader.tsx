import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCart } from '../context/CartContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProfileHeaderProps {
    navigation: any;
    username?: string;
}

export default function ProfileHeader({ navigation, username = 'User' }: ProfileHeaderProps) {
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const { itemCount } = useCart();

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('username');
            setDropdownVisible(false);
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleCartPress = () => {
        navigation.navigate('Cart');
    };

    return (
        <View style={styles.container}>
            {/* Cart Icon with Badge */}
            <TouchableOpacity style={styles.cartButton} onPress={handleCartPress}>
                <Icon name="cart-outline" size={24} color="#1a1a1a" />
                {itemCount > 0 && (
                    <View style={styles.cartBadge}>
                        <Text style={styles.cartBadgeText}>{itemCount > 9 ? '9+' : itemCount}</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Profile Bubble */}
            <TouchableOpacity
                style={styles.profileBubble}
                onPress={() => setDropdownVisible(true)}
            >
                <Icon name="account" size={22} color="#fff" />
            </TouchableOpacity>

            {/* Dropdown Modal */}
            <Modal
                visible={dropdownVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setDropdownVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setDropdownVisible(false)}
                >
                    <View style={styles.dropdown}>
                        {/* User Info */}
                        <View style={styles.userInfo}>
                            <View style={styles.avatarLarge}>
                                <Icon name="account" size={32} color="#fff" />
                            </View>
                            <Text style={styles.userName}>{username}</Text>
                        </View>

                        <View style={styles.divider} />

                        {/* Menu Items */}
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                setDropdownVisible(false);
                                navigation.navigate('Profile');
                            }}
                        >
                            <Icon name="account-circle-outline" size={22} color="#666" />
                            <Text style={styles.menuText}>My Profile</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                setDropdownVisible(false);
                                // TODO: Navigate to notifications
                            }}
                        >
                            <Icon name="bell-outline" size={22} color="#666" />
                            <Text style={styles.menuText}>Notifications</Text>
                            <View style={styles.notificationDot} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                setDropdownVisible(false);
                                navigation.navigate('Cart');
                            }}
                        >
                            <Icon name="cart-outline" size={22} color="#666" />
                            <Text style={styles.menuText}>My Cart</Text>
                            {itemCount > 0 && (
                                <Text style={styles.cartCount}>{itemCount}</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={[styles.menuItem, styles.logoutItem]}
                            onPress={handleLogout}
                        >
                            <Icon name="logout" size={22} color="#ff4444" />
                            <Text style={styles.logoutText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    cartButton: {
        position: 'relative',
        padding: 8,
    },
    cartBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: '#ff6b00',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '800',
    },
    profileBubble: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ff6b00',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#ff6b00',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 6,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 90,
        paddingRight: 16,
    },
    dropdown: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        width: 220,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        elevation: 20,
    },
    userInfo: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    avatarLarge: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#ff6b00',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        gap: 12,
    },
    menuText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    notificationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ff6b00',
    },
    cartCount: {
        backgroundColor: '#ff6b00',
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    logoutItem: {
        marginTop: 4,
    },
    logoutText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#ff4444',
        flex: 1,
    },
});
