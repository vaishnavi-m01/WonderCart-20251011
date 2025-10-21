
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, Dimensions, ImageSourcePropType, Alert, ToastAndroid, ScrollView, Platform, Animated } from "react-native";
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import Foundation from 'react-native-vector-icons/Foundation';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

import { RouteProp, useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useCart } from "./context/AddToCartItem";
import { useEffect, useState } from "react";
import ShareComponent from "../utils/ShareComponent";
// import { getAllVariantImages } from "../utils/ProductImageHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../services/apiBaseUrl";
import VarientProduct from "./VarientProduct";
import SeparateProductCards from "./SeparateProductCards";
import { RootStackParamLists } from "../navigation/type";
import WriteReviewModal from "./WriteReviewModal";
import Ionicons from 'react-native-vector-icons/Ionicons';
import StarDisplay from "../utils/StarDisplay";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';




export type TabParamList = {
    Home: undefined;
    Categories: undefined;
    Cart: undefined;
    Notification: undefined;
    Profile: undefined;
};

type BuyNowTarget = keyof RootStackParamList;

export type RootStackParamList = {
    ProductDetails: {
        product: any;
    };
    Main: {
        screen: keyof TabParamList;
        params?: { from: string, productId: number };
    };

    Cart?: {
        AddToCart: {
            id: number;
            productName: string;
            description: string;
            image: any;
            price: number;
            originalPrice: number;
            offer: string;
            discount: number;
            selectedSize: string;
        }
    }
    FullScreenImage: {
        images: ImageSourcePropType[];
        index: number;
    };
    DeliveryAddress: undefined;
    CheckOut: undefined;
    // Signup: { redirectTo?: string };
    Profile: undefined;
    SubCategoriesListOfProducts: {
        categoryId: number;
        category: string;
        product?: any;
    };
    ReviewFullImage: {
        review: ReviewType;
    };
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'ProductDetails'>;
type SubCategoriesRouteProp = RouteProp<RootStackParamList, 'SubCategoriesListOfProducts'>;


interface Props {
    categoryName?: string;
    productId: number;
    productName: string;
    description?: string;
    image: any[];
    offer?: number;
    discount?: number;
    price?: number;
    originalPrice?: number;
    buyNowTarget?: BuyNowTarget;
    variantId?: number;
    sku?: string;
    variants?: any[];
    categoryId?: number;
    onVariantChange?: (variant: { image: string; price: number; variantId: string }) => void;
};

type ReviewImageType = {
    id: number;
    imageUrl: string;
    productReviewId: number;
};

type ReviewType = {
    productReviewId: number;
    productId: number;
    variantId: number;
    userId: number;
    username: string;
    rating: number;
    reviewText: string;
    createdAt: string;
    imagesList?: ReviewImageType[];
};


type ProductItem = {
    productId: number;
    title: string;
    variants: {
        price: number;
        variantId: number;
        reviewSummary?: {
            averageRating?: number;
        };
        variantImage: { imageUrl: string }[];
    };
};



const { width } = Dimensions.get('window');

const SeparateProduct = ({ categoryName, productId, productName, description, image, offer, discount, price, originalPrice, buyNowTarget, variantId, sku, variants, categoryId }: Props) => {

    const navigation = useNavigation<NavigationProp>();
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [userId, setUserId] = useState();
    const isFocused = useIsFocused();
    const [modalVisible, setModalVisible] = useState(false);
    const navigations = useNavigation<StackNavigationProp<RootStackParamList>>();
    const destination = buyNowTarget ?? 'ProductDetails';
    const [isFavorite, setIsFavorite] = useState(false);
    const { addToCart } = useCart();

    // Animation values
    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(50))[0];
    const scaleAnim = useState(new Animated.Value(0.95))[0];

    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
    const selectedVariant = variants?.[selectedVariantIndex] || {};
    const [images, setImages] = useState<ImageSourcePropType[]>(() => {
        // Try to get variant images first
        const variantImages = variants?.[0]?.variantImage?.map((img: any) => ({ uri: img.imageUrl })) ?? [];

        // If no variant images, use the main product image array
        if (variantImages.length === 0 && image && image.length > 0) {
            return image;
        }

        return variantImages;
    });
    const firstImage = selectedVariant?.variantImage?.[0]?.imageUrl || "";


    const [selectedSize, setSelectedSize] = useState('');
    const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
    const [reviews, setReviews] = useState<ReviewType[]>([]);
    const [showAll, setShowAll] = useState(false);
    const route = useRoute<SubCategoriesRouteProp>();
    const { category } = route.params;
    const { setCartItems } = useCart();
    const [suggestedProducts, setSuggestedProducts] = useState<ProductItem[]>([]);


    const insets = useSafeAreaInsets();




    const handleVariantSelect = (index: number) => {
        setSelectedVariantIndex(index);
        const selectedImages = variants?.[index]?.variantImage?.map((img: any) => ({ uri: img.imageUrl })) ?? [];

        // If no variant images, keep the current images
        if (selectedImages.length > 0) {
            setImages(selectedImages);
        }
    };



    useEffect(() => {
        fetchSuggestedProducts();

        // Start animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const fetchSuggestedProducts = async () => {
        try {
            const response = await apiClient.get(
                `v2/products/filter?categoryId=${categoryId}`
            );

            const filteredProducts = response.data.filter(
                (product: any) => product.productId !== productId
            );

            setSuggestedProducts(filteredProducts);
        } catch (error) {
            console.error('Error fetching suggested products:', error);
        }
    };


    const checkLogin = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                setUserId(user.userId || "")
                setName(user.name || "");
                setEmail(user.email || "");
                setPhone(user.phone || "");
                setPassword(user.password || "");
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.error("Error loading user data:", error);
            setIsLoggedIn(false);
        }
        setLoading(false);
    };

    useEffect(() => {
        checkLogin();
    }, [isFocused]);


    useEffect(() => {
        const updateRecentlyViewed = async () => {
            try {
                const today = new Date();

                const stored = await AsyncStorage.getItem('recentlyViewed');
                let existing = stored ? JSON.parse(stored) : [];


                const filteredByDate = existing.filter((item: any) => {
                    if (!item.viewedDate) return true;
                    const viewedDate = new Date(item.viewedDate);
                    const diff = (today.getTime() - viewedDate.getTime()) / (1000 * 60 * 60 * 24);
                    return diff <= 7;
                });


                const filteredById = filteredByDate.filter((item: any) => item.productId !== productId);


                const newProduct = {
                    productId,
                    productName,
                    firstImage,
                    price,
                    originalPrice,
                    offer,
                    description,
                    sku,
                    variantId,
                    viewedDate: today.toISOString(),
                };


                const updated = [newProduct, ...filteredById].slice(0, 20);


                await AsyncStorage.setItem('recentlyViewed', JSON.stringify(updated));

            } catch (err) {
                console.log('Error storing recently viewed product', err);
            }
        };

        updateRecentlyViewed();
    }, [productId]);



    const handleClick = async () => {
        try {
            const userString = await AsyncStorage.getItem("user");

            const cartItem = {
                productId: productId,
                variantId: variantId,
                price,
                quantity: 1
            };

            if (userString) {
                const user = JSON.parse(userString);
                const userId = user.userId;


                const response = await apiClient.get(`v1/cart/${userId}`);
                const cartItems = response.data;


                const existingItem = cartItems.find(
                    (item: any) => item.productId === productId && item.variantId === variantId
                );

                if (existingItem) {

                    const updatedItem = {
                        cartItemId: existingItem.cartItemId,
                        quantity: existingItem.quantity + 1,
                        price: price,
                    };
                    await apiClient.patch(`v1/cart/update/cartItems/${existingItem.cartItemId}`, updatedItem);
                } else {


                    await apiClient.post(`v1/cart/${userId}/items`, cartItem);
                }
            } else {

                const localCart = await AsyncStorage.getItem('cartItems');
                let cart = localCart ? JSON.parse(localCart) : [];

                const existingIndex = cart.findIndex(
                    (item: any) => item.productId === productId && item.variantId === variantId
                );

                if (existingIndex !== -1) {

                    cart[existingIndex].quantity += 1;
                } else {

                    cart.unshift({
                        productId: productId,
                        productName,
                        description,
                        image,
                        price,
                        sku,
                        originalPrice,
                        offer: 10,
                        discount: 10,
                        variantId,
                        quantity: 1,
                    });
                }

                await AsyncStorage.setItem('cartItems', JSON.stringify(cart));
                setCartItems(cart);

            }

            navigation.navigate("Main", { screen: "Cart" });
        } catch (error) {
            console.error("Error adding to cart:", error);
            Alert.alert("Error", "Could not add item to cart.");
        }
    };




    const [wishlistId, setWishlistId] = useState(null);

    const fetchWishlist = async () => {
        try {
            const userString = await AsyncStorage.getItem("user");

            if (!userString) {
                const saved = await AsyncStorage.getItem('wishlistItems');
                const wishlist = saved ? JSON.parse(saved) : [];

                const matched = wishlist.find(
                    (item: any) => item.productId === productId && item.variantId === variantId
                );

                if (matched) {
                    setIsFavorite(true);
                } else {
                    setIsFavorite(false);
                }

                return;
            }

            const user = JSON.parse(userString);
            const res = await apiClient.get(`v1/wishlist?userId=${user.userId}`);
            const wishlist = res.data || [];

            const matched = wishlist.find(
                (item: any) => item.productId === productId && item.variantId === variantId
            );

            if (matched) {
                setIsFavorite(true);
                setWishlistId(matched.wishlistId);
            } else {
                setIsFavorite(false);
                setWishlistId(null);
            }

        } catch (err) {
            console.error('Error fetching wishlist:', err);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [productId]);

    const handleWishlistToggle = async () => {
        try {
            const userString = await AsyncStorage.getItem("user");

            if (!userString) {
                const saved = await AsyncStorage.getItem('wishlistItems');
                const wishlist = saved ? JSON.parse(saved) : [];

                if (!isFavorite) {
                    wishlist.push({
                        wishlistId: `guest-${Date.now()}`,
                        productId: productId,
                        variantId: variantId,
                        productName,
                        image: image,
                        price,
                        createdAt: new Date().toISOString()
                    });
                    await AsyncStorage.setItem('wishlistItems', JSON.stringify(wishlist));
                    setIsFavorite(true);
                    ToastAndroid.show('Added to Wishlist ❤️', ToastAndroid.SHORT);
                } else {
                    const updated = wishlist.filter((item: any) => item.productId !== productId);
                    await AsyncStorage.setItem('wishlistItems', JSON.stringify(updated));
                    setIsFavorite(false);
                    ToastAndroid.show('Removed from Wishlist 🤍', ToastAndroid.SHORT);
                }
                return;
            }

            const user = JSON.parse(userString);
            const payload = {
                userId: user.userId,
                productId: productId,
                variantId: variantId,
                createdAt: new Date().toISOString(),
            };

            if (!isFavorite) {
                const response = await apiClient.post('v1/wishlist', payload);
                console.log(" Wishlist Add Response:", response.data);
                setIsFavorite(true);
                setWishlistId(response.data.wishlistId);
                ToastAndroid.show('Added to Wishlist ❤️', ToastAndroid.SHORT);
            } else {
                const response = await apiClient.delete(`v1/wishlist/${wishlistId}`);
                console.log(" Wishlist Delete Response:", response.data);
                setIsFavorite(false);
                ToastAndroid.show('Removed from Wishlist 🤍', ToastAndroid.SHORT);
            }

        } catch (error) {
            console.error("Wishlist error:", error);
            ToastAndroid.show('Error updating wishlist', ToastAndroid.SHORT);
        }
    };



    const renderSizeItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => setSelectedSize(item)}
            style={[
                styles.sizeBox,
                selectedSize === item && styles.selectedBox,
            ]}
        >
            <Text
                style={[
                    styles.sizeText,
                    selectedSize === item && styles.selectedText,
                ]}
            >
                {item}
            </Text>
        </TouchableOpacity>
    );




    const fetchReviews = async () => {
        try {
            const res = await apiClient.get(`v1/productReview?productId=${productId}&variantId=${variantId}`);
            setReviews(res.data || []);
        } catch (err) {
            ToastAndroid.show('Failed to load reviews', ToastAndroid.SHORT);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const visibleReviews = showAll ? reviews : reviews.slice(0, 3);

    const formatDate = (iso: string) => {
        const date = new Date(iso);
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>

                <Text style={styles.title}>{productName}</Text>
                <Text style={styles.description}>{description}</Text>

                <Animated.View
                    style={[
                        styles.animatedViewContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        }
                    ]}>
                    <FlatList
                        key={productId}
                        data={images}
                        horizontal
                        pagingEnabled
                        snapToInterval={width}
                        decelerationRate="fast"
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(_, index) => index.toString()}
                        onMomentumScrollEnd={(e) => {
                            const index = Math.round(e.nativeEvent.contentOffset.x / width);
                            setActiveIndex(index);
                        }}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => navigation.navigate('FullScreenImage', { images, index })}
                            >
                                <Image
                                    source={typeof item === 'string' ? { uri: item } : item}
                                    style={styles.image}
                                    resizeMode="cover"
                                />

                            </TouchableOpacity>
                        )}
                    />

                    <View style={styles.pagination}>
                        {images.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.enhancedDot,
                                    activeIndex === index && styles.enhancedActiveDot
                                ]}
                            />
                        ))}
                    </View>
                    <View style={styles.iconRow}>
                        <TouchableOpacity onPress={handleWishlistToggle}>
                            {isFavorite ? (
                                <Foundation name="heart" color="red" size={24} />
                            ) : (
                                <AntDesign name="hearto" color="#212121" size={24} />
                            )}
                        </TouchableOpacity>

                        <ShareComponent productId={productId} productName={productName} description={description} image={images} />
                    </View>
                </Animated.View>



                <Text style={styles.productName}>{productName}</Text>

                <View style={styles.Varientcontainer}>
                    {variants?.map((variant, index) => (
                        <VarientProduct
                            key={index}
                            imageUrl={variant.variantImage?.[0]?.imageUrl}
                            price={variant.price}
                            isSelected={selectedVariantIndex === index}
                            onPress={() => handleVariantSelect(index)}
                        />
                    ))}

                </View>


                {categoryName === 'Cloths' && (
                    <View style={styles.Sizecontainer}>
                        <Text style={styles.label}>Size: {selectedSize}</Text>
                        <FlatList
                            data={sizes}
                            renderItem={renderSizeItem}
                            keyExtractor={(item) => item}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
                )}





                <View style={styles.amountContainer}>
                    <Entypo name="star" color="#FFE70C" size={15} />
                    <Text style={styles.review}>4.2 (3243 Reviews)</Text>
                    <View style={styles.right}>
                        <Text style={styles.offer}>{discount}%</Text>
                        <Text style={styles.price}>₹{selectedVariant.price}</Text>
                    </View>
                </View>
                <Text style={styles.header}>Description</Text>
                <Text style={styles.bottomDescription}>{description}</Text>



                {/* <TouchableOpacity style={styles.addToCartBtn} onPress={handleClick}>
                    <Text style={styles.btnText}>Add to Cart</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.buyNowBtn}
                    onPress={async () => {
                        const selectedProduct = {
                            id,
                            productName,
                            description,
                            image: images,
                            price: selectedVariant.price,
                            originalPrice: selectedVariant.originalPrice || originalPrice,
                            offer: selectedVariant.offer || offer,
                            discount: selectedVariant.discount || discount,
                            selectedVariantId: selectedVariant.variantId,
                            sku: selectedVariant.sku
                        };

                        console.log("Selected Product store Ays:", selectedProduct);

                        await AsyncStorage.setItem('selectedProduct', JSON.stringify(selectedProduct));
                        await AsyncStorage.removeItem('selectedCartItems');

                        if (isLoggedIn) {
                            navigation.navigate('DeliveryAddress');
                            // navigation.navigate('CheckOut')
                        } else {
                            navigation.navigate('Main', { screen: 'Profile' });
                        }
                    }}
                >
                    <Text style={styles.buyNowText}>Buy Now</Text>
                </TouchableOpacity>
 */}

                {/* Enhanced Reviews Section */}

                {visibleReviews.length > 0 && (
                    <Animated.View
                        style={[
                            styles.enhancedReviewsSection,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <>
                            {/* Header */}
                            <View style={styles.reviewsHeader}>
                                <View style={styles.reviewsHeaderLeft}>
                                    <MaterialIcons name="rate-review" size={24} color="#0077CC" />
                                    <Text style={styles.reviewsHeaderTitle}>Customer Reviews</Text>
                                </View>
                            </View>

                            {/* Reviews List */}
                            {visibleReviews.map((review) => (
                                <View key={review.productReviewId} style={styles.enhancedReviewCard}>
                                    {/* --- Review Images (clickable) --- */}
                                    {review.imagesList && review.imagesList.length > 0 && (
                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            style={styles.reviewImagesScroll}
                                            contentContainerStyle={{ paddingVertical: 4 }}
                                        >
                                            {review.imagesList.map((imgObj, index) => (
                                                <TouchableOpacity
                                                    key={index.toString()}
                                                    onPress={() =>
                                                        navigation.navigate('ReviewFullImage', { review })
                                                    }
                                                >
                                                    <Image
                                                        source={{ uri: imgObj.imageUrl }}
                                                        style={styles.reviewImage}
                                                        resizeMode="cover"
                                                    />
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    )}

                                    <View style={styles.reviewHeader}>
                                        <View style={styles.reviewerInfo}>
                                            <View style={styles.reviewerDetails}>
                                                <View style={styles.reviewerNameRow}>
                                                    <Text style={styles.enhancedReviewerName}>{review.username}</Text>
                                                    <View style={styles.verifiedBadge}>
                                                        <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                                                        <Text style={styles.verifiedText}>Verified</Text>
                                                    </View>
                                                </View>
                                                <StarDisplay rating={review.rating} />
                                            </View>
                                        </View>

                                        <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
                                    </View>

                                    <Text style={styles.enhancedReviewText}>{review.reviewText}</Text>
                                </View>
                            ))}



                            {/* Load More Button */}
                            {reviews.length > 3 && !showAll && (
                                <TouchableOpacity onPress={() => setShowAll(true)} style={styles.loadMoreReviewsButton}>
                                    <Text style={styles.loadMoreReviewsText}>
                                        Load More Reviews ({reviews.length - 3} remaining)
                                    </Text>
                                    <MaterialIcons name="keyboard-arrow-down" size={20} color="#0077CC" />
                                </TouchableOpacity>
                            )}
                        </>
                    </Animated.View>
                )}

                {/* Write Review Modal always mounted */}
                {/* <WriteReviewModal
                    visible={modalVisible}
                    onClose={() => {
                        setModalVisible(false);
                        fetchReviews();
                    }}
                    productId={productId}
                    variantId={productId}
                    userId={userId ?? null}
                /> */}



                {/* <Text style={styles.originalAmount}>₹{originalPrice}</Text> */}



                {suggestedProducts.length > 0 && (
                    <>
                        <View style={styles.subcontainer}>
                            <Text style={styles.header}>You Might also like</Text>
                        </View>

                        <FlatList
                            data={suggestedProducts}
                            horizontal
                            keyExtractor={(item) => item.productId.toString()}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 80 }}
                            renderItem={({ item }) => (
                                <SeparateProductCards
                                    productId={item.productId}
                                    variantId={item.variants?.variantId}
                                    image={item.variants?.variantImage?.[0]?.imageUrl}
                                    product={item.title}
                                    price={item.variants?.price}
                                    rating={item.variants?.reviewSummary?.averageRating ?? 0}
                                />
                            )}
                        />
                    </>
                )}


            </ScrollView>

            {/* Enhanced Bottom Buttons */}
            <View style={[styles.enhancedBottomButtons, { paddingBottom: insets.bottom || 12 }]}>
                <TouchableOpacity
                    style={styles.enhancedCartBtn}
                    onPress={handleClick}
                    activeOpacity={0.8}
                >
                    <MaterialIcons name="shopping-cart" size={20} color="#0077CC" />
                    <Text style={styles.enhancedCartText}>Add to Cart</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.enhancedBuyBtn}
                    onPress={async () => {
                        const selectedProduct = {
                            productId,
                            productName,
                            description,
                            image: images,
                            price: selectedVariant.price,
                            originalPrice: selectedVariant.originalPrice || originalPrice,
                            offer: selectedVariant.offer || offer,
                            discount: selectedVariant.discount || discount,
                            selectedVariantId: selectedVariant.variantId,
                            sku: selectedVariant.sku,
                            size: selectedSize
                        };

                        await AsyncStorage.setItem('selectedProduct', JSON.stringify(selectedProduct));
                        await AsyncStorage.removeItem('selectedCartItems');

                        if (isLoggedIn) {
                            navigation.navigate('DeliveryAddress');
                        } else {
                            navigation.navigate('Main', {
                                screen: 'Profile',
                                params: { from: 'SeparateProductPage', productId }
                            });
                        }
                    }}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#0077CC', '#0056B3']}
                        style={styles.buyButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <MaterialIcons name="flash-on" size={20} color="#FFFFFF" />
                        <Text style={styles.enhancedBuyText}>Buy Now</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>


        </SafeAreaView>
    );
};

export default SeparateProduct;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 8,
        paddingTop: 15
    },
    animatedViewContainer: {
        width: '100%',
        borderRadius: 20,
        borderColor: "#D9D9D9",
        borderWidth: 1,
        overflow: 'hidden',
    },
    productImage: {
        width: 50,
        height: 60,
        borderRadius: 6,
        marginRight: 10,
    },
    // Enhanced Header Styles
    enhancedHeader: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        marginHorizontal: 8,
        marginVertical: 12,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 119, 204, 0.05)',
    },
    enhancedTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1A1A1A',
        marginBottom: 8,
        lineHeight: 32,
    },
    enhancedDescription: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666666',
        lineHeight: 24,
        // marginLeft:8
    },
    // Enhanced Carousel Styles
    enhancedCarouselContainer: {
        marginHorizontal: 8,
        marginVertical: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0, 119, 204, 0.08)',
        paddingTop: 8
    },
    imageContainer: {
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
    },
    enhancedImage: {
        width: width - 62,
        height: 280,
        borderRadius: 20,
        marginHorizontal: 15,
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 15,
        right: 15,
        height: 60,
    },
    enhancedPagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    enhancedDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#E5E7EB',
    },
    enhancedActiveDot: {
        backgroundColor: '#0077CC',
        width: 24,
        height: 8,
        borderRadius: 4,
    },
    enhancedIconRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    iconButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    // Enhanced Variants Styles
    enhancedVariantsSection: {
        marginHorizontal: 8,
        marginVertical: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 119, 204, 0.05)',
    },
    variantsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    variantsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        marginLeft: 8,
    },
    enhancedVarientcontainer: {
        flexDirection: 'row',
        gap: 16,
        flexWrap: 'wrap',
    },
    // Enhanced Price Section Styles
    enhancedPriceSection: {
        marginHorizontal: 8,
        marginVertical: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 119, 204, 0.05)',
    },
    ratingSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    starContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8E1',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 12,
    },
    enhancedReview: {
        fontSize: 16,
        fontWeight: '700',
        color: '#F57C00',
        marginLeft: 4,
    },
    reviewCount: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666666',
    },
    priceSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    discountBadge: {
        backgroundColor: '#FF4757',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 12,
        marginBottom: 8,
    },
    discountText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    enhancedPrice: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1A1A1A',
        marginRight: 12,
    },
    originalPrice: {
        fontSize: 18,
        fontWeight: '600',
        color: '#999999',
        textDecorationLine: 'line-through',
    },
    // Enhanced Bottom Buttons
    enhancedBottomButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderColor: '#ccc',
        position: 'absolute',
        bottom: 3,
        width: '100%',
        gap: 12,

    },
    enhancedCartBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#0077CC',
        gap: 8,
    },
    enhancedCartText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0077CC',
    },
    enhancedBuyBtn: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#0077CC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    buyButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    enhancedBuyText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    // Original styles (keeping for compatibility)
    originalContainer: {
        flex: 1,
        margin: 5
    },
    title: {
        fontWeight: "900",
        fontSize: 18,
        paddingLeft: 5,
        color: "#2A2A2A",
        // paddingTop: 4,
    },
    description: {
        fontWeight: "600",
        fontSize: 14,
        paddingLeft: 5,
        color: "#666666",
        paddingVertical: 8,
        marginBottom: 6
    },
    carouselContainer: {
        marginTop: 10,
        borderColor: "#D9D9D9",
        borderWidth: 1,
        padding: 1,
        borderRadius: 10,
    },
    image: {
        width: width - 18,
        height: 290,
        borderRadius: 12,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
        gap: 6
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
        backgroundColor: '#ccc',
    },
    activeDot: {
        backgroundColor: '#00A2F4',
    },
    iconRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 15,
        marginVertical: 10,
    },
    productName: {
        fontWeight: "900",
        fontSize: 14,
        paddingLeft: 5,
        color: "#2A2A2A",
        marginTop: 20,
    },
    amountContainer: {
        flexDirection: "row",
        padding: 5,
        marginTop: 2,
        alignItems: 'center'
    },
    reviewImagesScroll: {
        marginVertical: 8,
        marginTop: -12,
    },
    review: {
        paddingLeft: 4,
        color: "#666666",
        fontSize: 12,
        fontWeight: "600",
    },
    right: {
        flexDirection: "row",
        paddingLeft: 90,
        gap: 8
    },
    offer: {
        textAlign: "right",
        top: 7,
        fontSize: 16,
    },
    price: {
        fontWeight: "800",
        color: "#2A2A2A",
        fontSize: 28,
    },
    originalAmount: {
        textAlign: "right",
        color: "#8F8F8F",
        fontWeight: "600",
        textDecorationLine: "line-through",
        paddingRight: 14,
    },
    header: {
        paddingLeft: 8,
        color: "#2A2A2A",
        fontWeight: "800",
        fontSize: 16,
        marginTop: 10,
        marginBottom: 2

    },
    bottomDescription: {
        fontWeight: "600",
        fontSize: 12,
        paddingLeft: 8,
        color: "#666666",
        paddingVertical: 8
    },
    addToCartBtn: {
        backgroundColor: "#E3F2FF",
        borderRadius: 8,
        padding: 10,
        margin: 10,
    },
    btnText: {
        textAlign: "center",
        color: "#535353",
        fontWeight: "700",
        fontSize: 12,
    },
    buyNowBtn: {
        backgroundColor: "#00A2F4",
        borderRadius: 8,
        padding: 10,
        margin: 10,
        marginBottom: 20,
    },
    buyNowText: {
        textAlign: "center",
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 12,
    },
    Varientcontainer: {
        flexDirection: 'row',
        gap: 16,
        paddingTop: 12,
        // padding: 8,
    },
    subcontainer: {
        marginTop: 10
    },
    Sizecontainer: {
        marginTop: 10,
        paddingLeft: 6
        // paddingHorizontal: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    sizeRow: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'space-between',
    },
    sizeBox: {
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#f2f2f2',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginRight: 6,
        minWidth: 50,
        alignItems: 'center',
    },
    selectedBox: {
        backgroundColor: '#00A2F4',
        borderColor: '#00A2F4',
    },
    sizeText: {
        fontSize: 14,
        color: '#333',
    },
    selectedText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    reviewButton: {
        alignSelf: 'flex-end',
        backgroundColor: "#00A2F4",
        paddingVertical: 8,
        paddingHorizontal: 5,
        borderRadius: 6,
        marginRight: 10,
    },
    reviewButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },

    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    card: {
        backgroundColor: '#f9f9f9',
        marginTop: 10,
        padding: 10,
        borderRadius: 8
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4
    },
    name: {
        fontWeight: 'bold',
        marginRight: 6
    },
    badge: {
        backgroundColor: 'green',
        borderRadius: 10,
        padding: 4
    },
    descriptions: {
        marginTop: 6,
        fontSize: 14
    },
    date: {
        marginTop: 4,
        fontSize: 12,
        color: 'gray'
    },
    loadMore: {
        marginTop: 10,
        alignItems: 'center'
    },
    loadMoreText: {
        color: 'blue'
    },
    bottomButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderColor: '#ccc',
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },

    scrollContent: {
        paddingBottom: 100,
    },
    cartBtn: {
        flex: 1,
        marginRight: 5,
        backgroundColor: "#E3F2FF",
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
    },
    buyBtn: {
        flex: 1,
        marginLeft: 5,
        backgroundColor: "#00A2F4",
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
    },
    addtocartbtnText: {
        textAlign: "center",
        color: "#535353",
        fontWeight: "700",
        fontSize: 12,
    },
    buyBtnText: {
        textAlign: "center",
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 12,
    },
    placeholderContainer: {
        height: 280,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        marginHorizontal: 15,
    },
    placeholderText: {
        color: '#94A3B8',
        fontSize: 16,
        fontWeight: '500',
        marginTop: 12,
    },
    // Enhanced Reviews Section Styles
    enhancedReviewsSection: {
        marginHorizontal: 2,
        marginVertical: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 0,
    },


    reviewsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    reviewsHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reviewsHeaderTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1A1A1A',
        marginLeft: 8,
    },
    writeReviewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0077CC',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    writeReviewButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    enhancedReviewCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    reviewerInfo: {
        flexDirection: 'row',
        flex: 1,
    },
    reviewerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#0077CC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    reviewerInitial: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    reviewImagesContainer: {
        flexDirection: 'row',
        marginBottom: 6,
        gap: 6,
    },
    reviewImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 8,
        borderWidth: 0.5,
        borderColor: '#ccc',
    },
    reviewerDetails: {
        flex: 1,
    },
    reviewerNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    enhancedReviewerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginRight: 8,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        gap: 2,
    },
    verifiedText: {
        color: '#10B981',
        fontSize: 10,
        fontWeight: '600',
    },
    reviewDate: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    enhancedReviewText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
        fontWeight: '400',
    },
    loadMoreReviewsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F5F9',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginTop: 8,
        gap: 6,
    },
    loadMoreReviewsText: {
        color: '#0077CC',
        fontSize: 14,
        fontWeight: '600',
    },
    noReviewsContainer: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 20,
    },
    noReviewsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginTop: 12,
        marginBottom: 4,
    },
    noReviewsSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 20,
    },
    writeFirstReviewButton: {
        backgroundColor: '#0077CC',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
    },
    writeFirstReviewButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    }
});
