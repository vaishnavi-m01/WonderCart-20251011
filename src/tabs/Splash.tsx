import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/StackScreen';


type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;
type Props = {
  navigation: LoginScreenNavigationProp;
};

const Splash = ({ navigation }: Props) => {
  useEffect(() => {
    console.log(' Splash started...');
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2000);

    return () => clearTimeout(timer);
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
