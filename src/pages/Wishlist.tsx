import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Foundation from 'react-native-vector-icons/Foundation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../services/apiBaseUrl';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  console.log("StoreWishlistItemss", wishlistItems)
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        let userId = null;
        if (userString) {
          const user = JSON.parse(userString);
          userId = user.userId;
        }

        if (userId) {
          const res = await apiClient.get('v1/wishlist', { params: { userId } });
          const dataWithFavorite = res.data.map((item: any) => ({
            ...item,
            isFavorite: true,
          }));
          setWishlistItems(dataWithFavorite);
          await AsyncStorage.setItem('wishlistItems', JSON.stringify(dataWithFavorite));
        } else {
          const localWishlist = await AsyncStorage.getItem('wishlistItems');
          console.log("LocalWishlistt", localWishlist)
          const parsed = localWishlist ? JSON.parse(localWishlist) : [];
          const dataWithFavorite = parsed.map((item: any) => ({
            ...item,
            isFavorite: true,
          }));
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
  }, []);



  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        const user = userString ? JSON.parse(userString) : null;

        const uncheckedItems = wishlistItems.filter((item) => !item.isFavorite);
        const checkedItems = wishlistItems.filter((item) => item.isFavorite);

        if (user) {
          for (const item of uncheckedItems) {
            await apiClient.delete(`v1/wishlist/${item.wishlistId}`);
          }
        }

        await AsyncStorage.setItem('wishlistItems', JSON.stringify(checkedItems));
      } catch (error) {
        console.error('Error saving wishlist:', error);
      }
    });

    return unsubscribe;
  }, [wishlistItems, navigation]);

  const toggleFavorite = async (itemId: any) => {
    const updatedList = wishlistItems.map((item) =>
      item.wishlistId === itemId
        ? { ...item, isFavorite: !item.isFavorite }
        : item
    );

    setWishlistItems(updatedList);

    const userString = await AsyncStorage.getItem('user');
    if (!userString) {

      const filtered = updatedList.filter((item) => item.isFavorite);
      await AsyncStorage.setItem('wishlistItems', JSON.stringify(filtered));
    }
  };





  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0094FF" />
        
        <Text style={styles.loading}>Loading Wishlist...</Text>
      </View>
    );
  }

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <View style={styles.container}>
        {/* <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntDesign name="arrowleft" color="#0077CC" size={26} style={styles.icon} />
          </TouchableOpacity>
          <Text style={styles.text}>Wishlist</Text>
        </View> */}
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
      {/* <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" color="#0077CC" size={26} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.text}>Wishlist</Text>
      </View> */}
      <FlatList
        data={wishlistItems}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        keyExtractor={(item) =>
          item.wishlistId
            ? item.wishlistId.toString()
            : `guest-${item.productId}`
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              {/* <Image
                source={{ uri: item.imageUrl || item.image?.uri }}
                style={styles.productImage}
              /> */}

              {/* <Image
                source={{ uri: item.image || item.imageUrl }}
                resizeMode="contain"
                style={styles.productImage}
              /> */}
              <Image
                source={{
                  uri: Array.isArray(item.image)
                    ? // If first element is string, use it; if object with uri, use uri; else undefined
                    typeof item.image[0] === 'string'
                      ? item.image[0]
                      : item.image[0]?.uri
                    : // If item.image is string, use it; else fallback to item.imageUrl
                    typeof item.image === 'string'
                      ? item.image
                      : item.imageUrl
                }}
                style={styles.productImage}
              // resizeMode="contain"
              />




              <TouchableOpacity onPress={() => toggleFavorite(item.wishlistId)}>
                <View
                  style={[
                    styles.heartCircle,
                    {
                      backgroundColor: item.isFavorite ? '#FFCCCC' : '#F0F0F0',
                    },
                  ]}
                >
                  <Foundation
                    name="heart"
                    size={16}
                    color={item.isFavorite ? '#FF0000' : '#CCCCCC'}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.productName} numberOfLines={1}>{item.productName}</Text>
            <Text style={styles.productPrice}>
              ₹{item.price}{' '}
              <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
            </Text>
            <TouchableOpacity style={styles.buyButton} onPress={() => navigation.navigate("SeparateProductPage", { productId: item.productId })}>
              <Text style={styles.buyButtonText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // padding: 8,
    // marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    elevation: 5,
    paddingTop: 10,
    paddingBottom: 14,
    paddingHorizontal: 10,
  },
  text: {
    color: '#0077CC',
    fontSize: 20,
    marginLeft: 20,
    fontWeight: '900',
  },
  icon: {
    fontWeight: 900
  },
  listContainer: {
    paddingBottom: 100,
    marginTop: 10
  },
  card: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 8,
    margin: 3,
    alignItems: 'center',
    elevation: 2,
    maxWidth: '48%',
    paddingRight: 20
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
    borderRadius: 8,
    backgroundColor: '#ccc',
    marginTop: 9,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  heartCircle: {
    width: 20,
    height: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
    marginTop: 8,
    marginRight: 2,
    top: -10,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 6,
    textAlign: 'center',
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    color: '#000',
    marginBottom: 6,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: '#888',
    fontSize: 12,
  },
  buyButton: {
    backgroundColor: '#0094FF',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop:5
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyImage: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  suggestionText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  loading: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});
