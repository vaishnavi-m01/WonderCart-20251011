import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Alert,
  ToastAndroid,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import apiClient from "../../services/apiBaseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCart } from "../context/AddToCartItem";
import { useEffect, useState } from "react";
import Ionicons from 'react-native-vector-icons/Ionicons';


export type ProductStackParamList = {
  ProductDetails: { productId: string };
  Cart: undefined;
};

type data = {
  productId: number;
  image: any;
  sku?: string;
  productName: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  deliveryStatus?: string;
  orderDay?: string;
  offer?: number;
  variantId?: number;
  description?: string;
  categoryName?: string;
};

type ProductProps = data & {
  onAdd?: (product: data) => void;
};
const { width } = Dimensions.get("window");
const CARD_GAP = 12;
const CARD_WIDTH = (width - CARD_GAP * 2) / 2;

const Product = ({
  productId,
  image,
  productName,
  price,
  variantId,
  originalPrice,
  description,
  discount,
  deliveryStatus,
  orderDay,
  offer,
  sku,
  categoryName
}: ProductProps) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { addToCart } = useCart();
  const { setCartItems } = useCart();

  const [isFavorite, setIsFavorite] = useState(false);
  const [wishlistId, setWishlistId] = useState(null);
  console.log("ProductCategoryName", categoryName)
  console.log("PRDOUCTiiiiiD", productId)
  console.log("VariantIdd", variantId)


  const handleAddToCart = async () => {
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

      navigation.navigate("Main", { screen: "Cart" });
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("Error", "Could not add item to cart.");
    }
  };


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

      console.log("WishlistDataa", wishlist)
      const matched = wishlist.find(
        // (item: any) => item.productId === productId && item.variantId === variantId
        (item: any) => item.productId === productId

      );

      if (matched) {
        setIsFavorite(true);
        console.log("ISfavorite", isFavorite)
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

      // Logged-in user logic
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
      console.error("Wishlist error:", error);
      ToastAndroid.show('Error updating wishlist', ToastAndroid.SHORT);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={()=> navigation.navigate('SeparateProductPage', { productId,categoryName })}>
      <View style={styles.imageContainer}>
        {image.length > 0 && ( 
          <Image source={image[0]} style={styles.image} />
        )}
      
        <TouchableOpacity style={styles.heartIcon} onPress={handleWishlistToggle}>
          {isFavorite ? (
            <Ionicons name="heart-sharp" color="red" size={16} />

          ) : (
            <Icon name="heart" size={16} color="#454545" />
          )}
        </TouchableOpacity>

      </View>

      <Text style={styles.productName} numberOfLines={1}>
        {productName}
      </Text>

      <View style={styles.iconContainer}>
        <Text style={styles.amount}>₹{price}</Text>
        <Text style={styles.originalPrice}>{originalPrice}</Text>
        <Text style={styles.discount}>{discount}% OFF</Text>
      </View>

     {deliveryStatus && orderDay ? (
    <Text style={styles.deliveryStatus}>
    {deliveryStatus} - {orderDay}
   </Text>
    ) : null}

      <TouchableOpacity style={styles.btn} onPress={handleAddToCart}>
        <Text style={styles.btnText}>Add to Cart</Text>
      </TouchableOpacity>
    </TouchableOpacity>

  );
};

export default Product;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    margin: 5,
    
    borderColor: "#eee",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    // elevation: 3,
  },

  imageContainer: {
    position: "relative",
    width: "100%",
    height: 130,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f8f8f8",
  },

  image: {
    width: "100%",
    height: "100%",
  },

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


  productName: {
    fontSize: 14,
    color: "#111",
    fontWeight: "600",
    marginVertical: 8,
    textAlign: "center",
  },

  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  amount: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#111",
  },

  originalPrice: {
    fontSize: 12,
    color: "gray",
    textDecorationLine: "line-through",
    marginLeft: 6,
  },

  discount: {
    color: "#FF6A00",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },

  deliveryStatus: {
    fontSize: 11,
    color: "gray",
    textAlign: "center",
    marginBottom: 8,
  },

  btn: {
    backgroundColor: "#059ff8",
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: "center",
  },

  btnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },
});
