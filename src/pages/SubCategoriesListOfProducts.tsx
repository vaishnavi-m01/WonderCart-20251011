import {
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    FlatList,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AntDesign from 'react-native-vector-icons/AntDesign';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Foundation from 'react-native-vector-icons/Foundation';
import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/type';
import SubCategories from '../components/home/SubCategories';
import apiClient from '../services/apiBaseUrl';

type CartRouteProp = RouteProp<RootStackParamList, 'SubCategoriesListOfProducts'>;

const SubCategoriesListOfProducts = () => {
    const route = useRoute<CartRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [searchText, setSearchText] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    const typingTimeoutRef = useRef<number | null>(null);
    const category = route.params?.category || '';
    console.log("CATEGORYYYY", category)

    const popularSearches = ['Saree', 'Earring', 'Tshirt', 'Ring', 'Bangaless'];

    useEffect(() => {
        const getSearches = async () => {
            const searches = await AsyncStorage.getItem('recentSearches');
            if (searches) setRecentSearches(JSON.parse(searches));
        };
        getSearches();
    }, []);

    // useEffect(() => {
    //     if (!searchText.trim()) return;

    //     if (typingTimeoutRef.current !== null) {
    //         clearTimeout(typingTimeoutRef.current);
    //     }

    //     typingTimeoutRef.current = setTimeout(() => handleSearch(), 1000);

    //     return () => {
    //         if (typingTimeoutRef.current) {
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
                const prevSearches = JSON.parse(await AsyncStorage.getItem('recentSearches') || '[]');
                const updatedSearches = [searchText, ...prevSearches.filter((item: any) => item !== searchText)].slice(0, 10);
                await AsyncStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
                navigation.navigate('CategoriesProduct', {
                    categoryId: firstProduct.categoryId,
                    categoryName: firstProduct.categoryName,
                    searchProduct: data,
                });
                setRecentSearches(updatedSearches);
                setSearchText('');
                setShowModal(false);
            } else {
                ToastAndroid.show('No products found', ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const handleFocus = () => setShowModal(true);
    const handleBlur = () => setTimeout(() => setShowModal(false), 150);

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ flex: 1 }}>

                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <AntDesign name="left" color="#0077CC" size={22} />
                        </TouchableOpacity>
                        <Text style={styles.text}>
                            {category ? (category === 'Beauty' ? 'Beauty Product' : category) : 'Cart'}
                        </Text>
                    </View>

                    <View style={styles.searchContainer}>
                        <EvilIcons name="search" color="#A8A8A8" size={24} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search for products"
                            placeholderTextColor="#999"
                            value={searchText}
                            returnKeyType="search"
                            onChangeText={setSearchText}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onSubmitEditing={() => {
                                if (searchText.trim()) handleSearch();
                            }}
                        />
                        <TouchableOpacity style={styles.iconWrapper} onPress={() => console.log('Camera tapped')}>
                            <FontAwesome name="camera" color="#666666" size={18} />
                        </TouchableOpacity>
                    </View>

                    {showModal && (
                        <View style={styles.modalView}>
                            {recentSearches.length > 0 && (
                                <>
                                    <Text style={styles.sectionTitle}>Recent Searches</Text>
                                    {recentSearches.map((item, index) => (
                                        <View key={index} style={styles.recentItem}>
                                            <Foundation name="clock" size={16} color="#777" />
                                            <Text style={styles.recentText}>{item}</Text>
                                        </View>
                                    ))}
                                </>
                            )}
                            <Text style={styles.sectionTitle}>Popular Searches</Text>
                            <View style={styles.popularContainer}>
                                {popularSearches.map((item, index) => (
                                    <TouchableOpacity key={index} style={styles.popularItem} onPress={() => setSearchText(item)}>
                                        <Text style={styles.popularText}>{item}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 50 }}>
                        <SubCategories />
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default SubCategoriesListOfProducts;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        elevation: 5,
        paddingTop: 10,
        paddingBottom: 14,
        paddingHorizontal: 10,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        marginRight: 12,
    },
    text: {
        color: '#0077CC',
        fontSize: 22,
        fontWeight: '700',
        // color: '#1A1A1A',
        marginBottom: 2,
    },
    icon: {
        fontWeight: '900',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        borderRadius: 30,
        backgroundColor: '#f9f9f9',
        paddingLeft: 38,
        paddingRight: 10,
        marginHorizontal: 10,
        marginTop: 10,
        height: 44,
        position: 'relative',
    },
    searchIcon: {
        position: 'absolute',
        left: 12,
        top: '50%',
        transform: [{ translateY: -12 }],
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        paddingVertical: 10,
        paddingRight: 10,
    },
    iconWrapper: {
        padding: 6,
    },
    modalView: {
        position: 'absolute',
        top: 110, // Adjust depending on your search bar height
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 20,
        zIndex: 10,
        borderTopColor: '#eee',
        borderTopWidth: 1,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginTop: 0
    },

    sectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#444',
        marginBottom: 8,
        marginTop: 10,
    },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        gap: 10,
    },
    recentText: {
        fontSize: 14,
        color: '#444',
    },
    popularContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    popularItem: {
        backgroundColor: '#eee',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 30,
        marginRight: 8,
        marginBottom: 8,
    },
    popularText: {
        fontSize: 13,
        color: '#333',
    },
});
