import { useNavigation } from "@react-navigation/native";
import { ActivityIndicator, Image, SafeAreaView, ScrollView, TouchableOpacity, TouchableWithoutFeedback } from "react-native"
import { StyleSheet, Text, View } from "react-native"
import OrderStepIndicator from "../utils/OrderStepIndicator";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import apiClient from "../services/apiBaseUrl";
import axios from "axios";
import { Modal } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type RootStackParamList = {
    CheckOut: undefined;
    PaymentPage: { orderTotal: number; pendingId: string };
    OrderDetails: { orderId: string; orderTotal: number };
};

type PaymentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CheckOut'>;


const CheckOut = () => {
    const navigation = useNavigation<PaymentScreenNavigationProp>();
    const [items, setItems] = useState<any[]>([]);
    console.log("ITEMSS", items)
    const [selectedAddress, setSelectedAddress] = useState<any>(null);

    const [userId, setUserId] = useState(0);
    const [username, setUserName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");

    const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);

    const [remainingDuration, setRemainingDuration] = useState("3:00");
    const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);






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


    const handleConfirm = async () => {
        try {
            const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const requestBody = {
                customerEmail: email,
                customerName: username,
                customerPhone: phone,
                userId: userId,
                shippingEmail: email,
                shippingPhone: phone,
                shippingCountryId: selectedAddress.countryId,
                shippingStateId: selectedAddress.stateId,
                shippingLine1: selectedAddress.line1,
                shippingLine2: selectedAddress.line2,
                shippingCity: selectedAddress.city,
                shippingTown: selectedAddress.town || "",
                shippingPinCode: selectedAddress.pinCode,
                billingEmail: email,
                billingPhone: phone,
                billingCountryId: selectedAddress.countryId,
                billingStateId: selectedAddress.stateId,
                billingLine1: selectedAddress.line1,
                billingLine2: selectedAddress.line2,
                billingCity: selectedAddress.city,
                billingTown: selectedAddress.town || "",
                billingPinCode: selectedAddress.pinCode,
                shippingFee: deliveryFee,
                taxAmount: 7,
                subtotal: subtotal,
                total: orderTotal,
                discountAmount: promotionDiscount,
                // couponId: couponId || 0,
                // couponAmount: couponAmount || 0,
                items: items.map(item => ({
                    productName: item.productName,
                    orderId: 0,
                    variantId: item.selectedVariantId || item.variantId,
                    productId: item.productId || item.id,
                    sku: item.sku,
                    price: item.price,
                    selectedSize: item.selectedSize || "",
                    quantity: item.quantity,
                    subTotal: item.price * item.quantity,
                    orderStatusId: 0,
                })),
            };


            console.log("OrderPendingRequest", requestBody)
            const response = await apiClient.post('v2/orders', requestBody);
            console.log("OrderPendingresponse", response)
            const orderId = response.data?.[0]?.pendingOrderId;



            if (response.status === 200 || response.status === 201) {
                const pendingId = response.data.pendingOrderId;
                console.log("PendingIddd", pendingId)
                console.log("CheckOutResponse", response.data.orderId)
                setPendingOrderId(pendingId);
                // setExpirationThreshold(response.data.expirationThreshold);
                // setPendingModalVisible(true);
                // startCountdown(response.data.expirationThreshold);
                navigation.navigate("PaymentPage", {
                    orderTotal,
                    pendingId
                });

                setIsModalVisible(false)

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

                // ✅ Show server error message if available
                const serverMessage =
                    typeof error.response.data === "string"
                        ? error.response.data
                        : error.response.data?.message || "Failed to place order.";

                Alert.alert("Error", serverMessage);
            } else {
                console.error("Unknown error:", error);
                Alert.alert("Error", "Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }

    };



    const handlePlaceOrder = () => {
        setIsModalVisible(true);
    };



    const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = 40;
    const codFee = 7;
    const promotionDiscount = 40;
    const orderTotal = itemsTotal + deliveryFee + codFee - promotionDiscount;





    return (
        <SafeAreaView style={styles.container}>
            {/* <View style={styles.header}>
                <TouchableOpacity onPress={handleClick}>
                    <AntDesign name="arrowleft" color="#0077CC" size={26} style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.text}>CheckOut</Text>
            </View> */}
            <View style={styles.subcontainer}>
                <OrderStepIndicator currentStep={2} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100, backgroundColor: "white" }}
            >
                <View style={styles.card}>
                    <Text style={styles.title}>Order Itmes ({items.length} items)</Text>

                    {items.map((item, index) => (
                        <View key={item.id} style={[styles.itemRow, index < items.length - 1 && styles.divider]}>
                            <View >
                                {/* <View style={styles.imagePlaceholder} 
                            
                            /> */}

                                <Image
                                    source={Array.isArray(item.image) ? item.image[0] : { uri: item.image }}
                                    style={styles.Img}
                                    resizeMode="contain"
                                />

                            </View>

                            <View style={styles.itemDetails}>
                                <Text style={styles.itemName}>{item.productName}</Text>
                                {/* <Text style={styles.itemDesc}>{item.description}</Text> */}
                                <Text style={styles.qty}>Qty: {item.quantity}</Text>
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

                            <Text style={styles.price}>₹{item.price}</Text>
                        </View>

                    ))}
                </View>

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

                <Modal
                    transparent
                    animationType="fade"
                    visible={isModalVisible}
                // onRequestClose={handleCancel}
                >
                    <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContainer}>
                                <Text style={styles.modalTitle}>Confirm Order</Text>
                                <Text style={styles.modalMessage}>Are you sure you want to place this order?</Text>

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsModalVisible(false)}>
                                        <Text style={styles.cancelText}>Cancel</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={handleConfirm}
                                        style={[styles.confirmBtn, loading && { opacity: 0.6 }]}
                                        disabled={loading}
                                    >
                                        <Text style={styles.confirmText}>
                                            {loading ? "Processing..." : "Confirm"}
                                        </Text>
                                    </TouchableOpacity>

                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                {/* <Modal
                    visible={pendingModalVisible}
                    transparent
                    animationType="fade"
                >
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}> Confirm Your Order</Text>
                            <Text style={styles.modalSubtitle}>Time Remaining: {remainingDuration}</Text>
                            <Text style={styles.modalMessage}>
                                Please confirm your order before time expires.
                            </Text>
                            <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleConfirmPayment}>
                                <Text style={styles.modalConfirmText}> Confirm Order</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalCancelBtn} onPress={handleCancelPending}>
                                <Text style={styles.modalCancelText}> Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal> */}
            </ScrollView>

            <View style={[styles.bottomButtons, { paddingBottom: insets.bottom + 15 },]}>
                <TouchableOpacity style={styles.btn} onPress={handlePlaceOrder}>
                    <Text style={styles.btnText}>Place your order</Text>
                </TouchableOpacity>
            </View>


            {loading && (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#0077CC" />
                    <Text style={styles.loaderText}>Placing your order...</Text>
                </View>
            )}


        </SafeAreaView>
    )
}

