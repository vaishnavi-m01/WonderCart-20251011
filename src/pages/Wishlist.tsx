import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator, Dimensions } from 'react-native';
import Foundation from 'react-native-vector-icons/Foundation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../services/apiBaseUrl';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from "react-native-vector-icons/Feather";


const { width } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (width - CARD_GAP * 2 - 16) / 2;

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      const loadWishlist = async () => {
        try {
          setLoading(true);
          const userString = await AsyncStorage.getItem('user');
          const user = userString ? JSON.parse(userString) : null;

          if (user) {
            const res = await apiClient.get('v1/wishlist', { params: { userId: user.userId } });
            const dataWithFavorite = res.data.map((item: any) => ({ ...item, isFavorite: true }));
            setWishlistItems(dataWithFavorite);
            await AsyncStorage.setItem('wishlistItems', JSON.stringify(dataWithFavorite));
          } else {
            const localWishlist = await AsyncStorage.getItem('wishlistItems');
            const parsed = localWishlist ? JSON.parse(localWishlist) : [];
            const dataWithFavorite = parsed.map((item: any) => ({ ...item, isFavorite: true }));
            setWishlistItems(dataWithFavorite);
          }
        } catch (e) {
          console.error(e);
          Alert.alert('Error', 'Could not load wishlist.');
        } finally {
          setLoading(false);
        }
      };

      loadWishlist();
    }, [])
  );

  const toggleFavorite = async (itemId: any) => {
    try {
      const userString = await AsyncStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;

      const updatedList = wishlistItems.map((item) =>
        item.wishlistId === itemId ? { ...item, isFavorite: !item.isFavorite } : item
      );

      setWishlistItems(updatedList);

      const filtered = updatedList.filter((item) => item.isFavorite);

      if (user) {
        const toggledItem = updatedList.find((i) => i.wishlistId === itemId);
        if (toggledItem && !toggledItem.isFavorite) {
          await apiClient.delete(`v1/wishlist/${toggledItem.wishlistId}`);
          console.log('Deleted from server:', toggledItem.wishlistId);
        }
      }

      await AsyncStorage.setItem('wishlistItems', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#059ff8" />
        <Text style={styles.loading}>Loading Wishlist...</Text>
      </View>
    );
  }

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <View style={styles.container}>
        <Image
          source={require('../assets/images/AddToCartEmptyImg.jpg')}
          style={styles.emptyImage}
        />
        <Text style={styles.emptyText}>Your Wishlist is Empty</Text>
        <Text style={styles.suggestionText}>Explore products and add to wishlist!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={wishlistItems}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        keyExtractor={(item) =>
          item.wishlistId ? item.wishlistId.toString() : `guest-${item.productId}`
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('SeparateProductPage', { productId: item.productId })
            }
          >
            <View style={styles.imageContainer}>
              <Image
                source={{
                  uri: Array.isArray(item.image)
                    ? typeof item.image[0] === 'string'
                      ? item.image[0]
                      : item.image[0]?.uri
                    : typeof item.image === 'string'
                      ? item.image
                      : item.imageUrl,
                }}
                style={styles.image}
              />
              <TouchableOpacity
                style={styles.heartIcon}
                onPress={() => toggleFavorite(item.wishlistId)}
              >
                {item.isFavorite ? (
                  <Ionicons name="heart-sharp" color="red" size={16} />
                ) : (
                  <Icon name="heart" size={16} color="#454545" />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.productName} numberOfLines={1}>
              {item.productName}
            </Text>
            <View style={styles.iconContainer}>
              <Text style={styles.amount}>₹{item.price}</Text>
              <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
              <Text style={styles.discount}>{item.discount}% OFF</Text>
            </View>
            <Text style={styles.deliveryStatus}>
              FREE Delivery - Friday
            </Text>

            <TouchableOpacity style={styles.btn}>
              <Text style={styles.btnText}>Buy Now</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 8 },
  listContainer: { paddingBottom: 100, marginTop: 10 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    margin: 4,
    borderColor: '#eee',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 130,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
  },
  image: { width: '100%', height: '100%' },
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
  productName: { fontSize: 14, color: '#111', fontWeight: '600', marginVertical: 8, textAlign: 'center' },
  iconContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  amount: { fontWeight: 'bold', fontSize: 14, color: '#111' },
  originalPrice: { fontSize: 12, color: 'gray', textDecorationLine: 'line-through', marginLeft: 6 },
  discount: { color: '#4CAF50', fontSize: 13, fontWeight: '600', marginLeft: 6 },
  deliveryStatus: {
    fontSize: 11,
    color: "gray",
    textAlign: "center",
    marginBottom: 8,
  },
  btn: { backgroundColor: '#059ff8', borderRadius: 6, paddingVertical: 6, alignItems: 'center' },
  btnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  emptyImage: { width: 200, height: 200, alignSelf: 'center', marginTop: 60 },
  emptyText: { fontSize: 20, fontWeight: '700', color: '#666', textAlign: 'center', marginTop: 20 },
  suggestionText: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 8 },
  loading: { fontSize: 18, textAlign: 'center', marginTop: 100 },
});
