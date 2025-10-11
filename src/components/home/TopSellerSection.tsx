import React, { useRef, useState } from 'react';
import {
    View,
    FlatList,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ImageSourcePropType
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import LinearGradient from 'react-native-linear-gradient';
import TopSeller from './TopSeller';

const { width } = Dimensions.get('window');

type TopSellerItem = {
    id: number;
    image: ImageSourcePropType;
    title: string;
    price: number;
    originalPrice: number;
    description?: string;
};

type Props = {
    topSellers: TopSellerItem[];
};

const TopSellerSection = ({ topSellers }: Props) => {
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const scrollToNext = () => {
        if (currentIndex < topSellers.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        }
    };

    return (
        <View style={styles.topSellerContainer}>
            <LinearGradient
                colors={['#E4F4FF', '#FFFFFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.gradientBackground}
            >
                <View style={styles.tobsubConatiner}>
                    <Text style={styles.sectionTitle}>Top Seller</Text>

                    <TouchableOpacity onPress={scrollToNext}>
                        <AntDesign name="right" color="#666666" size={20} style={styles.icon} />
                    </TouchableOpacity>

                </View>
                <Text style={styles.sectionText}>Discover products loved by many</Text>
            </LinearGradient>

            <FlatList
                ref={flatListRef}
                data={topSellers}
                horizontal
                keyExtractor={(item) => item.id.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 15 }}
                renderItem={({ item }) => (
                    <TopSeller
                        id={item.id}
                        image={item.image}
                        title={item.title}
                        price={item.price}
                        originalPrice={item.originalPrice}
                        description={item.description}
                    />
                )}
                onScroll={(event) => {
                    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(newIndex);
                }}
                getItemLayout={(data, index) => ({
                    length: width * 0.6,
                    offset: (width * 0.6) * index,
                    index,
                })}
            />
        </View>
    );
};

export default TopSellerSection;

const styles = StyleSheet.create({
    topSellerContainer: {
        marginBottom: 20,
    },
    gradientBackground: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
    },
    tobsubConatiner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    sectionText: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    icon: {
        padding: 5,
    },
});
