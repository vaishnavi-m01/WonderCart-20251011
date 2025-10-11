import { Alert, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AntDesign from 'react-native-vector-icons/AntDesign';
import AddToCart from "../components/cart/AddToCart";
import { NavigatorScreenParams, RouteProp, useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import SeparateProductCards from "../components/SeparateProductCards";
import { useCart } from "../components/context/AddToCartItem";
import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../services/apiBaseUrl";
import axios from "axios";
import UnifiedHeader from "../components/common/UnifiedHeader";


interface ProductType {
  id: number;
  productName: string;
  description?: string;
  price: number;
  originalPrice: number;
  image: any;
  discount: number;
  status?: string;
  day?: string;
  orderDay?: string;
  offer?: number;
}

export type TabParamList = {
  Profile: { from?: string };
};

type RootStackParamList = {
  Cart: {
    showOrders?: boolean;
    showAddress?: boolean;
    showOffers?: boolean;
    showSupport?: boolean;
    showFAQ?: boolean;
    showTerms?: boolean;
    showPrivacyPolicy?: boolean;
    category?: 'Grocery' | 'Electronics' | 'Beauty' | 'Appliances';
    product: ProductType;
    AddToCart: ProductType;
    // TopSellerProductItem?: TopSellerProductItem;
  };

  DeliveryAddress: {
    selectedItems: {
      id?: number;
      productId?: number;
      productName: string | undefined;
      image: any;
      price: number;
      description?: string;
      quantity: number;
    }[];
  };
  Payment: {
    selectedItems: {
      id?: number;
      productId?: number;
      productName: string;
      image: any;
      price: number;
      description?: string;
      quantity: number;
    }[];
  };

  SignUp: undefined;
  CheckOut: undefined;
  Main: NavigatorScreenParams<TabParamList>;
};

type ServerCartItem = {
  cartItemId: number;
  cartId: number;
  productId: number;
  variantId: number;
  quantity: number;
  sku?: number;
  price: number;
  productName?: string;
  categoryName?: string;
  imageUrl?: string;
};

type ProductItem = {
  productId: number;
  title: string;
  variants: {
    price: number;
    variantId: number;
    reviewSummary?: {
      averageRating?: number;
    };
    variantImage: { imageUrl: string }[];
  };
};


type CartRouteProp = RouteProp<RootStackParamList, 'Cart'>;




const Cart = () => {
  const route = useRoute<CartRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Cart'>>();

  const showOrders = route.params?.showOrders;
  const showAddress = route.params?.showAddress;
  const showOffers = route.params?.showOffers;
  const showSupport = route.params?.showSupport;
  const showFAQ = route.params?.showFAQ;
  const showTerms = route.params?.showTerms;
  const showPrivacyPolicy = route.params?.showPrivacyPolicy;
  const cartItem = route.params?.AddToCart;
  const { cartItems, setCartItems, removeFromCart } = useCart();

  const [serverCart, setServerCart] = useState<ServerCartItem[]>([]);
  console.log("ServerCART", serverCart)
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [latestAddToCart, setLatestAddToCart] = useState<ProductType | null>(null);
  const [suggestedProducts, setSuggestedProducts] = useState<ProductItem[]>([]);






  const fetchCart = async () => {
    try {
      const userString = await AsyncStorage.getItem("user");

      if (userString) {
        const user = JSON.parse(userString);
        setIsLoggedIn(true);
        const res = await apiClient.get(`v1/cart/${user.userId}`);
        console.log("Cart", res);
        // setServerCart(res.data);
        setServerCart(res.data.slice().reverse());

      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("Error Message:", error.message);
        console.log("Status Code:", error.response?.status);
        console.log("Error Data:", error.response?.data);
        console.log("Request Config:", error.config);
      } else {
        console.log("Unknown Error:", error);
      }
    }

    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // useEffect(() => {
  //   if (selectedItems.length === 0) {
  //     if (serverCart.length > 0) {
  //       setSelectedItems(serverCart.map(item => item.cartItemId));
  //     } else if (cartItems.length > 0) {
  //       setSelectedItems(cartItems.map(item => item.productId));
  //     }
  //   }
  // }, []);

  const seenItemsRef = useRef<Set<number>>(new Set());

  // useEffect(() => {

  //   if (isLoggedIn) {
  //     const newIds = serverCart
  //       .map(item => item.cartItemId)
  //       .filter(id => !seenItemsRef.current.has(id));

  //     if (newIds.length > 0) {
  //       setSelectedItems(prev => [...prev, ...newIds]);
  //       newIds.forEach(id => seenItemsRef.current.add(id));
  //     }
  //   } else { 
  //     const newIds = cartItems
  //       .map(item => item.productId)
  //       .filter(id => !seenItemsRef.current.has(id));

  //     if (newIds.length > 0) {
  //       setSelectedItems(prev => [...prev, ...newIds]);
  //       newIds.forEach(id => seenItemsRef.current.add(id));
  //     }
  //   }
  // }, [serverCart, cartItems, isLoggedIn]);



  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [])
  );

  //   useEffect(() => {
  //   if (isLoggedIn && serverCart.length > 0) {
  //     setSelectedItems(serverCart.map(item => item.cartItemId));
  //   } else if (!isLoggedIn && cartItems.length > 0) {
  //     setSelectedItems(cartItems.map(item => item.productId));
  //   } else {
  //     setSelectedItems([]); // empty cart
  //   }
  // }, [serverCart, cartItems, isLoggedIn]);
  // Keep selectedItems in sync with current cart
  useEffect(() => {
    if (isLoggedIn) {
      const validIds = serverCart.map(item => item.cartItemId);
      setSelectedItems(prev => prev.filter(id => validIds.includes(id)));
    } else {
      const validIds = cartItems.map(item => item.productId);
      setSelectedItems(prev => prev.filter(id => validIds.includes(id)));
    }
  }, [serverCart, cartItems, isLoggedIn]);






  const toggleSelection = (itemId: number) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  useEffect(() => {
    fetchSuggestedProducts();
  }, []);

  const fetchSuggestedProducts = async () => {
    try {
      const response = await apiClient.get(
        `v2/products/filter?categoryId=3`
      );


      const filteredProducts = response.data;

      console.log("FiltersuggestedProducts", filteredProducts)
      setSuggestedProducts(filteredProducts);
    } catch (error) {
      console.error('Error fetching suggested products:', error);
    }
  };

  const handleRemoveItem = async (itemId: number, isLocal: boolean) => {
    try {
      const userString = await AsyncStorage.getItem("user");
      if (userString && !isLocal) {

        const user = JSON.parse(userString);
        await apiClient.delete(`v1/cart/${user.userId}/items/${itemId}`);
        setServerCart(prev => prev.filter(item => item.cartItemId !== itemId));
      } else {

        removeFromCart(itemId);
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error message:", error.message);
        console.error("Axios error response data:", error.response?.data);
        console.error("Axios error response status:", error.response?.status);
        Alert.alert("Error", "Could not remove item from cart.");
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  const updateServerQuantity = async (cartItemId: number, newQty: number, price: number) => {
    try {
      const userString = await AsyncStorage.getItem("user");
      // if (!userString) return;
      await apiClient.patch(`v1/cart/update/cartItems/${cartItemId}`, {
        quantity: newQty,
        price
      });

      setServerCart(prev =>
        prev.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: newQty }
            : item
        )
      );
    } catch (error: any) {
      if (error.response) {
        console.log(" Add to cart STATUS:", error.response.status);
        console.log(" Add to cart HEADERS:", error.response.headers);
        console.log(" add to cart DATA:", error.response.data);
      } else if (error.request) {
        console.log(" add to cart REQUEST:", error.request);
      } else {
        console.log("ERROR:", error.message);
      }
      Alert.alert("Error", "Could not update cart quantity");
    }
  };


  const updateLocalQuantity = async (id: number, newQty: number) => {
    try {
      const qty = Math.max(1, newQty);
      const savedCart = await AsyncStorage.getItem("cartItems");
      let cartItemsData = savedCart ? JSON.parse(savedCart) : [];

      cartItemsData = cartItemsData.map((item: any) =>
        item.productId === id ? { ...item, quantity: qty } : item
      );

      // Update AsyncStorage
      await AsyncStorage.setItem("cartItems", JSON.stringify(cartItemsData));

      // Update state immediately so UI refreshes
      setCartItems(cartItemsData);

    } catch (error) {
      console.error("Error updating local quantity:", error);
    }
  };


  const selectedServerCart = serverCart.filter(item =>
    selectedItems.includes(item.cartItemId)

  );
  console.log("SelectedServerCart", selectedServerCart)
  const selectedLocalCart = cartItems.filter(item =>
    selectedItems.includes(item.productId)
  );

  const selectedTotal = isLoggedIn
    ? selectedServerCart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    : selectedLocalCart.reduce((sum, item) => sum + ((item.price ?? 0) * (item.quantity ?? 1)), 0);



  const saving = Math.round(selectedTotal * 0.2);
  const shipping = selectedTotal > 0 ? 0 : 0;
  const subtotal = selectedTotal - saving;


  const selectedCartItmeProductDetails = isLoggedIn
    ? selectedServerCart.map(item => ({
      cartItemId: item.cartItemId,
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      image: item.imageUrl,
      price: item.price,
      description: item.categoryName,
      quantity: item.quantity,
      sku: item.sku
    }))
    : selectedLocalCart.map(item => ({
      id: item.productId,
      productName: item.productName,
      image: item.image,
      price: item.price,
      description: item.description,
      quantity: item.quantity
    }));

  const handleProceedToPay = async () => {
    if (selectedItems.length === 0) {
      Alert.alert("Please select at least one product");
      return;
    }
    if (!isLoggedIn) {
      navigation.navigate('Main', {
        screen: 'Profile',
        params: { from: 'Cart' }
      });
    } else {
      console.log("SelectedProductCartDetails", selectedCartItmeProductDetails)
      await AsyncStorage.setItem('selectedCartItems', JSON.stringify(selectedCartItmeProductDetails));
      await AsyncStorage.removeItem('selectedProduct');
      // navigation.navigate('DeliveryAddress', { selectedItems: selectedCartItmeProductDetails });
      navigation.navigate("DeliveryAddress" as never)
    }
  };


  const handleClick = () => navigation.navigate("Home" as never);


  // const Summary = () => (
  //   <>
  //     <Text style={styles.text}>
  //       Selected Items ({selectedItems.length})
  //     </Text>

  //     {isLoggedIn ? (
  //       selectedServerCart.map(item => (
  //         <View key={item.cartItemId} style={styles.itemRow}>
  //           <Text style={styles.itemLabel}>
  //             {item.productName} ({item.quantity} × ₹{item.price})
  //           </Text>
  //           <Text style={styles.itemAmount}>
  //             ₹{item.price * item.quantity}
  //           </Text>
  //         </View>
  //       ))
  //     ) : (
  //       selectedLocalCart.map(item => (
  //         <View key={item.productId} style={styles.itemRow}>
  //           <Text style={styles.itemLabel}>
  //             {item.productName} ({item.quantity} × ₹{item.price})
  //           </Text>
  //           <Text style={styles.itemAmount}>
  //             ₹{(item.price ?? 0) * item.quantity}

  //           </Text>
  //         </View>
  //       ))
  //     )}

  //     <View style={styles.divider} />

  //     <View style={styles.paymentContainer}>
  //       <View style={styles.leftSection}>
  //         <Text style={styles.label}>Total MRP</Text>
  //         {/* <Text style={styles.label}>Saving On MRP (20%)</Text> */}
  //         {/* <Text style={styles.label}>Subtotal</Text> */}
  //         <Text style={styles.label}>Shipping Charges</Text>
  //         <Text style={styles.total}>TOTAL COST</Text>
  //       </View>
  //       <View>
  //         <Text style={styles.label}>₹{selectedTotal}</Text>
  //         {/* <Text style={styles.SavingOnMRP}>-₹{saving}</Text> */}
  //         {/* <Text style={styles.label}>₹{subtotal}</Text> */}
  //         <Text style={styles.MRP}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</Text>
  //         {/* <Text style={styles.totalAmount}>₹{subtotal + shipping}</Text> */}
  //         <Text style={styles.totalAmount}>₹{selectedTotal}</Text>
  //       </View>
  //     </View>

  //     <View style={styles.amountBottomContainer}>
  //       <View style={styles.bottomSubcontainer}>
  //         {/* <Text style={styles.totalAmount}>₹{subtotal + shipping}</Text>
  //         <Text style={styles.amountLabel}>You Save ₹{saving}</Text> */}
  //       </View>
  //       <TouchableOpacity style={styles.btn} onPress={handleProceedToPay}>
  //         <Text style={styles.btnText}>Proceed to Pay</Text>
  //       </TouchableOpacity>
  //     </View>
  //     {/* <Text style={styles.ViewText}>View detailed bill</Text> */}
  //   </>
  // );

  // ✅ Items to calculate (if none selected → all items)
  const itemsToCalculate = isLoggedIn
    ? (selectedItems.length > 0
      ? serverCart.filter(item => selectedItems.includes(item.cartItemId))
      : serverCart)
    : (selectedItems.length > 0
      ? cartItems.filter(item => selectedItems.includes(item.productId))
      : cartItems);




  // calculate based on fallback (all items if none selected)
  const totalAmount = itemsToCalculate.reduce<number>(
    (sum: number, item: any) => sum + (item.price ?? 0) * (item.quantity ?? 1),
    0
  );



  const Summary = () => (
    <>
      {/* Show selected items or all items */}
      <Text style={styles.text}>
        {selectedItems.length > 0
          ? `Selected Items (${selectedItems.length})`
          : `All Items (${itemsToCalculate.length})`}
      </Text>

      {itemsToCalculate.map((item, index) => (
        <View key={index} style={styles.itemRow}>
          <Text style={styles.itemLabel}>
            {item.productName} ({item.quantity} × ₹{item.price})
          </Text>
          <Text style={styles.itemAmount}>₹{item.price * item.quantity}</Text>
        </View>
      ))}

      <View style={styles.divider} />

      <View style={styles.paymentContainer}>
        <View style={styles.leftSection}>
          <Text style={styles.label}>Total MRP</Text>
          <Text style={styles.label}>Shipping Charges</Text>
          <Text style={styles.total}>TOTAL COST</Text>
        </View>
        <View>
          <Text style={styles.label}>₹{totalAmount}</Text>
          <Text style={styles.MRP}>{totalAmount > 0 ? 'FREE' : '₹0'}</Text>
          <Text style={styles.totalAmount}>₹{totalAmount}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.btn} onPress={handleProceedToPay}>
          <Text style={styles.btnText}>Proceed to Pay</Text>
        </TouchableOpacity>
      </View>

    </>
  );

  const Recommendations = () => (
    <>
      <Text style={styles.heading}>You Might also like</Text>
      <FlatList
        data={suggestedProducts}
        horizontal
        keyExtractor={(item) => item.productId.toString()}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (

          <SeparateProductCards
            productId={item.productId}
            variantId={item.variants?.variantId}
            image={item.variants?.variantImage?.[0]?.imageUrl}
            product={item.title}
            price={item.variants?.price}
            rating={item.variants?.reviewSummary?.averageRating ?? 0}
          />
        )}
      />
    </>
  );

  const EmptyCart = () => (
    <View>
      <View style={styles.emptyCartWrapper}>
        <Image
          source={require('../assets/images/AddToCartEmptyImg.jpg')}
          style={styles.emptyCartImage}
        />
        <Text style={styles.emptyCartText}>Your cart is empty</Text>
      </View>
      <Recommendations />
    </View>
  );


  return (
    <View style={styles.container}>
      {!showOrders && !showAddress && !showOffers && !showSupport && !showFAQ && !showTerms && !showPrivacyPolicy && (
        <UnifiedHeader
          title="Cart"
          showMenuButton={true}
          onMenuPress={() => {
            // Navigate to Profile tab which has drawer navigation
            navigation.navigate('Profile');
          }}
          headerStyle="default"
        />
      )}

      {
        loading ? (
          <Text>Loading...</Text>
        ) : isLoggedIn && serverCart.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {serverCart.map((cart, index) => (
              <AddToCart
                key={cart.cartItemId}
                productId={cart.productId}
                variantId={cart.variantId}
                image={cart.imageUrl ?? ""}
                productName={cart.productName ?? ""}
                price={cart.price}
                description={cart.categoryName}
                originalAmount={cart.price}
                discount={20}
                onRemove={() => handleRemoveItem(isLoggedIn ? cart.cartItemId : cart.cartItemId, !isLoggedIn)}
                isSelected={selectedItems.includes(cart.cartItemId)}
                onToggle={() => toggleSelection(cart.cartItemId)}
                quantity={cart.quantity}
                onQuantityChange={(newQty) => updateServerQuantity(cart.cartItemId, newQty, cart.price)}
              />
            ))}


            <Summary />
            <Recommendations />
          </ScrollView>
        ) : cartItems.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {cartItems.map((cart, index) => (
              <AddToCart
                key={cart.productId}
                id={cart.productId}
                image={cart.image}
                productName={cart.productName}
                productId={cart.productId}
                variantId={cart.variantId}
                price={cart.price}
                description={cart.description}
                originalAmount={cart.originalPrice}
                discount={cart.discount}
                onRemove={() => handleRemoveItem(isLoggedIn ? cart.productId : cart.productId, !isLoggedIn)}
                isSelected={selectedItems.includes(cart.productId)}
                onToggle={() => toggleSelection(cart.productId)}
                quantity={cart.quantity}
                onQuantityChange={(newQty) => updateLocalQuantity(cart.productId, newQty)}
              />
            ))}

            <Summary />
            <Recommendations />

          </ScrollView>


        ) : (
          <EmptyCart />
        )
      }

    </View>

  );
};

