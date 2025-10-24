import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../services/apiBaseUrl";
import LinearGradient from "react-native-linear-gradient";

type CartItemType = {
  id?: number;
  productId: number;
  variantId?: number;
  wishlistId?: number;
  cartItemId?: number;
  image: string;
  sku?: string;
  productName: string;
  description?: string;
  price?: number;
  originalAmount?: number;
  discount?: number;
  onRemove: () => void;
  isSelected: boolean;
  onToggle: () => void;
  quantity: number;
  onQuantityChange: (newQty: number) => void;
};

const AddToCart = ({
  id,
  cartItemId,
  wishlistId,
  image,
  productName,
  description,
  price,
  originalAmount,
  discount,
  productId,
  variantId,
  onRemove,
  isSelected,
  onToggle,
  quantity,
  onQuantityChange,
}: CartItemType) => {
  const navigation = useNavigation<any>();

  const handleMoveToWishlist = async () => {
    try {
      const userString = await AsyncStorage.getItem("user");

      if (userString) {
        const user = JSON.parse(userString);

        const res = await apiClient.get(`v1/wishlist?userId=${user.userId}`);
        const existingWishlist = res.data || [];

        const alreadyExists = existingWishlist.some(
          (item: any) =>
            item.productId === productId && item.variantId === variantId
        );

        if (alreadyExists) {
          Alert.alert("Info", "This item is already in your wishlist.");
          return;
        }

        const payload = {
          userId: user.userId,
          productId: productId,
          variantId: variantId,
          createdAt: new Date().toISOString(),
        };

        await apiClient.post(`v1/wishlist`, payload);

        if (cartItemId) {
          await apiClient.delete(`v1/cart/${user.userId}/items/${cartItemId}`);
        }
      } else {
        const savedWishlist = await AsyncStorage.getItem("wishlistItems");
        const wishlistItems = savedWishlist ? JSON.parse(savedWishlist) : [];

        const alreadyExists = wishlistItems.some(
          (item: any) =>
            item.productId === productId && item.variantId === variantId
        );

        if (alreadyExists) {
          Alert.alert("Info", "This item is already in your wishlist.");
          return;
        }

        wishlistItems.push({
          id,
          wishlistId: `guest-${Date.now()}`,
          image,
          productId: productId,
          variantId: variantId,
          productName,
          description,
          price,
          originalAmount,
          discount,
          createdAt: new Date().toISOString(),
        });

        await AsyncStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));

        const savedCart = await AsyncStorage.getItem("cartItems");
        const cartItems = savedCart ? JSON.parse(savedCart) : [];
        const updatedCart = cartItems.filter((item: any) => item.id !== id);
        await AsyncStorage.setItem("cartItems", JSON.stringify(updatedCart));
      }

      onRemove();
      navigation.navigate("Wishlist");
    } catch (error) {
      console.error("Error moving to wishlist:", error);
      Alert.alert("Error", "Could not move item to wishlist. Please try again.");
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate("SeparateProductPage", { productId })}
    >
      <LinearGradient
        colors={["#e6f0ff", "#ffffff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.subContainer}
      >
        <View style={styles.leftSection}>
          <Image
            source={
              Array.isArray(image)
                ? typeof image[0] === "string"
                  ? { uri: image[0] }
                  : image[0]
                : typeof image === "string"
                ? { uri: image }
                : image
            }
            style={styles.Img}
          />

          <View style={styles.qtyBox}>
            <TouchableOpacity
              onPress={() => onQuantityChange(Math.max(1, quantity - 1))}
            >
              <Text style={styles.qtyButton}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyNumber}>{quantity ?? 1}</Text>
            <TouchableOpacity
              onPress={() => onQuantityChange(Math.min(10, quantity + 1))}
            >
              <Text style={styles.qtyButton}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.rightSide}>
          <View style={styles.headerRow}>
            <Text style={styles.productName} numberOfLines={1}>
              {productName}
            </Text>

            <TouchableOpacity
              style={[
                styles.checkbox,
                isSelected ? styles.checked : styles.unchecked,
              ]}
              onPress={onToggle}
            >
              {isSelected && <Text style={styles.tick}>✓</Text>}
            </TouchableOpacity>
          </View>

          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>

          <View style={styles.amountContainer}>
            <Text style={styles.originalPrice}>₹{originalAmount}</Text>
            <Text style={styles.amount}>₹{price}</Text>

            <View style={styles.discountBadge}>
              <MaterialCommunityIcons name="tag-heart" size={16} color="#fff" />
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.removebutton} onPress={onRemove}>
              <MaterialCommunityIcons
                name="delete-variant"
                color="#5C5C5C"
                size={15}
              />
              <Text style={styles.buttonText}>Remove</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addWishlistBtn}
              onPress={handleMoveToWishlist}
            >
              <EvilIcons name="heart" color="#5C5C5C" size={18} />
              <Text style={styles.whislistbtnText}>Add Wishlist</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default AddToCart;

const styles = StyleSheet.create({
  subContainer: {
    marginTop: 16,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    marginHorizontal: 6,
    padding: 10,
    backgroundColor: "#fff",
    alignItems: "flex-start",
  },

  leftSection: {
    width: 95,
    alignItems: "center",
  },

  Img: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    marginTop: 8,
  },

  qtyButton: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    paddingHorizontal: 8,
  },

  qtyNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },

  rightSide: {
    flex: 1,
    paddingLeft: 8,
    justifyContent: "space-between",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  productName: {
    fontWeight: "700",
    color: "#222",
    fontSize: 14,
    flexShrink: 1,
    maxWidth: "85%",
  },

  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderRadius: 6,
    borderColor: "#BDBDBD",
    alignItems: "center",
    justifyContent: "center",
  },
  checked: {
    backgroundColor: "#0094FF",
    borderColor: "#0094FF",
  },
  unchecked: {
    backgroundColor: "#fff",
  },
  tick: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  description: {
    fontSize: 12,
    color: "#303030",
    marginTop: 2,
  },

  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
    flexWrap: "wrap",
  },

  amount: {
    color: "#303030",
    fontWeight: "700",
  },

  originalPrice: {
    fontSize: 11,
    color: "#9E9E9E",
    textDecorationLine: "line-through",
  },

  discountBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00A2F4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  discountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },

  buttonContainer: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },

  removebutton: {
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  buttonText: {
    fontWeight: "700",
    color: "#5C5C5C",
    paddingLeft: 5,
    fontSize: 12,
  },

  addWishlistBtn: {
    borderColor: "#000",
    borderWidth: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  whislistbtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5C5C5C",
  },
});
