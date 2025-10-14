import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
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
import { useEffect, useState } from "react";
import InvoiceModal from "./OrderPrivewModal";


const screenWidth = Dimensions.get("window").width;

type RootStackParamList = {
    OrderHistory: { orderId: string };
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
    const navigation = useNavigation<any>();
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



    const firstOrder = orders[0]; // use first order for shared fields

    useEffect(() => {
        fetchOrderDetails();
    }, []);

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
            setOrders(prev =>
                prev.map(order => {
                    const updatedItems = orders.map(i =>
                        i.orderItemId === orderItemId
                            ? { ...i, orderStatusName: 'CANCELED' }
                            : i
                    );
                    return { ...order, orderItemsV1DTOS: updatedItems };
                })
            );
        } catch (error) {
            console.error('Failed to update order status:', error);
        }
    };


    const handleCancelOrder = () => {
        const activeOrders = orders?.filter(o => o.orderStatusName !== 'CANCELED');
        console.log("activeOrders", activeOrders)
        if (activeOrders?.length === 1) {
            // Only one active order, go directly to confirm
            setSelectedOrderItem(activeOrders[0]);
            setIsConfirmModalVisible(true);
        } else if (activeOrders?.length > 1) {
            // Show select product modal
            setIsSelectProductModalVisible(true);
        }
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
                                                    onPress={() =>
                                                        navigation.navigate("ProductReviewAddPhoto", {
                                                            productId: order.productId,
                                                            variantId: order.variantId,
                                                            userId: order.userId
                                                        })
                                                    }
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
                        <TouchableOpacity style={styles.linkButton}>
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
                animationType="slide"
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Select a product to cancel:</Text>
                        {orders?.filter(o => o.orderStatusName !== 'CANCELED')?.map((order, idx) => (
                            <TouchableOpacity
                                key={idx}
                                onPress={() => {

                                    setIsSelectProductModalVisible(false);
                                    setIsConfirmModalVisible(true);
                                    setSelectedOrderItem(order);
                                }}
                                style={styles.modalOption}
                            >
                                <Text>{order.productName}</Text>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            onPress={() => setIsSelectProductModalVisible(false)}
                            style={styles.modalCancelBtn}
                        >
                            <Text style={{ color: 'red' }}>Cancel</Text>
                        </TouchableOpacity>
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
                            Confirm cancel for: {selectedOrderItem?.productName}?
                        </Text>

                        <View style={{ flexDirection: "row", justifyContent: "center", gap: 12, marginTop: 15, marginBottom: 10 }}>

                            <TouchableOpacity
                                onPress={() => setIsConfirmModalVisible(false)}
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
                                <Text style={{ color: "#721C24", fontWeight: "600", fontSize: 14 }}>No</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    updateOrderStatus(selectedOrderItem?.orderItemId ?? 0);
                                    setIsConfirmModalVisible(false);
                                }}
                                style={{
                                    backgroundColor: "#0077CC",
                                    paddingVertical: 8,
                                    paddingHorizontal: 20,
                                    borderRadius: 6,
                                    alignItems: "center",
                                    minWidth: 100,
                                }}
                            >
                                <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>Yes, Cancel</Text>
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
    modalTitle: { fontWeight: "bold", marginBottom: 10, fontSize: 16, marginTop: 5 },
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
        backgroundColor: "#28a745",
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
    modalOption: {
        paddingVertical: 10,
    },
    modalCancelBtn: {
        marginTop: 10,
        alignItems: 'center',
    },
    confirmButton: {
        backgroundColor: 'red',
        padding: 10,
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 10,
    },

});
