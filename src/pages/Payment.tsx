import AsyncStorage from "@react-native-async-storage/async-storage";
import {  useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, ScrollView, Alert, Modal } from "react-native";
import apiClient from "../services/apiBaseUrl";
import axios from "axios";
import { StackNavigationProp } from "@react-navigation/stack";


export type RootStackParamList = {
    Payment: undefined;
    OrderDetails: { orderId: number };
};

type PaymentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Payment'>;

const Payment = () => {
    const navigation = useNavigation<PaymentScreenNavigationProp>();

    const [selectedAddress, setSelectedAddress] = useState<any>(null);

    const [userId, setUserId] = useState(0);
    const [username, setUserName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");

    const [pendingModalVisible, setPendingModalVisible] = useState(false);
    const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);
    const [remainingDuration, setRemainingDuration] = useState("3:00");
    const [expirationThreshold, setExpirationThreshold] = useState<string | null>(null);
    const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const addressString = await AsyncStorage.getItem('selectedAddress');
                if (addressString) setSelectedAddress(JSON.parse(addressString));
                console.log("userAddresss", addressString)

                const cartString = await AsyncStorage.getItem('selectedCartItems');
                if (cartString) {
                    const cartItems = JSON.parse(cartString);
                    setItems(cartItems.map((item: any) => ({ ...item, quantity: item.quantity ?? 1 })));
                    return;
                }

                const productString = await AsyncStorage.getItem('selectedProduct');
                if (productString) {
                    const single = JSON.parse(productString);
                    setItems([{ ...single, quantity: single.quantity ?? 1 }]);
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
                    setUserName(user.name || "");
                    setPhone(user.phone || "");
                    setEmail(user.email || "")
                }
            } catch (error) {
                console.error('Error loading user from AsyncStorage:', error);
            }
        };
        loadUserData();
    }, []);


    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const addressString = await AsyncStorage.getItem('selectedAddress');
                if (addressString) {
                    setSelectedAddress(JSON.parse(addressString));
                }

                const cartString = await AsyncStorage.getItem('selectedCartItems');
                console.log("CartOrderItems", cartString)
                if (cartString) {
                    setItems(JSON.parse(cartString));
                    return;
                }

                const productString = await AsyncStorage.getItem('selectedProduct');
                if (productString) {
                    const single = JSON.parse(productString);
                    setItems([{ ...single, quantity: single.quantity ?? 1 }]);
                }
            } catch (error) {
                console.error('Error loading data:', error);
                Alert.alert('Error', 'Failed to load payment data.');
            }
        };

        loadData();
    }, []);

    const incrementQty = (index: number) => {
        setItems(prev =>
            prev.map((item, i) =>
                i === index && item.quantity < 10
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    };

    const decrementQty = (index: number) => {
        setItems(prev =>
            prev.map((item, i) =>
                i === index && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        );
    };

    const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = 40;
    const codFee = 7;
    const promotionDiscount = 40;
    const orderTotal = itemsTotal + deliveryFee + codFee - promotionDiscount;

    const handleChangeAddress = () => {
        navigation.navigate("DeliveryAddress" as never);
    };

    const handlePlaceOrder = async () => {
        try {
            const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const requestBody = items.map(item => ({
                customerEmail: email,
                customerName: username,
                customerPhone: phone,
                subtotal,
                shippingFee: deliveryFee,
                taxAmount: 7,
                total: orderTotal,
                discountAmount: promotionDiscount,
                shippingEmail: email,
                shippingPhone: phone,
                shippingCountryId: selectedAddress.countryId,
                shippingStateId: selectedAddress.stateId,
                shippingLine1: selectedAddress.line1,
                shippingLine2: selectedAddress.line2,
                shippingCity: selectedAddress.city,
                shippingPinCode: selectedAddress.pinCode,
                billingEmail: email,
                billingPhone: phone,
                billingCountryId: selectedAddress.countryId,
                billingStateId: selectedAddress.stateId,
                billingLine1: selectedAddress.line1,
                billingLine2: selectedAddress.line2,
                billingCity: selectedAddress.city,
                billingPinCode: selectedAddress.pinCode,
                returnPeriodDays: 30,
                userId: userId,
                productName: item.productName,
                sku: item.sku,
                quantity: item.quantity,
                price: item.price,
                productId: item.id || item.productId,
                variantId: item.id || item.variantId,
            }));

            console.log("OrderPendingRequest", requestBody)
            const response = await apiClient.post('v1/pending-orders', requestBody);
            console.log("OrderPendingresponse", response)


            if (response.status === 200 || response.status === 201) {
                const pendingId = response.data.pendingOrderId;
                setPendingOrderId(pendingId);
                setExpirationThreshold(response.data.expirationThreshold);
                setPendingModalVisible(true);
                startCountdown(response.data.expirationThreshold);
            } else {
                Alert.alert("Error", "Failed to place order. Please try again.");
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.log("Server responded with:", {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers
                });
            } else {
                console.error("Unknown error:", error);
            }
            Alert.alert("Error", "Failed to place order.");
        }
    };

    const startCountdown = (expirationISO: string) => {
        if (!expirationISO) return;
        if (timerInterval) clearInterval(timerInterval);

        const endTime = new Date(expirationISO).getTime();

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = Math.max(0, endTime - now);
            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            setRemainingDuration(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
            if (diff <= 0) clearInterval(interval);
        }, 1000);

        setTimerInterval(interval);
    };



    const handleConfirmPayment = async () => {
        try {
            const paymentBody = {
                pendingOrderId: [pendingOrderId],
                payment: {
                    paymentId: "",
                    amount: orderTotal,
                    status: "SUCCESS"
                }
            };
            const confirmResponse = await apiClient.post('v1/pending-orders/submit', paymentBody);
            console.log("ConfirmResponsee",confirmResponse)
            const orderId = confirmResponse.data?.[0]?.orderId;
            console.log("OrderIdddd",orderId)
            

            if (confirmResponse.status === 200) {
                setPendingModalVisible(false);
                // Toast("Success", "Order confirmed!");
                if (orderId != null) {
                    navigation.navigate("OrderDetails", { orderId });
                } else {
                    Alert.alert('Error', 'Missing pending order ID. Please try again.');
                }
            } else {
                Alert.alert("Error", "Failed to confirm payment.");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to confirm payment.");
        }
    };

    const handleCancelPending = () => {
        setPendingModalVisible(false);
        if (timerInterval) clearInterval(timerInterval);
    };



    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.addressContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.cancel}>CANCEL</Text>
                </TouchableOpacity>
                {selectedAddress ? (
                    <View style={styles.addressDetails}>
                        <Text style={styles.addressLine}>{selectedAddress.line1}</Text>
                        <Text style={styles.addressLine}>
                            {selectedAddress.city}, {selectedAddress.stateName} - {selectedAddress.pinCode}, {selectedAddress.countryName}
                        </Text>
                        <TouchableOpacity onPress={handleChangeAddress}>
                            <Text style={styles.changeAddress}>Change delivery address</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <Text style={styles.addressPlaceholder}>No selected address found.</Text>
                )}
            </View>

            <Text style={styles.sectionDivider}></Text>

            <View style={styles.orderStatus}>
                <Text style={styles.orderday}>Arriving 21 Jul 2025</Text>
                <Text style={styles.Arrivinghours}>If you order in the next 8 days</Text>
            </View>

            <Text style={styles.title}>Your Items</Text>
            {items.length === 0 ? (
                <Text style={styles.noItems}>No items in order.</Text>
            ) : (
                items.map((item, index) => (
                    <View key={index} style={styles.cardContainer}>
                        <Image
                            source={Array.isArray(item.image) ? item.image[0] : { uri: item.image }}
                            style={styles.Img}
                        />

                        <View style={styles.leftSection}>
                            <Text style={styles.productName}>{item.productName}</Text>
                            <Text style={styles.price}>₹{item.price}</Text>
                            <View style={styles.qtyBox}>
                                <TouchableOpacity onPress={() => decrementQty(index)}>
                                    <Text style={styles.qtyButton}>-</Text>
                                </TouchableOpacity>
                                <Text style={styles.qtyNumber}>{item.quantity}</Text>
                                <TouchableOpacity onPress={() => incrementQty(index)}>
                                    <Text style={styles.qtyButton}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))
            )}

            <Text style={styles.sectionDivider}></Text>

            <Text style={styles.title}>Order Summary</Text>
            <View style={styles.row}>
                <Text style={styles.label}>Items:</Text>
                <Text>₹{itemsTotal}</Text>
            </View>
            <View style={styles.row}>
                <Text>Delivery:</Text>
                <Text>₹{deliveryFee}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.Cash}>Cash/Pay on Delivery fee</Text>
                <Text>₹{codFee}</Text>
            </View>
            <View style={styles.row}>
                <Text>Total:</Text>
                <Text>₹{itemsTotal + deliveryFee + codFee}</Text>
            </View>
            <View style={styles.row}>
                <Text>Promotion Applied:</Text>
                <Text>-₹{promotionDiscount}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.Total}>Order Total:</Text>
                <Text style={styles.totalAmount}>₹{orderTotal}</Text>
            </View>

            <Text style={styles.sectionDivider}></Text>

            <TouchableOpacity style={styles.btn} onPress={handlePlaceOrder}>
                <Text style={styles.btnText}>Place your order</Text>
            </TouchableOpacity>


            <Modal
                visible={pendingModalVisible}
                transparent
                animationType="fade"
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>🕒 Confirm Your Order</Text>
                        <Text style={styles.modalSubtitle}>Time Remaining: {remainingDuration}</Text>
                        <Text style={styles.modalMessage}>
                            Please confirm your order before time expires.
                        </Text>
                        <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleConfirmPayment}>
                            <Text style={styles.modalConfirmText}>✅ Confirm Order</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalCancelBtn} onPress={handleCancelPending}>
                            <Text style={styles.modalCancelText}>✖️ Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

