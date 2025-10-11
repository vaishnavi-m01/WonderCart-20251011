import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CartItem {
  productId: number;
  productName: string;
  description?: string;
  image: any;
  price?: number;
  originalPrice?: number;
  sku?: string | number;
  quantity: number;
  offer?: number;
  discount?: number;
  variantId?: number;
}


type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  clearCart: () => void;
  removeFromCart: (itemId: number) => void;
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;


};

const CartContext = createContext<CartContextType | undefined>(undefined);



export const AddToCartItem = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const hasMounted = useRef(false);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedItems = await AsyncStorage.getItem("cartItems");
        if (!savedItems || savedItems.trim().length === 0) return;

        const parsed = JSON.parse(savedItems);
        if (Array.isArray(parsed)) {
          const withQuantities = parsed.map((item: CartItem) => ({
            ...item,
            quantity: item.quantity ?? 1
          }));
          setCartItems(withQuantities);
        }

      } catch {
        await AsyncStorage.removeItem("cartItems");
      }
    };

    loadCart();
  }, []);

  useEffect(() => {
    if (hasMounted.current) {
      AsyncStorage.setItem("cartItems", JSON.stringify(cartItems));
    } else {
      hasMounted.current = true;
    }
  }, [cartItems]);



  const addToCart = (item: CartItem) => {
    const updatedCart = [...cartItems];
    const index = updatedCart.findIndex(
      (i) => i.productId === item.productId && i.variantId === item.variantId
    );

    if (index !== -1) {
      updatedCart[index].quantity += item.quantity ?? 1;
    } else {
      updatedCart.push({ ...item, quantity: item.quantity ?? 1 });
    }

    setCartItems(updatedCart); 
    AsyncStorage.setItem("cartItems", JSON.stringify(updatedCart));
  };




  const clearCart = () => {
    setCartItems([]);
    AsyncStorage.removeItem("cartItems");
  };

  const removeFromCart = (itemId: number) => {
    setCartItems(prev => {
      const updated = prev.filter(item => item.productId !== itemId);
      AsyncStorage.setItem("cartItems", JSON.stringify(updated));
      return updated;
    });
  };


  return (
    <CartContext.Provider value={{ cartItems, addToCart, clearCart, removeFromCart, setCartItems, }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within an AddToCartItem provider");
  }
  return context;
};
