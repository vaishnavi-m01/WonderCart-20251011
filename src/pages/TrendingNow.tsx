import React from "react";
import {
    View,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Text,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Product from "../components/home/Product";
import { getProductThumbnail } from "../utils/ProductImageHelper";

type RootStackParamList = {
    SeparateProductPage: { productId: number };
};

type ProductType = {
    productId: number;
    title: string;
    description?: string;
    categoryId?: number;
    categoryName?: string;
    variants?: {
        variantId?: number;
        price: number;
        variantImage?: { imageUrl: string }[];
    }[];
};

const TrendingNow = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const trendingProducts = (route.params as { trendingProducts?: ProductType[] })?.trendingProducts || [];

    console.log("TrendingNow received:", trendingProducts);

    const renderItem = ({ item }: { item: ProductType }) => {
        const firstVariant = item.variants?.[0];
        const variantId = firstVariant?.variantId;

        const imageUri =
            getProductThumbnail(item) ||
            firstVariant?.variantImage?.[0]?.imageUrl ||
            "https://via.placeholder.com/150"; // fallback image

        if (!imageUri) console.warn("No image found for product:", item.productId);

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() =>
                    navigation.navigate("SeparateProductPage", { productId: item.productId })
                }
            >
                <Product
                    productId={item.productId}
                    image={[{ uri: imageUri }]}
                    productName={item.title || "No Name"}
                    price={firstVariant?.price ?? 0}
                    variantId={variantId}
                />
            </TouchableOpacity>
        );
    };

    if (!trendingProducts.length) {
        return (
            <View style={styles.center}>
                <Text>No trending products available</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={trendingProducts}
                keyExtractor={(item) => item.productId.toString()}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.list}
                renderItem={renderItem}
            />
        </View>
    );
};

export default TrendingNow;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 8,
        paddingHorizontal: 4, 
    },
    list: {
        paddingBottom: 20,
    },
    card: {
        flex: 1,
        margin: 2,

    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
