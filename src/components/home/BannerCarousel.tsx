import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

type BannerCarouselProps = {
    image: any[];
};

const BannerCarousel = ({ image }: BannerCarouselProps) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);


    useEffect(() => {
        const interval = setInterval(() => {
            let nextIndex = (activeIndex + 1) % image.length;
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
            setActiveIndex(nextIndex);
        }, 2000);

        return () => clearInterval(interval);
    }, [activeIndex, image.length]);

    const handleScroll = (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / (width - 32));
        setActiveIndex(index);
    };

    const scrollToIndex = (index: number) => {
        flatListRef.current?.scrollToIndex({ index, animated: true });
        setActiveIndex(index);
    };

    return (
        <View>
            <FlatList
                ref={flatListRef}
                data={image}
                horizontal
                pagingEnabled
                snapToInterval={width}
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => (
                    <Image source={item} style={styles.banner} resizeMode="stretch" />
                )}
            />


            <View style={styles.indicatorContainer}>
                {image.map((_, index) => (
                    <TouchableOpacity key={index} onPress={() => scrollToIndex(index)}>
                        <View
                            style={[
                                styles.circle,
                                activeIndex === index && styles.activeCircle,
                            ]}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

export default BannerCarousel;

const styles = StyleSheet.create({
    banner: {
        width: width - 32,
        height: 140,
        borderRadius: 16,
        marginTop: 20,
        marginBottom: 20,
        marginLeft: 16,
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 4,
        paddingVertical: 6,
    },
    circle: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D1D5DB',
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    activeCircle: {
        backgroundColor: '#0077CC',
        width: 24,
        height: 8,
        borderRadius: 4,
        shadowColor: '#0077CC',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
});
