import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Modal,
    Alert,
    SafeAreaView
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import OrderStepIndicator from '../utils/OrderStepIndicator';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import apiClient from '../services/apiBaseUrl';
import { RootStackParamList } from './CheckOut';
import { useSafeAreaInsets } from 'react-native-safe-area-context';




const paymentMethods = [
    { id: 'card', label: '💳 Credit / Debit Card' },
    { id: 'upi', label: '📱 UPI' },
    { id: 'cod', label: '💵 Cash on Delivery' },
];

type PaymentPageRouteProp = RouteProp<RootStackParamList, 'PaymentPage'>;


const PaymentPage = () => {

    const [selectedAddress, setSelectedAddress] = useState<any>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cod');
    const navigation = useNavigation<any>();
    const [cardNumber, setCardNumber] = useState('');
    const [cardholderName, setCardholderName] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [saveCard, setSaveCard] = useState(false);
    const route = useRoute<PaymentPageRouteProp>();
    const { orderTotal, pendingId } = route.params;
    const [isProcessing, setIsProcessing] = useState(false);
    // const navigations = useNavigation<StackNavigationProp<RootStackParamList, 'PaymentPage'>>();
    const [pendingModalVisible, setPendingModalVisible] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [userId, setUserId] = useState(0);
    const insets = useSafeAreaInsets();








    console.log("paymentPageOrderToatal", orderTotal)
    console.log("PaymentPagePendingId", pendingId)


    useEffect(() => {
        const loadSelectedAddress = async () => {
            try {
                const addressString = await AsyncStorage.getItem('selectedAddress');
                console.log("Loaded selectedAddress:", addressString);

                if (addressString) {
                    setSelectedAddress(JSON.parse(addressString));
                }
            } catch (error) {
                console.error('Error loading selected address:', error);
            }
        };

        loadSelectedAddress();
    }, []);

    const handlePaymentSelect = (id: string) => {
        setSelectedPaymentMethod(id);
    };



    // const validateFields = () => {
    //     if (!cardNumber || cardNumber.length < 16) {
    //         alert('Enter valid card number');
    //         return;
    //     }
    //     if (!cardholderName) {
    //         alert('Enter cardholder name');
    //         return;
    //     }
    //     if (!expiryDate) {
    //         alert('Enter expiry date');
    //         return;
    //     }
    //     if (!cvv || cvv.length < 3) {
    //         alert('Enter valid CVV');
    //         return;
    //     }

    //     alert('Payment Submitted ');
    // };


    const handlePay = () => {
        setPendingModalVisible(true);
    }
    //     setTimeout(() => {
    //         setIsProcessing(false);
    //         navigations.navigate("OrderDetails", { orderId: route.params.orderId });

    //     }, 3000);
    // };


    useEffect(() => {
        const loadData = async () => {
            try {
                const cartString = await AsyncStorage.getItem('selectedCartItems');
                console.log("PaymentPageCartOrderItems", cartString)
                if (cartString) {
                    setItems(JSON.parse(cartString));
                    return;
                }

            } catch (error) {
                console.error('Error loading data:', error);
                Alert.alert('Error', 'Failed to load payment data.');
            }
        };

        loadData();
    }, []);


    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userString = await AsyncStorage.getItem('user');
                if (userString) {
                    const user = JSON.parse(userString);
                    setUserId(user.userId);
                    // setUserName(user.name || "");
                    // setPhone(user.phone || "");
                    // setEmail(user.email || "")
                }
            } catch (error) {
                console.error('Error loading user from AsyncStorage:', error);
            }
        };
        loadUserData();
    }, []);


    const handleConfirmPayment = async () => {
        setIsProcessing(true);
        try {
            const paymentBody = {
                paymentId: "",
                amount: orderTotal,
                status: "SUCCESS"
            };

            console.log("ConfirmRequest", paymentBody);
            console.log("PendingIDDDDDDDD", pendingId);

            const confirmResponse = await apiClient.post(`v2/orders/${pendingId}/payment`, paymentBody);

            if (confirmResponse.status === 200) {
                setPendingModalVisible(false);

                const selectedItemsString = await AsyncStorage.getItem("selectedCartItems");
                if (selectedItemsString) {
                    const selectedItems = JSON.parse(selectedItemsString);

                    for (const item of selectedItems) {
                        const cartItemId = item.cartItemId;

                        try {
                            const deleteResponse = await apiClient.delete(`v1/cart/${userId}/items/${cartItemId}`);
                            console.log(`Deleted cartItemId ${cartItemId}:`, deleteResponse.status);
                        } catch (deleteError) {
                            console.error(`Failed to delete cartItemId ${cartItemId}:`, deleteError);
                        }
                    }
                }

                if (pendingId != null) {
                    navigation.navigate("OrderDetails", { orderTotal, orderId: pendingId });
                } else {
                    Alert.alert('Error', 'Missing pending order ID. Please try again.');
                }

                // 🔚 Optionally, clear the selected cart items from storage
                await AsyncStorage.removeItem("selectedCartItems");

            } else {
                Alert.alert("Error", "Failed to confirm payment.");
            }
        } catch (error) {
            console.error("Payment confirmation error:", error);
            Alert.alert("Error", "Failed to confirm payment.");
        }
        finally {
            setIsProcessing(false);
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <AntDesign name="arrowleft" color="#0077CC" size={26} style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.text}> Payment Method</Text>
            </View>

            <View style={styles.orderstatus}>
                <OrderStepIndicator currentStep={3} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ paddingBottom: 10 }}>
                <View style={styles.addressContainer}>
                    {selectedAddress ? (
                        <>
                            <Text style={styles.addressHeading}>
                                Delivering to {selectedAddress.name}
                            </Text>
                            <View style={styles.addressDetails}>
                                <Text style={styles.addressLine}>{selectedAddress.line1}</Text>
                                <Text style={styles.addressLine}>
                                    {selectedAddress.city}, {selectedAddress.stateName} - {selectedAddress.pinCode}, {selectedAddress.countryName}
                                </Text>
                                <Text style={styles.addressLine}>Phone: {selectedAddress.phone}</Text>
                                <TouchableOpacity onPress={() => navigation.goBack()}>
                                    <Text style={styles.changeAddress}>Change delivery address</Text>
                                </TouchableOpacity>
                            </View>

                        </>

                    ) : (
                        <Text style={styles.addressPlaceholder}>No selected address found.</Text>
                    )}

                </View>




                <View style={styles.paymentSection}>
                    <Text style={styles.paymentHeading}>Select a payment method</Text>

                    {paymentMethods.map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            style={[
                                styles.paymentOption,
                                selectedPaymentMethod === method.id && styles.selectedPaymentOption
                            ]}
                            onPress={() => handlePaymentSelect(method.id)}
                        >
                            <View style={styles.radioCircle}>
                                {selectedPaymentMethod === method.id && <View style={styles.radioDot} />}
                            </View>
                            <Text style={styles.paymentText}>{method.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {selectedPaymentMethod === 'card' && (
                    <View style={styles.creditCardContainer}>
                        <View style={styles.subcontainer}>
                            <View style={styles.row}>
                                <Text style={styles.cardNumber}>**** **** **** ****</Text>
                                <Text style={styles.cardType}>VISA</Text>
                            </View>

                            <Text style={styles.label}> CARD HOLDER</Text>
                            <View style={styles.row}>
                                <Text style={styles.name}>YOUR NAME</Text>
                                <Text style={styles.day}>MM/YY</Text>
                            </View>
                        </View>
                        <View style={styles.column}>

                        </View>
                        <Text style={styles.labels}>Card Number
                            <Text style={styles.required}> *</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder='  1234 5678 9012 3456'
                            value={cardNumber}
                            onChangeText={setCardNumber}
                        />

                        <Text style={styles.labels}>Cardholder Name
                            <Text style={styles.required}> *</Text> </Text>

                        <TextInput
                            style={styles.input}
                            placeholder='  Name on Card'
                            value={cardholderName}
                            onChangeText={setCardholderName}
                        />

                        <View style={styles.rowContainer}>
                            <Text style={styles.labels}>Expiry Date
                                <Text style={styles.required}> *</Text>
                            </Text>
                            <Text style={styles.city}>CVV <Text style={styles.required}>*</Text></Text>
                        </View>

                        <View style={styles.rowContainer}>
                            <TextInput
                                style={styles.inputbox}
                                value={expiryDate}
                                keyboardType="number-pad"
                                placeholder=' MM/YY'
                                onChangeText={(text) => {
                                    setExpiryDate(text);
                                }}
                            />
                            <TextInput
                                style={styles.inputbox}
                                value={cvv}
                                keyboardType='number-pad'
                                placeholder=' 123'

                                onChangeText={(text) => {
                                    setCvv(text);
                                }}
                            />
                        </View>
                        <TouchableOpacity
                            style={styles.rows}
                            onPress={() => setSaveCard(!saveCard)}
                        >
                            <View
                                style={[
                                    styles.defaultbox,
                                    saveCard && styles.defaultboxChecked,
                                ]}
                            >
                                {saveCard && (
                                    <Ionicons name="checkmark" size={18} color="white" />
                                )}
                            </View>
                            <Text style={styles.saveCard}>Save card for future purchases</Text>
                        </TouchableOpacity>


                    </View>
                )}

                <View style={styles.bottomContainer}>
                    <View style={styles.rowContainer}>
                        <MaterialIcons name="security" color="#000" size={24} style={styles.securityIcon} />
                        <Text style={styles.bottomText} numberOfLines={2}>Your payment information is encrypted and secure. We never store your card details.</Text>
                    </View>
                </View>

                {/* 
            {isProcessing && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ActivityIndicator size="large" color="#007bff" />
                        <Text style={styles.modalText}>Processing Payment...</Text>
                        <Text style={styles.subtitle}>Please wait while we process your order..</Text>
                    </View>
                </View>
            )} */}

                <Modal
                    visible={pendingModalVisible}
                    transparent
                    animationType="fade"
                >
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}> Confirm Your Order</Text>
                            <Text style={styles.modalSubtitle}>Time Remaining</Text>
                            <Text style={styles.modalMessage}>
                                Please confirm your order before time expires.
                            </Text>

                            {isProcessing ? (
                                <>
                                    <ActivityIndicator size="large" color="#007bff" />
                                    <Text style={{ marginTop: 10, color: "#333" }}>Placing your order...</Text>
                                </>
                            ) : (
                                <View style={styles.modalButtonRow}>
                                   
                                    <TouchableOpacity
                                        style={styles.modalCancelBtn}
                                        onPress={() => setPendingModalVisible(false)}
                                        disabled={isProcessing}
                                    >
                                        <Text style={styles.modalCancelText}>Cancel</Text>
                                    </TouchableOpacity>

                                     <TouchableOpacity
                                        style={styles.modalConfirmBtn}
                                        onPress={handleConfirmPayment}
                                        disabled={isProcessing}
                                    >
                                        <Text style={styles.modalConfirmText}>Confirm Order</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                </Modal>


            </ScrollView>

            <View style={[styles.bottomButtons, { paddingBottom: insets.bottom + 8 },]}>
                <TouchableOpacity style={styles.btn} onPress={handlePay}>
                    <Text style={styles.btnText}>Pay  ₹ {orderTotal}</Text>
                </TouchableOpacity>
            </View>



        </SafeAreaView>
    );
}
export default PaymentPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
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
    icon: {
        fontWeight: '900',
        marginLeft: 5
    },
    text: {
        color: '#0077CC',
        fontSize: 20,
        marginLeft: 20,
        fontWeight: '900',
    },
    cancelText: {
        color: "#0077CC",
        fontSize: 16,
        fontWeight: "600",
    },
    orderstatus: {
        marginTop: 1
    },
    addressContainer: {
        borderWidth: 1,
        borderColor: "#DEDEDE",
        borderRadius: 8,
        padding: 10,
        marginHorizontal: 10,
        // marginTop: 10,
        backgroundColor: '#FAFAFA',
    },
    addressHeading: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 5,
        color: "#333",
    },
    addressDetails: {
        marginLeft: 5,
        marginTop: 3
    },
    addressLine: {
        fontSize: 14,
        marginBottom: 2,

    },
    addressPlaceholder: {
        fontSize: 14,
        color: "#888",
    },
    sectionDivider: {
        height: 1,
        backgroundColor: "#DEDEDE",
        marginVertical: 15,
        marginHorizontal: 10,
    },
    paymentSection: {
        paddingHorizontal: 15,
    },
    paymentHeading: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 16,
        color: "#333",
        marginTop: 12

    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        backgroundColor: '#FFF',
    },
    selectedPaymentOption: {
        borderColor: "#0077CC",
        backgroundColor: '#E6F4FF',
    },
    paymentText: {
        fontSize: 15,
        color: "#333",
    },
    radioCircle: {
        height: 24,
        width: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#0077CC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    radioDot: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: '#0077CC',
    },
    changeAddress: {
        marginTop: 15,
        color: "#4286f4",
        fontFamily: "Jost",
        fontWeight: 700
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

    btn: {
        borderRadius: 28,
        padding: 12,
        backgroundColor: '#0077CC',
        margin: 10,
        // marginTop: 10,
        // marginBottom: 50
    },
    btnText: {
        textAlign: "center",
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: 18,
    },
    creditCardContainer: {
        borderRadius: 18,
        backgroundColor: "#F5F5F5",
        padding: 12,
        marginBottom: 16,
        margin: 5,
        marginTop: 20
    },
    subcontainer: {
        // margin: 5,
        borderRadius: 16,
        backgroundColor: "#0077CC",
        padding: 10,
        width: "100%"


    },
    cardNumber: {
        color: "#fff",
        fontWeight: 600,
        fontSize: 22
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 5,
        marginBottom: 10
    },
    cardType: {
        marginLeft: 12,
        color: "#fff",
        backgroundColor: "#a7b8d3ff",
        borderRadius: 8,
        padding: 5,
    },
    label: {
        color: "#fff",
        opacity: 0.8
    },
    name: {
        color: "#fff",
        fontWeight: 500
    },
    day: {
        fontWeight: "900",
        color: "#fff",
        fontFamily: "Jost",
    },
    labels: {
        marginTop: 14,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        paddingLeft: 5
    },
    required: {
        color: "red",
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginTop: 8,
        fontSize: 16,
        color: "#303030",
        marginLeft: 5

    },
    column: {
        flexDirection: "column"
    },
    rowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginHorizontal: 2,
        marginVertical: 2,
    },
    inputbox: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginTop: 5,
        fontSize: 16,
        width: "48%",
    },
    city: {
        marginTop: 15,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        paddingRight: 75
    },
    rows: {
        flexDirection: "row",
        gap: 8,
        marginTop: 20
    },
    defaultbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#ccc',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
        marginRight: 8,
    },
    saveCard: {
        bottom: -8,
        fontWeight: 400
    },
    bottomContainer: {
        borderColor: "#b0cabbff",
        borderWidth: 1,
        padding: 5,
        borderRadius: 12,
        backgroundColor: "#d7eee0ff",
        marginTop: 8,
        margin: 8,
        marginBottom: 20
    },
    bottomText: {
        color: "#277e48ff",
        paddingLeft: 8,
        marginRight: 10,
        marginBottom: 20
    },
    securityIcon: {
        bottom: -5
    },
    defaultboxChecked: {
        backgroundColor: '#007bff',
        borderColor: '#007bff',
    },
    modalOverlay: {
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.3)",
        zIndex: 999,
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
        elevation: 5,
    },
    modalText: {
        marginTop: 10,
        fontSize: 16,
        color: "#333",
    },
    subtitle: {
        marginTop: 6,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    modalSubtitle: {
        fontSize: 16,
        color: '#555',
        marginBottom: 4,
    },
    modalMessage: {
        fontSize: 14,
        textAlign: 'center',
        color: '#666',
        marginBottom: 20,
    },
    modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        width: '100%',
        gap:8
    },

    modalConfirmBtn: {
        flex: 1,
        backgroundColor: '#0077CC',  // same as Pay button
        borderRadius: 8,
        paddingVertical: 10,
        marginRight: 8,
        alignItems: 'center',
    },
    modalConfirmText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    modalCancelBtn: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        borderRadius: 8,
        paddingVertical: 10,
        marginLeft: 8,
        alignItems: 'center',
    },

    modalCancelText: {
        color: '#333',
        fontSize: 14,
        fontWeight: '600',
    },
}
);

