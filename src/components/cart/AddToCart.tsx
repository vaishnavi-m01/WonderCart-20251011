import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../services/apiBaseUrl";

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



  console.log("AddTocart")

  return (
    <TouchableOpacity onPress={() => navigation.navigate("SeparateProductPage", { productId })}>
      <View style={styles.subContainer}>
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

        <View style={styles.rightSide}>
          <Text style={styles.productName}>{productName}</Text>
          {/* <Text style={styles.description}>{description}</Text> */}
          <View style={styles.amountContainer}>
            <Text style={styles.amount}>₹{price}</Text>
            <Text style={styles.originalPrice}>₹{originalAmount}</Text>
            <Text style={styles.discount}>{discount} OFF</Text>
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

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.removebutton} onPress={onRemove}>
              <MaterialCommunityIcons name="delete-variant" color="#5C5C5C" size={16} />
              <Text style={styles.buttonText}>Remove</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.removebutton} onPress={handleMoveToWishlist}>
              <EvilIcons name="heart" color="#5C5C5C" size={22} />
              <Text style={styles.whislistbtnText}>Move to Wishlist</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
};

export default AddToCart;




const styles = StyleSheet.create({
  subContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#D9D9D9",
    borderRadius: 10,
    shadowColor: "D9D9D9",
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10

  },
  leftSection: {
    borderWidth: 2,
    borderColor: "#D9D9D9",
    borderRadius: 10,
    margin: 15,
    padding: 5,
    width: 100,
    height: 120,
    left: -18
  },
  Img: {
    width: 90,
    height: 100,
    marginBottom: 6,
    resizeMode: 'contain',
  },
  rightSide: {
    flexDirection: "column",
    left: -25
  },
  productName: {
    padding: 8,
    paddingHorizontal: 0,
    paddingTop: 20,
    fontWeight: "bold"
  },
  description: {
    fontSize: 11,
    fontWeight: 600
  },
  amountContainer: {
    flexDirection: "row",
    gap: 8,
    // paddingTop: 10

  },
  amount: {
    fontFamily: "Jost",
    color: "#303030",
    fontWeight: 900
  },
  originalPrice: {
    fontSize: 8,
    color: 'gray',
    top: 5,
    textDecorationLine: 'line-through',
  },
  discount: {
    color: "#0094FF",
    fontWeight: 800
  },
  qty: {
    paddingLeft: 12,
    fontWeight: 800
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
    marginBottom: 5,
    width: "50%",
    marginLeft:-10
  },
  removebutton: {
    backgroundColor: "#F2F2F2",
    borderColor: "#D7D7D7",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 2,
    top: -10
  },
  buttonText: {
    fontWeight: 900,
    color: "#5C5C5C",
    paddingLeft: 5,
    fontSize: 10
  },
  whislistbtnText: {
    fontSize: 10,
    fontWeight: 900,
    color: "#5C5C5C",
    paddingLeft: 5,
    top: 2
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 15,
    paddingHorizontal: 5,

    backgroundColor: '#fff',
    marginTop: 40,
    alignSelf: 'flex-start',
    top: -30,
    width: "60%",
    textAlign: "center",

    // position:"absolute"
  },

  qtyButton: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 15,
    top: -5,
    paddingTop: 6,
    textAlign: "center"

  },

  qtyNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 5,
    color: '#333',
    top: -5,
    paddingTop: 6,
    textAlign: "center"


  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  checkboxContainer: {
    padding: 5
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  checked: {
    backgroundColor: "#0094FF",
    borderColor: "#0094FF"
  },
  unchecked: {
    backgroundColor: "#fff",
  },
  tick: {
    color: "#fff",
    fontWeight: "bold",
  }


})