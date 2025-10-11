import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Category, RootStackParamList } from '../../navigation/type';
import { useNavigation, useRoute } from '@react-navigation/native';
import apiClient from '../../services/apiBaseUrl';
import { ActivityIcon } from 'lucide-react-native';
import { ActivityIndicator } from 'react-native';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<HomeScreenNavigationProp>();



    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await apiClient.get('v1/category');
                console.log("CATEGORY API Response:", response.data);
                
                if (response.data && response.data.length > 0) {
                    // Process categories and ensure they have proper image URLs
                    const processedCategories = response.data.map((category: any) => ({
                        ...category,
                        imageUrl: category.imageUrl || `https://via.placeholder.com/150/0077CC/FFFFFF?text=${encodeURIComponent(category.name)}`
                    }));
                    
                    console.log("Processed Categories for Home:", processedCategories);
                    setCategories(processedCategories);
                } else {
                    // Fallback categories with proper images
                    const fallbackCategories = [
                        { categoryId: 1, name: "Electronics", imageUrl: "https://via.placeholder.com/150/0077CC/FFFFFF?text=Electronics" },
                        { categoryId: 2, name: "Fashion", imageUrl: "https://via.placeholder.com/150/FF6B35/FFFFFF?text=Fashion" },
                        { categoryId: 3, name: "Jewellery", imageUrl: "https://via.placeholder.com/150/FFD700/FFFFFF?text=Jewellery" },
                        { categoryId: 4, name: "Home", imageUrl: "https://via.placeholder.com/150/4CAF50/FFFFFF?text=Home" },
                        { categoryId: 5, name: "Sports", imageUrl: "https://via.placeholder.com/150/FF9800/FFFFFF?text=Sports" },
                        { categoryId: 6, name: "Books", imageUrl: "https://via.placeholder.com/150/9C27B0/FFFFFF?text=Books" }
                    ];
                    console.log("Using fallback categories for Home:", fallbackCategories);
                    setCategories(fallbackCategories);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                // Set fallback categories
                const fallbackCategories = [
                    { categoryId: 1, name: "Electronics", imageUrl: "https://via.placeholder.com/150/0077CC/FFFFFF?text=Electronics" },
                    { categoryId: 2, name: "Fashion", imageUrl: "https://via.placeholder.com/150/FF6B35/FFFFFF?text=Fashion" },
                    { categoryId: 3, name: "Jewellery", imageUrl: "https://via.placeholder.com/150/FFD700/FFFFFF?text=Jewellery" },
                    { categoryId: 4, name: "Home", imageUrl: "https://via.placeholder.com/150/4CAF50/FFFFFF?text=Home" },
                    { categoryId: 5, name: "Sports", imageUrl: "https://via.placeholder.com/150/FF9800/FFFFFF?text=Sports" },
                    { categoryId: 6, name: "Books", imageUrl: "https://via.placeholder.com/150/9C27B0/FFFFFF?text=Books" }
                ];
                console.log("Using fallback categories due to error:", fallbackCategories);
                setCategories(fallbackCategories);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);


    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    const renderItem = ({ item }: { item: Category }) => {
        const fallbackImageUrl = `https://via.placeholder.com/150/0077CC/FFFFFF?text=${encodeURIComponent(item.name)}`;
        
        return (
            <TouchableOpacity
                key={item.categoryId}
                style={styles.categoryItem}
                onPress={() => {
                    console.log('Clicked Category:', item.name);
                    navigation.navigate('SubCategoriesListOfProducts', { categoryId: item.categoryId, category: item.name });
                }}
            >
                <Image 
                    source={{ uri: item.imageUrl || fallbackImageUrl }} 
                    style={styles.categoryImage}
                    onError={(error) => {
                        console.log('Home category image failed to load:', item.imageUrl, error);
                    }}
                    onLoad={() => {
                        console.log('Home category image loaded successfully:', item.imageUrl);
                    }}
                />
                <Text style={styles.categoryLabel}>{item.name}</Text>
            </TouchableOpacity>
        );
    };


    return (
        <FlatList
            data={categories}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.categoryId.toString()}
            renderItem={renderItem}
            // numColumns={4}
            contentContainerStyle={styles.listContainer}
        />
    );
}

const styles = StyleSheet.create({
    center: {
        // flex: 1,
    },
    listContainer: {

    },
    categoryItem: {
        alignItems: 'center',
        marginRight: 2,
        color: "#FFFFFF",
        marginLeft: 13
    },
    categoryImage: {
        width: 85,
        height: 85,
        borderRadius: 50,
        marginBottom: 4,
        borderWidth: 2,
        borderColor: "#8C8C8C40"
    },
    categoryLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
});
