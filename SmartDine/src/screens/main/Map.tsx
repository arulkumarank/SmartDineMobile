import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { restaurantsAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import type { Restaurant } from '../../types';

export default function Map({ navigation, route }: any) {
    const { isDark, colors } = useTheme();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const selectedRestaurant = route?.params?.restaurant;

    useEffect(() => {
        loadRestaurants();
    }, []);

    const loadRestaurants = async () => {
        try {
            const response = await restaurantsAPI.getAll();
            setRestaurants(response.restaurants || []);
        } catch (error) {
            console.error('Failed to load restaurants:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'markerClick') {
                const restaurant = restaurants.find(r => r.name === data.restaurantName);
                if (restaurant) {
                    navigation.navigate('Restaurant', { restaurant });
                }
            }
        } catch (e) {
            console.error('Error handling message:', e);
        }
    };

    const getMapHTML = () => {
        const markers = restaurants.map(r => ({
            name: r.name,
            lat: r.location?.latitude || r.location?.coordinates?.[1] || 13.0827,
            lng: r.location?.longitude || r.location?.coordinates?.[0] || 80.2707,
            cuisine: r.cuisine,
            rating: r.rating,
        }));

        const selectedLat = selectedRestaurant?.location?.latitude || selectedRestaurant?.location?.coordinates?.[1];
        const selectedLng = selectedRestaurant?.location?.longitude || selectedRestaurant?.location?.coordinates?.[0];
        const centerLat = selectedLat || 13.075;
        const centerLng = selectedLng || 80.24;
        const zoomLevel = selectedRestaurant ? 15 : 12;

        return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #map { height: 100%; width: 100%; }
        
        .marker-pin {
            width: 30px;
            height: 40px;
            position: relative;
            cursor: pointer;
        }
        
        .pin-icon {
            width: 30px;
            height: 30px;
            background: #FF6B35;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            position: absolute;
            left: 50%;
            top: 0;
            margin-left: -15px;
            box-shadow: 0 3px 8px rgba(0,0,0,0.4);
            border: 3px solid white;
        }
        
        .pin-icon::after {
            content: '';
            width: 12px;
            height: 12px;
            background: white;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
        }
        
        .marker-name {
            position: absolute;
            top: 36px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-family: -apple-system, sans-serif;
            font-size: 11px;
            font-weight: 600;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            color: #333;
            border: 1px solid #ddd;
        }
        
        .marker-pin.selected .pin-icon {
            background: #D94A1F;
            width: 40px;
            height: 40px;
            margin-left: -20px;
            border: 4px solid white;
        }
        
        .marker-pin.selected .pin-icon::after {
            width: 16px;
            height: 16px;
        }
        
        .marker-pin.selected .marker-name {
            font-size: 13px;
            top: 46px;
            background: #FF6B35;
            color: white;
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        const map = L.map('map').setView([${centerLat}, ${centerLng}], ${zoomLevel});
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map);

        const restaurants = ${JSON.stringify(markers)};
        const selectedName = ${JSON.stringify(selectedRestaurant?.name || null)};
        
        restaurants.forEach(r => {
            const isSelected = selectedName && r.name === selectedName;
            const icon = L.divIcon({
                className: 'custom-marker',
                html: \`
                    <div class="marker-pin \${isSelected ? 'selected' : ''}">
                        <div class="pin-icon"></div>
                        <div class="marker-name">\${r.name}</div>
                    </div>
                \`,
                iconSize: [30, 60],
                iconAnchor: [15, 40]
            });
            
            const marker = L.marker([r.lat, r.lng], { icon }).addTo(map);
            
            marker.on('click', function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'markerClick',
                    restaurantName: r.name
                }));
            });
            
            marker.bindPopup(\`
                <div style="text-align: center; padding: 6px;">
                    <strong style="font-size: 14px;">\${r.name}</strong><br>
                    <span style="color: #666; font-size: 12px;">\${r.cuisine}</span><br>
                    <span style="color: #FFD700; font-size: 12px;">⭐ \${r.rating}</span>
                </div>
            \`);
        });
    </script>
</body>
</html>
        `;
    };

    if (loading) {
        return (
            <View style={[styles.loading, { backgroundColor: isDark ? colors.background : '#fff' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: isDark ? colors.text : '#000', marginTop: 16 }}>
                    Loading {restaurants.length || 0} restaurants...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <WebView
                originWhitelist={['*']}
                source={{ html: getMapHTML() }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                onMessage={handleMessage}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
