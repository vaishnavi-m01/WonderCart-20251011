import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  FlatList,
  ViewToken,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ Import this

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: any;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Shop Everything You Love',
    subtitle: 'Browse thousands of products across',
    description: 'All your needs in one place.',
    image: require('../assets/images/GetStarted1.png'),
  },
  {
    id: '2',
    title: 'Easy & Secure Checkout',
    subtitle: 'Fast payments with 100% security.',
    description: 'Multiple options for your convenience.',
    image: require('../assets/images/GetStarted2.png'),
  },
  {
    id: '3',
    title: 'Fast Delivery at Your Doorstep',
    subtitle: 'Get your orders quickly and safely.',
    description: 'Track every step in real-time.',
    image: require('../assets/images/GetStarted3.png'),
  },
];

const OnboardingScreen = () => {
  const navigation = useNavigation<any>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index ?? 0);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      scrollToIndex(currentIndex + 1);
    } else {
      handleGetStarted(); 
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true'); 
    navigation.replace('Main'); 
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    navigation.replace('Main');
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <Text style={styles.header}>{item.title}</Text>
      <Text style={styles.subtitle}>
        {item.subtitle}
        {item.id === '1' && '\ncategories.'}
      </Text>
      <Text style={styles.description}>{item.description}</Text>
      <Image source={item.image} style={styles.image} resizeMode="contain" />
    </View>
  );

  return (
    <View style={styles.container}>
     
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
        style={styles.flatList}
      />

      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        {slides.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              currentIndex === index ? styles.activeDot : styles.inactiveDot,
            ]}
            onPress={() => scrollToIndex(index)}
          />
        ))}
      </View>

      {/* Next/Get Started Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={currentIndex === slides.length - 1 ? handleGetStarted : handleNext}
      >
        <Text style={styles.buttonText}>
          {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OnboardingScreen;

// styles (unchanged)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: '#007CEE',
    fontSize: 16,
    fontWeight: '600',
  },
  flatList: {
    flex: 1,
  },
  slide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    color: '#000000',
    letterSpacing: 1,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  subtitle: {
    color: '#7B7B7B',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
    fontWeight: '500',
  },
  description: {
    color: '#7B7B7B',
    marginTop: 12,
    fontWeight: '500',
    fontSize: 15,
    textAlign: 'center',
  },
  image: {
    width: width * 0.9,
    height: height * 0.4,
    marginTop: 40,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    margin: 5,
    borderRadius: 30,
  },
  activeDot: {
    backgroundColor: '#007CEE',
    width: 24,
    height: 8,
  },
  inactiveDot: {
    backgroundColor: '#D0D0D0',
    width: 8,
    height: 8,
  },
  button: {
    marginHorizontal: 40,
    marginBottom: 50,
    borderRadius: 30,
    backgroundColor: '#007CEE',
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#007CEE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
