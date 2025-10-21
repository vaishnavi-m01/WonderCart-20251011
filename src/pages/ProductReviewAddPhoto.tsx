import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ToastAndroid,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  PermissionsAndroid,
} from "react-native";
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import apiClient from "../services/apiBaseUrl";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type RootStackParamList = {
  ProductReviewAddPhoto: {
    productId: number;
    variantId: number;
    userId: number;
    productReviewId?: number;
  };
};

type FetchedImage = {
  id?: number; // API images have id
  uri: string; // Image URL or local URI
  isNew?: boolean; // True if selected from gallery/camera
};

const ProductReviewAddPhoto = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, "ProductReviewAddPhoto">>();
  const { productId, variantId, userId, productReviewId } = route.params;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [latestReview, setLatestReview] = useState<any>(null);
  const [images, setImages] = useState<FetchedImage[]>([]);
  const [visibleXIndex, setVisibleXIndex] = useState<number | null>(null);

  // Fetch previous review
  useEffect(() => {
    const fetchReview = async () => {
      if (productReviewId) {
        try {
          const response = await apiClient.get(`v1/productReview/${productReviewId}`);
          const reviewData = response.data;
          setLatestReview(reviewData);
          setRating(reviewData.rating);
          setReview(reviewData.reviewText);
        } catch (error) {
          console.error("Error fetching product review:", error);
        }
      }
    };
    fetchReview();
  }, [productReviewId]);

  // Fetch API images
  useEffect(() => {
    const fetchReviewImages = async (reviewId: number) => {
      try {
        const response = await apiClient.get(`v1/productReviewImage?ReviewId=${reviewId}`);
        const apiImages: FetchedImage[] = response.data.map((img: any) => ({
          id: img.id,
          uri: img.imageUrl,
          isNew: false,
        }));
        setImages(apiImages);
      } catch (error) {
        console.error("Error fetching review images:", error);
      }
    };

    if (productReviewId) fetchReviewImages(productReviewId);
  }, [productReviewId]);

  // ---------- Submit Review ----------
  const handleSubmit = async () => {
    if (rating === 0) {
      ToastAndroid.show("Please select a rating", ToastAndroid.SHORT);
      return;
    }
    if (!review.trim()) {
      ToastAndroid.show("Please enter your review", ToastAndroid.SHORT);
      return;
    }

    setLoading(true);
    const payload = { productId, variantId, userId, rating, reviewText: review };

    try {
      let reviewId = latestReview?.productReviewId;

      if (!reviewId) {
        const response = await apiClient.post("v1/productReview", payload);
        reviewId = response?.data?.productReviewId;
      } else {
        await apiClient.put(`v1/productReview/${reviewId}`, payload);
      }

      if (!reviewId) {
        ToastAndroid.show("Review submitted but no ID returned", ToastAndroid.SHORT);
        setLoading(false);
        return;
      }

      const key = `productReview_${productId}_${variantId}_${userId}`;
      await AsyncStorage.setItem(key, reviewId.toString());

      // Upload new images
      const newImages = images.filter(img => img.isNew);
      for (let i = 0; i < newImages.length; i++) {
        const formData = new FormData();
        formData.append("file", {
          uri: newImages[i].uri,
          name: `review_image_${i}.jpg`,
          type: "image/jpeg",
        } as any);

        try {
          await apiClient.post(
            `v1/productReviewImage/imageUpload/${reviewId}`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
          console.log("Image uploaded Successfully")

        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
        }
      }

      setLatestReview({
        productReviewId: reviewId,
        productId,
        variantId,
        userId,
        rating,
        reviewText: review,
        createdAt: new Date().toISOString(),
      });

      ToastAndroid.show("Review submitted successfully!", ToastAndroid.SHORT);
    } catch (error) {
      console.error("Review submit error", error);
      ToastAndroid.show("Error submitting review", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Camera Permission ----------
  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "App needs camera access to take photos.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  // ---------- Camera ----------
  const openCamera = async () => {
    // const hasPermission = await requestCameraPermission();
    // if (!hasPermission) {
    //   ToastAndroid.show("Camera permission denied", ToastAndroid.SHORT);
    //   return;
    // }

    try {
      const result = await launchCamera({
        mediaType: "photo",
        quality: 1,
        cameraType: "back",
        saveToPhotos: true,
      });

      if (result.didCancel) return;
      if (result.errorCode) return;

      if (result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        if (uri) setImages(prev => [...prev, { uri, isNew: true }]);
      }
    } catch (err) {
      console.log("Camera Exception:", err);
    } finally {
      setIsModalVisible(false);
    }
  };

  // ---------- Gallery ----------
  const openGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: "photo",
        quality: 1,
        selectionLimit: 0,
      });

      if (result.didCancel) return;
      if (result.errorCode) return;

      if (result.assets && result.assets.length > 0) {
        const uris = result.assets
          .map(asset => asset.uri)
          .filter(uri => !!uri)
          .map(uri => ({ uri: uri!, isNew: true }));

        setImages(prev => [...prev, ...uris]);
      }
    } catch (err) {
      console.error("Gallery Exception:", err);
    } finally {
      setIsModalVisible(false);
    }
  };

  // ---------- Remove/Delete Image ----------
  const removeImage = async (index: number) => {
    const img = images[index];
    if (!img) return;

    if (img.isNew) {
      // Just remove locally
      setImages(prev => prev.filter((_, i) => i !== index));
    } else if (img.id) {
      // API image: delete from server
      try {
        await apiClient.delete(`v1/productReviewImage/${img.id}`);
        setImages(prev => prev.filter((_, i) => i !== index));
        ToastAndroid.show("Image deleted", ToastAndroid.SHORT);
      } catch (err) {
        console.error("Failed to delete image", err);
        ToastAndroid.show("Failed to delete image", ToastAndroid.SHORT);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === "ios" ? 20 : 40}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Images Horizontal Scroll --- */}


        {/* --- Add Photo Button --- */}
        <TouchableOpacity style={styles.addPhotoWrapper} onPress={() => setIsModalVisible(true)}>
          <Image source={require("../assets/images/addPhoto.png")} style={styles.addPhotoImg} />
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
          {images.map((img, index) => (
            <TouchableOpacity
              key={img.id || img.uri}
              style={styles.imageWrapper}
              activeOpacity={1}
              onPress={() => setVisibleXIndex(visibleXIndex === index ? null : index)}
            >
              <Image source={{ uri: img.uri }} style={styles.previewImg} />
              {visibleXIndex === index && (
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => {
                    removeImage(index);
                    setVisibleXIndex(null);
                  }}
                >
                  <Icon name="close" size={16} color="#fff" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.reviewSection}>
          <Text style={styles.label}>Rating</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <TouchableOpacity key={i} onPress={() => setRating(i)}>
                <Icon name="star" size={30} color={i <= rating ? "#FFD700" : "#ccc"} />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Type Comment</Text>
          <TextInput
            placeholder="Write your review..."
            style={styles.textArea}
            value={review}
            onChangeText={setReview}
            multiline
          />

          <TouchableOpacity
            style={[styles.reviewbtn, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.feedbacktext}>{loading ? "Processing..." : "Submit"}</Text>
          </TouchableOpacity>
        </View>

        {/* --- Modal --- */}
        <Modal animationType="slide" transparent visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <TouchableOpacity onPress={openCamera} style={styles.modalButton}>
                <Text style={styles.modalText}>📷 Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={openGallery} style={styles.modalButton}>
                <Text style={styles.modalText}>🖼️ Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.modalCancel}>
                <Text style={styles.modalText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProductReviewAddPhoto;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  addPhotoWrapper: { marginTop: 20, alignItems: "center", justifyContent: "center" },
  addPhotoImg: { width: 100, height: 100, borderRadius: 10 },
  scrollContent: { paddingBottom: 0, alignItems: "center" },
  imageScroll: { marginVertical: 15, paddingHorizontal: 10, marginTop: 40 },
  imageWrapper: { position: "relative", marginRight: 10 },
  previewImg: { width: 90, height: 90, borderRadius: 10, borderWidth: 1, borderColor: "#ddd" },
  removeBtn: { position: "absolute", top: 4, right: 4, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 12, padding: 2 },
  reviewSection: { marginTop: 8, width: "90%", backgroundColor: "#fff", borderRadius: 10, padding: 16, elevation: 2 },
  label: { fontSize: 15, fontWeight: "600", color: "#333", marginBottom: 8, marginTop: 10 },
  starRow: { flexDirection: "row", marginBottom: 10 },
  textArea: { borderWidth: 1, borderColor: "#CECECE", borderRadius: 8, padding: 10, height: 120, textAlignVertical: "top", backgroundColor: "#FAFAFA" },
  reviewbtn: { backgroundColor: "#00A2F4", borderRadius: 8, paddingVertical: 14, marginTop: 20, alignItems: "center" },
  feedbacktext: { color: "#fff", fontWeight: "700", fontSize: 15 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  modalContainer: { backgroundColor: "#fff", padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalButton: { paddingVertical: 15, alignItems: "center" },
  modalCancel: { paddingVertical: 15, alignItems: "center", borderTopWidth: 1, borderColor: "#ddd" },
  modalText: { fontSize: 16, fontWeight: "600" },
});
