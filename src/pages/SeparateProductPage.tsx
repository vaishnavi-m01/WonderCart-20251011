import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import AntDesign from "react-native-vector-icons/AntDesign";
import SeparateProduct from "../components/SeparateProduct";
import apiClient from "../services/apiBaseUrl";
import UnifiedHeader from "../components/common/UnifiedHeader";

// ✅ Navigation params typing
type RootStackParamList = {
    SeparateProductPage: { productId: string ,categoryName:string};
};

type SeparateProductPageRouteProp = RouteProp<
    RootStackParamList,
    "SeparateProductPage"
>;

// ✅ Types
interface VariantImage {
    imageId: number;
    imageUrl: string;
    altText?: string;
    isPrimary?: boolean;
}

interface Variant {
    variantId: number;
    sku?: string;
    price: number;
    variantImage?: VariantImage[];
}

interface Product {
    productId: number;
    title: string;
    categoryId: number;
    description: string;
    variants?: Variant[];
}

const SeparateProductPage = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<SeparateProductPageRouteProp>();
    const { productId,categoryName } = route.params;
    console.log("ProductIdSeparateProductPAGe",productId)

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 🔹 Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/v2/products/${productId}`);
                setSelectedProduct(response.data);
            } catch (err: any) {
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    if (loading) return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;
    if (error) return <Text style={styles.error}>{error}</Text>;
    if (!selectedProduct) return <Text>No product found</Text>;

    // ✅ Just pick the first available variant
    const primaryVariant = selectedProduct.variants?.[0];

    const variantId = primaryVariant?.variantId ?? 0;
    const sku = primaryVariant?.sku ?? "N/A";
    const price = primaryVariant?.price ?? 0;

    // ✅ Extract variant images
    const images = primaryVariant?.variantImage?.map((img) => img.imageUrl) ?? [];

    return (
        <View style={styles.container}>
            <UnifiedHeader
                title="Product"
                subtitle={selectedProduct.title}
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
                headerStyle="default"
            />

            {/* Product Details */}
            <View style={{ flex: 1 }}>
                <SeparateProduct
                    key={selectedProduct.productId}
                    categoryName={categoryName} 
                    productId={selectedProduct.productId}
                    productName={selectedProduct.title}
                    categoryId={selectedProduct.categoryId}
                    variantId={variantId}
                    sku={sku}
                    image={images}
                    price={price}
                    description={selectedProduct.description}
                    variants={selectedProduct.variants}
                />
            </View>
        </View>
    );
};

export default SeparateProductPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingBottom: 8,
    },
    error: {
        color: "red",
        textAlign: "center",
        marginTop: 20,
    },
});
