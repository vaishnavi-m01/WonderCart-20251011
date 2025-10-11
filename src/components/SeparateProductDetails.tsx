import React from "react";
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SeparateProduct from "./SeparateProduct";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import SeparateProductCards from "./SeparateProductCards";
import AntDesign from 'react-native-vector-icons/AntDesign';
import UnifiedHeader from "./common/UnifiedHeader";



interface ProductType {
    id: number;
    productName: string;
    description?: string;
    price: number;
    originalPrice: number;
    image: any;
    discount: number;
    status: string;
    day: string;
    orderDay: string;
    offer: number;
    sku: string;
    variantId: number;
}

type RootStackParamList = {
    ProductDetails: {
        product: ProductType;
    };
};


type ProductRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;

const data = [
    { id: 1, product: 'JBL Headphone', productName: "Headphone", price: 1500, image: require('../assets/images/Bluetooth.png'), rating: 3.5 },
    { id: 2, product: 'JBL Headphone', productName: "Headphone", price: 1500, image: require('../assets/images/HeadPhone.png'), rating: 3.5 },
    { id: 3, product: 'JBL Headphone', productName: "Headphone", price: 1500, image: require('../assets/images/HeadPhones.png'), rating: 3.5 },
]

const SeparateProductDetails = () => {
    const route = useRoute<ProductRouteProp>();
    const productItem = route.params.product;
    const navigation = useNavigation();

    const handleClick = () => navigation.goBack();

    console.log("PRODUCTITEMM", productItem)


    return (
        <View style={styles.container}>
            <UnifiedHeader
                title="Product"
                showBackButton={true}
                onBackPress={handleClick}
                headerStyle="default"
            />
            <FlatList
                data={[{ type: 'product', data: productItem }, { type: 'recommendations', data }]}
                keyExtractor={(item, index) => `${item.type}-${index}`}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                    if (item.type === 'product') {
                        return (
                            <SeparateProduct
                                id={item.data.id}
                                productName={item.data.productName}
                                image={item.data.image}
                                price={item.data.price}
                                variantId={item.data.variantId}
                                sku={item.data.sku}
                                originalPrice={item.data.originalPrice}
                                offer={item.data.offer}
                                description={item.data.description ?? "No description available."}
                                discount={item.data.discount}
                                buyNowTarget="DeliveryAddress"
                            />
                        );
                    } else {
                        return (
                            <>
                                <View style={styles.subcontainer}>
                                    <Text style={styles.header}>You Might also like</Text>
                                </View>
                                <FlatList
                                    data={item.data}
                                    horizontal
                                    keyExtractor={(recItem) => recItem.id.toString()}
                                    showsHorizontalScrollIndicator={false}
                                    renderItem={({ item: recItem }) => (
                                        <SeparateProductCards
                                            image={recItem.image}
                                            product={recItem.product}
                                            price={recItem.price}
                                            rating={recItem.rating}
                                            productName={recItem.productName}
                                        />
                                    )}
                                />
                            </>
                        );
                    }
                }}
            />
        </View>
    );
};

export default SeparateProductDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        margin: 10
    },
    subcontainer: {
        marginTop: 10
    },
    header: {
        paddingLeft: 12,
        color: "#2A2A2A",
        fontWeight: 800,
        fontSize: 16,
        fontFamily: "Jost"
    },

});
