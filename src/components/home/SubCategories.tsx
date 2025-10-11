import { StackNavigationProp } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity } from "react-native"
import { StyleSheet, View } from "react-native"

import { Category, RootStackParamList } from "../../navigation/type";
import apiClient from "../../services/apiBaseUrl";
import { useNavigation } from "@react-navigation/native";
import BannerCarousel from "./BannerCarousel";

import ApplianceProducts from "./ApplianceProducts";
import { useRoute } from '@react-navigation/native';
import Cloth from "../Cloth";
import Jewellery from "../SubCategory/Jewellery";




type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;


type Subcategory = {
    categoryId: number;
    name: string;
    imageUrl: string;
    parentId: number;
    parentCategoryName: string;
};

type Product = {
    productId: number;
    id: number;
    title: string;
    price: number;
    image: string;
};


const banner = [
    require('../../assets/images/Jewellry1.jpg'),
    require('../../assets/images/Jewellry2.jpg'),
    require('../../assets/images/Jewellry3.jpg'),
    require('../../assets/images/Jewellry4.jpg')
];
const banners = [
    require('../../assets/images/fashion1.jpg'),
    require('../../assets/images/fashion2.jpg'),
    require('../../assets/images/fashion3.jpg'),
    require('../../assets/images/fashion4.jpg')
]

type VariantType = {
    variantId: number;
    price: number;
    stock: number;
    sku: string;
};

interface ProductType {
    productId: number;
    title: string;
    description: string;
    categoryId: number;
    categoryName: string;
    thumbnail?: string;
    price: number;
    sku: string;
    originalPrice?: number;
    discount?: number;
    offer?: number;
    images: any[];
    variants?: VariantType[];
    variant?: VariantType;
    selectedVariantId?: number;
    imageUrl: any;
}

const SubCategories = () => {
    const route = useRoute();

    const { categoryId, category } = route.params as {
        categoryId: number;
        category: string;
    };

    console.log("CategoryIdAndCategory", category)
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const [SubCategory, setSubCategory] = useState<Product[]>([]);
    const [products, setProducts] = useState<ProductType[]>([]);




    useEffect(() => {
        const fetchSubcategories = async () => {
            try {
                const response = await apiClient.get(`v1/category?parentId=${categoryId}`);
                setSubcategories(response.data);
                console.log("CategoryyID", subcategories)
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubcategories();
    }, [categoryId]);

    console.log("categoryIddd", categoryId)

    const fetchProduct = async (categoryId: number) => {
        try {
            const response = await apiClient.get(`v2/products/filter?categoryId=${categoryId}`);
            const rawData = response.data;
            console.log("MappedDataRespose", rawData)

            const mappedProducts: Product[] = rawData.map((item: any) => {
                const variant = item.variants;
                const imageObj = variant?.variantImage?.[0];

                return {
                    productId: item.productId,
                    title: item.title,
                    price: variant?.price ?? 0,
                    image: imageObj?.imageUrl
                };
            });

            setSubCategory(mappedProducts);
            console.log("mappedProducts", mappedProducts);

        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (subcategories?.length) {
            const categoryId = subcategories[0].categoryId;
            fetchProduct(categoryId);
        }
















    }, [subcategories]);

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


    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007aff" />
            </View>
        );
    }



    const renderItem = ({ item }: { item: Category }) => (
        <TouchableOpacity
            key={item.categoryId}
            style={styles.categoryItem}
            onPress={() => {
                console.log('Clickeddddd Category:', item.name);
                navigation.navigate('CategoriesProduct', {
                    categoryId: item.categoryId,
                    categoryName: item.name,
                    category: category
                });

            }}
        // onPress={() => {
        //     console.log('Clickeddddd Category:', item.name);
        //     // navigation.navigate('ProductList', {
        //     //     categoryId: item.categoryId,
        //     //     categoryName: item.name
        //     // });


        // }}
        >
            <View style={styles.roundBackground}>
                <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.categoryImage}
                />
            </View>
            <Text style={styles.categoryLabel}>{item.name}</Text>
        </TouchableOpacity>

        // <TouchableOpacity
        //     key={item.categoryId}
        //     style={styles.categoryItem}
        //     onPress={() => {
        //         setSelectedSubcategory({
        //             name: item.name,
        //             imageUrl: item.imageUrl,
        //         });
        //         setSelectedCategoryId(item.categoryId);
        //         setIsSheetVisible(true);
        //     }}

        // >
        //     <View style={styles.roundBackground}>
        //         <Image
        //             source={{ uri: item.imageUrl }}
        //             style={styles.categoryImage}
        //         />
        //     </View>
        //     <Text style={styles.categoryLabel}>{item.name}</Text>

        // </TouchableOpacity>

    );

    return (
        <View style={styles.container}>
            <FlatList
                data={subcategories}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.categoryId.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
            />


            {category === "Jewellery" && (
                <>
                    <BannerCarousel image={banner} />
                    <Text style={styles.title}>Exquisite Jewels</Text>
                    <FlatList
                        data={SubCategory}
                        numColumns={3}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <Jewellery
                                productId={item.productId}
                                image={item.image}
                                title={item.title}
                                price={item.price}
                            />
                        )}
                        contentContainerStyle={{ padding: 8 }}
                    />
                </>
            )}

            {category === "Cloths" && (
                <>
                    <BannerCarousel image={banners} />
                    <Text style={styles.title}>Best of Clothing</Text>
                    <FlatList
                        data={SubCategory}
                        numColumns={3}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <Cloth
                                productId={item.productId}
                                image={item.image}
                                title={item.title}
                                price={item.price}
                            />
                        )}
                        contentContainerStyle={{ padding: 8 }}
                    />
                </>
            )}



            <ApplianceProducts />
            {/* <Modal
                visible={isSheetVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setIsSheetVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsSheetVisible(false)}>
                    <View style={styles.sheetContainer}>
                        <View style={styles.sheetContent}>
                            <View style={styles.row}>
                                <View style={styles.centerItem}>
                                    <View style={styles.grayLine} />
                                </View>
                            </View>


                            <ScrollView contentContainerStyle={styles.gridWrapper}>
                                <View style={styles.grid}>
                                    {products
                                        .filter(p => p.categoryId === selectedCategoryId)
                                        .map((item, index) => (
                                            <TouchableOpacity key={index} style={styles.gridItem} onPress={() => { }}>
                                                <Image
                                                    source={
                                                        getProductThumbnail(item)
                                                            ? { uri: getProductThumbnail(item) }
                                                            : require('../../assets/images/Appliances.png')
                                                    }
                                                    style={styles.roundImage}
                                                />
                                                <Text style={styles.productLabel} numberOfLines={1}>
                                                    {item.title}
                                                </Text>
                                            </TouchableOpacity>

                                        ))}
                                </View>
                            </ScrollView>

                          
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal> */}


        </View>


    )


}

