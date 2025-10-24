import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import {
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    Alert,
    ToastAndroid
} from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Foundation from 'react-native-vector-icons/Foundation';
import { useCart } from "../context/AddToCartItem";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../services/apiBaseUrl";
import { TabParamList } from "../SeparateProduct";
import Icon from "react-native-vector-icons/Feather";
import { Dimensions } from "react-native";


const { width } = Dimensions.get("window");
const CARD_GAP = 12;
const CARD_WIDTH = (width - CARD_GAP * 2) / 2;

type data = {
    productId: number;
    image: string;
    productName: string;
    price: number;
    originalPrice?: number;
    description?: string;
    sku?: string;
    variantId?: number;
    onToggleWishlist?: () => void;
};

export type RootStackParamList = {
    Home: undefined;
    CategoriesProduct: {
        product: any;
    };
    Cart?: {
        AddToCart: {
            id: number;
            productName: string;
            image: any;
            price: number;
            originalPrice: number;
            offer: string;
            discount: number;
            selectedSize: string;
            description: string;
        }
    },
    Main: {
        screen: keyof TabParamList;
        params?: undefined;
    };
};


type NavigationProp = NativeStackNavigationProp<RootStackParamList, "CategoriesProduct">;

const TopSeller = ({ productId, image, productName, price, originalPrice, description, sku, variantId, onToggleWishlist }: data) => {
    const { addToCart } = useCart();
    const navigation = useNavigation<any>();
    const [isFavorite, setIsFavorite] = useState(false);
    const { setCartItems } = useCart();
    const [wishlistId, setWishlistId] = useState(null);



    useFocusEffect(
        useCallback(() => {
            const loadWishlist = async () => {
                const saved = await AsyncStorage.getItem("wishlistItems");
                const wishlist = saved ? JSON.parse(saved) : [];
                const exists = wishlist.some((item: any) => item.productId === productId);
                setIsFavorite(exists);
            };

            loadWishlist();
        }, [productId])
    );

    const handleClick = async () => {
        try {
            const userString = await AsyncStorage.getItem("user");

            const cartItem = {
                productId: productId,
                variantId: variantId,
                price,
                quantity: 1
            };

            if (userString) {
                const user = JSON.parse(userString);
                const userId = user.userId;


                const response = await apiClient.get(`v1/cart/${userId}`);
                const cartItems = response.data;


                const existingItem = cartItems.find(
                    (item: any) => item.productId === productId && item.variantId === variantId
                );

                if (existingItem) {

                    const updatedItem = {
                        cartItemId: existingItem.cartItemId,
                        quantity: existingItem.quantity + 1,
                        price: price,
                    };
                    console.log("Sending cart item to backend put api ", updatedItem)
                    await apiClient.patch(`v1/cart/update/cartItems/${existingItem.cartItemId}`, updatedItem);
                    console.log("Updated existing cart item (PUT):", updatedItem);
                } else {

                    console.log("Sending cart item to backend:", cartItem);

                    await apiClient.post(`v1/cart/${userId}/items`, cartItem);
                    console.log("Added new item to cart (POST):", cartItem);
                }
            } else {

                const localCart = await AsyncStorage.getItem('cartItems');
                let cart = localCart ? JSON.parse(localCart) : [];

                const existingIndex = cart.findIndex(
                    (item: any) => item.productId === productId && item.variantId === variantId
                );

                if (existingIndex !== -1) {

                    cart[existingIndex].quantity += 1;
                } else {

                    cart.unshift({
                        productId: productId,
                        productName,
                        description,
                        image,
                        price,
                        sku,
                        originalPrice,
                        offer: 10,
                        discount: 10,
                        variantId,
                        quantity: 1,
                    });
                }

                await AsyncStorage.setItem('cartItems', JSON.stringify(cart));
                setCartItems(cart);
                console.log("Cart item stored locally!");
            }

            navigation.navigate("MainTabs", { screen: "Cart" });
        } catch (error) {
            console.error("Error adding to cart:", error);
            Alert.alert("Error", "Could not add item to cart.");
        }
    };



    const handleWishlistToggle = async () => {
        try {
            const newFavorite = !isFavorite;
            setIsFavorite(newFavorite);

            const userString = await AsyncStorage.getItem("user");

            if (!userString) {
                const saved = await AsyncStorage.getItem("wishlistItems");
                const wishlist = saved ? JSON.parse(saved) : [];

                if (newFavorite) {
                    // add
                    const newItem = {
                        wishlistId: `guest-${Date.now()}`,
                        productId,
                        variantId,
                        productName,
                        description,
                        image,
                        price,
                        createdAt: new Date().toISOString(),
                    };
                    await AsyncStorage.setItem(
                        "wishlistItems",
                        JSON.stringify([...wishlist, newItem])
                    );
                    ToastAndroid.show("Added to Wishlist ❤️", ToastAndroid.SHORT);
                } else {
                    const updated = wishlist.filter(
                        (item: any) => item.productId !== productId
                    );
                    await AsyncStorage.setItem("wishlistItems", JSON.stringify(updated));
                    ToastAndroid.show("Removed from Wishlist 🤍", ToastAndroid.SHORT);
                }
                return;
            }

            // Logged-in user
            const user = JSON.parse(userString);
            const payload = {
                userId: user.userId,
                productId,
                variantId,
                createdAt: new Date().toISOString(),
            };

            if (newFavorite) {
                const response = await apiClient.post("v1/wishlist", payload);
                setWishlistId(response.data.wishlistId);
                ToastAndroid.show("Added to Wishlist ❤️", ToastAndroid.SHORT);
            } else {
                await apiClient.delete(`v1/wishlist/${wishlistId}`);
                setWishlistId(null);
                ToastAndroid.show("Removed from Wishlist 🤍", ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error("Wishlist error:", error);
            ToastAndroid.show("Error updating wishlist", ToastAndroid.SHORT);
            // rollback
            setIsFavorite((prev) => !prev);
        }
    };

    return (
        //  <View style={styles.container}>

        //      <View style={styles.ImgContainer}>
        //         <Image source={
        //             image
        //                 ? { uri: String(image) }
        //                 : require("../../assets/images/Bluetooth.png")
        //         } style={styles.productImage} />


        //     </View>  

        //      <View style={styles.imageContainer}>
        //             {image.length > 0 && ( 
        //               <Image source={
        //               image
        //                 ? { uri: String(image) }
        //                 : require("../../assets/images/Bluetooth.png")
        //         } style={styles.image} />
        //             )}

        //             <TouchableOpacity style={styles.heartIcon} onPress={handleWishlistToggle}>
        //               {isFavorite ? (
        //                 <Ionicons name="heart-sharp" color="red" size={16} />

        //               ) : (
        //                 <Icon name="heart" size={16} color="#454545" />
        //               )}
        //             </TouchableOpacity>

        //           </View>


        //     <Text style={styles.productTitle} numberOfLines={2}>{productName}</Text>

        //     <View style={styles.row}>
        //         {/* <TouchableOpacity onPress={() => setModalVisible(true)}>
        //                 <Text style={styles.text}>{selectedSize}</Text>
        //             </TouchableOpacity> */}
        //         {/* <Text style={styles.text}>20% OFF</Text> */}
        //     </View>



        //     <View style={styles.amountContainer}>
        //         <View style={styles.priceContainer}>
        //             <Text style={styles.productPrice}>₹{price}</Text>
        //             <Text style={styles.originalPrice}>₹{originalPrice}</Text>
        //         </View>

        //         <View style={styles.iconContainer}>
        //             <TouchableOpacity onPress={handleWishlistToggle}>
        //                 {isFavorite ? (
        //                     <Foundation name="heart" color="red" size={24} />
        //                 ) : (
        //                     <AntDesign name="hearto" color="#212121" size={24} />
        //                 )}
        //             </TouchableOpacity>
        //             <TouchableOpacity onPress={handleClick}>
        //                 <Ionicons name="cart-outline" color="#FFFFFF" size={18} style={styles.cartIcon} />
        //             </TouchableOpacity>
        //         </View>
        //     </View>


        // </View>

        <TouchableOpacity style={styles.container} onPress={() => navigation.navigate('SeparateProductPage', { productId })}>
            <View style={styles.imageContainer}>
                <Image
                    source={
                        image
                            ? { uri: String(image) }
                            : require("../../assets/images/Bluetooth.png")
                    }
                    style={styles.image}
                />

                {/* Wishlist Heart on top-right corner */}
                <TouchableOpacity style={styles.heartIcon} onPress={handleWishlistToggle}>
                    {isFavorite ? (
                        <Ionicons name="heart-sharp" color="red" size={16} />

                    ) : (
                        <Icon name="heart" size={16} color="#454545" />
                    )}
                </TouchableOpacity>
            </View>
            <Text style={styles.productTitle} numberOfLines={1}>
                {productName}
            </Text>

            <View style={styles.amountContainer}>
                <View style={styles.priceContainer}>
                    <Text style={styles.productPrice}>₹{price}</Text>
                    {originalPrice && (
                        <Text style={styles.originalPrice}>₹{originalPrice}</Text>
                    )}

                </View>

                <View style={styles.iconContainer}>
                    {/* Only cart icon here */}
                    <TouchableOpacity onPress={handleClick}>
                        <Ionicons
                            name="cart-outline"
                            color="#FFFFFF"
                            size={18}
                            style={styles.cartIcon}
                        />
                    </TouchableOpacity>
                </View>
            </View>


        </TouchableOpacity>

    );

};

export default TopSeller;

const styles = StyleSheet.create({
    // container: {
    //     height: 220,
    //     width: 145,
    //     padding: 10,
    //     borderRadius: 10,
    //     borderColor: "#D9D9D9",
    //     borderWidth: 2,
    //     gap: 1,
    //     marginRight: 5,
    //     backgroundColor: "#fff",
    //     paddingBottom: 10
    // },
    container: {
        width: CARD_WIDTH,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 10,
        margin: 6,
        borderColor: "#eee",
        borderWidth: 1,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
        minHeight: 220,
    },
    // ImgContainer: {
    //     borderWidth: 1,
    //     borderColor: "#D9D9D9",
    //     borderRadius: 12,
    //     margin: 3,
    //     padding: 5,
    //     width: 100,
    //     alignSelf: 'center',
    // },
    // productImage: {
    //     width: 90,
    //     height: 100,
    //     marginBottom: 6,
    //     borderRadius: 12,
    //     // resizeMode: 'contain',
    // },

    imageContainer: {
        position: "relative",
        width: "100%",
        height: 150,
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: "#f8f8f8",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    productTitle: {
        fontSize: 14,
        color: "#111",
        fontWeight: "600",
        marginVertical: 8,
        textAlign: "center",
    },

    amountContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
    },

    priceContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },

    iconContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3
    },

    subContainer: {
        flexDirection: "row"
    },
    productPrice: {
        fontSize: 12,
        color: '#303030',
        fontWeight: '900',
        fontFamily: "Jost"
    },
    originalPrice: {
        fontSize: 8,
        color: 'gray',
        textDecorationLine: 'line-through',
    },
    cartIcon: {
        backgroundColor: "#0094FF",
        padding: 1,
        borderRadius: 2,
        marginBottom: 3
    },
    // heartIcon: {
    //     top: -4,
    //     fontSize: 29
    // },
    heartIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 6,
        elevation: 4,
        zIndex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 4
    },
    text: {
        fontSize: 10,
        paddingLeft: 1,
        marginTop: 2,
        color: "#303030",
        fontWeight: '800'
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        marginLeft: 20,
        paddingTop: 10

    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 10,
        width: 80,
        elevation: 5,
    },
    modalItem: {
        paddingVertical: 8,
    },
    modalText: {
        fontSize: 14,
        textAlign: "center",
        color: "#303030"
    }
});
