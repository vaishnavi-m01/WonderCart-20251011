import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
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
    console.log("AdvariantId", variantId);
    try {
      const userString = await AsyncStorage.getItem("user");

      if (userString) {
        const user = JSON.parse(userString);

        //  Step 1: Fetch existing wishlist from server
        const res = await apiClient.get(`v1/wishlist?userId=${user.userId}`);
        const existingWishlist = res.data || [];
        console.log("Existing wishlist:", existingWishlist);

        //  Step 2: Check if product+variant already exists
        const alreadyExists = existingWishlist.some(
          (item: any) =>
            item.productId === productId && item.variantId === variantId
        );

        if (alreadyExists) {
          console.log("Already in wishlist");
          Alert.alert("Info", "This item is already in your wishlist.");
          return;
        }


        const payload = {
          userId: user.userId,
          productId: productId,
          variantId: variantId,
          createdAt: new Date().toISOString(),
        };
        console.log("Adding to Wishlist:", payload);

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
          console.log("Already in guest wishlist");
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



  console.log("description", description)

  return (
    <TouchableOpacity onPress={() => navigation.navigate("SeparateProductPage", { productId })}>
      <LinearGradient
        colors={['#e6f0ff', '#ffffff',]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.subContainer}
      >

        <View style={{ flex: 1, flexDirection: "column" }}>
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



          </View>
          <View style={styles.qtyBox}>
            <TouchableOpacity onPress={() => onQuantityChange(Math.max(1, quantity - 1))}>
              <Text style={styles.qtyButton}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyNumber}>{quantity ?? 1}</Text>

            <TouchableOpacity onPress={() => onQuantityChange(Math.min(10, quantity + 1))}>
              <Text style={styles.qtyButton}>+</Text>
            </TouchableOpacity>
          </View>
        </View>


        <View style={styles.rightSide}>
          <View style={{ flex: 1, flexDirection: "row" }}>
            <Text style={styles.productName}>{productName}</Text>

            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  isSelected ? styles.checked : styles.unchecked
                ]}
                onPress={onToggle}
              >
                {isSelected && <Text style={styles.tick}>✓</Text>}
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.description} numberOfLines={1}>{description}</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.originalPrice}>₹{originalAmount}</Text>

            <Text style={styles.amount}>₹{price}</Text>
            {/* <Text style={styles.discount}><MaterialCommunityIcons name="tag-heart" size={16} color="#fff" />
   {discount}% OFF</Text> */}
            <View style={styles.discountBadge}>
              <MaterialCommunityIcons name="tag-heart" size={16} color="#fff" />
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>

          </View>


          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.removebutton} onPress={onRemove}>
              <MaterialCommunityIcons name="delete-variant" color="#5C5C5C" size={15} />
              <Text style={styles.buttonText}>Remove</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.addWishlistBtn} onPress={handleMoveToWishlist}>
              <EvilIcons name="heart" color="#5C5C5C" size={18} />
              <Text style={styles.whislistbtnText}>Add Wishlist</Text>
            </TouchableOpacity>
          </View>

        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
};

export default AddToCart;




const styles = StyleSheet.create({

  subContainer: {
    marginTop: 16,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    // backgroundColor: "#FAFAFA",
    marginHorizontal: 6,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  description: {
    fontSize: 12,
    fontFamily: "Jost-Regular",
    fontWeight: "400",
    color: "#303030",
    top: -2
  },
  checkboxContainer: {
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: -10
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

  leftSection: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 8,
    width: 85,
    height: 85,
    marginRight: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  Img: {
    width: 80,
    height: 80,
    borderRadius: 8
  },

  rightSide: {
    justifyContent: "space-between",
    left: -15
  },
  productName: {
    fontWeight: "700",
    color: "#222",
    fontSize: 14,

  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#00A2F4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    left: 20
  },
  discountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  discount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    borderRadius: 24,
    paddingHorizontal: 4,
    backgroundColor: '#0094FF',
    paddingVertical: 2
  },

  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    marginTop: 6,
    alignSelf: "flex-start",
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
    paddingHorizontal: 5,
  },

  buttonContainer: {
    flexDirection: "row",
    marginTop: 15,
    gap: 8,
    top: 1,
    right: 3
    // left: -10
  },
  removebutton: {
    backgroundColor: "#ffe6e6",
    // borderColor: "#dc3545",
    // backgroundColor:"#fff",
    borderColor:"#ffe6e6",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "700",
    // color: "#5C5C5C",
    color:"#dc3545",
    paddingLeft: 5,
    fontSize: 12,
  },
  whislistbtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5C5C5C",
    // paddingLeft: 5,
  },
  addWishlistBtn: {
    // borderColor: "#D7D7D7",
    borderColor: "#00A2F4",
    borderWidth: 1,
    backgroundColor:"#fff",
    // backgroundColor: "#F2F2F2",
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  }
});
