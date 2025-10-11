import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ScrollView,
    TextInput,
} from "react-native";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import AntDesign from "react-native-vector-icons/AntDesign";
import { RouteProp, useRoute } from "@react-navigation/native";
import { ProductType, RootStackParamLists } from "../navigation/type";
import UnifiedHeader from "../components/common/UnifiedHeader";
import apiClient from "../services/apiBaseUrl";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 32) / 2;

type FilterOption = {
    label: string;
    range: number[];
};

type CartRouteProp = RouteProp<RootStackParamLists, 'ProductList'>;




const filterOptions = [
    // { label: "All"},
    { label: "Under ₹300", range: [0, 300] },
    { label: "₹300 - ₹500", range: [300, 500] },
    { label: "₹500 - ₹800", range: [500, 800] },
    { label: "Above ₹800", range: [800, Infinity] },
];

const ProductList = () => {
    const [selectedFilter, setSelectedFilter] = useState<FilterOption | null>(null);
    const route = useRoute<CartRouteProp>();
    const [loading, setLoading] = useState(true);

    const categoryId = route.params?.categoryId;
    console.log("CategoryIDDDD", categoryId)
    const categoryName = route.params?.categoryName;
    console.log("CategoryNameee", categoryName)

    const [products, setProducts] = useState<ProductType[]>([]);



    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const res = await apiClient.get<ProductType[]>('/v2/products');
                setProducts(res.data);
            } catch (err) {
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);


    return (
        <View style={styles.container}>
            <UnifiedHeader
                title="Products"
                showBackButton={true}
                onBackPress={() => {/* Add navigation logic */}}
                headerStyle="default"
            />

            <View style={styles.searchContainer}>
                <EvilIcons name="search" color="#A8A8A8" size={26} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for products"
                    placeholderTextColor="#999"
                />
                <TouchableOpacity onPress={() => console.log("Camera tapped")}>
                    <FontAwesome name="camera" color="#666" size={18} />
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterBar}
                contentContainerStyle={styles.filterContent}
            >
                {filterOptions.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.filterButton,
                            selectedFilter?.label === option.label &&
                            styles.activeFilter,
                        ]}
                        onPress={() => {
                            setSelectedFilter(
                                selectedFilter?.label === option.label
                                    ? null
                                    : option
                            );
                        }}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                selectedFilter?.label === option.label &&
                                styles.activeFilterText,
                            ]}
                        >
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>



         

            {/* <FlatList
                data={filteredProducts}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                columnWrapperStyle={{ justifyContent: "space-between" }}
                contentContainerStyle={styles.productList}
            /> */}
        </View>
    );
};

export default ProductList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 8,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        backgroundColor: "#fff",
        marginBottom: 10,
        height: 45,

    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        marginLeft: 6,
    },
    filterBar: {
        maxHeight: 42,
        marginBottom: 8,
    },
    filterContent: {
        paddingLeft: 4,
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: "#eee",
        borderWidth: 1,
        borderColor: "#ccc",
        justifyContent: "center",
        alignItems: "center",
    },
    filterText: {
        fontSize: 13,
        color: "#333",
        height: 20
    },
    activeFilter: {
        backgroundColor: "#059ff8",
        borderColor: "#059ff8",
    },
    activeFilterText: {
        color: "#fff",
    },
    productList: {
        paddingBottom: 80,
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        marginBottom: 10,
        padding: 8,
        elevation: 2,
        marginTop: 8
    },
    productImage: {
        width: "100%",
        height: 120,
        borderRadius: 6,
        marginBottom: 6,
    },
    name: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,
        textAlign: "center"
    },
    price: {
        fontSize: 15,
        color: "green",
        marginBottom: 8,
        textAlign: "center"
    },
    cartButton: {
        backgroundColor: "#059ff8",
        paddingVertical: 6,
        borderRadius: 4,
        alignItems: "center",
    },
    cartText: {
        color: "#fff",
        fontWeight: "bold",
    },
});
