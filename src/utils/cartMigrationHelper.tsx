import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../services/apiBaseUrl";

export const migrateGuestCartToServer = async (userId: number) => {
  try {
    const guestCartString = await AsyncStorage.getItem("cartItems");
    if (!guestCartString) {
      return;
    }

    const guestCart = JSON.parse(guestCartString);
    if (!Array.isArray(guestCart) || guestCart.length === 0) {
      await AsyncStorage.removeItem("cartItems");
      return;
    }


    for (const item of guestCart) {
      await apiClient.post(`v1/cart/${userId}/items`, {
        productId: item.productId,
        variantId: item.productId || item.productId,
        quantity: 1,
        price: item.price
      });
    }

    await AsyncStorage.removeItem("cartItems");

  } catch (err) {
    console.error(" Failed to migrate guest cart:", err);
  }
};
