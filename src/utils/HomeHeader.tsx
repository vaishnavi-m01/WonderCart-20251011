import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  View,
  Text,
  TextInput,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import EvilIcons from 'react-native-vector-icons/EvilIcons';

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44;

const HomeHeader = () => {
    const navigation = useNavigation();
  return (
    <LinearGradient
      colors={['#1565C0', '#1E88E5']}
      style={styles.appBar}
    >
      
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Header content */}
      <View style={styles.headerContent}>
        <Text style={styles.title}>
          <Text style={{ color: '#fff' }}>WonderCart</Text>
        </Text>

        <TextInput
          style={styles.searchInputs}
          placeholder="Search products"
          placeholderTextColor="#ccc"
        />

        <TouchableOpacity onPress={() => navigation.navigate("Wishlist" as never)}>
          <EvilIcons name="heart" color="#fff" size={30} style={styles.heartIcon} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default HomeHeader;


const styles = StyleSheet.create({
  appBar: {
    paddingTop: STATUSBAR_HEIGHT, 
    paddingHorizontal: 16,
    paddingBottom: 12,
    width: '100%',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  searchInputs: {
    flex: 1,
    backgroundColor: '#ffffff33',
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 36,
    fontSize: 14,
    color: '#fff',
    marginHorizontal: 8,
  },
  heartIcon: {
    marginLeft: 8,
  },
});
