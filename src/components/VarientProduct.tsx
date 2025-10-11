import React from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  GestureResponderEvent,
  Text,
} from 'react-native';

interface Props {
  imageUrl: string;
   image?: any[];
   price:number;
  isSelected: boolean;
  onPress: (event: GestureResponderEvent) => void;
  size?: number;
}

const VarientProduct: React.FC<Props> = ({
  imageUrl,
  isSelected,
  price,
  onPress,
  size = 70,
}) => {
  const borderRadius = size / 2;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View
        style={[
          styles.borderWrapper,
          {
            width: size + 8,
            height: size + 8,
            borderRadius: (size + 8) / 2,
            borderColor: isSelected ? '#6fcdfcff' : '#CCCCCC',
          },
        ]}
      >
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: size,
            height: size,
            borderRadius,
          }}
          resizeMode="cover"
        />
        
      </View>
      <Text style={styles.price}>₹{price}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  borderWrapper: {
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  price:{
    textAlign:"center",
    marginTop:5,
    color:"gray",
    fontWeight:"bold"
  }
});

export default VarientProduct;
