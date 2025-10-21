
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, SafeAreaView } from 'react-native';
import { useEffect, useState } from 'react';

import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import apiClient from '../services/apiBaseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from 'react-native-vector-icons/AntDesign';
import OrderStepIndicator from '../utils/OrderStepIndicator';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityIndicator } from 'react-native';


const { width, height } = Dimensions.get('window');


type OrderItem = {
    orderId: number;
    orderNumber: string;
    productName: string;
    imageUrl: string;
    price: number;
    quantity: number;
    sku: string;
    variantId: number;
    productId: number;
    shippingLine1: string;
    shippingPinCode: string;
    billingLine1: string;
    billingPinCode: string;
    payment: {
        paymentId: number;
        amount: number;
        status: string;
        transactionReference: string;
        notes: string;
    };

};

export type RootStackParamList = {
    OrderDetails: { orderId: number };
    Main: undefined;
    Orders: undefined

};


type OrderDetailsRouteProp = RouteProp<RootStackParamList, 'OrderDetails'>;

type OrderDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'OrderDetails'>;



export default function OrderDetails() {

    const [isAddressExpanded, setIsAddressExpanded] = useState(false);
    const toggleAddress = () => setIsAddressExpanded(!isAddressExpanded);
    const navigation = useNavigation<any>();
    const navigations = useNavigation<OrderDetailsNavigationProp>();
    const [userId, setUserId] = useState(0);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    console.log("OrderItems", orderItems)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const route = useRoute<OrderDetailsRouteProp>();
    const { orderId } = route.params;

    console.log("OrderDetailsPageOrderId", orderId)

    const insets = useSafeAreaInsets();

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userString = await AsyncStorage.getItem('user');
                console.log("userString", userString)
                if (userString) {
                    const user = JSON.parse(userString);
                    setUserId(user.userId);

                }
            } catch (error) {
                console.error('Error loading user from AsyncStorage:', error);
            }
        };
        loadUserData();
    }, []);






    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`v2/orders/${orderId}`);
                const order = response.data;

                console.log("ORDER Success", order);

                if (Array.isArray(order)) {
                    setOrderItems(order);
                } else if (order) {
                    setOrderItems([order]);
                } else {
                    setOrderItems([]);
                    console.warn("No order found for orderId:", orderId);
                }
            } catch (err: any) {
                console.error("ORDER ERROR", err.response?.data || "No response data");
                setError("Failed to load order.");
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);






    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 9.00;
    // const tax = subtotal * 0.09;
    const total = subtotal + shipping;



    if (loading) {
        return (
            <SafeAreaView style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#00A2F4" />
            </SafeAreaView>
        );
    }


    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate("Main", { screen: "Home" })} style={styles.backButton}>
                    <AntDesign name="left" color="#0077CC" size={22} />
                </TouchableOpacity>
                <Text style={styles.text}>Confirm</Text>
            </View>

            <View style={styles.orderstatus}>
                <OrderStepIndicator currentStep={4} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}

            >


                <View style={styles.orderContainer}>
                    <View style={styles.iconCircle}>
                        <Text style={styles.checkMark}>✓</Text>
                    </View>
                    <Text style={styles.title}>Order Confirmed!</Text>
                    <Text style={styles.subtitle}>
                        Thank you for your purchase. Your order has been successfully placed.
                    </Text>

                    <View style={styles.orderNumberBox}>
                        <Text style={styles.orderLabel}>Order Number</Text>
                        <Text style={styles.orderNumber}># {orderItems[0]?.orderNumber ?? "N/A"}</Text>
                    </View>
                </View>


                <View style={styles.deliveryBox}>
                    <View style={styles.deliveryHeader}>
                        <Text style={styles.deliveryTitle}>⇅ Delivery Status</Text>
                        <Text style={styles.statusBadge}>Processing</Text>
                    </View>
                    <Text style={styles.deliveryText}>
                        <Text style={styles.bold}>Delivering to:</Text> {isAddressExpanded
                            ? orderItems[0]?.shippingLine1
                            : orderItems[0]?.shippingLine1
                        }
                    </Text>
                    <Text style={styles.deliveryText}>
                        <Text style={styles.bold}>Estimated delivery:</Text> Tomorrow, 2-4 PM
                    </Text>
                    <Text style={styles.deliveryText}>
                        <Text style={styles.bold}>Tracking:</Text> You'll receive tracking details via email
                    </Text>
                </View>

                <View style={styles.totalBox}>
                    <Text style={styles.totalLabel}>Total Paid</Text>
                    <Text style={styles.totalAmount}>₹{total}</Text>
                </View>

            </ScrollView>

            <View style={[styles.bottomButtons, { paddingBottom: insets.bottom || 12 }]}>
                <TouchableOpacity style={styles.trackButton} onPress={() => navigations.navigate("Orders") as never}>
                    <Text style={styles.trackText}>Track Order</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.continueButton} onPress={() => navigations.navigate("Main")}>
                    <Text style={styles.continueText}>Continue Shopping</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
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
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        marginRight: 12,
    },
    icon: {
        fontWeight: '900',
        marginLeft: 5
    },
    text: {
        color: '#0077CC',
        fontSize: 22,
        fontWeight: '700',
        // color: '#1A1A1A',
        marginBottom: 2,
    },
    cancelText: {
        color: "#0077CC",
        fontSize: 16,
        fontWeight: "600",
    },
    orderstatus: {
        marginTop: 1
    },
    subcontainer: {
        marginTop: 2
    },


    scrollContent: {
        paddingHorizontal: 10,
        paddingBottom: 100,
    },

    successIcon: { marginBottom: 16 },
    successHeader: {
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 24,
    },
    checkmarkContainer: {
        marginBottom: 24,
    },
    checkmarkGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    successTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 8,
    },
    successSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderColor: "#D9D9D9",
    },
    summaryCard: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#3B82F6',
        shadowOpacity: 0.05,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#F59E0B',
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#D97706',
    },
    orderIdBadge: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    orderIdText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
        fontFamily: 'monospace',
    },
    itemCountBadge: {
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    itemCountText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#3B82F6',
    },
    trackingContainer: {
        marginTop: 8,
    },
    horizontalTrackingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    horizontalTrackingStep: {
        flex: 1,
        alignItems: 'center',
        position: 'relative',
    },
    horizontalTrackingDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        zIndex: 2,
    },
    horizontalTrackingDotActive: {
        backgroundColor: '#10B981',
    },
    horizontalTrackingLine: {
        position: 'absolute',
        top: 16,
        left: '50%',
        right: -50,
        height: 2,
        backgroundColor: '#E5E7EB',
        zIndex: 1,
    },
    horizontalTrackingTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
        textAlign: 'center',
    },
    horizontalTrackingTitleInactive: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9CA3AF',
        marginBottom: 2,
        textAlign: 'center',
    },
    horizontalTrackingTime: {
        fontSize: 10,
        color: '#10B981',
        fontWeight: '500',
        textAlign: 'center',
    },
    horizontalTrackingTimeInactive: {
        fontSize: 10,
        color: '#D1D5DB',
        fontWeight: '500',
        textAlign: 'center',
    },

    detailsContainer: {
        padding: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginHorizontal: 8,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 20
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    detailWithIcon: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
    detailContent: { marginLeft: 12, flex: 1 },
    detailLabel: { fontSize: 14, color: '#64748B', marginBottom: 4 },
    detailValue: { fontSize: 16, color: '#1E293B', fontWeight: '600', lineHeight: 22 },
    orderDetailsGrid: {
        gap: 16,
    },

    detailItem: {
        flex: 1,
    },


    addressSection: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    addressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    addressTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        marginLeft: 8,
    },
    addressText: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginLeft: 26,
    },
    orderItem: {
        flexDirection: 'row',
        paddingVertical: 16,
    },
    orderItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    itemImageContainer: {
        position: 'relative',
        marginRight: 16,
    },
    itemImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        resizeMode: 'cover',
    },

    quantityBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#3B82F6',
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    quantityBadgeText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
        lineHeight: 22,
    },
    itemBrand: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 6,
    },
    itemRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    starsContainer: {
        flexDirection: 'row',
        marginRight: 6,
    },
    ratingText: {
        fontSize: 12,
        color: '#6B7280',
    },
    itemVariant: {
        marginBottom: 8,
    },
    variantText: {
        fontSize: 12,
        color: '#6B7280',
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    itemUnitPrice: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    summaryContainer: {
        marginTop: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    summaryDivider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 16,
    },
    summaryTotalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    summaryTotalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    savingsRow: {
        marginTop: 12,
        alignItems: 'center',
    },
    savingsText: {
        fontSize: 13,
        color: '#10B981',
        fontWeight: '600',
    },
    buttonsContainer: {
        marginTop: 24,
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginRight: 8,
    },
    secondaryButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },

    iconCircle: {
        backgroundColor: '#28C76F',
        borderRadius: 50,
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 16,
    },
    checkMark: {
        color: '#fff',
        fontSize: 32,
    },

    orderNumberBox: {
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
        marginTop: 20
    },
    orderLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
    },
    orderContainer: {
        backgroundColor: '#fdfdfd',
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#eee',
    },
    deliveryBox: {
        backgroundColor: '#fdfdfd',
        borderRadius: 10,
        padding: 15,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#eee',
    },
    deliveryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    deliveryTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#222',
    },
    statussBadge: {
        backgroundColor: '#E0E7FF',
        color: '#2F54EB',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        fontSize: 12,
        fontWeight: '500',
    },
    deliveryText: {
        fontSize: 13,
        color: '#444',
        marginTop: 4,
    },
    bold: {
        fontWeight: '600',
    },
    totalBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#f2f2f2',
        padding: 12,
        borderRadius: 10,
        marginBottom: 20,
    },
    totalLabel: {
        fontSize: 14,
        color: '#555',
        fontWeight: '600',
    },
    totalAmount: {
        fontSize: 16,
        color: '#00A2F4',
        fontWeight: 'bold',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    trackButton: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        paddingVertical: 14,
        borderRadius: 10,
        marginRight: 10,
        alignItems: 'center',
    },
    trackText: {
        color: '#222',
        fontWeight: '600',
    },
    continueButton: {
        flex: 1,
        // backgroundColor: '#7C3AED',
        backgroundColor: "#00A2F4",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    continueText: {
        color: '#fff',
        fontWeight: '600',
    },
    bottomButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderColor: '#ccc',
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
});
