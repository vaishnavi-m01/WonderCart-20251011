import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ToastAndroid,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Animated,
  RefreshControl,
  HapticFeedback,
  Platform,
} from "react-native";
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import Card from "../components/categories/Card";
import apiClient from "../services/apiBaseUrl";
import { Category, RootStackParamList } from "../navigation/type";
import Fontisto from 'react-native-vector-icons/Fontisto';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Product from "../components/home/Product";
import { getProductThumbnail } from "../utils/ProductImageHelper";
import UnifiedHeader from "../components/common/UnifiedHeader";
import LinearGradient from 'react-native-linear-gradient';



type CategoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Category'>;
type VariantType = {
  variantId: number;
  price: number;
  stock: number;
  sku: string;
  variantImage?: {
    imageId: number;
    imageUrl: string;
    altText: string;
    isPrimary: boolean;
    positionId: number;
    storageLocation: string | null;
    variantId: number;
  }[];
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





const Categories = () => {
  const navigation = useNavigation<CategoryScreenNavigationProp>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [trendingProducts, setTrendingProducts] = useState<ProductType[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scrollY = useRef(new Animated.Value(0)).current;


  const filters = [
    { label: "All", parentId: null },
    { label: "Jewellery", parentId: 1 },
    { label: "Cloth", parentId: 2 }
  ];

  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 40) / 2;


  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await apiClient.get('v1/category');
        console.log('Categories API Response:', response.data);

        if (response.data && response.data.length > 0) {
          // Process categories and ensure they have proper image URLs
          const processedCategories = response.data.map((category: any, index: number) => ({
            ...category,
            imageUrl: category.imageUrl || `https://via.placeholder.com/300/0077CC/FFFFFF?text=${encodeURIComponent(category.name)}`
          }));

          console.log('Processed Categories:', processedCategories);
          setCategories(processedCategories);
        } else {
          // Fallback categories with proper images
          const fallbackCategories = [
            { categoryId: 1, name: "Electronics", imageUrl: "https://via.placeholder.com/300/0077CC/FFFFFF?text=Electronics" },
            { categoryId: 2, name: "Fashion", imageUrl: "https://via.placeholder.com/300/FF6B35/FFFFFF?text=Fashion" },
            { categoryId: 3, name: "Jewellery", imageUrl: "https://via.placeholder.com/300/FFD700/FFFFFF?text=Jewellery" },
            { categoryId: 4, name: "Home & Garden", imageUrl: "https://via.placeholder.com/300/4CAF50/FFFFFF?text=Home+%26+Garden" },
            { categoryId: 5, name: "Sports", imageUrl: "https://via.placeholder.com/300/FF9800/FFFFFF?text=Sports" },
            { categoryId: 6, name: "Books", imageUrl: "https://via.placeholder.com/300/9C27B0/FFFFFF?text=Books" }
          ];
          console.log('Using fallback categories:', fallbackCategories);
          setCategories(fallbackCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Set some dummy data for testing
        const fallbackCategories = [
          { categoryId: 1, name: "Electronics", imageUrl: "https://via.placeholder.com/300/0077CC/FFFFFF?text=Electronics" },
          { categoryId: 2, name: "Fashion", imageUrl: "https://via.placeholder.com/300/FF6B35/FFFFFF?text=Fashion" },
          { categoryId: 3, name: "Jewellery", imageUrl: "https://via.placeholder.com/300/FFD700/FFFFFF?text=Jewellery" },
          { categoryId: 4, name: "Home & Garden", imageUrl: "https://via.placeholder.com/300/4CAF50/FFFFFF?text=Home+%26+Garden" },
          { categoryId: 5, name: "Sports", imageUrl: "https://via.placeholder.com/300/FF9800/FFFFFF?text=Sports" },
          { categoryId: 6, name: "Books", imageUrl: "https://via.placeholder.com/300/9C27B0/FFFFFF?text=Books" }
        ];
        console.log('Using fallback categories due to error:', fallbackCategories);
        setCategories(fallbackCategories);
      } finally {
        setCategoriesLoading(false);
        setLoading(false);

        // Start animations when data is loaded
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
        ]).start();
      }
    };

    fetchCategories();
  }, []);



  // useEffect(() => {
  //   if (!searchText.trim()) return;


  //   if (typingTimeoutRef.current !== null) {
  //     clearTimeout(typingTimeoutRef.current);
  //   }


  //   typingTimeoutRef.current = setTimeout(() => {
  //     handleSearch();
  //   }, 1000);

  //   return () => {
  //     if (typingTimeoutRef.current !== null) {
  //       clearTimeout(typingTimeoutRef.current);
  //     }
  //   };
  // }, [searchText]);


  useEffect(() => {
    const fetchTrendingProducts = async () => {
      setTrendingLoading(true);
      try {
        const response = await apiClient.get('v1/homepageSection4?limit=4');

        if (response.data && response.data.length > 0) {
          const productList = response.data[0].abstractProductList || [];

          const fixedProductList = productList.map((item: any) => {
            return {
              ...item,
              variants: item.variants ? [item.variants] : [],
            };
          });

          setTrendingProducts(fixedProductList);
        }
      } catch (error) {
        console.error('Error fetching trending products:', error);
      } finally {
        setTrendingLoading(false);
      }
    };

    fetchTrendingProducts();
  }, []);



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


  const handleFilterPress = async (filter: { label: string, parentId: number | null }) => {
    // Add haptic feedback
    if (Platform.OS === 'ios') {
      HapticFeedback.selection();
    }

    setSelectedFilter(filter.label);

    if (filter.label === "All") return;

    try {
      const response = await apiClient.get(`v2/products/filter?parentId=${filter.parentId}`);
      const products = response.data;

      if (products.length > 0) {
        const categoryId = products[0].categoryId;
        const categoryName = products[0].categoryName;

        navigation.navigate('CategoriesProduct', {
          categoryId,
          categoryName,
          searchProduct: products
        });
      } else {
        ToastAndroid.show("No products found in this category", ToastAndroid.SHORT);
      }

    } catch (error) {
      console.error("Error fetching filtered products:", error);
      ToastAndroid.show("Something went wrong", ToastAndroid.SHORT);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Reset animations
    fadeAnim.setValue(0);
    slideAnim.setValue(50);

    // Fetch data again
    try {
      const [categoriesResponse, trendingResponse] = await Promise.all([
        apiClient.get('v1/category'),
        apiClient.get('v1/homepageSection4?limit=4')
      ]);

      // Process categories
      if (categoriesResponse.data && categoriesResponse.data.length > 0) {
        const processedCategories = categoriesResponse.data.map((category: any) => ({
          ...category,
          imageUrl: category.imageUrl || `https://via.placeholder.com/300/0077CC/FFFFFF?text=${encodeURIComponent(category.name)}`
        }));
        setCategories(processedCategories);
      }

      // Process trending products
      if (trendingResponse.data && trendingResponse.data.length > 0) {
        const productList = trendingResponse.data[0].abstractProductList || [];
        const fixedProductList = productList.map((item: any) => ({
          ...item,
          variants: item.variants ? [item.variants] : [],
        }));
        setTrendingProducts(fixedProductList);
      }

      // Restart animations
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
      ]).start();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };


  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <LinearGradient
          colors={['#0077CC', '#0056B3']}
          style={styles.loaderGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.loaderContent}>
            <MaterialIcons name="category" size={60} color="#FFFFFF" />
            <Text style={styles.loaderText}>Loading Categories...</Text>
            <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 20 }} />
          </View>
        </LinearGradient>
      </View>
    );
  }




  return (
    <View style={styles.container}>
      <UnifiedHeader
        title="Categories"
        showMenuButton={true}
        onMenuPress={() => {
          // Navigate to Profile tab which has drawer navigation
          navigation.navigate('Profile' as never);
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
        onSearchToggle={() => setIsSearchActive(!isSearchActive)}
        onWishlistPress={() => navigation.navigate("Wishlist" as never)}
        isSearchActive={isSearchActive}
        headerStyle="default"
      />

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0077CC']}
            tintColor="#0077CC"
            title="Pull to refresh"
            titleColor="#0077CC"
          />
        }
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Enhanced Filter Section with Parallax */}
        <Animated.View
          style={[
            styles.modernFilterContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                {
                  translateY: scrollY.interpolate({
                    inputRange: [0, 200],
                    outputRange: [0, -50],
                    extrapolate: 'clamp',
                  }),
                },
              ]
            }
          ]}
        >
          <View style={styles.filterHeader}>
            <MaterialIcons name="filter-list" size={22} color="#0077CC" />
            <Text style={styles.filterTitle}>Quick Filters</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.modernFilterScrollContent}
          >
            {filters.map((filter, index) => (
              <Animated.View
                key={filter.label}
                style={[
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateX: slideAnim.interpolate({
                          inputRange: [0, 50],
                          outputRange: [0, -20 * index],
                          extrapolate: 'clamp',
                        }),
                      },
                    ],
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.modernFilterButton,
                    selectedFilter === filter.label && styles.modernSelectedFilterButton
                  ]}
                  onPress={() => handleFilterPress(filter)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.modernFilterText,
                      selectedFilter === filter.label && styles.modernSelectedFilterText
                    ]}
                  >
                    {filter.label}
                  </Text>
                  {selectedFilter === filter.label && (
                    <Animated.View
                      style={{
                        opacity: fadeAnim,
                        transform: [
                          {
                            scale: fadeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 1],
                              extrapolate: 'clamp',
                            }),
                          },
                        ],
                      }}
                    >
                      <MaterialIcons name="check" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                    </Animated.View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Enhanced Categories Section with Parallax */}
        <Animated.View
          style={[
            styles.modernContentContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                {
                  translateY: scrollY.interpolate({
                    inputRange: [0, 300],
                    outputRange: [0, -30],
                    extrapolate: 'clamp',
                  }),
                },
              ]
            }
          ]}
        >
          <View style={styles.modernSectionHeader}>
            <View style={styles.modernSectionTitleContainer}>
              <View style={styles.titleRow}>
                <MaterialIcons name="category" size={28} color="#0077CC" />
                <Text style={styles.modernSectionTitle}>Shop By Category</Text>
              </View>
              <Text style={styles.modernSectionSubtitle}>Discover our wide range of product categories</Text>
            </View>
            <TouchableOpacity
              style={styles.modernCategoryCount}
              onPress={() => {
                // Could add functionality to show all categories or filter
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.modernCategoryCountText}>{categories.length}</Text>
              <Text style={styles.modernCategoryCountLabel}>Items</Text>
            </TouchableOpacity>
          </View>

          {categoriesLoading ? (
            <View style={styles.skeletonContainer}>
              {[1, 2, 3, 4].map((index) => (
                <View key={index} style={styles.skeletonCard}>
                  <View style={styles.skeletonImage} />
                  <View style={styles.skeletonContent}>
                    <View style={styles.skeletonTitle} />
                    <View style={styles.skeletonSubtitle} />
                  </View>
                </View>
              ))}
            </View>
          ) : categories.length > 0 ? (
            <FlatList
              data={categories}
              numColumns={2}
              keyExtractor={(item) => item.categoryId.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
              renderItem={({ item, index }) => (
                <Animated.View
                  style={[
                    styles.categoryItem,
                    {
                      opacity: fadeAnim,
                      transform: [
                        {
                          translateY: slideAnim.interpolate({
                            inputRange: [0, 50],
                            outputRange: [0, 50],
                            extrapolate: 'clamp',
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.categoryCard}
                    onPress={() => {
                      console.log("Category pressed:", item.categoryId);
                      handleFilterPress({ label: '', parentId: item.categoryId });
                    }}
                    activeOpacity={0.8}
                  >
                    <Card image={item.imageUrl} title={item.name} />
                  </TouchableOpacity>
                </Animated.View>
              )}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="category" size={60} color="#CCCCCC" />
              <Text style={styles.emptyText}>No categories available</Text>
              <Text style={styles.emptySubtext}>Check your connection and try again</Text>
            </View>
          )}
        </Animated.View>

        {/* Enhanced Trending Section with Parallax */}
        <Animated.View
          style={[
            styles.modernTrendingSection,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                {
                  translateY: scrollY.interpolate({
                    inputRange: [0, 400],
                    outputRange: [0, -20],
                    extrapolate: 'clamp',
                  }),
                },
              ]
            }
          ]}
        >
          <View style={styles.modernTrendingHeader}>
            <View style={styles.modernTrendingTitleContainer}>
                <View style={styles.trendingTitleRow}>
                  <MaterialIcons name="trending-up" size={24} color="#FF6B35" />
                  <Text style={styles.modernTrendingTitle}>Trending Now</Text>
                </View>
              <Text style={styles.modernTrendingSubtitle}>Popular products everyone loves</Text>
            </View>
            <TouchableOpacity 
              style={styles.modernSeeAllButton}
              onPress={() => navigation.navigate('ProductList' as never)}
              activeOpacity={0.8}
            >
              <Text style={styles.modernSeeAllText}>See All</Text>
              <AntDesign name="right" color="#fff" size={14} />
            </TouchableOpacity>
          </View>

          {trendingLoading ? (
            <View style={styles.trendingSkeletonContainer}>
              {[1, 2, 3].map((index) => (
                <View key={index} style={styles.trendingSkeletonItem}>
                  <View style={styles.trendingSkeletonImage} />
                  <View style={styles.trendingSkeletonContent}>
                    <View style={styles.trendingSkeletonTitle} />
                    <View style={styles.trendingSkeletonPrice} />
                  </View>
                </View>
              ))}
            </View>
          ) : trendingProducts.length > 0 ? (

            <FlatList
              horizontal
              data={trendingProducts}
              keyExtractor={(item) => item.productId.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.modernTrendingList}
              renderItem={({ item }) => {
                const variant = item.variants?.[0];

                return (
                  <View style={styles.modernTrendingItem}>
                    <Product
                      productId={item.productId}
                      image={
                        getProductThumbnail(item)
                          ? [{ uri: getProductThumbnail(item) }]
                          : variant?.variantImage?.[0]?.imageUrl
                            ? [{ uri: variant.variantImage[0].imageUrl }]
                            : []
                      }
                      price={variant?.price ?? 0}
                      productName={item.title}
                      originalPrice={item.originalPrice || item.price}
                      variantId={variant?.variantId}
                      discount={item.discount || 0}
                      deliveryStatus="FREE Delivery"
                      description={item.description}
                      orderDay="Friday"
                      offer={item.offer || 0}
                    />
                  </View>
                );
              }}
            />
          ) : (
            <View style={styles.trendingEmptyContainer}>
              <MaterialIcons name="trending-up" size={40} color="#CCCCCC" />
              <Text style={styles.trendingEmptyText}>No trending products available</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default Categories;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loaderGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  loaderText: {
    marginTop: 16,
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  scrollContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderBottomWidth: 0,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 44,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  // Enhanced Filter Styles
  modernFilterContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 24,
    marginHorizontal: 8,
    marginVertical: 12,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 119, 204, 0.08)',
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  modernFilterScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  modernFilterButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 28,
    backgroundColor: "#F8F9FA",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    transform: [{ scale: 1 }],
    marginBottom: 5
  },
  modernSelectedFilterButton: {
    backgroundColor: "#0077CC",
    borderColor: "#0077CC",
    shadowColor: '#0077CC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ scale: 1.05 }],
  },
  modernFilterText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "600",
  },
  modernSelectedFilterText: {
    color: "#FFFFFF",
  },
  // Modern Content Styles
  modernContentContainer: {
    flex: 1,
    paddingBottom: 100,
    backgroundColor: '#F8F9FA',
  },
  modernSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 8,
    marginVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 119, 204, 0.05)',
  },
  modernSectionTitleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  modernSectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  modernSectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  modernCategoryCount: {
    backgroundColor: '#0077CC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 25,
    shadowColor: '#0077CC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: "row",
    gap: 4,
    marginHorizontal: -6
  },
  modernCategoryCountText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  modernCategoryCountLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    opacity: 0.9,
  },
  categoriesList: {
    // paddingHorizontal: 8,
    paddingBottom: 24,
  },
  categoryItem: {
    width: '50%',
    paddingHorizontal: 2,
    marginBottom: 10,
  },
  categoryCard: {
    flex: 1,
  },
  // Skeleton Loading Styles
  skeletonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  skeletonCard: {
    width: '50%',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  skeletonImage: {
    height: 160,
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    marginBottom: 12,
  },
  skeletonContent: {
    paddingHorizontal: 8,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 8,
    width: '80%',
  },
  skeletonSubtitle: {
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    width: '60%',
  },
  // Enhanced Trending Section Styles
  modernTrendingSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 8,
    borderRadius: 24,
    paddingVertical: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.05)',
  },
  modernTrendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modernTrendingTitleContainer: {
    flex: 1,
  },
  trendingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  modernTrendingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  modernTrendingSubtitle: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  modernSeeAllButton: {
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
  modernSeeAllText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 6,
  },
  modernTrendingList: {
    // paddingLeft: 20,
    // paddingRight: 20,
  },
  modernTrendingItem: {
    // marginRight: 20,
  },
  // Trending Skeleton Styles
  trendingSkeletonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  trendingSkeletonItem: {
    marginRight: 20,
    width: 160,
  },
  trendingSkeletonImage: {
    height: 120,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 12,
  },
  trendingSkeletonContent: {
    paddingHorizontal: 4,
  },
  trendingSkeletonTitle: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 7,
    marginBottom: 6,
    width: '90%',
  },
  trendingSkeletonPrice: {
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    width: '70%',
  },
  // Empty State Styles
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginTop: 8,
  },
  trendingEmptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendingEmptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
});
