import { 
  Alert, 
  FlatList, 
  Image, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  ActivityIndicator 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import AntDesign from "react-native-vector-icons/AntDesign";
import TopSeller from "../home/TopSeller";
import apiClient from "../../services/apiBaseUrl";
import { useEffect, useRef, useState } from "react";
import UnifiedHeader from "../common/UnifiedHeader";

type Product = {
  productId: number;
  title: string;
  variants?: {
    price: number;
    variantImage: {
      imageUrl: string;
    }[];
  };
};

const Offers = () => {
  const navigation = useNavigation<any>();
  const flatListRef = useRef<FlatList<any>>(null);
  const [JewelleryProducts, setJewelleryProducts] = useState<Product[]>([]);
  const [topSellerProduct, setTopSellerProduct] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJewellery = async () => {
      try {
        const response = await apiClient.get(`v2/products/filter?categoryId=3`);
        setJewelleryProducts(response.data);
      } catch (error) {
        console.error("Error fetching products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJewellery();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [category3Res, category6Res] = await Promise.all([
          apiClient.get(`v2/products/filter?categoryId=6`),
          apiClient.get(`v2/products/filter?categoryId=3`),
        ]);

        const jewelleryTop3 = category3Res.data.slice(0, 3);
        const clothProducts = category6Res.data;
        const combined = [...jewelleryTop3, ...clothProducts];

        setTopSellerProduct(combined);
      } catch (error) {
        console.error("Error fetching top seller products", error);
      }
    };
    fetchProducts();
  }, []);

  // ⏳ Show loader while data fetching
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0077CC" />
        <Text style={{ marginTop: 10, color: "#0077CC", fontWeight: "600" }}>
          Loading Offers...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.subcontainer}>
        <Image source={require('../../assets/images/offerBanner1.jpg')} style={styles.banner} />

        {/* Jewellery Top Seller */}
        <View style={styles.topSellerContainer}>
          <LinearGradient
            colors={['#3AC2FE', '#FFFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.gradientBackground}
          >
            <View style={styles.tobsubConatiner}>
              <Text style={styles.sectionTitle}>Top Seller</Text>
              <TouchableOpacity>
                <AntDesign name="right" color="#666666" size={22} />
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionText}>25% OFF</Text>
          </LinearGradient>

          <FlatList
            ref={flatListRef}
            data={JewelleryProducts}
            horizontal
            keyExtractor={(item) => item.productId.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
            renderItem={({ item }) => {
              const imageUrl = item.variants?.variantImage?.[0]?.imageUrl ?? "";
              const variantId = item.variants?.variantId;

              return (
                <TouchableOpacity
                  onPress={() => navigation.navigate("SeparateProductPage", { productId: item.productId })}
                >
                  <TopSeller
                    productId={item.productId}
                    image={imageUrl}
                    productName={item.title}
                    price={item.variants?.price ?? 0}
                    variantId={variantId}
                  />
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Banner 2 */}
        <Image source={require('../../assets/images/offerBanner2.jpg')} style={styles.bannerImg} />

        {/* Combined Top Seller */}
        <View style={styles.topSellerContainer}>
          <LinearGradient
            colors={['#FBAEFF', '#FDDBFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.gradientBackground}
          >
            <View style={styles.tobsubConatiner}>
              <Text style={styles.sectionTitle}>Top Seller</Text>
              <TouchableOpacity>
                <AntDesign name="right" color="#666666" size={22}  />
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionText}>35% OFF</Text>
          </LinearGradient>

          <FlatList
            ref={flatListRef}
            data={topSellerProduct}
            horizontal
            keyExtractor={(item) => item.productId.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
            renderItem={({ item }) => {
              const imageUrl = item.variants?.variantImage?.[0]?.imageUrl ?? "";
              const variantId = item.variants?.variantId;

              return (
                <TouchableOpacity onPress={() => navigation.navigate("SeparateProductPage", { productId: item.productId })}>
                  <TopSeller
                    productId={item.productId}
                    image={imageUrl}
                    productName={item.title}
                    price={item.variants?.price ?? 0}
                    variantId={variantId}
                  />
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default Offers;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  subcontainer: { margin: 8, paddingBottom: 20 },
  banner: { width: '100%', height: 120, borderRadius: 15, resizeMode: 'cover', marginBottom: 10 },
  topSellerContainer: { width: "100%", marginBottom: 20 },
  tobsubConatiner: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 5 },
  gradientBackground: { borderRadius: 8, padding: 16, marginBottom: 16, minHeight: 60 },
  sectionText: { fontSize: 14, color: '#303030', fontWeight: "800", paddingLeft: 15, paddingVertical: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: "#4A4A4A", margin: 3, paddingTop: 3, paddingLeft: 13 },
  bannerImg: { width: '100%', height: 130, borderRadius: 15, resizeMode: 'cover', marginBottom: 30, marginTop: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
});
