import { RouteProp, useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { CheckCircle, Package, Truck } from "lucide-react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {
    ActivityIndicator,
    Modal,
    ScrollView,
    TextInput,
    ToastAndroid,
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    Image,
    Dimensions,
} from "react-native";
import apiClient from "../services/apiBaseUrl";
import { useCallback, useEffect, useState } from "react";
import InvoiceModal from "./OrderPrivewModal";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Entypo from 'react-native-vector-icons/Entypo';



const screenWidth = Dimensions.get("window").width;

type RootStackParamList = {
    OrderHistory: { orderId: string };
    ProductReviewAddPhoto: {
        productId: number;
        variantId: number;
        userId: number;
        productReviewId?: number;
    };
    SeparateProductPage: { productId: number },
    Support: undefined
};


interface OrderItem {
    userId: number;
    orderId: number;
    orderNumber: string;
    orderItemId: number;
    createdAt: string;
    customerEmail: string;
    customerName: string;
    customerPhone: string;
    productId: number;
    productName: string;
    imageUrl: string;
    variantId: number;
    quantity: number;
    price: number;
    subtotal: number;
    shippingFee: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
    orderStatusName: string;
    shippingLine1: string;
    shippingCity: string;
    shippingPinCode: string;
    shippingCountryName: string;
}

