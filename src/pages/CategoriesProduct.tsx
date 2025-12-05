import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, ImageSourcePropType, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import AntDesign from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from "../services/apiBaseUrl";
import { TabParamList } from "../components/SeparateProduct";
import Product from "../components/home/Product";
import { getProductThumbnail } from "../utils/ProductImageHelper";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import UnifiedHeader from "../components/common/UnifiedHeader";


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

interface TopSellerProductItem {
    id: number;
    productName: string;
    image: any[];
    price: number;
    originalPrice: number;
    offer: number;
    discount: number;
    selectedSize?: string;
}

type RootStackParamList = {
    CategoriesProduct: {
        categoryId: number;
        categoryName?: string;
        category?: string;
        product?: ProductType;
        searchProduct?: ProductType;
        TopSellerProductItem?: TopSellerProductItem;
        selectedVariantId?: number;
    };
    ProductDetails: {
        product: any;
    };
    Main: {
        screen: keyof TabParamList;
        params?: undefined;
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

    Profile: undefined;
    SubCategoriesListOfProducts: {
        categoryId: number;
        category: string;
        product?: any;
    };
};

type CartRouteProp = RouteProp<RootStackParamList, 'CategoriesProduct'>;

type Option = {
    id: number;
    label: string;
};



const CategoriesProduct = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'CategoriesProduct'>>();
    const route = useRoute<CartRouteProp>();

    const categoryId = route.params?.categoryId;
    const parentCategoryName = route.params?.category;

    const categoryName = route.params?.categoryName;
    const passedProduct = route.params?.product;
    const passedVariantId = route.params?.selectedVariantId;
    const routes = useRoute<RouteProp<RootStackParamList, 'CategoriesProduct'>>();
    const { product } = routes.params;
    const { searchProduct } = routes.params;
    console.log("SearchProduct", searchProduct)

    const [products, setProducts] = useState<ProductType[]>([]);
    const selectedProducts = products.filter(p => p.categoryId === categoryId);


    const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
    const [loading, setLoading] = useState(true);
    const handleClick = () => navigation.goBack();

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');

    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedSection, setSelectedSection] = useState('Category');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
    const [isPriceFiltered, setIsPriceFiltered] = useState(false);
    console.log("ispriceFiltered",isPriceFiltered)
    const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
    // const [selectedTag, setSelectedTag] = useState<number | null>(null);
    // const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);

    const [startPrice, setStartPrice] = useState<number | null>(null);
    const [endPrice, setEndPrice] = useState<number | null>(null);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchText, setSearchText] = useState('');
    const typingTimeoutRef = useRef<number | null>(null);




    const [filteredProducts, setFilteredProducts] = useState([]);
    const [noProduct, setNoProduct] = useState(false);



    const sortOptions = [
        'New Arrivals',
        'Price (Low to High)',
        'Price (High to Low)',
        'Ratings',
        'Discount',
    ];

    const categoryOptions = ['Necklace', 'Bangles', 'Ring', 'Earring'];
    const brandOptions: Option[] = [
        { id: 1, label: 'Tiffany & Co' },
        { id: 2, label: 'Pandora' },
        { id: 3, label: 'Swarovski' },
    ];

    const tags: Option[] = [
        { id: 1, label: "Limited Edition" },
        { id: 2, label: "Bestseller" },]



    const Collection = ['New Arrival Products', 'Featured Products']
    const priceOptions = ['Under ₹100', '₹100-₹200', '₹200-₹500', 'Above ₹500'];
    const Rating = ["2.0 and above", "3.0 and above", "3.5 and above", "4.0 and above"]


    const filterSections: string[] = [
        'Category',
        'Price',
        'Material',
        'Brand',
        'Tags',
        'Collection',
        'Size',
        'Rating',
        'Discount',
    ];


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


    const toggleBrand = (id: number) => {
        const newBrand = selectedBrand === id ? null : id;
        setSelectedBrand(newBrand);

        fetchFilteredProducts(
            startPrice,
            endPrice,
            newBrand ? [newBrand] : [],
            selectedTags
        );
    };



    const toggleTag = (id: number) => {
        setSelectedTags(prev => {
            const newTags = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
            fetchFilteredProducts(
                startPrice,
                endPrice,
                selectedBrand ? [selectedBrand] : [],
                newTags
            );
            return newTags;
        });
    };





    const getSelectedCount = (section: string) => {
        switch (section) {
            case 'Category':
                return selectedCategories.length;
            case 'Price':
                return selectedPrices.length;
            case 'Brand':
                return selectedBrand ? 1 : 0;

            case 'Tags':
                return selectedTags.length;
            default:
                return 0;
        }
    };


    const clearStoredProduct = async () => {
        try {
            await AsyncStorage.removeItem('lastSelectedProduct');
        } catch (e) {
            console.error('Error clearing stored product:', e);
        }
    };

    const storeProduct = async (product: ProductType) => {
        try {
            await AsyncStorage.setItem('lastSelectedProduct', JSON.stringify(product));
        } catch (e) {
            console.error('Error saving product to storage:', e);
        }
    };


    useEffect(() => {
        const setOrLoadProduct = async () => {
            if (passedProduct) {
                const variantIdToUse = passedVariantId ?? passedProduct.variants?.[0]?.variantId ?? null;

                if (variantIdToUse) {
                    const newSelected = { ...passedProduct, selectedVariantId: variantIdToUse };
                    setSelectedProduct(newSelected);
                    await storeProduct(newSelected);
                } else {
                    setSelectedProduct(null);
                    await clearStoredProduct();
                }
            } else {

                try {
                    const json = await AsyncStorage.getItem('lastSelectedProduct');
                    if (json) {
                        const savedProduct: ProductType = JSON.parse(json);
                        if (savedProduct.categoryId === categoryId) {
                            setSelectedProduct(savedProduct);
                        } else {
                            await clearStoredProduct();
                            setSelectedProduct(null);
                        }
                    }
                } catch (e) {
                    console.error('Error loading product from storage:', e);
                }
            }
        };

        setOrLoadProduct();
    }, [passedProduct, passedVariantId, categoryId]);


    const toggleCategory = (item: string) => {
        setSelectedCategories((prev) =>
            prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
        );
    };

    // const togglePrice = (item: string) => {
    //     setSelectedPrices((prev) =>
    //         prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    //     );
    // };

    const filteredSections = filterSections.filter(section => {
        if (section === 'Size') {
            return selectedCategories.includes('Bangles') || selectedCategories.includes('Ring');
        }
        return true;
    });


    useEffect(() => {
        console.log('Filters Updated →', {
            startPrice,
            endPrice,
            selectedBrand,
            selectedTags,
        });
    }, [startPrice, endPrice, selectedBrand, selectedTags]);





    const getPriceRange = (label: string): { startPrice: number; endPrice: number } | null => {
        switch (label) {
            case 'Under ₹100':
                return { startPrice: 0, endPrice: 99 };
            case '₹100-₹200':
                return { startPrice: 100, endPrice: 200 };
            case '₹200-₹500':
                return { startPrice: 200, endPrice: 500 };
            case 'Above ₹500':
                return { startPrice: 501, endPrice: 100000 };
            default:
                return null;
        }
    };


    const togglePrice = async (item: string) => {
        setSelectedPrices((prev) => {
            if (prev.includes(item)) {
                return prev.filter((i) => i !== item);
            } else {
                return [...prev, item];
            }
        });

        const range = getPriceRange(item);

        if (range && range.startPrice !== undefined && range.endPrice !== undefined) {
            setStartPrice(range.startPrice);
            setEndPrice(range.endPrice);

            try {
                // 1️⃣ FIRST: fetch new filtered products
                await fetchFilteredProducts(
                    range.startPrice,
                    range.endPrice,
                    selectedBrand ? [selectedBrand] : [],
                    selectedTags
                );

                // 2️⃣ NOW turn on price filter (after fetch)
                setIsPriceFiltered(true);

            } catch (error) {
                console.error("Failed to fetch:", error);
                setFilteredProducts([]);
                setIsPriceFiltered(false);
            }

        } else {
            // deselect case
            setStartPrice(null);
            setEndPrice(null);
            setFilteredProducts([]);
            setIsPriceFiltered(false);
        }
    };

    


    useEffect(() => {
        if (selectedPrices.length === 0 && !selectedBrand && selectedTags.length === 0) {
            setStartPrice(null);
            setEndPrice(null);
            setFilteredProducts([]);
            setIsPriceFiltered(false);
            return;
        }

        let minPrice = Infinity;
        let maxPrice = -Infinity;

        selectedPrices.forEach((priceLabel) => {
            const range = getPriceRange(priceLabel);
            if (range) {
                if (range.startPrice < minPrice) minPrice = range.startPrice;
                if (range.endPrice > maxPrice) maxPrice = range.endPrice;
            }
        });

        setStartPrice(minPrice !== Infinity ? minPrice : null);
        setEndPrice(maxPrice !== -Infinity ? maxPrice : null);
        setIsPriceFiltered(true);

        fetchFilteredProducts(
            minPrice !== Infinity ? minPrice : null,
            maxPrice !== -Infinity ? maxPrice : null,
            selectedBrand ? [selectedBrand] : [],
            selectedTags
        );
    }, [selectedPrices, selectedBrand, selectedTags]);



    const fetchFilteredProducts = async (
        start: number | null,
        end: number | null,
        brands: number[],
        tags: number[]
    ) => {
        setLoading(true);
        setNoProduct(false);

        console.log("fetchFilteredProducts")
        try {
            let url = `v2/products/filter?categoryId=${categoryId}`;
            console.log("filterURL", url)

            if (start !== null && end !== null) {
                url += `&startPrice=${start}&endPrice=${end}`;
            }

            if (brands.length > 0) {
                url += `&brandId=${brands[0]}`;
            }





            if (tags.length > 0) {
                url += `&tags=${tags.join(',')}`;
            }

            console.log("filterUrl →", url);

            const res = await apiClient.get(url);

            const normalized = res.data.map((item: any) => ({
                ...item,
                variants: [item.variants],
            }));

            if (normalized.length === 0) {
                setNoProduct(true);
            }
            setFilteredProducts(normalized);
            console.log("FilterProducts", normalized)
        } catch (err) {
            console.error('Error:', err);
            setNoProduct(true);
        }

        setLoading(false);
    };

    const handleClearCurrentSection = () => {
        switch (selectedSection) {
            case 'Category':
                setSelectedCategories([]);
                break;
            case 'Price':
                setSelectedPrices([]);
                setStartPrice(null);
                setEndPrice(null);
                setIsPriceFiltered(false);
                break;
            case 'Brand':
                setSelectedBrand(null);
                break;
            case 'Tags':
                setSelectedTags([]);
                break;
            default:
                break;
        }

        // Re-fetch products after clearing this section
        fetchFilteredProducts(
            startPrice,
            endPrice,
            selectedBrand ? [selectedBrand] : [],
            selectedTags
        );
    };


    const handleClearFilters = () => {
        setSelectedCategories([]);
        setSelectedPrices([]);
        setSelectedBrand(null);
        setSelectedTags([]);
        setIsPriceFiltered(false);
        setFilteredProducts([]);
    };


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
            console.log("SearchWordd", data);

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




    const renderRightContent = () => {
        if (selectedSection === 'Category') {
            return (
                <>
                    <Text style={styles.sectionTitle}>Category</Text>
                    {categoryOptions.map((item) => (
                        <Pressable
                            key={item}
                            style={styles.checkboxRow}
                            onPress={() => toggleCategory(item)}
                        >
                            <View style={styles.checkboxOuter}>
                                {selectedCategories.includes(item) && (
                                    <View style={styles.checkboxInner}>
                                        <MaterialIcons name="check" size={16} color="#fff" />
                                    </View>
                                )}
                            </View>
                            <Text style={styles.checkboxLabel}>{item}</Text>
                        </Pressable>
                    ))}
                </>
            );
        } else if (selectedSection === 'Price') {
            return (
                <>
                    <Text style={styles.sectionTitle}>Price</Text>
                    <View style={styles.priceGrid}>
                        {priceOptions.map((price, index) => (
                            <Pressable
                                key={index}
                                style={[
                                    styles.priceBox,
                                    selectedPrices.includes(price) && styles.priceBoxSelected,
                                ]}
                                onPress={() => togglePrice(price)}
                            >
                                <Text
                                    style={{
                                        color: selectedPrices.includes(price) ? '#0077CC' : '#000',
                                        fontSize: 12
                                    }}
                                >
                                    {price}
                                </Text>
                            </Pressable>
                        ))}

                    </View>


                </>
            );
        } else if (selectedSection === "Brand") {
            return (
                <>
                    <Text style={styles.sectionTitle}>Brand</Text>
                    {brandOptions.map((item) => (
                        <Pressable
                            key={item.id}
                            style={styles.checkboxRow}
                            onPress={() => toggleBrand(item.id)}
                        >
                            <View style={styles.checkboxOuter}>
                                {selectedBrand === item.id && (
                                    <View style={styles.checkboxInner}>
                                        <MaterialIcons name="check" size={16} color="#fff" />
                                    </View>
                                )}
                            </View>
                            <Text style={styles.checkboxLabel}>{item.label}</Text>
                        </Pressable>
                    ))}

                </>
            );
        } else if (selectedSection === "Tags") {
            return (
                <>
                    <Text style={styles.sectionTitle}>Tags</Text>
                    <View style={styles.priceGrid}>
                        {tags.map((item) => (
                            <Pressable
                                key={item.id}
                                style={[
                                    styles.priceBox,
                                    selectedTags.includes(item.id) && styles.priceBoxSelected,
                                ]}
                                onPress={() => toggleTag(item.id)}
                            >
                                <Text
                                    numberOfLines={1}
                                    style={{
                                        color: selectedTags.includes(item.id) ? '#0077CC' : '#000',
                                        fontSize: 12,
                                    }}
                                >
                                    {item.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </>
            );
        }

        else if (selectedSection === 'Collection') {
            return (
                <>
                    <Text style={styles.sectionTitle}>Collection</Text>
                    {Collection.map((item) => (
                        <Pressable
                            key={item}
                            style={styles.checkboxRow}
                            onPress={() => toggleCategory(item)}
                        >
                            <View style={styles.checkboxOuter}>
                                {selectedCategories.includes(item) && (
                                    <View style={styles.checkboxInner}>
                                        <MaterialIcons name="check" size={16} color="#fff" />
                                    </View>
                                )}
                            </View>
                            <Text style={styles.checkboxLabel}>{item}</Text>
                        </Pressable>
                    ))}
                </>
            )
        } else if (selectedSection === "Size") {
            const sizeOptions: { [key: string]: string[] } = {
                Bangles: ['2.2', '2.4', '2.6', '2.8'],
                Ring: ['5', '6', '7', '8', '9'],
            };


            const availableSizes = selectedCategories.flatMap((category) =>
                sizeOptions[category] || []
            );

            const uniqueSizes = [...new Set(availableSizes)];

            return (
                <>
                    <Text style={styles.sectionTitle}>Size</Text>
                    {uniqueSizes.map((item) => (
                        <Pressable
                            key={item}
                            style={styles.checkboxRow}
                            onPress={() => toggleCategory(item)}
                        >
                            <View style={styles.checkboxOuter}>
                                {selectedCategories.includes(item) && (
                                    <View style={styles.checkboxInner}>
                                        <MaterialIcons name="check" size={16} color="#fff" />
                                    </View>
                                )}
                            </View>
                            <Text style={styles.checkboxLabel}>{item}</Text>
                        </Pressable>
                    ))}
                </>
            );
        } else if (selectedSection === "Rating") {
            return (
                <>
                    <Text style={styles.sectionTitle}>Rating</Text>
                    {Rating.map((item) => (
                        <Pressable
                            key={item}
                            style={styles.checkboxRow}
                            onPress={() => toggleCategory(item)}
                        >
                            <View style={styles.checkboxOuter}>
                                {selectedCategories.includes(item) && (
                                    <View style={styles.checkboxInner}>
                                        <MaterialIcons name="check" size={16} color="#fff" />
                                    </View>
                                )}
                            </View>
                            <Text style={styles.checkboxLabel}>{item}</Text>
                        </Pressable>
                    ))}
                </>
            )
        }

        else {
            return (
                <Text style={styles.sectionTitle}>
                    {selectedSection} (Coming Soon...)
                </Text>
            );
        }
    };

    

    return (
        <View style={styles.container}>
            <UnifiedHeader
                title={categoryName
                    ? categoryName === 'Beauty'
                        ? 'Beauty Product'
                        : categoryName
                    : 'Products'}
                showBackButton={true}
                showSearch={true}
                searchText={searchText}
                onSearchChange={setSearchText}
                onSearchSubmit={() => {
                    if (searchText.trim()) {
                        handleSearch();
                        setSearchText('');
                        setIsSearchActive(false);
                    }
                }}
                onSearchToggle={() => setIsSearchActive(!isSearchActive)}
                onBackPress={handleClick}
                isSearchActive={isSearchActive}
                headerStyle="default"
            />


            {categoryName && (
                <View style={styles.sortContainer}>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => setModalVisible(true)}
                    >
                        <MaterialIcons name="import-export" color="#000" size={24} />
                        <Text style={{ marginLeft: 1 }}>Sort</Text>
                    </TouchableOpacity>
                    <View style={styles.breakLine}></View>
                    <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                        <Text>Category</Text>
                        <FontAwesome name="angle-down" color="#000" size={24} />
                    </TouchableOpacity>
                    <View style={styles.breakLine}></View>
                    <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                        <Text>Gender</Text>
                        <FontAwesome name="angle-down" color="#000" size={24} />
                    </TouchableOpacity>
                    <View style={styles.breakLine}></View>
                    <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 2 }} onPress={() => setFilterModalVisible(true)}>
                        <Ionicons name="filter-outline" color="#000" size={20} />
                        <Text>Filters</Text>
                    </TouchableOpacity>
                </View>
            )}



            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#0077CC" />
                </View>
            )
                : noProduct ? (
                    <Text style={{ textAlign: 'center', marginTop: 30 }}>No products found.</Text>
                )

                    : categoryName ? (
                        <View style={{ flex: 1 }}>
                            <FlatList
                                data={Array.isArray(searchProduct) ? searchProduct : (isPriceFiltered ? filteredProducts : selectedProducts)}
                                keyExtractor={(item) => item.productId.toString()}
                                numColumns={2}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 50, paddingHorizontal: 8, paddingTop: 8 }}
                                renderItem={({ item }) => {
                                    const variant = item.variants?.[0];
                                    return (
                                        <Product
                                            productId={item.productId}
                                            categoryName={parentCategoryName}
                                            image={
                                                getProductThumbnail(item)
                                                    ? [{ uri: getProductThumbnail(item) }]
                                                    : item.variants?.variantImage?.length > 0
                                                        ? [{ uri: item.variants.variantImage[0].imageUrl }]
                                                        : []
                                            }
                                            productName={item.title}
                                            price={variant?.price ?? item.variants.price}
                                            originalPrice={item.originalPrice || item.price}
                                            variantId={variant?.variantId}
                                            discount={item.discount || 0}
                                            deliveryStatus="FREE Delivery"
                                            description={item.description}
                                            orderDay="Friday"
                                            offer={item.offer || 0}
                                        />
                                    );
                                }}
                            />
                        </View>
                    ) : null}


            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Sort</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialIcons name="close" size={24} color="black" />
                            </TouchableOpacity>
                        </View>

                        {/* Break Line */}
                        <View style={styles.breakLines} />

                        {sortOptions.map((option, index) => (
                            <Pressable
                                key={index}
                                style={styles.optionRow}
                                onPress={() => setSelectedOption(option)}
                            >
                                <Text style={styles.optionText}>{option}</Text>
                                <View style={styles.radioOuter}>
                                    {selectedOption === option && <View style={styles.radioInner} />}
                                </View>
                            </Pressable>
                        ))}
                    </View>
                </View>
            </Modal>

            <Modal
                visible={filterModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View></View>
                    <View style={styles.FilterModalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filter</Text>
                            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                                <MaterialIcons name="close" size={24} color="black" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.breakLines} />

                        <View style={styles.contentRow}>



                            <View style={styles.leftPanel}>
                                {filteredSections.map((section) => {
                                    const count = getSelectedCount(section);

                                    return (
                                        <Pressable
                                            key={section}
                                            onPress={() => setSelectedSection(section)}
                                            style={[
                                                styles.sectionItem,
                                                selectedSection === section && styles.activeSectionItem,
                                            ]}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Text
                                                    style={{
                                                        color: selectedSection === section ? '#0077CC' : '#555',
                                                        fontWeight: selectedSection === section ? 'bold' : 'normal',
                                                    }}
                                                >
                                                    {section}
                                                </Text>
                                                {count > 0 && (
                                                    <View style={styles.selectedCountBadge}>
                                                        <Text style={styles.selectedCountText}>{count}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </Pressable>
                                    );
                                })}

                                {/* Clear All Button outside the selected highlight */}
                                <TouchableOpacity style={styles.clearAllButton} onPress={handleClearFilters}>
                                    <MaterialIcons name="clear-all" size={20} color="#0077CC" />
                                    <Text style={styles.clearAllText}>Clear All</Text>
                                </TouchableOpacity>
                            </View>


                            <View style={styles.verticalLine} />

                            <View style={{ flex: 1 }}>
                                <ScrollView style={styles.rightPanel} contentContainerStyle={{ paddingBottom: 20 }}>
                                    {renderRightContent()}
                                </ScrollView>

                                <View style={styles.filterActionButtons}>
                                    <TouchableOpacity
                                        style={styles.clearButton}
                                        onPress={handleClearCurrentSection}
                                    >
                                        <Text style={styles.clearText}>Clear</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.doneButton}
                                        onPress={() => setFilterModalVisible(false)}
                                    >
                                        <Text style={styles.doneText}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>


                        </View>

                    </View>
                </View>
            </Modal>
        </View>


    );
};


