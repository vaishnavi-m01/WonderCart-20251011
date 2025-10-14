import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Image, FlatList, TouchableOpacity, Alert, ToastAndroid, Platform } from 'react-native';
import TopSeller from '../components/home/TopSeller';
import LinearGradient from 'react-native-linear-gradient';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BannerCarousel from '../components/home/BannerCarousel';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Categories from '../components/home/Categories';
import apiClient from '../services/apiBaseUrl';
import Product from '../components/home/Product';
import RecentlyViewed from '../components/home/RecentlyViewed';
import OfferBanner from '../components/home/Banner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions } from 'react-native';
import { getProductThumbnail } from '../utils/ProductImageHelper';
import SecureStorage from '../services/SecureStorage';
import UnifiedHeader from '../components/common/UnifiedHeader';
import Ionicons from 'react-native-vector-icons/Ionicons';



type RootStackParamList = {
    CategoriesProduct: { product?: any; categoryId?: number; categoryName?: string; searchProduct?: any };
    RecentlyViewedAllProduct: undefined
    SeparateProductPage: { productId: number };
    TopSellerProduct: { topSellerProduct: Product[] };
    JewelleryProduct: { JewelleryProducts: Product[] };
    Main: { screen?:any };


}
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CategoriesProduct'>;

type Product = {
    productId: number;
    title: string;
    originalPrice :string;
    price:string;
    variants?: {
        price: number;
        variantImage: {
            imageUrl: string;

        }[];

    };
};

type RecentlyViewedItem = {
    id: number;
    productId: number;
    productName: string;
    firstImage: string;
    price: number;
    variantId: number;
    originalPrice?: number;
    offer?: number;
    description?: string;
    sku?: string;
};


const images = [
    require('../assets/images/banner2.png'),
    require('../assets/images/banner2.png'),
    require('../assets/images/banner3.png'),
];


const ITEM_WIDTH = Dimensions.get("window").width;




