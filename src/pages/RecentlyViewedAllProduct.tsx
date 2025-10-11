import { useNavigation } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { View } from "react-native";
import AntDesign from 'react-native-vector-icons/AntDesign';
import RecentlyViewed from "../components/home/RecentlyViewed";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const RecentlyViewedAllProduct = () => {
    const navigation = useNavigation<any>();
    const [allViewed, setAllViewed] = useState<RecentlyViewedItem[]>([]);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const stored = await AsyncStorage.getItem('recentlyViewed');
                if (stored) {
                    const all = JSON.parse(stored);
                    const today = new Date();

                    const valid = all.filter((item: any) => {
                        const viewedDate = new Date(item.viewedDate);
                        const diff = (today.getTime() - viewedDate.getTime()) / (1000 * 60 * 60 * 24);
                        return diff <= 7;
                    });

                    setAllViewed(valid);
                }
            } catch (error) {
                console.log("Error fetching recently viewed:", error);
            } finally {
                setLoading(false); 
            }
        };

        fetchAll();
    }, []);

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0077CC" />
                <Text style={styles.loaderText}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate("Main")}>
                    <AntDesign name="arrowleft" color="#0077CC" size={26} style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.text}>Recently View</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {allViewed.length > 0 ? (
                    allViewed.map((item) => (
                        <RecentlyViewed
                            key={item.productId}
                            productId={item.productId}
                            image={{ uri: item.firstImage }}
                            name={item.productName}
                            price={item.price}
                        />
                    ))
                ) : (
                    <Text style={styles.emptyText}>No recently viewed products.</Text>
                )}
            </ScrollView>
        </View>
    );
};

export default RecentlyViewedAllProduct;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    text: {
        color: "#0077CC",
        fontSize: 20,
        marginLeft: 13,
        fontWeight: '900',
        marginBottom: 20,
        bottom: -9
    },
    icon: {
        fontWeight: '900',
        marginLeft: 12
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff"
    },
    loaderText: {
        marginTop: 10,
        fontSize: 16,
        color: "#0077CC"
    },
    emptyText: {
        textAlign: "center",
        marginTop: 20,
        fontSize: 16,
        color: "gray"
    }
});