type OrderItems = {
    orderItemId: number;
    productName: string;
    // ... any other properties
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductReviewAddPhoto'>;

const trackingUpdates = [
    {
        status: "Order Placed",
        date: "6 Aug 2025, 2:30 PM",
        completed: true,
        description: "Your order has been confirmed and is being prepared",
    },
    {
        status: "Shipped",
        date: "7 Aug 2025, 10:15 AM",
        completed: true,
        description: "Package has left our warehouse and is on its way",
    },
    {
        status: "Out for Delivery",
        date: "8 Aug 2025, 8:00 AM",
        completed: true,
        description: "Your package is out for delivery and will arrive today",
    },
    {
        status: "Delivered",
        date: "8 Aug 2025, 3:45 PM",
        completed: true,
        description: "Package successfully delivered to your address",
    },
];

const getStatusStyle = (status: string) => {
    switch (status) {
        case 'CONFIRMED':
            return { backgroundColor: '#e6f9ee', color: '#28a745' };
        case 'SHIPPED':
            return { backgroundColor: '#e0f0ff', color: '#007bff' };
        case 'DELIVERED':
            return { backgroundColor: '#e6f9ee', color: '#28a745' };
        case 'PROCESSING':
            return { backgroundColor: '#fff5e5', color: '#f0ad4e' };
        case 'CANCELED':
            return { backgroundColor: '#ffe6e6', color: '#dc3545' };
        default:
            return { backgroundColor: '#eee', color: '#000' };
    }
};

const OrderHistory = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProp<RootStackParamList, "OrderHistory">>();
    const { orderId } = route.params;

    const [orders, setOrders] = useState<OrderItem[]>([]);
    console.log("orders", orders)
    const [loading, setLoading] = useState(true);

    const [modalVisible, setModalVisible] = useState(false);
    const [reason, setReason] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [refundRequested, setRefundRequested] = useState(false);
    const [rating, setRating] = useState(0);
    const [selectedOrderItem, setSelectedOrderItem] = useState<OrderItems | null>(null);
    const [isSelectProductModalVisible, setIsSelectProductModalVisible] = useState(false);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

    const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItems[]>([]);




    const firstOrder = orders[0];

    useFocusEffect(
        useCallback(() => {
            fetchOrderDetails();
        }, [])
    );

    useEffect(() => {
        if (firstOrder?.orderStatusName === "RETURN_REQUESTED") {
            setRefundRequested(true);
        }
    }, [firstOrder]);

    const fetchOrderDetails = async () => {
        try {
            const response = await apiClient.get(`v2/orders/${orderId}`);
            if (Array.isArray(response.data) && response.data.length > 0) {
                setOrders(response.data);
            }
        } catch (error) {
            console.error("Error fetching order details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!firstOrder) return;
        try {
            const body = {
                orderId: firstOrder.orderId,
                orderItemId: firstOrder.orderItemId,
                variantId: firstOrder.variantId,
                orderNumber: firstOrder.orderNumber,
                status: "SUCCESS",
                reason,
                requestedAt: new Date().toISOString(),
                processedAt: new Date().toISOString(),
            };

            const res = await apiClient.post("v1/refund-request", body);
            ToastAndroid.show("Refund requested successfully!", ToastAndroid.SHORT);
            setModalVisible(false);
            setReason("");
            setRefundRequested(true);
        } catch (err: any) {
            console.error("Refund Error:", err);
        }
    };

    const formatOrderDate = (dateString: string): string => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString("en-US", { month: "short" });
        const year = date.getFullYear();
        return `Ordered on ${day} ${month} ${year}`;
    };

    if (loading) {
        return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
    }

    if (!firstOrder) {
        return (
            <Text style={{ marginTop: 40, textAlign: "center" }}>Order not found</Text>
        );
    }

    const updateOrderStatus = async (orderItemId: number) => {
        try {
            await apiClient.put(`v2/orders/items/${orderItemId}/status?statusId=3`);

            setOrders(prevOrders =>
                prevOrders.map(order => {
                    if (order.orderItemId === orderItemId) {
                        return { ...order, orderStatusName: 'CANCELED' };
                    }
                    return order;
                })
            );
        } catch (error) {
            console.error('Failed to update order status:', error);
        }
    };



    const handleCancelOrder = () => {
        const activeOrders = orders?.filter(o => o.orderStatusName !== 'CANCELED');
        if (activeOrders?.length === 1) {
            setSelectedOrderItems([activeOrders[0]]);
            setIsConfirmModalVisible(true);
        } else if (activeOrders?.length > 1) {
            setSelectedOrderItems([]);
            setIsSelectProductModalVisible(true);
        }
    };

    const onConfirmCancel = () => {
        selectedOrderItems.forEach(item => {
            updateOrderStatus(item.orderItemId);
        });
        setIsConfirmModalVisible(false);
        setSelectedOrderItems([]);
    };



    const handleNavigateToAddPhoto = async (order: any) => {
        const { productId, variantId, userId } = order;

        const key = `productReview_${productId}_${variantId}_${userId}`;
        const storedId = await AsyncStorage.getItem(key);
        const productReviewId = storedId ? parseInt(storedId, 10) : undefined;

        navigation.navigate("ProductReviewAddPhoto", {
            productId,
            variantId,
            userId,
            productReviewId, // optional
        });
    };


    return (
        <View style={styles.container}>


            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {orders.map((order, index) => {
                    const statusStyle = getStatusStyle(order?.orderStatusName ?? 'PROCESSING');

                    return (
                        <>
                            <TouchableOpacity onPress={() => navigation.navigate("SeparateProductPage", { productId: order.productId })}>
                                <View key={index} style={styles.card}>
                                    <View style={styles.row}>
                                        <Image source={{ uri: order.imageUrl }} style={styles.image} />

                                        <View style={styles.details}>
                                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 3 }}>
                                                <Text
                                                    style={styles.productName}
                                                >
                                                    {order.productName}
                                                </Text>

                                                <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                                                    <Text style={[styles.statusText, { color: statusStyle.color }]}>
                                                        {order?.orderStatusName}
                                                    </Text>
                                                </View>
                                            </View>


                                            <Text style={styles.orderId}>Order ID: {order.orderNumber}</Text>
                                            <Text style={styles.date}>
                                                {formatOrderDate(order.createdAt)}
                                            </Text>
                                            {/* <View style={{ alignItems: "flex-start", bottom: -9 }}>
                                                {order?.orderStatusName !== 'CANCELED' && (
                                                    <TouchableOpacity
                                                        style={styles.smallButtonCancel}
                                                        onPress={() => updateOrderStatus(order?.orderItemId)}
                                                    >
                                                        <Text style={styles.buttonTextCancel}>Cancel Order</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View> */}

                                            <View style={{ alignItems: "flex-start", bottom: -9 }}>
                                                <TouchableOpacity
                                                    style={styles.smallButtonCancel}
                                                    onPress={() => handleNavigateToAddPhoto(order)}

                                                >
                                                    <Text style={styles.buttonTextCancel}>Add Review</Text>
                                                </TouchableOpacity>
                                            </View>

                                        </View>
                                    </View>

                                    <View style={styles.line} />
                                    <View style={styles.bottomRow}>
                                        <Text style={styles.price}>Price</Text>
                                        <Text style={styles.quantity}>₹{order.price}</Text>
                                    </View>
                                    <View style={styles.bottomRow}>
                                        <Text style={styles.price}>Quantity</Text>
                                        <Text style={styles.quantity}>{order.quantity}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </>
                    );
                })}

                {/* <View style={styles.reviewContainer}>
                    <Text style={styles.reviewText}>Rating</Text>
                    <View style={styles.starRow}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <TouchableOpacity key={i} onPress={() => setRating(i)}>
                                <Icon
                                    name="star"
                                    size={30}
                                    color={i <= rating ? '#FFD700' : '#ccc'}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View> */}

                {/* <View style={styles.reviewContainer}>
                    <Text style={styles.reviewText}>Add Phots & Videos</Text>
                    {orders.map((order, index) => (
                        <TouchableOpacity
                            key={order.orderId ?? index}
                            style={styles.reviewbtn}
                            onPress={() =>
                                navigation.navigate("ProductReviewAddPhoto", {
                                    productId: order.productId,
                                    variantId: order.variantId,
                                    userId:order.userId
                                })
                            }
                        >
                            <Text >Add Review Photo</Text>
                        </TouchableOpacity>
                    ))}

                </View> */}


                {/* Address */}
                <View style={styles.addressSection}>
                    <Text style={styles.detailLabel}>🏠 Delivered To</Text>
                    <Text style={styles.addressText}>{firstOrder.shippingLine1}</Text>
                    <Text style={styles.addressText}>
                        {firstOrder.shippingCity}, {firstOrder.shippingPinCode},{" "}
                        {firstOrder.shippingCountryName}
                    </Text>
                </View>

                {/* Tracking */}
                <View style={styles.trackingcard}>
                    <Text style={styles.cardTitle}>🚛 Tracking Updates</Text>
                    <View style={styles.trackingContainer}>
                        {trackingUpdates.map((update, index) => (
                            <View key={index} style={styles.trackingItem}>
                                <View style={styles.trackingLeft}>
                                    <View
                                        style={[
                                            styles.trackingDot,
                                            update.completed && styles.trackingDotCompleted,
                                        ]}
                                    >
                                        {update.status === "Order Placed" && (
                                            <Package
                                                size={14}
                                                color={update.completed ? "#FFFFFF" : "#9CA3AF"}
                                            />
                                        )}
                                        {update.status === "Shipped" && (
                                            <Package
                                                size={14}
                                                color={update.completed ? "#FFFFFF" : "#9CA3AF"}
                                            />
                                        )}
                                        {update.status === "Out for Delivery" && (
                                            <Truck
                                                size={14}
                                                color={update.completed ? "#FFFFFF" : "#9CA3AF"}
                                            />
                                        )}
                                        {update.status === "Delivered" && (
                                            <CheckCircle
                                                size={14}
                                                color={update.completed ? "#FFFFFF" : "#9CA3AF"}
                                            />
                                        )}
                                    </View>
                                    {index < trackingUpdates.length - 1 && (
                                        <View
                                            style={[
                                                styles.trackingLine,
                                                update.completed && styles.trackingLineCompleted,
                                            ]}
                                        />
                                    )}
                                </View>
                                <View style={styles.trackingRight}>
                                    <Text
                                        style={[
                                            styles.trackingStatus,
                                            update.completed && styles.trackingStatusCompleted,
                                        ]}
                                    >
                                        {update.status}
                                    </Text>
                                    <Text style={styles.trackingDate}>{update.date}</Text>
                                    <Text style={styles.trackingDescription}>
                                        {update.description}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Bottom Section */}
                <View style={styles.bottomSection}>
                    <TouchableOpacity
                        style={[
                            styles.refundButton,
                            refundRequested && { backgroundColor: "#ccc" },
                        ]}
                        onPress={() => {
                            if (!refundRequested) setModalVisible(true);
                        }}
                        disabled={refundRequested}
                    >
                        <Text style={styles.refundText}>
                            {refundRequested ? "Already Requested" : "Request Refund"}
                        </Text>
                    </TouchableOpacity>


                    {orders?.some(order => order.orderStatusName !== 'CANCELED') && (
                        <TouchableOpacity
                            style={styles.orderCancelBtn}
                            onPress={handleCancelOrder}
                        >
                            <Text style={styles.orderCancelText}>Cancel Order</Text>
                        </TouchableOpacity>
                    )}


                    <View style={styles.bottomLinks}>
                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={() => setShowModal(true)}
                        >
                            <Text style={styles.linkText}>Download Invoice</Text>
                        </TouchableOpacity>

                        <InvoiceModal
                            visible={showModal}
                            onClose={() => setShowModal(false)}
                            invoiceNo={firstOrder.orderNumber}
                            date={formatOrderDate(firstOrder.createdAt)}
                            deliveryStatus={firstOrder.orderStatusName}
                            products={orders.map((o) => ({
                                name: o.productName,
                                quantity: o.quantity,
                                price: o.price,
                            }))}
                            user={{
                                name: firstOrder.customerName,
                                email: firstOrder.customerEmail,
                                phone: firstOrder.customerPhone,
                                shippingAddress: firstOrder.shippingLine1,
                            }}
                        />

                        <View style={styles.verticalDivider} />
                        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate("Support")}>
                            <Text style={styles.linkText}>Need Help?</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Refund Modal */}
            <Modal transparent={true} visible={modalVisible} animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Enter Refund Reason</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Type your reason..."
                            multiline
                            value={reason}
                            onChangeText={setReason}
                        />
                        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                            <Text style={styles.submitText}>Submit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* //select order cancel model */}

            <Modal
                visible={isSelectProductModalVisible}
                transparent
                animationType="fade"
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Products to Cancel</Text>
                            <TouchableOpacity onPress={() => setIsSelectProductModalVisible(false)}>
                                <Entypo name="cross" size={22} color="#444" />
                            </TouchableOpacity>
                        </View>

                        {/* Product list */}
                        <View style={styles.modalList}>
                            {orders?.filter(o => o.orderStatusName !== 'CANCELED')?.map((order, idx) => {
                                const isSelected = selectedOrderItems.some(item => item.orderItemId === order.orderItemId);

                                return (
                                    <TouchableOpacity
                                        key={idx}
                                        onPress={() => {
                                            if (isSelected) {
                                                setSelectedOrderItems(prev => prev.filter(item => item.orderItemId !== order.orderItemId));
                                            } else {
                                                setSelectedOrderItems(prev => [...prev, order]);
                                            }
                                        }}
                                        activeOpacity={0.8}
                                        style={[
                                            styles.modalOption,
                                            isSelected && styles.modalOptionSelected,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.modalOptionText,
                                                isSelected && styles.modalOptionTextSelected,
                                            ]}
                                        >
                                            {order.productName}
                                        </Text>
                                        {isSelected && (
                                            <Entypo name="check" size={18} color="#0077CC" />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Footer buttons */}
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                onPress={() => setIsSelectProductModalVisible(false)}
                                style={styles.modalCancelBtn}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    setIsSelectProductModalVisible(false);
                                    if (selectedOrderItems.length > 0) {
                                        setIsConfirmModalVisible(true);
                                    }
                                }}
                                style={styles.modalConfirmBtn}
                            >
                                <Text style={styles.modalConfirmText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* //cancel confirm model */}

            <Modal
                visible={isConfirmModalVisible}
                transparent
                animationType="fade"
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            Confirm cancel for:{' '}
                            <Text style={styles.productNames}>
                                {selectedOrderItems.map(item => item.productName).join(', ')}
                            </Text>
                            ?
                        </Text>



                        <View style={{ flexDirection: "row", justifyContent: "center", gap: 12, marginTop: 15, marginBottom: 10 }}>

                            <TouchableOpacity
                                onPress={() => setIsConfirmModalVisible(false)}
                                style={{
                                    backgroundColor: "#F2F2F2",
                                    paddingVertical: 8,
                                    paddingHorizontal: 20,
                                    borderRadius: 6,
                                    alignItems: "center",
                                    borderWidth: 1,
                                    borderColor: "#D7D7D7",
                                    minWidth: 100,
                                }}
                            >
                                <Text style={{ color: "#5C5C5C", fontWeight: "600", fontSize: 14 }}>No</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    onConfirmCancel();
                                }}

                                style={{
                                    backgroundColor: "#F8D7DA",
                                    paddingVertical: 8,
                                    paddingHorizontal: 20,
                                    borderRadius: 6,
                                    alignItems: "center",
                                    borderWidth: 1,
                                    borderColor: "#F5C6CB",
                                    minWidth: 100,
                                }}
                            >
                                <Text style={{ color: "#721C24", fontWeight: "600", fontSize: 14 }}>Yes, Cancel</Text>
                            </TouchableOpacity>

                        </View>


                    </View>
                </View>
            </Modal>


        </View>
    );
};

export default OrderHistory;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        marginHorizontal: 2
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        elevation: 5,
        paddingTop: 10,
        paddingBottom: 14,
        paddingHorizontal: 10,
    },
    text: {
        color: "#0077CC",
        fontSize: 20,
        marginLeft: 20,
        fontWeight: "900"
    },
    icon: {
        fontWeight: "900"
    },
    card: {
        borderWidth: 1,
        borderColor: "#D9D9D9",
        borderRadius: 10,
        margin: 10,
        backgroundColor: "#fff",
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-start"
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 5,
        marginRight: 10,
        marginTop: 10,
        marginLeft: 5,
    },
    statusBadge: {
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 4
    },
    statusText: {
        fontWeight: '600',
        fontSize: 10
    },
    details: {
        flex: 1,
        padding: 10
    },
    productName: {
        fontWeight: "600",
        fontSize: 16,
        marginBottom: 2,
        flexShrink: 1,
        marginRight: 3,
    },
    orderId: {
        fontSize: 13,
        color: "#555",
        marginBottom: 2
    },
    date: {
        fontSize: 13,
        color: "#777"
    },
    smallButtonCancel: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        backgroundColor: '#007CEE',
        borderRadius: 6,
        marginRight: 8,
    },
    buttonTextCancel: { fontSize: 12, color: '#fff', fontWeight: '600' },
    line: {
        height: 1,
        backgroundColor: "#D9D9D9",
        marginVertical: 10
    },
    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 2,
        marginHorizontal: 10,
    },
    price: { fontWeight: "600", fontSize: 14, color: "#000" },
    quantity: { fontSize: 16, color: "#0077CC", fontWeight: "bold" },
    addressSection: {
        backgroundColor: "#F9F9F9",
        padding: 12,
        marginHorizontal: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    detailLabel: { fontWeight: "600", fontSize: 16, marginBottom: 4, color: "#333" },
    addressText: { fontSize: 14, color: "#555", lineHeight: 20 },
    trackingcard: {
        borderWidth: 1,
        borderColor: "#D9D9D9",
        borderRadius: 10,
        margin: 10,
        backgroundColor: "#fff",
        elevation: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 20,
        paddingLeft: 10,
        marginTop: 10,
    },
    trackingContainer: { paddingLeft: 8 },
    trackingItem: { flexDirection: "row", marginBottom: 24 },
    trackingLeft: { alignItems: "center", marginRight: 16 },
    trackingDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#F3F4F6",
        borderWidth: 2,
        borderColor: "#E5E7EB",
        alignItems: "center",
        justifyContent: "center",
    },
    trackingDotCompleted: { backgroundColor: "#22C55E", borderColor: "#22C55E" },
    trackingLine: { width: 2, height: 40, backgroundColor: "#E5E7EB", marginTop: 4 },
    trackingLineCompleted: { backgroundColor: "#22C55E" },
    trackingRight: { flex: 1, paddingTop: 4 },
    trackingStatus: {
        fontSize: 16,
        fontWeight: "600",
        color: "#9CA3AF",
        marginBottom: 4,
    },
    trackingStatusCompleted: { color: "#111827" },
    trackingDate: { fontSize: 14, color: "#6B7280", marginBottom: 4 },
    trackingDescription: { fontSize: 13, color: "#9CA3AF", lineHeight: 18 },
    bottomSection: { marginHorizontal: 15, marginVertical: 20, alignItems: "center" },
    refundButton: {
        backgroundColor: "#0077CC",
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        marginBottom: 15,
        width: "100%",
        alignItems: "center",
    },
    refundText: { color: "#fff", fontWeight: "600", fontSize: 16 },

    orderCancelBtn: {
        backgroundColor: "#ffe6e6",
        paddingVertical: 12,
        paddingHorizontal: 110,
        borderRadius: 8,
        marginBottom: 25,
        width: "100%",
        alignItems: "center",

    },
    orderCancelText: { color: "#dc3545", fontWeight: "600", fontSize: 16 },


    bottomLinks: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
    linkButton: { paddingHorizontal: 10, paddingVertical: 6 },
    linkText: { color: "#007AFF", fontSize: 14, fontWeight: "500" },
    verticalDivider: { width: 1, height: 14, backgroundColor: "#ccc", marginHorizontal: 10 },
    modalOverlay: { flex: 1, backgroundColor: "#000000aa", justifyContent: "center", padding: 20 },
    modalContent: { backgroundColor: "#fff", borderRadius: 10, padding: 20 },
    // modalTitle: { fontWeight: "bold", marginBottom: 10, fontSize: 16, marginTop: 5, },
    textInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        height: 100,
        padding: 10,
        marginBottom: 15,
        textAlignVertical: "top",
    },
    submitButton: {
        backgroundColor: "#00A2F4",
        padding: 10,
        borderRadius: 6,
        alignItems: "center",
    },
    submitText: { color: "#fff", fontWeight: "bold" },
    cancelText: { marginTop: 10, color: "#888", textAlign: "center" },
    reviewContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginHorizontal: 12,
        marginTop: 10
    },
    reviewText: {
        fontSize: 16,
        fontWeight: 800,
        top: 3,
        fontFamily: "Jost"
    },
    starRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    reviewbtn: {
        backgroundColor: "#00A2F4",
        borderRadius: 5,
        paddingVertical: 6,
        paddingHorizontal: 8,
        flexDirection: "row",
        gap: 5,
        textAlign: "center"
    },
    feedbacktext: {
        fontFamily: "Jost",
        fontWeight: 800,
        fontSize: 14,
        color: "#FFFFFF",
        top: 4
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modelrow: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#DBE2E9",
        padding: 8,

    },
    // modalOption: {
    //     paddingVertical: 10,
    // },
    // modalCancelBtn: {
    //     marginTop: 10,
    //     alignItems: 'center',
    // },
    confirmButton: {
        backgroundColor: 'red',
        padding: 10,
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 10,
    },

    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    // modalTitle: {
    //     fontSize: 16,
    //     fontWeight: '600',
    //     color: '#333',
    //     marginBottom: 2
    // },
    modalTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
        lineHeight: 22,
    },
    productNames: {
        fontWeight: '700',
        color: '#0077CC',
    },
    modalList: {
        maxHeight: 280,
        marginTop: 5,
    },
    modalOption: {
        backgroundColor: '#F9F9F9',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginVertical: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalOptionSelected: {
        backgroundColor: '#E6F3FF',
        borderColor: '#0077CC',
    },
    modalOptionText: {
        color: '#333',
        fontSize: 14,
    },
    modalOptionTextSelected: {
        color: '#0077CC',
        fontWeight: '600',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 18,
    },
    modalCancelBtn: {
        borderColor: 'red',
        borderWidth: 1,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    modalCancelText: {
        color: 'red',
        fontWeight: '600',
    },
    modalConfirmBtn: {
        backgroundColor: '#0077CC',
        paddingHorizontal: 22,
        paddingVertical: 10,
        borderRadius: 8,
    },
    modalConfirmText: {
        color: '#fff',
        fontWeight: '600',
    },

});
