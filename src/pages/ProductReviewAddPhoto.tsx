import React, { useState } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    PermissionsAndroid,
    ToastAndroid,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView,
} from "react-native";
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import apiClient from "../services/apiBaseUrl";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Modal } from "react-native";




type RootStackParamList = {
    ProductReviewAddPhoto: {
        productId: number;
        variantId: number;
        userId: number;
    };
};

const ProductReviewAddPhoto = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<RootStackParamList, 'ProductReviewAddPhoto'>>();
    const { productId, variantId, userId } = route.params;
    const [isModalVisible, setIsModalVisible] = useState(false);


    console.log("productId", productId)
    console.log("variantId", variantId)
    console.log("userId", userId)

    const [rating, setRating] = useState(0);
    const [name, setName] = useState('');
    const [review, setReview] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // 📷 Request permissions
    // const requestCameraPermission = async () => {
    //     if (Platform.OS === "android") {
    //         try {
    //             const granted = await PermissionsAndroid.requestMultiple([
    //                 PermissionsAndroid.PERMISSIONS.CAMERA,
    //                 PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    //                 PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    //             ]);

    //             return (
    //                 granted["android.permission.CAMERA"] === PermissionsAndroid.RESULTS.GRANTED &&
    //                 granted["android.permission.READ_EXTERNAL_STORAGE"] === PermissionsAndroid.RESULTS.GRANTED
    //             );
    //         } catch (err) {
    //             console.warn(err);
    //             return false;
    //         }
    //     }
    //     return true;
    // };

    // 📤 Submit review
   const handleSubmit = async () => {
    if (rating === 0) {
        ToastAndroid.show('Please select a rating', ToastAndroid.SHORT);
        return;
    }

    if (!review.trim()) {
        ToastAndroid.show('Please enter your review', ToastAndroid.SHORT);
        return;
    }

    const payload = {
        productId,
        variantId,
        userId,
        rating,
        reviewText: review,
    };

    try {
        const response = await apiClient.post("v1/productReview", payload);
        console.log("Review submit response", response.data);

        const productReviewId = response?.data?.productReviewId;
        console.log("productReviewId",productReviewId)

        if (!productReviewId) {
            ToastAndroid.show('Review submitted but no ID returned', ToastAndroid.SHORT);
            return;
        }

        // ✅ Now upload image if selected
        console.log("selectedImage")
        if (selectedImage) {
            const formData = new FormData();
            formData.append('productReviewId', productReviewId.toString());
            formData.append('file', {
                uri: selectedImage,
                name: 'review_image.jpg',
                type: 'image/jpeg',
            } as any); 

             console.log("formdata",formData)
            try {
                const uploadResponse = await apiClient.post(
                    "v1/productReview/imageUpload",
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );
                console.log("Image upload response", uploadResponse.data);
                ToastAndroid.show('Review & image submitted!', ToastAndroid.SHORT);
            } catch (uploadError) {
                console.error("Image upload failed:", uploadError);
                ToastAndroid.show('Review submitted, but image upload failed', ToastAndroid.SHORT);
            }
        } else {
            ToastAndroid.show('Review submitted!', ToastAndroid.SHORT);
        }

        // ✅ Reset form
        // setRating(0);
        // setName('');
        // setReview('');
        // setSelectedImage(null);

    } catch (error) {
        console.error('Review submit error', error);
        ToastAndroid.show('Error submitting review', ToastAndroid.SHORT);
    }
};

    // 📷 Open camera
    const openCamera = async () => {
        // const hasPermission = await requestCameraPermission();
        // if (!hasPermission) {
        //     ToastAndroid.show("Camera permission not granted!", ToastAndroid.SHORT);
        //     return;
        // }

        launchCamera({ mediaType: 'photo', quality: 1 }, (response) => {
            if (response.didCancel) {
                console.log("User cancelled camera");
            } else if (response.errorCode) {
                console.log("Camera Error:", response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                setSelectedImage(response.assets[0].uri || null);
            }
        });
    };

    // 🖼️ Open gallery
    const openGallery = async () => {
        // const hasPermission = await requestCameraPermission();
        // if (!hasPermission) {
        //     ToastAndroid.show("Storage permission not granted!", ToastAndroid.SHORT);
        //     return;
        // }

        launchImageLibrary({ mediaType: 'photo', quality: 1 }, (response) => {
            if (response.didCancel) {
                console.log("User cancelled gallery");
            } else if (response.errorCode) {
                console.log("Gallery Error:", response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                setSelectedImage(response.assets[0].uri || null);
            }
        });
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={80}
        >
            <ScrollView contentContainerStyle={{ alignItems: 'center' }} keyboardShouldPersistTaps="handled">

                <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                    {selectedImage ? (
                        <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                    ) : (
                        <Image source={require("../assets/images/addPhoto.png")} style={styles.previewImage} />
                    )}
                </TouchableOpacity>


                {/* <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.reviewbtn} onPress={openCamera}>
                    <Image
                        source={require("../assets/icons/AddCamera.png")}
                        style={styles.icon}
                    />
                    <Text style={styles.feedbacktext}>Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.reviewbtn} onPress={openGallery}>
                    <Image
                        source={require("../assets/icons/AddCamera.png")}
                        style={styles.icon}
                    />
                    <Text style={styles.feedbacktext}>Gallery</Text>
                </TouchableOpacity>
            </View> */}


                <View style={{ marginTop: 20, marginLeft: 1 }}>
                    <Text style={styles.reviewText}>Rating</Text>
                    <View style={styles.starRow}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <TouchableOpacity key={i} onPress={() => setRating(i)}>
                                <Icon
                                    name="star"
                                    size={30}
                                    color={i <= rating ? '#FFD700' : '#ccc'}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.text}>Type Comment</Text>
                    <TextInput
                        placeholder="Write your review..."
                        style={styles.textArea}
                        value={review}
                        onChangeText={setReview}
                        multiline
                        numberOfLines={5}
                    />

                    <TouchableOpacity style={styles.reviewbtn} onPress={handleSubmit}>
                        <Text style={styles.feedbacktext}>Submit</Text>
                    </TouchableOpacity>
                </View>


                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={() => setIsModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <TouchableOpacity onPress={() => { openCamera(); setIsModalVisible(false); }} style={styles.modalButton}>
                                <Text style={styles.modalText}>📷 Camera</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { openGallery(); setIsModalVisible(false); }} style={styles.modalButton}>
                                <Text style={styles.modalText}>🖼️ Gallery</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.modalCancel}>
                                <Text style={styles.modalText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </ScrollView>

        </KeyboardAvoidingView>
    );
};

