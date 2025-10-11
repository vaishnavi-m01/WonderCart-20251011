import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Fontisto from 'react-native-vector-icons/Fontisto';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface UnifiedHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  showSearch?: boolean;
  showWishlist?: boolean;
  searchText?: string;
  onSearchChange?: (text: string) => void;
  onSearchSubmit?: () => void;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  onWishlistPress?: () => void;
  onSearchToggle?: () => void;
  isSearchActive?: boolean;
  rightIcon?: React.ReactNode;
  headerStyle?: 'default' | 'home' | 'minimal';
}

const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  showMenuButton = false,
  showSearch = false,
  showWishlist = false,
  searchText = '',
  onSearchChange,
  onSearchSubmit,
  onBackPress,
  onMenuPress,
  onWishlistPress,
  onSearchToggle,
  isSearchActive = false,
  rightIcon,
  headerStyle = 'default',
}) => {
  const getHeaderStyles = () => {
    switch (headerStyle) {
      case 'home':
        return {
          container: styles.homeContainer,
          title: styles.homeTitle,
          subtitle: styles.homeSubtitle,
        };
      case 'minimal':
        return {
          container: styles.minimalContainer,
          title: styles.minimalTitle,
          subtitle: styles.minimalSubtitle,
        };
      default:
        return {
          container: styles.defaultContainer,
          title: styles.defaultTitle,
          subtitle: styles.defaultSubtitle,
        };
    }
  };

  const headerStyles = getHeaderStyles();

  return (
    <View style={[styles.container, headerStyles.container]}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
          >
            <AntDesign name="left" color="#0077CC" size={22} />
          </TouchableOpacity>
        )}
        {showMenuButton && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={onMenuPress}
          >
            <MaterialIcons name="menu" color="#0077CC" size={24} />
          </TouchableOpacity>
        )}

        {!isSearchActive && (
          <View style={styles.titleContainer}>
            <Text style={[styles.title, headerStyles.title]}>{title}</Text>
            {subtitle && (
              <Text style={[styles.subtitle, headerStyles.subtitle]}>{subtitle}</Text>
            )}
          </View>
        )}

        {isSearchActive && showSearch && (
          <View style={styles.searchBar}>
            <AntDesign name="search1" color="#0077CC" size={18} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor="#999"
              value={searchText}
              returnKeyType="search"
              onChangeText={onSearchChange}
              onSubmitEditing={onSearchSubmit}
              autoFocus
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => onSearchChange?.('')}>
                <AntDesign name="close" color="#999" size={16} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.rightSection}>
        {!isSearchActive && showSearch && (
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={onSearchToggle}
          >
            <Fontisto name="search" color="#0077CC" size={20} />
          </TouchableOpacity>
        )}
        
        {showWishlist && (
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={onWishlistPress}
          >
            <EvilIcons name="heart" color="#0077CC" size={24} />
          </TouchableOpacity>
        )}
        
        {rightIcon}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 12,
    left:-6
  },
  menuButton: {
    padding: 8,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 44,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  
  // Header Style Variants
  defaultContainer: {
    // Uses base container styles
  },
  defaultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  defaultSubtitle: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  
  homeContainer: {
    backgroundColor: '#FFFFFF',
    elevation: 8,
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  homeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0077CC',
  },
  homeSubtitle: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '400',
  },
  
  minimalContainer: {
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowOpacity: 0.08,
    shadowRadius: 2,
    paddingTop: 12,
    paddingBottom: 16,
  },
  minimalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0077CC',
  },
  minimalSubtitle: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '400',
  },
});

export default UnifiedHeader;
