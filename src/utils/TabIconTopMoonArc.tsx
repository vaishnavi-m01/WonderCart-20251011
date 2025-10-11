import React from 'react';
import { View, StyleSheet } from 'react-native';

const TabIconTopMoonArc = () => {
  return <View style={styles.moonArc} />;
};

const styles = StyleSheet.create({
  moonArc: {
    width: 36,
    height: 18,
    backgroundColor: '#0094FF', 
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    position: 'absolute',
    top: -20, 
    alignSelf: 'center',
    zIndex: 10,
  },
});

export default TabIconTopMoonArc;