const Home = () => {

    const navigation = useNavigation<HomeScreenNavigationProp>();
    const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
    const [JewelleryProducts, setJewelleryProducts] = useState<Product[]>([]);
    const [topSellerProduct, setTopSellerProduct] = useState<Product[]>([]);
    console.log("JewelleryProducts", JewelleryProducts)
    const flatListRef = useRef<FlatList<any>>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [searchText, setSearchText] = useState('');
    const typingTimeoutRef = useRef<number | null>(null);
    const [recentlyViewedData, setRecentlyViewedData] = useState<RecentlyViewedItem[]>([]);
    console.log("recentlyViewedData", recentlyViewedData)

    const topSellerRef = useRef<FlatList<any>>(null);
    const jewelleryRef = useRef<FlatList<any>>(null);




    const getGreeting = () => {
        const hour = new Date().getHours();
        console.log("hourrr", hour)

        if (hour < 12) {
            return 'Good Morning';
        } else if (hour < 17) {
            return 'Good Afternoon';
        } else {
            return 'Good Evening';
        }
    };


    useEffect(() => {
        const loadUserData = async () => {
            try {
                const user = await SecureStorage.getUserData();
                if (user) {
                    console.log("User", user);
                    setUserName(user.name);
                }
            } catch (error) {
                console.error('Error loading user from SecureStorage:', error);
            }
        };

        loadUserData();
    }, []);



    useEffect(() => {
        apiClient.get(`v1/homepageSection4?limit=8`)
            .then((response: any) => {
                const section = response.data?.[0];
                const data = section?.abstractProductList || [];
                console.log("Correct trending data", data);
                setTrendingProducts(data.slice(0, 8));
            })
            .catch((error: any) => {
              console.error('Failed to load trending collection', error);
            });
    }, []);


    useEffect(() => {
    }, [trendingProducts]);



    const fetchJewelleryProducts = () => {
        apiClient
            .get("v2/products/filter?categoryId=3")
            .then((response: any) => {
                setJewelleryProducts(response.data);
            })
            .catch((error: any) => {
                console.error("Error fetching products", error);
            });
    };
    useFocusEffect(
        useCallback(() => {
            fetchJewelleryProducts();
        }, [])
    );


    useEffect(() => {
        const fetchProducts = async () => {
            try {
                console.log("homepagetry")
                const [category3Res, category6Res] = await Promise.all([
                    apiClient.get(`v2/products/filter?categoryId=6`),
                    apiClient.get(`v2/products/filter?categoryId=3`),
                ]);

                const jewelleryTop3 = category3Res.data.slice(0, 3);
                const clothProducts = category6Res.data;

                const combined = [...jewelleryTop3, ...clothProducts];

                setTopSellerProduct(combined);
            } catch (error) {
                 console.log("homepagecatch")
                console.error("Error fetching top seller products", error);
            }
        };

        fetchProducts();
    }, []);



    const scrollToNext = () => {
        let nextIndex = currentIndex + 1;

        if (nextIndex >= JewelleryProducts.length) {
            nextIndex = 0;
        }

        if (jewelleryRef.current && JewelleryProducts.length > 0) {
            jewelleryRef.current.scrollToIndex({
                index: nextIndex,
                animated: true,
            });
        }

        setCurrentIndex(nextIndex);
    };


    const topscrollToNext = () => {
        let nextIndex = currentIndex + 1;

        if (nextIndex >= topSellerProduct.length) {
            nextIndex = 0;
        }

        if (topSellerRef.current && topSellerProduct.length > 0) {
            topSellerRef.current.scrollToIndex({
                index: nextIndex,
                animated: true,
            });
        }

        setCurrentIndex(nextIndex);
    };




    const firstGroup = trendingProducts.slice(0, 4);
    const secondGroup = trendingProducts.slice(4, 8);


    // useEffect(() => {
    //     if (!searchText.trim()) return;


    //     if (typingTimeoutRef.current !== null) {
    //         clearTimeout(typingTimeoutRef.current);
    //     }


    //     typingTimeoutRef.current = setTimeout(() => {
    //         handleSearch();
    //     }, 1000);

    //     return () => {
    //         if (typingTimeoutRef.current !== null) {
    //             clearTimeout(typingTimeoutRef.current);
    //         }
    //     };
    // }, [searchText]);

    const handleSearch = async () => {
        try {
            const response = await apiClient.get(`v2/products/filter?word=${searchText}`);
            const data = response.data;

            if (data.length > 0) {
                const firstProduct = data[0];
                navigation.navigate('CategoriesProduct', {
                    categoryId: firstProduct.categoryId,
                    categoryName: firstProduct.categoryName,
                    searchProduct: data,
                });
                setSearchText('');
            } else {
                ToastAndroid.show("No products found", ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    };


    useFocusEffect(
        useCallback(() => {
            const fetchRecentlyViewed = async () => {
                const stored = await AsyncStorage.getItem('recentlyViewed');
                if (stored) {
                    const all = JSON.parse(stored);

                    const today = new Date();
                    const valid = all.filter((item: any) => {
                        const viewedDate = new Date(item.viewedDate);
                        const diff = (today.getTime() - viewedDate.getTime()) / (1000 * 60 * 60 * 24);
                        return diff <= 7;
                    });

                    setRecentlyViewedData(valid.slice(0, 3));
                }
            };

            fetchRecentlyViewed();
        }, [])
    );



    return (
        <View style={styles.container} >
            <UnifiedHeader
                title="WonderCart"
                showMenuButton={true}
                onMenuPress={() => {
                    // Navigate to Profile tab which has drawer navigation
                    navigation.navigate('Profile');
                }}
                showSearch={true}
                showWishlist={true}
                searchText={searchText}
                onSearchChange={setSearchText}
                onSearchSubmit={() => {
                    if (searchText.trim()) {
                        handleSearch();
                    }
                }}
                onWishlistPress={() => navigation.navigate("Wishlist" as never)}
                headerStyle="home"
            />


            {/* Modern Header Section */}
            <View style={styles.modernHeader}>
                <View style={styles.headerContent}>
                    <View style={styles.greetingSection}>
                        <Text style={styles.modernGreeting}>{getGreeting()}</Text>
                        {userName ? (
                            <Text style={styles.modernUserName}>{userName} ✨</Text>
                        ) : (
                            <Text style={styles.modernUserName}>Welcome to WonderCart ✨</Text>
                        )}
                        {/* <Text style={styles.modernSubText}>Discover amazing products tailored for you</Text> */}
                    </View>
                    {/* <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.notificationButton}
                            onPress={() =>
                                navigation.navigate("Main", { screen: "Notification" } )
                            }
                        >
                            <Ionicons name="notifications-outline" color="#fff" size={24} />
                            <View style={styles.notificationBadge}>
                                <Text style={styles.badgeText}>3</Text>
                            </View>
                        </TouchableOpacity>

                    </View> */}
                </View>
            </View>

            {/* Modern Action Buttons */}
            <View style={styles.modernActionRow}>
                {[
                    { label: 'My Orders', icon: 'package-variant', color: '#4CAF50' },
                    { label: 'Address', icon: 'map-marker', color: '#2196F3' },
                    { label: 'Offers', icon: 'tag', color: '#FF9800' },
                    { label: 'Support', icon: 'headset', color: '#9C27B0' },
                ].map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.modernActionButton}
                        onPress={() => {
                            switch (item.label) {
                                case 'My Orders':
                                    navigation.navigate('Orders' as never);
                                    break;
                                case 'Address':
                                    navigation.navigate('DeliveryAddress' as never);
                                    break;
                                case 'Offers':
                                    navigation.navigate('Offers' as never);
                                    break;
                                case 'Support':
                                    navigation.navigate('Support' as never);
                                    break;
                                default:
                                    break;
                            }
                        }}
                    >
                        <View style={[styles.actionIconContainer, { backgroundColor: item.color + '20' }]}>
                            <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color} />
                        </View>
                        <Text style={styles.modernActionText}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            < ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer} >


                {/* Modern Shop By Category Section */}
                <View style={styles.modernCategoryContainer}>
                    <View style={styles.modernCategoryHeader}>
                        <Text style={styles.modernCategoryTitle}>🛍️ Shop By Category</Text>
                        <Text style={styles.categorySubtitle}>Explore our wide range of products</Text>
                    </View>
                    <Categories />
                </View>

                <Image source={require('../assets/images/banner.png')} style={styles.banner} />

                <View style={styles.topSellerContainer}>
                    {/* Modern Top Seller Header */}
                    <View style={styles.modernTopSellerHeader}>
                        <View style={styles.topSellerTitleSection}>
                            <Text style={styles.modernTopSellerTitle}>🏆 Top Seller</Text>
                            <Text style={styles.topSellerSubtitle}>Discover products loved by many</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.modernTopSellerViewAllBtn}
                            onPress={() => navigation.navigate("TopSellerProduct", { topSellerProduct })}
                        >
                            <Text style={styles.modernTopSellerViewAllText}>View All</Text>
                            <AntDesign name="right" color="#fff" size={14} />
                        </TouchableOpacity>
                    </View>
                    < FlatList
                        ref={topSellerRef}
                        data={topSellerProduct}
                        extraData={topSellerProduct}
                        horizontal
                        keyExtractor={(item) => item.productId.toString()}
                        showsHorizontalScrollIndicator={false}
                        getItemLayout={(data, index) => ({
                            length: ITEM_WIDTH,
                            offset: ITEM_WIDTH * index,
                            index,
                        })}
                        renderItem={({ item }) => {
                            const imageUrl = item.variants?.variantImage?.[0]?.imageUrl ?? "";
                            const variantId = item.variants?.variantId

                            return (
                                <TouchableOpacity onPress={() =>
                                    navigation.navigate("SeparateProductPage", {
                                        productId: item.productId,
                                    })
                                }>
                                    <Product
                                        productId={item.productId}
                                        image={
                                            getProductThumbnail(item)
                                                ? [{ uri: getProductThumbnail(item) }]
                                                : item.variants?.variantImage?.length > 0
                                                    ? [{ uri: item.variants.variantImage[0].imageUrl }]
                                                    : []
                                        } productName={item.title}
                                        price={item.variants?.price ?? 0}
                                        variantId={variantId}

                                    />
                                </TouchableOpacity>
                            );
                        }}
                    />

                </View>


                < BannerCarousel image={images} />

                {/* Modern Trending Section */}
                <View style={styles.modernTrendingContainer}>
                    <View style={styles.modernTrendingHeader}>
                        <View style={styles.trendingTitleSection}>
                            <Text style={styles.modernTrendingTitle}>🔥 Trending on Sale!</Text>
                            <Text style={styles.trendingSubtitle}>Handpicked items just for you</Text>
                        </View>
                        <TouchableOpacity style={styles.modernViewAllButton}>
                            <Text style={styles.modernViewAllText}>View All</Text>
                            <AntDesign name="right" color="#fff" size={14} />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={[...firstGroup, ...secondGroup]}
                        numColumns={2}
                        keyExtractor={(item) => item.productId.toString()}
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={false}
                        contentContainerStyle={styles.trendingFlatList}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.modernTrendingCard}
                                onPress={() =>
                                    navigation.navigate("SeparateProductPage", {
                                        productId: item.productId,
                                    })
                                }
                                activeOpacity={0.8}
                            >
                                <View style={styles.modernCardImageContainer}>
                                    <Image
                                        source={{ uri: item.variants?.variantImage?.[0]?.imageUrl }}
                                        style={styles.modernCardImage}
                                    />
                                    <View style={styles.saleBadge}>
                                        <Text style={styles.saleBadgeText}>SALE</Text>
                                    </View>
                                </View>
                                <View style={styles.modernCardContent}>
                                    <Text style={styles.modernCardTitle} numberOfLines={2}>{item.title}</Text>
                                    <View style={styles.priceContainer}>
                                        <Text style={styles.originalPrice}>₹{item.originalPrice || item.price}</Text>
                                        <Text style={styles.salePrice}>₹{item.variants?.price || item.price}</Text>
                                        <Text style={styles.text}>{item.title}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </View>



                < View style={styles.topSellerContainer} >
                    {/* Enhanced Jewellery Header */}
                    <View style={styles.jewelleryHeader}>
                        <View style={styles.jewelleryTitleContainer}>
                            <Text style={styles.jewelleryTitle}>💎 Jewellery</Text>
                            <Text style={styles.jewellerySubtitle}>Complete Your Look with Stunning Jewellery</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.jewelleryViewAllBtn}
                            onPress={() => navigation.navigate("JewelleryProduct", { JewelleryProducts })}
                        >
                            <Text style={styles.jewelleryViewAllText}>View All</Text>
                            <AntDesign name="right" color="#0077CC" size={14} />
                        </TouchableOpacity>
                    </View>
                    < FlatList
                        ref={jewelleryRef}
                        data={JewelleryProducts}
                        extraData={JewelleryProducts}
                        horizontal
                        keyExtractor={(item) => item.productId.toString()}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => {
                            const imageUrl = item.variants?.variantImage?.[0]?.imageUrl ?? "";
                            const variantId = item.variants?.variantId

                            return (

                                <TopSeller
                                    productId={item.productId}
                                    image={imageUrl}
                                    productName={item.title}
                                    price={item.variants?.price ?? 0}
                                    variantId={variantId}
                                />
                            );
                        }}
                    />



                </View>
                {/* <View >
                    <BannerCarousel image={banner2} />
                </View>


                <BeautyCare /> */}


                {/* <BannerCarousel image={banner3} />
                <Text style={styles.bottomTitle}>See More Items</Text> */}
                {
                    recentlyViewedData.length > 0 && (
                        <>
                            <View style={styles.rowContainer}>
                                <Text style={styles.text}> Recently Viewed </Text>
                                < TouchableOpacity onPress={() => navigation.navigate("RecentlyViewedAllProduct")
                                }>
                                    <Text style={styles.viewAll}> View All </Text>
                                </TouchableOpacity>
                            </View>

                            < Text style={styles.bottomText} > Continue where you left off </Text>

                            {
                                recentlyViewedData.map((item) => (

                                    <RecentlyViewed
                                        key={item.productId}
                                        productId={item.productId}
                                        image={{ uri: item.firstImage }}
                                        name={item.productName}
                                        price={item.price}
                                    />

                                ))}
                        </>
                    )}


                <OfferBanner />

            </ScrollView>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        // paddingTop: 10,
        // paddingBottom: 100
    },
    subContainer: {
        paddingTop: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 5,
        margin: 5,
        paddingLeft: 12
    },
    icon: {
        top: 5,
        backgroundColor: "#FFF",
        padding: 5,
        borderRadius: 50,
        elevation: 2
    },
    title: {
        fontSize: 20,
        color: '#007aff',
        fontWeight: 'bold',
        fontFamily: 'fantasy',
    },
    tagline: {
        fontSize: 12,
        color: '#A8A8A8'
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
    },
    location: {
        marginLeft: 6,
        color: '#333',
    },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        margin: 5,
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
    sectionTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: "#4A4A4A",
        fontFamily: "Jost",
        // margin: 3,
        // top: -4,
        paddingLeft: 13,
        marginBottom: 8

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
    banner: {
        width: '95%',
        height: 120,
        borderRadius: 10,
        marginVertical: 15,
        resizeMode: 'cover',
        margin: 8,
        marginLeft: 12,
        marginRight: 12
    },
    cardContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },

    trendingGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginVertical: 10,
        padding: 13
    },

    trendingCard: {
        width: '28%',
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        marginBottom: 12,
        overflow: 'hidden',
        paddingBottom: 8,
    },

    trendingImage: {
        width: '100%',
        height: 100,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        resizeMode: 'cover',
    },

    trendingText: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 6,
        marginLeft: 8,
    },

    discountText: {
        fontSize: 12,
        color: '#FF3366',
        marginLeft: 8,
    },

    topSellerContainer: {
        // backgroundColor: '#E4F4FF',
        padding: 6,
        margin: 0,
        width: "100%",
        
    },
    tobsubConatiner: {
        flexDirection: "row",
        justifyContent: "space-between"

    },
    sectiontext: {
        color: "#303030",
        fontFamily: "Jost",
        fontWeight: 600,
        paddingBottom: 10
    },
    gradientBackground: {
        borderRadius: 8,
        padding: 8,
        marginBottom: 16,
    },
    sectionText: {
        fontSize: 14,
        color: '#303030',
        textAlign: 'left',
        fontWeight: 400,
        paddingLeft: 17,
        paddingTop: 0,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 20,
    },
    containerBox: {
        width: '48%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderRadius: 12,
    },
    bottomText: {
        paddingLeft: 12,
        color: "#797373ff",
        opacity: 0.9
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        backgroundColor: "#E3F2FF",
        padding: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    secondGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        backgroundColor: "#FFE3F1",
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    card: {
        width: '49%',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 8,
        padding: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    image: {
        width: 70,
        height: 70,
        borderRadius: 10,
        marginBottom: 8,
        resizeMode: 'cover',
    },

    discount: {
        color: '#4A4A4A',
        fontSize: 12,
        marginTop: 2,
        fontWeight: 800,
        paddingTop: 8
    },
    productName: {
        fontSize: 11,
        color: "#2D2D2D",
        fontFamily: "Poppins",
        fontWeight: '600',
        textAlign: "center",
        lineHeight: 14,
        marginTop: 4,
    },

    // New Trending Section Styles
    trendingSectionContainer: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginVertical: 20,
        borderRadius: 16,
        paddingVertical: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    trendingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    trendingTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1A1A1A',
        fontFamily: 'Poppins',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F7FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        shadowColor: '#0077CC',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    viewAllText: {
        color: '#0077CC',
        fontSize: 14,
        fontWeight: '600',
        marginRight: 4,
    },
    trendingGridContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
    },
    trendingGridLeft: {
        flex: 1,
        backgroundColor: '#F8FAFF',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#0077CC',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    trendingGridRight: {
        flex: 1,
        backgroundColor: '#FFF5F8',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#FF3366',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    trendingCard: {
        width: '48%',
        marginBottom: 12,
        alignItems: 'center',
    },
    trendingImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 8,
    },
    trendingImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
        resizeMode: 'cover',
    },
    trendingProductName: {
        fontSize: 12,
        color: '#2D2D2D',
        fontFamily: 'Poppins',
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 16,
    },

    // Enhanced Jewellery Section Styles
    jewelleryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: '#FFF8F0',
        borderRadius: 16,
        marginHorizontal: 16,
        marginVertical: 20,
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    jewelleryTitleContainer: {
        flex: 1,
    },
    jewelleryTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#D2691E',
        fontFamily: 'Poppins',
        marginBottom: 4,
    },
    jewellerySubtitle: {
        fontSize: 14,
        color: '#8B4513',
        fontFamily: 'Poppins',
        fontWeight: '500',
    },
    jewelleryViewAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#D2691E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F4E4BC',
    },
    jewelleryViewAllText: {
        color: '#D2691E',
        fontSize: 14,
        fontWeight: '600',
        marginRight: 4,
    },

    // Modern Header Styles
    modernHeader: {
        backgroundColor: '#0077CC',
        paddingTop: 20,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#0077CC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    greetingSection: {
        flex: 1,
    },
    modernGreeting: {
        fontSize: 16,
        color: '#E3F2FD',
        fontWeight: '500',
        marginBottom: 4,
    },
    modernUserName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 6,
    },
    modernSubText: {
        fontSize: 14,
        color: '#B3E5FC',
        fontWeight: '400',
    },
    headerActions: {
        alignItems: 'flex-end',
    },
    notificationButton: {
        position: 'relative',
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    notificationBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: '#FF4444',
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },

    // Modern Action Buttons
    modernActionRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 20,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: -22,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        marginBottom:3
    },
    modernActionButton: {
        alignItems: 'center',
        flex: 1,
    },
    actionIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    modernActionText: {
        fontSize: 12,
        color: '#2D2D2D',
        fontWeight: '600',
        textAlign: 'center',
    },

    // Modern Trending Section
    modernTrendingContainer: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginVertical: 20,
        borderRadius: 20,
        paddingVertical: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    modernTrendingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    trendingTitleSection: {
        flex: 1,
    },
    modernTrendingTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    trendingSubtitle: {
        fontSize: 14,
        color: '#666666',
        fontWeight: '500',
    },
    modernViewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0077CC',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        shadowColor: '#0077CC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    modernViewAllText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginRight: 6,
    },
    trendingFlatList: {
        paddingHorizontal: 16,
    },
    modernTrendingCard: {
        flex: 1,
        marginHorizontal: 8,
        marginBottom: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    modernCardImageContainer: {
        position: 'relative',
        height: 120,
        backgroundColor: '#FFFFFF',
    },
    modernCardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    saleBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#FF4444',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    saleBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    modernCardContent: {
        padding: 12,
    },
    modernCardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2D2D2D',
        marginBottom: 8,
        lineHeight: 18,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    originalPrice: {
        fontSize: 12,
        color: '#999999',
        textDecorationLine: 'line-through',
    },
    salePrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0077CC',
    },

    // Modern Top Seller Section Styles
    modernTopSellerContainer: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginVertical: 20,
        borderRadius: 20,
        paddingVertical: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    modernTopSellerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    topSellerTitleSection: {
        flex: 1,
    },
    modernTopSellerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    topSellerSubtitle: {
        fontSize: 14,
        color: '#666666',
        fontWeight: '500',
    },
    modernTopSellerViewAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0077CC',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        shadowColor: '#0077CC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    modernTopSellerViewAllText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginRight: 6,
    },

    // Modern Category Section Styles
    modernCategoryContainer: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginVertical: 20,
        borderRadius: 20,
        paddingVertical: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    modernCategoryHeader: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    modernCategoryTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    categorySubtitle: {
        fontSize: 14,
        color: '#666666',
        fontWeight: '500',
    },
    banner3: {
        width: '94%',
        height: 130,
        borderRadius: 20,
        marginVertical: 8,
        margin: 15,
    },
    bannerImage: {
        width: '95%',
        height: 150,
        borderRadius: 16,
        marginHorizontal: 12,
        // marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
        marginBottom: 10
    },
    bottomTitle: {
        color: "#303030",
        textAlign: "center",
        fontFamily: "Jost",
        fontWeight: 900,
        marginBottom: 20,
        marginTop: 10,
        fontSize: 16
    },
    scrollContainer: {
        flex: 1,
        paddingBottom: 120,
        backgroundColor: '#F8F9FA',
    },
    heartIcon: {
        textAlign: "right",

    },
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 10 : 5,
        paddingBottom: 8,
        backgroundColor: '#fff',
    },
    logo: {
        fontSize: 20,
        fontWeight: 'bold',
        marginRight: 8,
        color: '#333',
    },
    searchInputs: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        borderRadius: 30,
        paddingHorizontal: 16,
        height: 40,
        fontSize: 14,
        marginHorizontal: 8,
    },
    notification: {
        position: 'relative',
        padding: 6,
    },
    bell: {
        fontSize: 22,
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#ef4444',
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },

    banners: {
        backgroundColor: '#1E88E5',
        paddingVertical: 20,
        paddingHorizontal: 16,


    },
    greeting: {
        fontSize: 14,
        color: '#fff',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    subText: {
        fontSize: 13,
        color: '#e5e5e5',
        marginTop: 4,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderRadius: 16,
        top: -19,
        marginRight: 10,
        marginLeft: 10
    },
    iconBox: {
        alignItems: 'center',
        width: '23%',
        backgroundColor: '#ffffff22',
        paddingVertical: 12,
        borderRadius: 10,
    },
    icon: {
        fontSize: 22,
        marginBottom: 4,
    },
    iconLabel: {
        fontSize: 12,
        fontWeight: 600
        // color: '#fff',
    },
    text: {
        fontSize: 20,
        fontWeight: 900,
        fontFamily: "Jost",
        paddingLeft: 5,
        marginTop: 10
    },
    viewAll: {
        fontSize: 18,
        color: "#007aff",
        fontWeight: 800,
        bottom: -12
    },
    viewAllBtn: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 12,
        alignSelf: "flex-start",
    },
    viewAllText: {
        fontSize: 12,
        color: "#555",
        fontWeight: "900",
    },

    // viewAllContainer:{
    //    borderRadius:24,
    //    borderWidth:1,
    //    borderColor:"gray"   
    // }

});

export default Home;