export default Cart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },

  text: {
    color: '#0094FF',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'left',
    flex: 1,
    paddingLeft: 12
  },
  icon: {
    fontWeight: '900',
  },
  paymentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
    paddingHorizontal: 6,
  },
  leftSection: {
    flexDirection: 'column',
    flex: 1,
  },

  label: {
    margin: 3,
    left: 12,
    fontWeight: '900',
    fontFamily: "Jost",
    fontSize: 16,
    marginBottom: 5
  },
  MRP: {
    margin: 3,
    paddingLeft: 14,
    fontWeight: '900',
    fontFamily: "Jost",
    fontSize: 16,
    marginBottom: 5,
    color: "#07E303"
  },
  SavingOnMRP: {
    margin: 3,
    paddingLeft: 10,
    fontWeight: '900',
    fontFamily: "Jost",
    fontSize: 16,
    marginBottom: 5,
    color: "#07E303"
  },
  total: {
    color: "#00A2F4",
    fontSize: 18,
    fontFamily: "Jost",
    fontWeight: '900',
    marginTop: 25,
    paddingLeft: 14
  },
  totalAmount: {
    margin: 3,
    paddingLeft: 15,
    fontWeight: '900',
    fontFamily: "Jost",
    fontSize: 16,
    marginBottom: 5,
    marginTop: 22
  },
  amountBottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 2,
  },
  bottomSubcontainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12
  },
  amountLabel: {
    color: "#07E303",
    paddingTop: 22,
    fontWeight: '800'
  },
  btn: {
    borderWidth: 1,
    borderColor: "#00A2F4",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#00A2F4",
    marginBottom: 30,
    marginTop: 10,
    marginRight: 2
  },
  btnText: {
    color: "#FFFFFF",
    fontFamily: "League Spartan",
    fontWeight: '800',
    textAlign: "center"
  },
  ViewText: {
    top: -30,
    paddingLeft: 18,
    color: "#00A2F4",
    fontSize: 11,
    fontWeight: '800'
  },
  emptyCartWrapper: {
    display: "flex",
    flexDirection: "row",
    borderWidth: 2,
    borderColor: '#D9D9D9',
    borderRadius: 10,
    padding: 10,
    margin: 5,
    alignItems: 'center',
    // justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    gap: 8
  },
  emptyCartImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  emptyCartText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '600',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    marginTop: 5,
    fontFamily: "Jost",
    fontWeight: 800,
    fontSize: 16,
    color: "#2A2A2A",
    marginLeft: 12,
    marginBottom: 10
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  itemLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 8,
    marginHorizontal: 16,
  },

});