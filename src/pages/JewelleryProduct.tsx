import React from "react";
import { View, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import Product from '../components/home/Product';
import { getProductThumbnail } from '../utils/ProductImageHelper';

type ProductType = {
  productId: number;
  title: string;
  description?: string;
  categoryId?: number;
  categoryName?: string;
  price?: number;
  images?: string[];
  variants?: {
    variantId?: number;
    price: number;
    variantImage: {
      imageUrl: string;
    }[];
  };
};




const JewelleryProduct = ({ navigation, route }: any) => {
  const { JewelleryProducts } = route.params || { JewelleryProducts: [] };

  return (
    <View style={styles.container}>
      <FlatList
        data={JewelleryProducts}
        keyExtractor={(item) => item.productId.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const firstVariant = item.variants ?? undefined;
          const variantId = firstVariant?.variantId;

          // Safe image fallback
          const imageUri =
            getProductThumbnail(item) ||
            (firstVariant?.variantImage?.length
              ? firstVariant.variantImage[0].imageUrl
              : undefined);

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate("SeparateProductPage", { productId: item.productId })
              }
            >
              <Product
                productId={item.productId}
                image={imageUri ? [{ uri: imageUri }] : []}
                productName={item.title}
                price={firstVariant?.price ?? 0}
                variantId={variantId}
              />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default JewelleryProduct;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 6,
    paddingTop: 8,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    margin: 4,
  },
});
