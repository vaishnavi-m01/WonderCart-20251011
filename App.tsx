import React from 'react';
import {
  View,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AddToCartItem } from './src/components/context/AddToCartItem';
import Toast from 'react-native-toast-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import StackScreen from './src/navigation/StackScreen';
import { AuthProvider } from './src/components/context/AuthProvider';

const STATUSBAR_HEIGHT = Platform.select({
  android: (StatusBar.currentHeight || 25) + 5,
  ios: 48,
  default: 50
});

export default function App() {
  console.log("app");
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AddToCartItem>
        <AuthProvider>

          <SafeAreaProvider style={styles.root}>

            <StatusBar
              translucent
              backgroundColor="transparent"
              barStyle="light-content"
            />

            <LinearGradient
              colors={['#1565C0', '#1E88E5']}
              style={styles.gradientBackground}
            />

            <View style={styles.content}>
              <StackScreen />
            </View>
          </SafeAreaProvider>
        </AuthProvider>

        <Toast />
      </AddToCartItem>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  gradientBackground: {
    position: 'absolute',
    height: STATUSBAR_HEIGHT,
    width: '100%',
    zIndex: -1,
  },
  content: {
    flex: 1,
    marginTop: STATUSBAR_HEIGHT,
  },
});
