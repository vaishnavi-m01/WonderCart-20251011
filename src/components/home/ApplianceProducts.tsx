import React from 'react';
import {
  View,
  FlatList,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';



const offersData = [
  {
    id: 1,
    title: 'Up to 40% off | Laptops',
    image: require('../../assets/images/Laptops.png'),
  },
  {
    id: 2,
    title: 'Up to 70% off | Headphones',
    image: require('../../assets/images/HeadPhone.png'),
  },
  {
    id: 3,
    title: 'Up to 60% off | Tablets',
    image: require('../../assets/images/HeadPhones.png'),
  },
  {
    id: 4,
    title: 'Up to 70% off | Camera',
    image: require('../../assets/images/CCTV.png'),
  },
];

type OfferItem = {
  id: number;
  title: string;
  image: any;
};


const { width } = Dimensions.get('window');
const CARD_MARGIN = 10;
const CARD_WIDTH = (width - CARD_MARGIN * 3) / 2;


const AmazonStyleGrid = () => {
  const renderItem = ({ item }: { item: OfferItem }) => (

    <TouchableOpacity style={styles.card}>
      <View style={styles.coloredBackground}>
        <View style={styles.circleHighlight} />
        <Image source={item.image} style={styles.productImage} resizeMode="contain" />
      </View>
      <Text style={styles.title}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Deals on Electronics</Text>
      <FlatList
        data={offersData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default AmazonStyleGrid;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    // textAlign: 'center',
    marginVertical: 10,
    color: '#222',
    marginLeft:10,
    marginBottom:10
  },
  listContent: {
    paddingHorizontal: CARD_MARGIN,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    marginBottom: CARD_MARGIN * 2,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  coloredBackground: {
    backgroundColor: '#9ef7fb',  
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    position: 'relative',

  },
  circleHighlight: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: '#0098a5',
    borderRadius: 50,
    opacity: 0.6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  productImage: {
    width: 80,
    height: 80,
  },
  title: {
    padding: 8,
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
  },
});
