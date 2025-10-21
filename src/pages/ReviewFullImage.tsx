import React, { useState, useRef } from "react";
import {
    View,
    Text,
    Image,
    FlatList,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    NativeSyntheticEvent,
    NativeScrollEvent,
    ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import StarDisplay from "../utils/StarDisplay";

const { width } = Dimensions.get("window");

type ReviewImage = {
    imageUrl: string;
};

type Review = {
    username: string;
    rating: number;
    createdAt: string;
    reviewText: string;
    imagesList: ReviewImage[];
};

type Props = {
    route: {
        params: {
            review: Review;
        };
    };
};

const ReviewFullImage = ({ route }: Props) => {
    const { review } = route.params;
    const [currentIndex, setCurrentIndex] = useState(0);

    // Properly typed ref
    const flatListRef = useRef<FlatList<ReviewImage>>(null);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
    };

    const postedDaysAgo = () => {
        const diff = Math.floor(
            (Date.now() - new Date(review.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        return `${diff} day${diff !== 1 ? "s" : ""} ago`;
    };

    const goToIndex = (index: number) => {
        if (index < 0 || index >= review.imagesList.length) return;
        setCurrentIndex(index);

        flatListRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5, // centers the item
        });
    };

    return (
        <View style={styles.mainContainer}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                {/* --- Image Carousel --- */}
                <View style={styles.imageWrapper}>
                    <FlatList
                        ref={flatListRef}
                        data={review.imagesList}
                        keyExtractor={(_, idx) => idx.toString()}
                        horizontal
                        pagingEnabled
                        onScroll={handleScroll}
                        showsHorizontalScrollIndicator={false}
                        scrollEventThrottle={16}
                        getItemLayout={(_, index) => ({
                            length: width,
                            offset: width * index,
                            index,
                        })}
                        renderItem={({ item }) => (
                            <View style={styles.imageContainer}>
                                <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
                                <LinearGradient
                                    colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.35)"]}
                                    style={styles.gradientOverlay}
                                />
                            </View>
                        )}
                    />

                    {/* Pagination Dots */}
                    <View style={styles.pagination}>
                        {review.imagesList.map((_, idx) => (
                            <TouchableOpacity key={idx.toString()} onPress={() => goToIndex(idx)}>
                                <View style={[styles.dot, idx === currentIndex && styles.activeDot]} />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Left Arrow */}
                    {currentIndex > 0 && (
                        <TouchableOpacity style={[styles.arrowButton, { left: 12 }]} onPress={() => goToIndex(currentIndex - 1)}>
                            <Ionicons name="chevron-back" size={28} color="#111" />
                        </TouchableOpacity>
                    )}

                    {/* Right Arrow */}
                    {currentIndex < review.imagesList.length - 1 && (
                        <TouchableOpacity style={[styles.arrowButton, { right: 12 }]} onPress={() => goToIndex(currentIndex + 1)}>
                            <Ionicons name="chevron-forward" size={28} color="#111" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* --- Review Info Card --- */}
                <View style={styles.flatReviewWrapper}>
                    <View style={styles.flatReviewerRow}>
                        <View style={styles.flatAvatarCircle}>
                            <Text style={styles.flatAvatarLetter}>{review.username.charAt(0).toUpperCase()}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={styles.flatNameRatingRow}>
                                <Text style={styles.flatUsername}>{review.username}</Text>
                                <StarDisplay rating={review.rating} />
                            </View>
                            <Text style={styles.flatReviewDate}>{postedDaysAgo()}</Text>
                        </View>
                    </View>

                    <Text style={styles.flatReviewText}>{review.reviewText}</Text>

                    {review.imagesList.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.flatThumbnailRow}>
                            {review.imagesList.map((img, idx) => (
                                <TouchableOpacity key={idx.toString()} onPress={() => goToIndex(idx)}>
                                    <Image source={{ uri: img.imageUrl }} style={styles.flatThumbnail} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

export default ReviewFullImage;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#F3F4F6",
        marginTop: 20,
        margin: 12
    },
    imageWrapper: {
        width,
        height: width * 1.2,
        backgroundColor: "#fff",
        justifyContent: "center",
    },
    imageContainer: {
        width,
        height: width * 1.2,
        overflow: "hidden",
    },
    image: {
        width: "100%",
        height: "100%"
    },
    gradientOverlay: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: 140
    },
    pagination: {
        position: "absolute",
        bottom: 20,
        flexDirection: "row",
        alignSelf: "center"
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
        backgroundColor: "rgba(255,255,255,0.6)"
    },
    activeDot: {
        backgroundColor: "#0094FF", transform: [{ scale: 1.2 }]
    },
    arrowButton: { position: "absolute", top: "45%", backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 50, padding: 8, shadowColor: "#000", shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 4 },
    flatReviewWrapper: { marginTop: 20, marginHorizontal: 16, paddingVertical: 12 },
    flatReviewerRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    flatAvatarCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#E5E7EB", justifyContent: "center", alignItems: "center", marginRight: 10 },
    flatAvatarLetter: { fontSize: 14, fontWeight: "600", color: "#374151" },
    flatNameRatingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    flatUsername: { fontSize: 14, fontWeight: "600", color: "#111827", marginRight: 6 },
    flatReviewDate: { fontSize: 12, color: "#6B7280", marginTop: 2 },
    flatReviewText: { fontSize: 14, color: "#4B5563", lineHeight: 20, marginTop: 8 },
    flatThumbnailRow: { marginTop: 10 },
    flatThumbnail: { width: 50, height: 50, borderRadius: 6, marginRight: 6 },
});
