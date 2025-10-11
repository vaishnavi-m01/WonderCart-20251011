import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    PermissionsAndroid,
    Platform,
    ActivityIndicator,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Coords {
    latitude: number;
    longitude: number;
}

export default function LocationDisplay() {
    const [coords, setCoords] = useState<Coords | null>(null);
    const [city, setCity] = useState('');
    const [region, setRegion] = useState('');
    const [country, setCountry] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const requestPermission = async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission',
                    message: 'We need your location to show nearby info.',
                    buttonPositive: 'OK',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
    };

    const fetchLocation = async () => {
        const granted = await requestPermission();
        if (!granted) {
            setError(true);
            setLoading(false);
            return;
        }

        Geolocation.getCurrentPosition(
            async (position:any) => {
                const { latitude, longitude } = position.coords;
                console.log('📍 Coords:', latitude, longitude);
                setCoords({ latitude, longitude });

                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                    );
                    const data = await response.json();

                    console.log('📍 OSM address:', data.address);

                    const addr = data.address;
                    setCity(
                        addr.city ||
                        addr.town ||
                        addr.village ||
                        addr.county ||
                        addr.hamlet ||
                        ''
                    );
                    setRegion(addr.state || '');
                    setCountry(addr.country || '');
                } catch (err) {
                    console.log('❌ OSM Error:', err instanceof Error ? err.message : err);
                    setError(true);
                }

                setLoading(false);
            },
            (err) => {
                console.log('❌ Location fetch error:', err.message);
                setError(true);
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000,
            }
        );
    };

    useEffect(() => {
        fetchLocation();
    }, []);

    if (loading) {
        return (
            <View style={styles.row}>
                <Ionicons name="location-sharp" size={20} color="#007bff" />
                <ActivityIndicator size="small" color="#007bff" style={{ marginLeft: 8 }} />
                <Text style={styles.loading}>Finding your location...</Text>
            </View>
        );
    }

    if (error || (!city && !region && !country)) {
        return (
            <View style={styles.container}>
                <View style={styles.row}>
                    <Ionicons name="location-sharp" size={20} color="#999" />
                    <Text style={styles.errorText}>Location not found</Text>
                </View>
                {coords && (
                    <Text style={styles.subText}>
                        Latitude: {coords.latitude.toFixed(4)}, Longitude: {coords.longitude.toFixed(4)}
                    </Text>
                )}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Ionicons name="location-sharp" size={20} color="#007bff" />
                <Text style={styles.mainText}>{city || region || country}</Text>
            </View>
            {(region || country) && (
                <Text style={styles.subText}>
                    {region}{region && country ? ', ' : ''}{country}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        // backgroundColor: '#f2f2f2',
        // elevation: 2,
    },
    row: {

        flexDirection: 'row',
        alignItems: 'center',
    },
    mainText: {
        fontSize: 16,
        marginLeft: 8,
        color: '#333',
        fontWeight: '600',
    },
    subText: {
        marginLeft: 28,
        color: '#666',
        fontSize: 13,
        marginTop: 2,
    },
    loading: {
        marginLeft: 8,
        fontSize: 13,
        color: '#555',
    },
    errorText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#999',
    },
});
