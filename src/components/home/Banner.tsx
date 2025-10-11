import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const OfferBanner = () => {
  return (
    <TouchableOpacity style={styles.bannerContainer}>
      <Text style={styles.emoji}>🎉</Text>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Special Offer Just for You!</Text>
        <Text style={styles.subtitle}>Get 25% off on your next purchase</Text>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Claim Now</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default OfferBanner;

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#FFF0D9',
    padding: 16,
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#FF9F29',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