export default SubCategories

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    center: {
        textAlign: "center",
        justifyContent: "center"
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        // margin: 1,
        marginLeft: 16
    },
    searchIcon: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: 34,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    searchInput: {
        flex: 1,
        top: 3,
        fontSize: 14,
        paddingVertical: 12,
        paddingRight: 12,
        paddingLeft: 20
    },
    iconWrapper: {
        padding: 6,
    },
    listContainer: {
        padding: 10,
    },
    categoryItem: {
        alignItems: 'center',
        marginRight: 2,
        color: "#FFFFFF",
        marginLeft: 13
    },
    categoryImage: {
        width: 75,
        height: 75,
        borderRadius: 50,
        marginBottom: 4,
        borderWidth: 2,
        borderColor: "#8C8C8C40"
    },
    categoryLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    roundBackground: {
        width: 75,
        height: 75,
        borderRadius: 50,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
        color: '#222',
        marginLeft: 10,
        marginBottom: 5
    },
    sheetContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheetContent: {
        backgroundColor: '#fff',
        maxHeight: '65%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 15,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginBottom: 10,
    },

    centerItem: {
        flex: 1,
        alignItems: 'center',
        paddingLeft: 30
    },

    grayLine: {
        width: 83,
        borderBottomWidth: 4,
        borderColor: '#617085',
        borderRadius: 12
    },

    cancelIcon: {
        padding: 4,
    },



    gridWrapper: {
        paddingBottom: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',

    },
    gridItem: {
        width: "33%",
        alignItems: 'center',
        marginVertical: 10,
    },
    roundImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        marginBottom: 5,
    },
    productLabel: {
        fontSize: 13,
        textAlign: 'center',
        color: '#333',
    },
    closeButton: {
        alignSelf: 'center',
        backgroundColor: '#ddd',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 10,
        marginTop: 10,
    },
    closeText: {
        fontSize: 16,
    },





})