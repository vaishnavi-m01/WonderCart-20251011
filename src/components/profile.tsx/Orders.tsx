import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import apiClient from '../../services/apiBaseUrl';
import UnifiedHeader from '../common/UnifiedHeader';

interface Order {
    orderId: number;
    productId:number;
    orderNumber: string;
    total: number;
    createdAt: string;
    orderItemsV1DTOS: any[];
    orderStatusName: string;
}

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

const getProductImage = (orderItem: any) => {
    return (
        orderItem?.variantImageDTOList?.find((img: any) => img.isPrimary)?.imageUrl ??
        orderItem?.variantImageDTOList?.[0]?.imageUrl ??
        null
    );
};

const Orders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [userId, setUserId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<any>();

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userString = await AsyncStorage.getItem('user');
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
        const fetchOrders = async () => {
            if (!userId) return;
            try {
                setLoading(true);
                const response = await apiClient.get(`v2/orders/getAll`, {
                    params: { userId },
                });

                setOrders(response.data || []);
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.error('Axios error:', error.response?.data);
                } else {
                    console.error('Unexpected error:', error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [userId]);

  

    const renderItem = ({ item }: { item: Order }) => {
        const firstItem = item.orderItemsV1DTOS[0];
        console.log("ORDERSID",item.orderId)
        console.log("ProductIdddOrdersPage",firstItem.productId)
        const statusStyle = getStatusStyle(firstItem?.orderStatusName ?? 'PROCESSING');

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                 onPress={() => navigation.navigate("SeparateProductPage",{productId:firstItem.productId})}
            >

                <View style={styles.card}>
                    {/* Header */}
                    <View style={styles.cardheader}>
                        <Text style={styles.orderText}># {item.orderNumber}</Text>
                        <View
                            style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}
                        >
                            <Text style={[styles.statusText, { color: statusStyle.color }]}>
                                {firstItem?.orderStatusName}
                            </Text>
                        </View>
                    </View>

                    {/* Date */}
                    <Text style={styles.date}>
                        {new Date(item.createdAt).toLocaleString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                        })}
                    </Text>

                    <View style={styles.content}>
                        {item.orderItemsV1DTOS.length === 1 ? (
                            getProductImage(firstItem) ? (
                                <Image
                                    source={{ uri: getProductImage(firstItem) }}
                                    style={styles.image}
                                />
                            ) : (
                                <View style={[styles.image, { backgroundColor: '#eee' }]} />
                            )
                        ) : (
                            <View style={styles.thumbnailRow}>
                                {item.orderItemsV1DTOS.slice(0, 2).map((product, idx) => (
                                    <Image
                                        key={idx}
                                        source={{ uri: getProductImage(product) }}
                                        style={styles.thumbnail}
                                    />
                                ))}
                                {item.orderItemsV1DTOS.length > 2 && (
                                    <Text style={styles.moreText}>
                                        +{item.orderItemsV1DTOS.length - 2} more
                                    </Text>
                                )}
                            </View>
                        )}

                        <View style={styles.info}>
                            <Text style={styles.product}>
                                {firstItem?.productName}
                                {item.orderItemsV1DTOS.length > 1 && (
                                    <Text style={{ color: '#666' }}>
                                        {' '}
                                        +{item.orderItemsV1DTOS.length - 1} more items
                                    </Text>
                                )}
                            </Text>

                            <Text>
                                <Text style={{ color: "#666" }}>Total: </Text>
                                <Text style={styles.price}>
                                    ₹{item?.total ?? 0}
                                </Text>
                            </Text>


                            <View style={styles.row}>
                                {/* {firstItem?.orderStatusName !== 'CANCELED' && (
                                    <TouchableOpacity
                                        style={styles.smallButtonCancel}
                                        onPress={() => updateOrderStatus(firstItem?.orderItemId)}
                                    >
                                        <Text style={styles.buttonTextCancel}>Cancel</Text>
                                    </TouchableOpacity>
                                )} */}
                                <TouchableOpacity
                                    style={styles.smallButtonView}
                                    onPress={() =>
                                        navigation.navigate('OrderHistory', { orderId: item.orderId })
                                    }
                                >
                                    <Text style={styles.buttonTextView}>View Details</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {!userId ? (
                <View style={styles.emptyContainer}>
                    <AntDesign name="user" size={64} color="#aaa" style={{ marginBottom: 20 }} />
                    <Text style={styles.emptyText}>You're not logged in.</Text>
                    <TouchableOpacity
                        style={styles.exploreButton}
                        onPress={() => navigation.navigate('Main', { screen: 'Profile' })}
                    >
                        <Text style={styles.exploreButtonText}>Login Now</Text>
                    </TouchableOpacity>
                </View>
            ) : loading ? (
                <ActivityIndicator size="large" color="#0077CC" style={{ marginTop: 30 }} />
            ) : orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <AntDesign name="inbox" size={64} color="#aaa" style={{ marginBottom: 20 }} />
                    <Text style={styles.emptyText}>You haven't placed any orders yet.</Text>
                    <TouchableOpacity
                        style={styles.exploreButton}
                        onPress={() => navigation.navigate('Main', { screen: 'Home' })}
                    >
                        <Text style={styles.exploreButtonText}>Start Shopping</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={item => item.orderId.toString()}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
};

export default Orders;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    list: {
        paddingBottom: 50
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        elevation: 5,
        marginHorizontal: 8,
        marginVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    cardheader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    orderText: {
        fontWeight: 'bold',
        fontSize: 16
    },
    date: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8
    },
    statusBadge: {
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 4
    },
    statusText: {
        fontWeight: '600',
        fontSize: 12
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    image: {
        width: 65,
        height: 85,
        borderRadius: 8,
        marginRight: 12
    },
    info: {
        flex: 1
    },
    product: {
        fontSize: 15,
        fontWeight: 'bold'
    },
    price: {
        fontSize: 15,
        color: '#007bff',
        marginVertical: 4
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyText: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 20
    },
    exploreButton: {
        backgroundColor: '#0077CC',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    exploreButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 10
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10
    },
    smallButtonCancel: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        backgroundColor: '#FFEBEE',
        borderRadius: 6,
        marginRight: 8,
    },
    buttonTextCancel: { fontSize: 12, color: '#D32F2F', fontWeight: '600' },
    smallButtonView: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        backgroundColor: '#1976D2',
        borderRadius: 6,
    },
    buttonTextView: { fontSize: 12, color: '#fff', fontWeight: '600' },
    thumbnailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, top: -12 },
    thumbnail: { width: 40, height: 40, borderRadius: 5, marginRight: 6 },
    moreText: { fontSize: 12, color: '#666', alignSelf: 'center' },
});
