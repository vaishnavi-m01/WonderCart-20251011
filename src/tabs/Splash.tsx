import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/StackScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';


type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;
type Props = {
  navigation: LoginScreenNavigationProp;
};

const Splash = ({ navigation }: Props) => {
 
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      console.log('Splash started...');
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        setTimeout(() => {
          if (hasSeenOnboarding === 'true') {
            navigation.replace('Main');
          } else {
            navigation.replace('Onboarding');
          }
        }, 2000);
      } catch (error) {
        console.log('Error checking onboarding status:', error);
        navigation.replace('Onboarding');
      }
    };

    checkOnboardingStatus();
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* <Text style={styles.logoText}>W</Text>
      <Text style={styles.appName}>Wondercart</Text> */}
      <Image source={require("../assets/images/splash.png")} style={{height:280,width:280}}></Image>
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  logoText: {
    fontSize: 60,
    color: '#007aff',
    fontWeight: 'bold',
    fontFamily: 'fantasy',

  },
  appName: {
    fontSize: 22,
    color: '#007aff',
    fontWeight: 'bold',
    fontFamily: 'fantasy',
  },
});
