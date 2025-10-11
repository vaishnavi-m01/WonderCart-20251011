/**
 * Secure Storage Service
 * Provides encrypted storage for sensitive data like tokens and user information
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Simple encryption/decryption functions (in production, use a proper crypto library)
class SimpleEncryption {
  private static readonly KEY = 'WonderCartSecretKey2024!';

  static encrypt(text: string): string {
    try {
      let result = '';
      for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        const keyChar = this.KEY.charCodeAt(i % this.KEY.length);
        result += String.fromCharCode(char ^ keyChar);
      }
      return btoa(result); // Base64 encode
    } catch (error) {
      console.error('Encryption error:', error);
      return text; // Return original if encryption fails
    }
  }

  static decrypt(encryptedText: string): string {
    try {
      const decoded = atob(encryptedText); // Base64 decode
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        const char = decoded.charCodeAt(i);
        const keyChar = this.KEY.charCodeAt(i % this.KEY.length);
        result += String.fromCharCode(char ^ keyChar);
      }
      return result;
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedText; // Return original if decryption fails
    }
  }
}

export interface SecureStorageOptions {
  encrypt?: boolean;
  fallbackToPlain?: boolean;
}

class SecureStorage {
  private static readonly ENCRYPTED_PREFIX = 'encrypted_';
  private static readonly TOKEN_KEY = 'userToken';
  private static readonly USER_KEY = 'user';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';

  /**
   * Store data securely with optional encryption
   */
  static async setItem(
    key: string, 
    value: string, 
    options: SecureStorageOptions = { encrypt: true, fallbackToPlain: false }
  ): Promise<void> {
    try {
      const storageKey = options.encrypt ? `${this.ENCRYPTED_PREFIX}${key}` : key;
      const storageValue = options.encrypt ? SimpleEncryption.encrypt(value) : value;
      
      await AsyncStorage.setItem(storageKey, storageValue);
      
      if (__DEV__) {
        console.log(`✅ SecureStorage: Stored ${key} (encrypted: ${options.encrypt})`);
      }
    } catch (error) {
      console.error(`❌ SecureStorage: Failed to store ${key}:`, error);
      
      if (options.fallbackToPlain && options.encrypt) {
        // Fallback to plain storage if encryption fails
        try {
          await AsyncStorage.setItem(key, value);
          console.warn(`⚠️ SecureStorage: Stored ${key} in plain text as fallback`);
        } catch (fallbackError) {
          throw new Error(`Failed to store ${key}: ${fallbackError}`);
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Retrieve data securely with automatic decryption
   */
  static async getItem(
    key: string, 
    options: SecureStorageOptions = { encrypt: true }
  ): Promise<string | null> {
    try {
      // Try encrypted version first
      const encryptedKey = `${this.ENCRYPTED_PREFIX}${key}`;
      let encryptedValue = await AsyncStorage.getItem(encryptedKey);
      
      if (encryptedValue && options.encrypt) {
        const decryptedValue = SimpleEncryption.decrypt(encryptedValue);
        
        if (__DEV__) {
          console.log(`✅ SecureStorage: Retrieved ${key} (decrypted)`);
        }
        
        return decryptedValue;
      }
      
      // Fallback to plain storage
      const plainValue = await AsyncStorage.getItem(key);
      
      if (__DEV__ && plainValue) {
        console.log(`✅ SecureStorage: Retrieved ${key} (plain)`);
      }
      
      return plainValue;
    } catch (error) {
      console.error(`❌ SecureStorage: Failed to retrieve ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove data from secure storage
   */
  static async removeItem(key: string): Promise<void> {
    try {
      // Remove both encrypted and plain versions
      await AsyncStorage.multiRemove([
        `${this.ENCRYPTED_PREFIX}${key}`,
        key
      ]);
      
      if (__DEV__) {
        console.log(`✅ SecureStorage: Removed ${key}`);
      }
    } catch (error) {
      console.error(`❌ SecureStorage: Failed to remove ${key}:`, error);
      throw error;
    }
  }

  /**
   * Store user authentication token securely
   */
  static async setAuthToken(token: string): Promise<void> {
    await this.setItem(this.TOKEN_KEY, token, { 
      encrypt: true, 
      fallbackToPlain: true 
    });
  }

  /**
   * Get user authentication token
   */
  static async getAuthToken(): Promise<string | null> {
    return await this.getItem(this.TOKEN_KEY, { encrypt: true });
  }

  /**
   * Store user data securely
   */
  static async setUserData(userData: any): Promise<void> {
    const userString = JSON.stringify(userData);
    await this.setItem(this.USER_KEY, userString, { 
      encrypt: true, 
      fallbackToPlain: true 
    });
  }

  /**
   * Get user data
   */
  static async getUserData(): Promise<any | null> {
    const userString = await this.getItem(this.USER_KEY, { encrypt: true });
    if (userString) {
      try {
        return JSON.parse(userString);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Store refresh token securely
   */
  static async setRefreshToken(token: string): Promise<void> {
    await this.setItem(this.REFRESH_TOKEN_KEY, token, { 
      encrypt: true, 
      fallbackToPlain: true 
    });
  }

  /**
   * Get refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    return await this.getItem(this.REFRESH_TOKEN_KEY, { encrypt: true });
  }

  /**
   * Clear all authentication data
   */
  static async clearAuthData(): Promise<void> {
    try {
      await this.multiRemove([
        this.TOKEN_KEY,
        this.USER_KEY,
        this.REFRESH_TOKEN_KEY
      ]);
      
      if (__DEV__) {
        console.log('✅ SecureStorage: Cleared all auth data');
      }
    } catch (error) {
      console.error('❌ SecureStorage: Failed to clear auth data:', error);
      throw error;
    }
  }

  /**
   * Remove multiple items
   */
  static async multiRemove(keys: string[]): Promise<void> {
    try {
      const allKeys = keys.flatMap(key => [
        `${this.ENCRYPTED_PREFIX}${key}`,
        key
      ]);
      
      await AsyncStorage.multiRemove(allKeys);
      
      if (__DEV__) {
        console.log(`✅ SecureStorage: Removed multiple keys: ${keys.join(', ')}`);
      }
    } catch (error) {
      console.error('❌ SecureStorage: Failed to remove multiple keys:', error);
      throw error;
    }
  }

  /**
   * Get all keys (for debugging)
   */
  static async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('❌ SecureStorage: Failed to get all keys:', error);
      return [];
    }
  }

  /**
   * Clear all storage (use with caution)
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
      
      if (__DEV__) {
        console.log('✅ SecureStorage: Cleared all storage');
      }
    } catch (error) {
      console.error('❌ SecureStorage: Failed to clear all storage:', error);
      throw error;
    }
  }

  /**
   * Check if storage is available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      await AsyncStorage.setItem('test_key', 'test_value');
      await AsyncStorage.removeItem('test_key');
      return true;
    } catch (error) {
      console.error('❌ SecureStorage: Storage not available:', error);
      return false;
    }
  }
}

export default SecureStorage;