export default CategoriesProduct;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingBottom: 8,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: '#FFFFFF',
        // borderRadius: 8,
        //   marginVertical: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },

    breakLine: {
        width: 1,
        height: "100%",
        alignSelf: 'stretch',
        backgroundColor: '#ccc',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        padding: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    breakLines: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: 10,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    optionText: {
        fontSize: 16,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#0077CC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#0077CC',
    },
    contentRow: {
        flex: 1,
        flexDirection: 'row',
    },
    leftPanel: {
        width: 120,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingVertical: 4,
        height: "90%"
    },
    sectionItem: {
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    activeSectionItem: {
        backgroundColor: '#fff',
        borderLeftWidth: 3,
        borderColor: '#0077CC',
    },
    selectedCountBadge: {
        backgroundColor: '#0077CC',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    selectedCountText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    clearAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EAF5FF',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#0077CC',
        gap: 4,
        alignSelf: 'flex-start',
        top: 15,
        left: 10
    },
    clearAllText: {
        color: '#0077CC',
        fontWeight: '600',
        fontSize: 12,
    },


    verticalLine: {
        width: 1,
        backgroundColor: '#ccc',
        marginHorizontal: 8,
    },
    rightPanel: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: "#0077CC",
        paddingBottom: 5
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,

    },
    checkboxOuter: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#D3D3D3',
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxInner: {
        width: 20,
        height: 20,
        backgroundColor: '#0077CC',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
    },

    checkboxLabel: {
        fontSize: 15,
    },
    priceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    priceBox: {
        width: '45%',
        padding: 8,
        borderWidth: 1,
        borderRadius: 24,
        borderColor: '#ccc',
        alignItems: 'center',
        marginBottom: 10,
        gap: 1
    },
    priceBoxSelected: {
        borderColor: '#0077CC',
    },
    FilterModalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        padding: 16,
        height: '65%',
    },
    filterActionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingBottom: 20,
        paddingHorizontal: 12,
        top: 22,
        gap: 8
    },

    clearButton: {
        backgroundColor: '#EEE',
        paddingVertical: 8,       // smaller height
        paddingHorizontal: 12,    // smaller width
        borderRadius: 6,          // slightly smaller radius
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,           // spacing between buttons
    },
    doneButton: {
        backgroundColor: '#0077CC',
        paddingVertical: 8,       // smaller height
        paddingHorizontal: 16,    // smaller width
        borderRadius: 6,          // slightly smaller radius
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearText: {
        color: '#444',
        fontWeight: '600',
        fontSize: 12,             // smaller text
    },
    doneText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,             // smaller text
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




});
