import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import Product from '../components/home/Product';
import { getProductThumbnail } from '../utils/ProductImageHelper';




const TopSellerProduct = ({ navigation, route }: any) => {
  const { topSellerProduct } = route.params || { topSellerProduct: [] };
  console.log("topsellerProduct", topSellerProduct)

  return (
    <View style={styles.container} >

      <FlatList
        data={topSellerProduct}
        keyExtractor={(item) => item.productId.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const imageUrl = item.variants?.variantImage?.[0]?.imageUrl ?? "";
          const variantId = item.variants?.variantId;

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate("SeparateProductPage", {
                  productId: item.productId,
                })
              }
            >
              <Product
                productId={item.productId}
                image={
                  getProductThumbnail(item)
                    ? [{ uri: getProductThumbnail(item) }]
                    : item.variants?.variantImage?.length > 0
                      ? [{ uri: item.variants.variantImage[0].imageUrl }]
                      : []
                }
                productName={item.title}
                price={item.variants?.price ?? 0}
                variantId={variantId}
              />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default TopSellerProduct;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 6,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    flex: 1,
  },

});
