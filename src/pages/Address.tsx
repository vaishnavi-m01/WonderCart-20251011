import React, { useEffect, useState, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    Alert,
    ActivityIndicator,
    SafeAreaView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useFocusEffect, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/StackScreen";
import apiClient from '../services/apiBaseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Address = {
    addressId: number;
    userId: number;
    countryId: number | null;
    stateId: number | null;
    type: string;
    line1: string;
    line2: string;
    city: string;
    pinCode: string;
};
type Country = {
    countryId: number;
    countryName: string;
};
type State = {
    stateId: number;
    stateName: string;
    countryId: number;
};

type DeliveryAddressNavigationProp = StackNavigationProp<RootStackParamList, 'DeliveryAddress'>;
type DeliveryAddressRouteProp = RouteProp<RootStackParamList, 'DeliveryAddress'>;

const AddressPage = () => {
    const navigation = useNavigation<DeliveryAddressNavigationProp>();
    const route = useRoute<DeliveryAddressRouteProp>();

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(0);
    const [username, setUserName] = useState("");
    const [phone, setPhone] = useState("");
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [countries, setCountries] = useState<Country[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const insets = useSafeAreaInsets();

    // Load user data
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userString = await AsyncStorage.getItem('user');
                if (userString) {
                    const user = JSON.parse(userString);
                    setUserId(user.userId);
                    setUserName(user.name || "");
                    setPhone(user.phone || "");
                }
            } catch (error) {
                console.error('Error loading user from AsyncStorage:', error);
            }
        };
        loadUserData();
    }, []);

    // Load saved selected address
    useEffect(() => {
        const loadSelectedAddress = async () => {
            try {
                const savedAddress = await AsyncStorage.getItem('selectedAddress');
                if (savedAddress) {
                    const parsed = JSON.parse(savedAddress);
                    setSelectedAddressId(parsed.addressId);
                }
            } catch (error) {
                console.error('Error loading selected address:', error);
            }
        };
        loadSelectedAddress();
    }, []);

    // Fetch addresses
    const fetchAddresses = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const res = await apiClient.get(`v1/address/user/${userId}`);
            setAddresses(res.data);
            // If no selection yet, select first
            if (!selectedAddressId && res.data.length > 0) {
                setSelectedAddressId(res.data[0].addressId);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Unable to load addresses.');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAddresses();
        }, [userId])
    );

    useEffect(() => {
        if (route.params?.refresh && userId) {
            fetchAddresses();
        }
    }, [route.params, userId]);

    // Fetch countries
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await apiClient.get('v1/country');
                setCountries(res.data);
            } catch (error) {
                console.error('Error fetching countries:', error);
            }
        };
        fetchCountries();
    }, []);

    // Fetch states
    useEffect(() => {
        const fetchStates = async () => {
            try {
                const res = await apiClient.get('v1/states');
                setStates(res.data);
            } catch (error) {
                console.error('Error fetching states:', error);
            }
        };
        fetchStates();
    }, []);

    const handleAddAddress = () => {
        navigation.navigate("DeliveryAddressForm");
    };

    const handleDeliver = async (address: Address) => {
        try {
            const country = countries.find(c => c.countryId === address.countryId);
            const state = states.find(s => s.stateId === address.stateId);

            const selectedAddress = {
                ...address,
                name: username,
                phone: phone,
                countryName: country?.countryName || '',
                stateName: state?.stateName || '',
            };
            await AsyncStorage.setItem('selectedAddress', JSON.stringify(selectedAddress));
            navigation.navigate("CheckOut");
        } catch (error) {
            console.error('Error saving selected address:', error);
            Alert.alert('Error', 'Failed to proceed to payment.');
        }
    };

    const handleClick = async () => {
        const selected = addresses.find(a => a.addressId === selectedAddressId);
        if (selected) {
            const country = countries.find(c => c.countryId === selected.countryId);
            const state = states.find(s => s.stateId === selected.stateId);

            const selectedAddress = {
                ...selected,
                name: username,
                phone: phone,
                countryName: country?.countryName || '',
                stateName: state?.stateName || '',
            };

            await AsyncStorage.setItem('selectedAddress', JSON.stringify(selectedAddress));
        }
        navigation.goBack();
    };

    const handleSelectAddress = async (item: Address) => {
        setSelectedAddressId(item.addressId);

        const country = countries.find(c => c.countryId === item.countryId);
        const state = states.find(s => s.stateId === item.stateId);

        const selectedAddress = {
            ...item,
            name: username,
            phone: phone,
            countryName: country?.countryName || '',
            stateName: state?.stateName || '',
        };

        await AsyncStorage.setItem('selectedAddress', JSON.stringify(selectedAddress));
    };


    const renderAddressItem = ({ item }: { item: Address }) => {
        const isSelected = item.addressId === selectedAddressId;

        return (
           <TouchableOpacity onPress={() => handleSelectAddress(item)}>

                <View style={[
                    styles.addressCard,
                    isSelected && styles.selectedAddress,
                ]}>
                    <View style={styles.radioRow}>
                        <Ionicons
                            name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                            size={22}
                            color="#0077CC"
                            style={styles.radioIcon}
                        />
                        <Text style={styles.addressName}>{username}</Text>
                        <View style={styles.rightContainer}>
                            <TouchableOpacity
                                onPress={() =>
                                    navigation.navigate('DeliveryAddressForm', { editAddress: item })
                                }
                            >
                                <MaterialIcons name="edit" color="#0094FF" size={22} />
                            </TouchableOpacity>
                            <MaterialIcons name="delete" color="#84b9daff" size={22} />
                        </View>
                    </View>

                    <Text style={styles.addressLine}>{item.line1}</Text>
                    <Text style={styles.addressLine}>{item.city}</Text>
                    <Text style={styles.addressLine}>Pincode: {item.pinCode}</Text>
                    <Text style={styles.phoneLine}>Phone: {phone}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={addresses}
                keyExtractor={(item) => item.addressId.toString()}
                renderItem={renderAddressItem}
                ListHeaderComponent={<View style={styles.subContainer} />}
                ListEmptyComponent={
                    loading ? (
                        <ActivityIndicator size="large" color="#0077CC" />
                    ) : (
                        <Text style={styles.addresses}>No addresses found.</Text>
                    )
                }
                ListFooterComponent={
                    <View style={styles.subContainer}>
                        <TouchableOpacity style={styles.button} onPress={handleAddAddress}>
                            <Text style={styles.btnText}>Add a new delivery address</Text>
                        </TouchableOpacity>
                        <View style={styles.bottomLine} />
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 100, margin: 10 }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

export default AddressPage;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    subContainer: { paddingHorizontal: 10, marginTop: 10 },
    bottomLine: { borderBottomWidth: 2, borderBottomColor: "#DEDEDE", width: "100%", marginVertical: 8 },
    button: { borderWidth: 1, borderRadius: 18, padding: 10, backgroundColor: "#E3F2FF", borderColor: "#E3F2FF", marginTop: 8, marginBottom: 30 },
    btnText: { textAlign: "center", fontWeight: '700' },
    addressCard: { borderWidth: 1, borderRadius: 18, padding: 20, borderColor: '#DDD', backgroundColor: '#FAFAFA', marginBottom: 16 },
    selectedAddress: { borderColor: "#0077CC", borderWidth: 2 },
    radioRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    radioIcon: { marginRight: 10, top: 8 },
    addressName: { fontWeight: '700', fontSize: 16, bottom: -5 },
    addressLine: { fontSize: 14, color: '#333', marginVertical: 2, paddingLeft: 30 },
    phoneLine: { marginTop: 6, fontSize: 14, fontWeight: '700', paddingLeft: 30 },
    rightContainer: { flexDirection: 'row', marginLeft: 'auto', gap: 3, alignItems: 'center' },
    addresses: { marginBottom: 20, textAlign: "center" },
});
