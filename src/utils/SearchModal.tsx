import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Props {
  onClose: () => void;
  onSearch: (term: string) => void;
}

const popularSearches = ['Saree', 'Kurtis', 'Gold Necklace', 'Silk Dress'];

const SearchModal: React.FC<Props> = ({ onClose, onSearch }) => {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const loadRecent = async () => {
      const saved = await AsyncStorage.getItem('recentSearches');
      if (saved) setRecentSearches(JSON.parse(saved));
    };
    loadRecent();
  }, []);

  return (
    <Modal animationType="slide" transparent={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Recent Searches</Text>
        <FlatList
          data={recentSearches}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => {
              onSearch(item);
              onClose();
            }} style={styles.searchItem}>
              <Icon name="history" size={18} color="#666" />
              <Text style={styles.searchText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
        <Text style={styles.title}>Popular Searches</Text>
        <FlatList
          data={popularSearches}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => {
              onSearch(item);
              onClose();
            }} style={styles.searchItem}>
              <Icon name="trending-up" size={18} color="#666" />
              <Text style={styles.searchText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default SearchModal;

const styles = StyleSheet.create({
  container: {
   
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  searchText: {
    marginLeft: 10,
    fontSize: 16,
  },
  closeBtn: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#000',
    borderRadius: 8,
  },
  closeText: {
    color: '#fff',
    textAlign: 'center',
  },
});
