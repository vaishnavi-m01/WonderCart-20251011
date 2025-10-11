import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ToastAndroid,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import apiClient from '../services/apiBaseUrl';

interface WriteReviewModalProps {
  visible: boolean;
  onClose: () => void;
  productId: number;
  variantId: number;
  userId: number | null;
}

const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  visible,
  onClose,
  productId,
  variantId,
  userId,
}) => {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [review, setReview] = useState('');
  const navigation = useNavigation<any>();

  const handleSubmit = async () => {
    if (!userId) {
      ToastAndroid.show('Please login to submit review', ToastAndroid.SHORT);
      onClose();
      navigation.navigate('Main', { screen: 'Profile' });
      return;
    }

    if (rating === 0) {
      ToastAndroid.show('Please select a rating', ToastAndroid.SHORT);
      return;
    }
    if (!name.trim()) {
      ToastAndroid.show('Please enter your name', ToastAndroid.SHORT);
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
      ToastAndroid.show('Review submitted!', ToastAndroid.SHORT);
      onClose();
      setRating(0);
      setName('');
      setReview('');
    } catch (error) {
      console.error('Review submit error', error);
      ToastAndroid.show('Error submitting review', ToastAndroid.SHORT);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => { }}>
            <View style={styles.modalContent}>
              <Text style={styles.title}>Write a Review</Text>

              <Text style={styles.label}>Rating</Text>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TouchableOpacity key={i} onPress={() => setRating(i)}>
                    <Icon
                      name="star"
                      size={32}
                      color={i <= rating ? '#FFD700' : '#ccc'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                placeholder="Your name"
                style={styles.input}
                value={name}
                onChangeText={setName}
              />

              <TextInput
                placeholder="Write your review..."
                style={styles.textArea}
                value={review}
                onChangeText={setReview}
                multiline
                numberOfLines={5}
              />

              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
                  <Text style={styles.submitText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default WriteReviewModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '88%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  starRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    marginRight: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: '#555',
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
