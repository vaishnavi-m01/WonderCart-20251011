import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import apiClient from "../services/apiBaseUrl";
import Foundation from 'react-native-vector-icons/Foundation';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from "@react-navigation/native";


type data = {
    variantId: number;
    productId: number;
    image: any;
    product: string;
    productName?: string;
    price: number;
    rating: number;
};

const SeparateProductCards = ({ variantId, productId, image, product, productName, price, rating }: data) => {

    const [isFavorite, setIsFavorite] = useState(false);
    const [wishlistId, setWishlistId] = useState(null);
    const navigation = useNavigation<any>();

    const fetchWishlist = async () => {
        try {
            const userString = await AsyncStorage.getItem("user");

            if (!userString) {
                const saved = await AsyncStorage.getItem('wishlistItems');
                const wishlist = saved ? JSON.parse(saved) : [];

                const matched = wishlist.find(
                    (item: any) => item.productId === productId && item.variantId === variantId
                );

                if (matched) {
                    setIsFavorite(true);
                } else {
                    setIsFavorite(false);
                }

                return;
            }

            const user = JSON.parse(userString);
            const res = await apiClient.get(`v1/wishlist?userId=${user.userId}`);
            const wishlist = res.data || [];

            const matched = wishlist.find(
                (item: any) => item.productId === productId && item.variantId === variantId
            );

            if (matched) {
                setIsFavorite(true);
                setWishlistId(matched.wishlistId);
            } else {
                setIsFavorite(false);
                setWishlistId(null);
            }

        } catch (err) {
            console.error('Error fetching wishlist:', err);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [productId]);

    const handleWishlistToggle = async () => {
        try {
            const userString = await AsyncStorage.getItem("user");
            if (!userString) {
                const saved = await AsyncStorage.getItem('wishlistItems');
                const wishlist = saved ? JSON.parse(saved) : [];

                if (!isFavorite) {
                    wishlist.push({
                        wishlistId: `guest-${Date.now()}`,
                        productId: productId,
                        variantId: variantId,
                        productName,
                        image: image,
                        price,
                        createdAt: new Date().toISOString()
                    });
                    await AsyncStorage.setItem('wishlistItems', JSON.stringify(wishlist));
                    setIsFavorite(true);
                    ToastAndroid.show('Added to Wishlist ❤️', ToastAndroid.SHORT);
                } else {
                    const updated = wishlist.filter((item: any) => item.productId !== productId);
                    await AsyncStorage.setItem('wishlistItems', JSON.stringify(updated));
                    setIsFavorite(false);
                    ToastAndroid.show('Removed from Wishlist 🤍', ToastAndroid.SHORT);
                }
                return;
            }
            const user = JSON.parse(userString);
            const payload = {
                userId: user.userId,
                productId: productId,
                variantId: variantId,
                createdAt: new Date().toISOString(),
            };

            if (!isFavorite) {
                const response = await apiClient.post('v1/wishlist', payload);
                console.log(" Wishlist Add Response:", response.data);
                setIsFavorite(true);
                setWishlistId(response.data.wishlistId);
                ToastAndroid.show('Added to Wishlist ❤️', ToastAndroid.SHORT);
            } else {
                const response = await apiClient.delete(`v1/wishlist/${wishlistId}`);
                console.log(" Wishlist Delete Response:", response.data);
                setIsFavorite(false);
                ToastAndroid.show('Removed from Wishlist 🤍', ToastAndroid.SHORT);
            }
        } catch (error) {
            ToastAndroid.show('Error updating wishlist', ToastAndroid.SHORT);
        }
    };

 
    return (
        <TouchableOpacity activeOpacity={1} onPress={() => navigation.navigate("SeparateProductPage",{productId})}>
            <View style={styles.container}>
                <View style={styles.cardContainer}>
                    <Image source={{ uri: image }} style={styles.Img} />
                    <View style={styles.cardBottom}>
                        <View style={styles.row}>
                            <Text style={styles.productName}>{product}</Text>
                            <TouchableOpacity onPress={handleWishlistToggle}>
                                {isFavorite ? (
                                    <Foundation name="heart" color="red" size={20} />
                                ) : (
                                    <AntDesign name="hearto" color="#212121" size={20} />
                                )}
                            </TouchableOpacity>

                        </View>
                        <Text style={styles.text} numberOfLines={1}>{productName}</Text>
                        <View style={styles.row}>
                            <Text style={styles.amount}>₹{price}</Text>
                            <View style={styles.ratingContainer}>
                                <MaterialCommunityIcons name="star" color="#FFE70C" size={14} />
                                <Text style={styles.rating}>{rating}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>

    );
};

export default SeparateProductCards;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 5,
        paddingVertical: 10,
    },
    cardContainer: {
        borderColor: "#AFAFAF",
        borderWidth: 1,
        borderRadius: 12,
        backgroundColor: "#fff",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        width: 150,
        height: 200
    },
    Img: {
        height: 120,
        width: "100%",
        resizeMode: 'cover',
    },
    cardBottom: {
        // backgroundColor: "#E3F2FF",
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        top: -3
    },
    productName: {
        color: "#333",
        fontWeight: "600",
        fontSize: 12,
        flex: 1,
    },
    text: {
        fontSize: 10,
        fontWeight: "500",
        color: "#666",
        marginVertical: 4,
    },
    amount: {
        color: "#008DD4",
        fontWeight: "700",
        fontSize: 12,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    rating: {
        fontSize: 10,
        marginLeft: 2,
        color: "#666666",
        fontWeight: "500",
    },
});
