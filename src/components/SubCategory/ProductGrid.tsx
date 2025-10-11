import React from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';

type ProductVariant = {
    variantId: string;
    price: number;
    sku: string;
};

export type ProductType = {
    productId: string;
    image: string;
    title: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    offer?: number;
    description?: string;
    categoryId?: string;
    categoryName?: string;
    variants?: ProductVariant[];
};

type Props = {
    products: ProductType[];
    onAdd: (product: ProductType) => void;
    getProductThumbnail?: (item: ProductType) => string;
};

const CARD_WIDTH = (Dimensions.get('window').width - 40) / 2;

const ProductGrid = ({ products, onAdd, getProductThumbnail }: Props) => {
    return (
        <FlatList
            data={products}
            numColumns={2}
            keyExtractor={(item) => item.productId}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
                const imageUrl = getProductThumbnail?.(item);
                const variant = item.variants?.[0];

                return (
                    <View style={styles.card}>
                        <Image
                            source={{ uri: imageUrl || 'https://via.placeholder.com/150' }}
                            style={styles.image}
                        />
                        <Text style={styles.name}>{item.title}</Text>
                        <Text style={styles.price}>₹{variant?.price ?? item.price}</Text>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => onAdd(item)}
                        >
                            <Text style={styles.buttonText}>View Product</Text>
                        </TouchableOpacity>
                    </View>
                );
            }}
        />
    );
};

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: 12,
        paddingBottom: 20,
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        marginBottom: 10,
        padding: 8,
        elevation: 2,
        marginTop: 8,
    },
    image: {
        width: '100%',
        height: 120,
        borderRadius: 6,
        marginBottom: 6,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        textAlign: 'center',
    },
    price: {
        fontSize: 15,
        color: 'green',
        marginBottom: 8,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#059ff8',
        paddingVertical: 6,
        borderRadius: 4,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default ProductGrid;
