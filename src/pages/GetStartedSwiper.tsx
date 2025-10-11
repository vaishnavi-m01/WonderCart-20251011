import React from 'react';
import Swiper from 'react-native-swiper';
import { StyleSheet, View } from 'react-native';
import GetStarted1 from './GetStarted1';
import GetStarted2 from './GetStarted2';
import GetStarted3 from './GetStarted3';

const GetStartedSwiper = () => {
  return (
    <Swiper
      loop={false}
      showsButtons={false}
      autoplay={false}
      dotStyle={styles.dot}
      activeDotStyle={styles.activeDot}
      paginationStyle={styles.pagination}
    >
      <View style={styles.slide}><GetStarted1 /></View>
      <View style={styles.slide}><GetStarted2 /></View>
      <View style={styles.slide}><GetStarted3 /></View>
    </Swiper>
  );
};

export default GetStartedSwiper;

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: '#ccc',
    margin: 3,
    marginTop: 6,
  },
  activeDot: {
    backgroundColor: '#0094FF',
    width: 15,
    height: 8,
    borderRadius: 30,
    marginTop: 6,
    margin: 3,
  },
  pagination: {
    position: 'absolute',
    top: '0%',          // 👈 centers vertically on screen
    alignSelf: 'center', // 👈 centers horizontally
    transform: [{ translateY: -20 }], // 👈 adjust up/down a bit if needed
  },
});