export default CheckOut


const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        fontWeight: "900",
        marginLeft: 5
    },
    subcontainer: {
        marginTop: 1
    },
    card: {
        // backgroundColor: '#fff',
        // borderRadius: 14,
        // padding: 13,
        // margin: 8,
        // elevation: 5,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.08,
        // shadowRadius: 4,
        // top: -10
        backgroundColor: '#fdfdfd',
        borderRadius: 16,
        padding: 13,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#eee',
        margin: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 12,
        marginLeft: 10
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    imageBox: {
        width: 50,
        height: 50,
        marginRight: 12,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f2f2f2',
    },
    imagePlaceholder: {
        flex: 1,
        backgroundColor: '#ddd',
        borderRadius: 8,
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontWeight: '600',
        fontSize: 14,
        color: '#000',
    },
    itemDesc: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    qty: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    price: {
        fontWeight: '700',
        color: '#0077CC',
        fontSize: 16,
        paddingLeft: 6,
    },

    Img: {
        height: 70,
        width: 90,
        resizeMode: "contain",
        borderRadius: 12
    },

    qtyBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        padding: 5,
        borderRadius: 18,
        width: 110,
        borderColor: "#00A2F4",
        marginTop: 10,
    },
    qtyButton: {
        fontSize: 16,
        paddingHorizontal: 10,
    },
    qtyNumber: {
        fontSize: 18,
        marginHorizontal: 10,
    },

    sectionDivider: {
        height: 2,
        backgroundColor: "#DEDEDE",
        marginVertical: 15,
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
        // marginTop: 20,
        // marginBottom: 40
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

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    //   modalContainer: {
    //     width: '85%',
    //     backgroundColor: 'white',
    //     padding: 25,
    //     borderRadius: 12,
    //     alignItems: 'center',
    //   },
    //   modalTitle: {
    //     fontSize: 18,
    //     fontWeight: 'bold',
    //     marginBottom: 10,
    //   },
    //   modalMessage: {
    //     fontSize: 15,
    //     textAlign: 'center',
    //     marginBottom: 20,
    //   },
    modalButtons: {
        flexDirection: 'row',
        gap: 20,
    },
    cancelBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#ccc',
        borderRadius: 8,
    },
    confirmBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#0077CC',
        borderRadius: 8,
    },
    cancelText: {
        color: 'black',
        fontWeight: '600',
    },
    confirmText: {
        color: 'white',
        fontWeight: '600',
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

    loaderContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)', 
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999, 
    },
    loaderText: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: '600',
        color: '#0077CC',
    },



})