export default Payment;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    cancel: {
        textAlign: "right",
        fontWeight: "400",
        paddingRight: 10
    },
    addressContainer: {
        borderRadius: 8,
        padding: 10,
        marginHorizontal: 10,
        marginTop: 10,
    },
    addressDetails: {
        marginLeft: 5,
        marginTop: 3
    },
    addressLine: {
        fontSize: 14,
        marginBottom: 2,
        lineHeight: 20
    },
    addressPlaceholder: {
        fontSize: 14,
        color: "#888",
    },
    changeAddress: {
        color: "#4286f4",
        fontWeight: '700',
        fontSize: 15,
        marginTop: 8
    },
    sectionDivider: {
        height: 2,
        backgroundColor: "#DEDEDE",
        marginVertical: 15,
        marginHorizontal: 10,
    },
    orderStatus: {
        paddingLeft: 15
    },
    orderday: {
        fontWeight: "bold",
        fontSize: 18,
        marginBottom: 5
    },
    Arrivinghours: {
        fontSize: 16,
        fontWeight: '400'
    },
    title: {
        fontSize: 18,
        paddingLeft: 12,
        fontWeight: "bold",
        marginBottom: 5,
        marginTop: 12
    },
    noItems: {
        textAlign: 'center',
        fontSize: 16,
        marginVertical: 10,
        color: '#888',
    },
    cardContainer: {
        borderRadius: 15,
        flexDirection: "row",
        backgroundColor: "#F5F5F5",
        padding: 12,
        marginBottom: 16,
        margin: 5,
        marginTop: 20
    },
    Img: {
        height: 100,
        width: 120,
        resizeMode: "contain",
        borderRadius: 12
    },
    leftSection: {
        paddingLeft: 8,
        flex: 1,
    },
    productName: {
        lineHeight: 20,
        fontWeight: '600'
    },
    price: {
        marginTop: 5,
        fontSize: 20,
        fontWeight: "bold",
    },
    qtyBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        padding: 5,
        borderRadius: 18,
        width: 110,
        borderColor: "#00A2F4",
        marginTop: 20,
    },
    qtyButton: {
        fontSize: 20,
        paddingHorizontal: 10,
    },
    qtyNumber: {
        fontSize: 18,
        marginHorizontal: 10,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingLeft: 12,
        margin: 2,
        paddingHorizontal: 15,
    },
    label: {
        fontWeight: '400',
        fontSize: 14
    },
    Cash: {
        color: "#4286f4",
        fontWeight: '700',
        fontSize: 15,
    },
    Total: {
        fontSize: 17,
        fontWeight: "bold",
    },
    totalAmount: {
        fontWeight: "bold",
        fontSize: 18
    },
    btn: {
        borderRadius: 28,
        padding: 12,
        backgroundColor: '#0077CC',
        margin: 10,
        marginTop: 10,
        marginBottom: 40
    },
    btnText: {
        textAlign: "center",
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: 18,
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
    modalConfirmBtn: {
        backgroundColor: '#28a745',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    modalConfirmText: {
        color: 'white',
        fontSize: 16,
    },
    modalCancelBtn: {
        paddingVertical: 6,
    },
    modalCancelText: {
        color: '#888',
        fontSize: 14,
    },
});
