import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Platform, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Home from '../tabs/Home';
import Category from '../tabs/Categories';
import Cart from '../tabs/Cart';
import Notification from '../tabs/Notification';
import ProfileDrawer from './ProfileDrawer';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 11,
          marginBottom: Platform.OS === 'android' ? 4 : 0,
        },
        tabBarIconStyle: {
          marginTop: 6,
        },
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 6,
          backgroundColor: '#E3F2FF',
          borderTopColor: '#e0e0e0',
          borderTopWidth: 1,
          elevation: 8,
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8e8e93',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';
          switch (route.name) {
            case 'Home':
              iconName = 'home-outline';
              break;
            case 'Categories':
              iconName = 'grid-outline';
              break;
            case 'Cart':
              iconName = 'cart-outline';
              break;
            case 'Notification':
              iconName = 'notifications-outline';
              break;
            case 'Profile':
              iconName = 'person-outline';
              break;
          }
          if (route.name === 'Cart') {
            return (<View style={style.cartWrapper}>
              <Ionicons
                name={iconName}
                size={24}
                color={focused ? '#ffffff' : '#fff'} />
            </View>
            );
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Categories" component={Category} options={{ tabBarLabel: 'Categories' }} />
      <Tab.Screen name="Cart" component={Cart} options={{ tabBarLabel: 'Cart' }} />
      <Tab.Screen name="Notification" component={Notification} options={{ tabBarLabel: 'Notification' }} />
      {/* <Tab.Screen name="Profile" component={Profile} options={{ tabBarLabel: 'Profile' }} /> */}
      <Tab.Screen name="Profile" component={ProfileDrawer} options={{ lazy: false }} />

    </Tab.Navigator>
  );
};

export default TabNavigator;


const style = StyleSheet.create({
  cartWrapper: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: '#0094FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    padding: 5,

    ...Platform.select({
      android: {
        elevation: 6,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2,
        shadowRadius: 4,
      },
    }),
  },
})