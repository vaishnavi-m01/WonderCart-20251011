import React from 'react';
import { View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = {
  rating: number;
};

const StarDisplay = ({ rating }: Props) => {
  return (
    <View style={{ flexDirection: 'row' }}>
      {[...Array(5)].map((_, index) => (
        <Ionicons
          key={index}
          name={index < rating ? 'star' : 'star-outline'}
          size={16}
          color="#f1c40f"
        />
      ))}
    </View>
  );
};

export default StarDisplay;