export default ProductReviewAddPhoto;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",

        backgroundColor: "#fff"
    },
    previewImage: {
        height: 100,
        width: 100,
        borderRadius: 10,
        marginTop: 50
    },
    reviewbtn: {
        backgroundColor: "#00A2F4",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 5,
        justifyContent: "center"
    },
    feedbacktext: {
        fontFamily: "Jost",
        fontWeight: "800",
        fontSize: 14,
        color: "#FFFFFF",
        marginLeft: 5,
        textAlign: "center"
    },

    reviewText: {
        fontSize: 16,
        fontWeight: 800,
        top: 3,
        fontFamily: "Jost",
        alignSelf: "flex-start",
    },
    starRow: {
        flexDirection: 'row',
        marginBottom: 10,
        alignSelf: "flex-start",
        marginTop: 12,
        left: -6
    },
    icon: {
        height: 25,
        width: 25,
    },
    input: {
        borderWidth: 1,
        borderColor: "#CECECE",
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
        width: 330,
    },
    text: {
        fontFamily: "Jost",
        color: "#333333",
        fontSize: 15,
        fontWeight: "800",
        alignSelf: "flex-start",
        marginBottom: 10,
        marginTop: 10,
    },
    textArea: {
        borderWidth: 1,
        borderColor: "#CECECE",
        borderRadius: 8,
        padding: 10,
        height: 120,
        width: 330,
        textAlignVertical: "top",
        marginBottom: 60,
    },
    buttonRow: {
        flexDirection: "row",
        marginVertical: 20,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContainer: {
        backgroundColor: "#fff",
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalButton: {
        paddingVertical: 15,
        alignItems: "center",
    },
    modalCancel: {
        paddingVertical: 15,
        alignItems: "center",
        borderTopWidth: 1,
        borderColor: "#ddd",
    },
    modalText: {
        fontSize: 16,
        fontWeight: "600",
    },

});
