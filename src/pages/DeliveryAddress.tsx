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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/StackScreen";
import apiClient from '../services/apiBaseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import OrderStepIndicator from '../utils/OrderStepIndicator';
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
type DeliveryAddressRouteProps = RouteProp<RootStackParamList, 'DeliveryAddress'>;

const DeliveryAddress = () => {
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


    useFocusEffect(
        useCallback(() => {
            const refreshSelected = async () => {
                const saved = await AsyncStorage.getItem('selectedAddress');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setSelectedAddressId(parsed.addressId);
                }
            };
            refreshSelected();
        }, [])
    );


    const fetchAddresses = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const res = await apiClient.get(`v1/address/user/${userId}`);
            setAddresses(res.data);

            // 🟩 Load saved selection (if available)
            const saved = await AsyncStorage.getItem('selectedAddress');
            if (saved) {
                const parsed = JSON.parse(saved);
                setSelectedAddressId(parsed.addressId);
            } else if (res.data.length > 0) {
                // only select first if nothing saved
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
            console.log("SelectedAddressss", selectedAddress)
            await AsyncStorage.setItem('selectedAddress', JSON.stringify(selectedAddress));
            navigation.navigate("CheckOut");
        } catch (error) {
            console.error('Error saving selected address:', error);
            Alert.alert('Error', 'Failed to proceed to payment.');
        }
    };

    const handleClick = () => {
        navigation.goBack()
    }

    const renderAddressItem = ({ item }: { item: Address }) => {
        const isSelected = item.addressId === selectedAddressId;

        return (
            <TouchableOpacity onPress={() => handleSelectAddress(item)}>

                <View style={[
                    styles.addressCard,
                    isSelected && styles.selectedCard && styles.selectedAddress, ,
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

                    {/* <TouchableOpacity
                        style={styles.deliverAddressButton}
                        onPress={() => handleDeliver(item)}
                    >
                        <MaterialCommunityIcons name="truck-delivery-outline" size={22} color="#fff" />
                        <Text style={styles.deliverAddressButtonText}>Deliver to this address</Text>
                    </TouchableOpacity> */}
                </View>
            </TouchableOpacity>
        );
    };


    return (
        <SafeAreaView style={styles.container}>
            {/* <View style={styles.header}>
                <TouchableOpacity onPress={handleClick}>
                    <AntDesign name="arrowleft" color="#0077CC" size={26} style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.text}> Delivery Address</Text>
            </View> */}


            <View style={styles.statusContainer}>
                <OrderStepIndicator currentStep={1} />
            </View>

            <FlatList
                data={addresses}
                keyExtractor={(item) => item.addressId.toString()}
                renderItem={renderAddressItem}
                ListHeaderComponent={
                    <View style={styles.subContainer}>
                        <Text style={styles.title}>Select a delivery address</Text>
                    </View>
                }
                ListEmptyComponent={
                    loading ? (
                        <ActivityIndicator size="large" color="#0077CC" />
                    ) : (
                        <Text style={styles.addresses}>No addresses found.</Text>
                    )
                }
                ListFooterComponent={
                    <View style={styles.subContainer}>
                        <Text style={styles.addressLabel}>Add delivery address</Text>
                        <TouchableOpacity style={styles.button} onPress={handleAddAddress}>
                            <Text style={styles.btnText}>Add a new delivery address</Text>
                        </TouchableOpacity>
                        <View style={styles.bottomLine} />
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 100, margin: 10 }}
                showsVerticalScrollIndicator={false}
            />


            <View style={[styles.bottomButtons, { paddingBottom: insets.bottom + 30 },]}>
                <TouchableOpacity
                    style={styles.deliverAddressButton}
                    onPress={() => {
                        const selected = addresses.find(a => a.addressId === selectedAddressId);
                        if (selected) {
                            handleDeliver(selected);
                        } else {
                            Alert.alert("Select Address", "Please select an address to proceed.");
                        }
                    }}
                // onPress={() => navigation.navigate("CheckOut")}
                >
                    <MaterialCommunityIcons name="truck-delivery-outline" size={22} color="#fff" />
                    <Text style={styles.deliverAddressButtonText}>Deliver to this address</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
};

export default DeliveryAddress;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        elevation: 5,
        paddingTop: 10,
        paddingBottom: 14,
        paddingHorizontal: 10,
    },

    text: {
        color: '#0077CC',
        fontSize: 20,
        marginLeft: 20,
        fontWeight: '900',
    },
    icon: {
        fontWeight: '900',
        marginLeft: 5
    },
    subContainer: {
        paddingHorizontal: 10,

    },

    statusContainer: {
        marginTop: 1
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10
    },
    label: {
        paddingTop: 15,
        fontWeight: "700",
        fontSize: 16,
        top: -8
    },
    bottomLine: {
        borderBottomWidth: 2,
        borderBottomColor: "#DEDEDE",
        width: "100%",
        marginVertical: 8
    },
    addressLabel: {
        fontWeight: "700",
        fontSize: 16,
        top: -8,
        // marginLeft: 10
        // marginTop: 10
    },
    button: {
        borderWidth: 1,
        borderRadius: 18,
        padding: 10,
        backgroundColor: "#E3F2FF",
        borderColor: "#E3F2FF",
        marginTop: 8,
        marginBottom: 30

    },
    btnText: {
        textAlign: "center",
        fontWeight: '700'
    },
    addressCard: {
        borderWidth: 1,
        borderRadius: 18,
        padding: 20,
        borderColor: '#DDD',
        backgroundColor: '#FAFAFA',
        marginBottom: 16
    },
    selectedCard: {

    },
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
    },
    radioIcon: {
        marginRight: 10,
        top: 8,

    },
    addressName: {
        fontWeight: '700',
        fontSize: 16,
        bottom: -5
    },
    addressLine: {
        fontSize: 14,
        color: '#333',
        marginVertical: 2,
        paddingLeft: 30
    },
    phoneLine: {
        marginTop: 6,
        fontSize: 14,
        fontWeight: '700',
        paddingLeft: 30
    },
    deliverAddressButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0077CC',
        paddingVertical: 12,
        borderRadius: 18,
        // marginTop: 16,
        // width: "100%",
        // marginBottom: 40,
        marginLeft: 10,
        marginRight: 10
    },
    deliverAddressButtonText: {
        color: '#fff',
        fontWeight: '700',
        marginLeft: 8,
        fontSize: 16
    },
    listContent: {
        paddingVertical: 10,

    },




    // addressItem: {
    //     padding: 12,
    //     marginVertical: 8,
    //     marginHorizontal: 16,
    //     backgroundColor: "#fff",
    //     borderRadius: 8,
    //     borderWidth: 1,
    //     borderColor: "#ccc", // default border
    // },

    selectedAddress: {
        borderColor: "#0077CC", // blue border when selected
        // borderWidth: 2,
    },
    rightContainer: {
        flexDirection: 'row',
        marginLeft: 'auto',
        gap: 3,
        alignItems: 'center',
    },
    addresses: {
        marginBottom: 20,
        textAlign: "center"
    },
    bottomButtons: {
        padding: 8,
        backgroundColor: 'white',
        // borderTopWidth: 1,
        // borderColor: '#ccc',
        position: 'absolute',
        bottom: 0,
        width: '100%',

    },


});
