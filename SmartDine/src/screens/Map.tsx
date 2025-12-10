import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Map() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Map Screen</Text>
            <Text style={styles.subtitle}>
                Restaurant locations will be displayed here
            </Text>
            <Text style={styles.note}>
                Google Maps integration will be added after you configure the API key
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fafafa',
        padding: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#222',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    note: {
        fontSize: 14,
        color: '#ff6b00',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
