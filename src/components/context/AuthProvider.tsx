// AuthProvider.tsx
import React, { createContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SecureStorage from '../../services/SecureStorage';

interface AuthContextType {
  isLoggedIn: boolean;
  logout: () => void;
  setIsLoggedIn: (value: boolean) => void;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  logout: () => {},
  setIsLoggedIn: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const logout = async () => {
    try {
      // Preserve guest cart and wishlist
      const savedCart = await AsyncStorage.getItem('cartItems');
      let guestCart = savedCart ? JSON.parse(savedCart) : [];
      const savedWishlist = await AsyncStorage.getItem('wishlistItems');
      let guestWishlist = savedWishlist
        ? JSON.parse(savedWishlist).filter(
            (item: any) =>
              item && item.wishlistId && String(item.wishlistId).startsWith('guest-')
          )
        : [];

      // Clear all authentication data securely
      await SecureStorage.clearAuthData();
      
      // Clear other storage but preserve guest data
      await AsyncStorage.clear();
      
      // Restore guest data
      if (guestCart.length) await AsyncStorage.setItem('cartItems', JSON.stringify(guestCart));
      if (guestWishlist.length)
        await AsyncStorage.setItem('wishlistItems', JSON.stringify(guestWishlist));

      setIsLoggedIn(false);
      
      if (__DEV__) {
        console.log('✅ AuthProvider: User logged out successfully');
      }
    } catch (error) {
      console.error('❌ AuthProvider: Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, logout, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};
