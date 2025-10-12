import React, { useState } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    PermissionsAndroid,
    ToastAndroid
} from "react-native";
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import { useNavigation } from "@react-navigation/native";
import { KeyboardAvoidingView } from "react-native";
import { Platform } from "react-native";
import { Alert } from "react-native";


const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
        try {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.CAMERA,
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            ]);

            return (
                granted["android.permission.CAMERA"] === PermissionsAndroid.RESULTS.GRANTED &&
                granted["android.permission.READ_EXTERNAL_STORAGE"] === PermissionsAndroid.RESULTS.GRANTED
            );
        } catch (err) {
            console.warn(err);
            return false;
        }
    }
    return true;
};

const ProductReviewAddPhoto = () => {
    const [name, setName] = useState('');
    const [review, setReview] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const navigation = useNavigation<any>();

    // Open image picker (gallery)
    const openCamera = async () => {
        console.log("camera");
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            ToastAndroid.show("Camera permission not granted!", ToastAndroid.SHORT);
            return;
        }

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

    const openGallery = async () => {
        console.log("gallery");
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            ToastAndroid.show("Storage permission not granted!",ToastAndroid.SHORT);
            return;
        }

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
        <KeyboardAvoidingView style={styles.container}>
            {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            ) : (
                <Image
                    source={require("../assets/images/addPhoto.png")}
                    style={styles.previewImage}
                />
            )}

            <View style={styles.buttonRow}>
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
            </View>

            <Text style={styles.text}>Name</Text>
            <TextInput
                placeholder="Your name"
                style={styles.input}
                value={name}
                onChangeText={setName}
            />

            <Text style={styles.text}>Type Comment</Text>
            <TextInput
                placeholder="Write your review..."
                style={styles.textArea}
                value={review}
                onChangeText={setReview}
                multiline
                numberOfLines={5}
            />
        </KeyboardAvoidingView>
    );
};

export default ProductReviewAddPhoto;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        marginTop: 50,
    },
    previewImage: {
        height: 100,
        width: 100,
        borderRadius: 10,
    },
    reviewbtn: {
        backgroundColor: "#00A2F4",
        borderRadius: 5,
        paddingVertical: 6,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 5,
    },
    feedbacktext: {
        fontFamily: "Jost",
        fontWeight: "800",
        fontSize: 14,
        color: "#FFFFFF",
        marginLeft: 5,
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
        paddingLeft: 18,
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
        marginBottom: 20,
    },
    buttonRow: {
        flexDirection: "row",
        marginVertical: 20,
    },
});
