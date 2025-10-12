import React, { useContext, useState, useEffect } from "react";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { View, TouchableOpacity, Text, StyleSheet, Image, Animated, Dimensions } from "react-native";
import Feather from 'react-native-vector-icons/Feather';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Foundation from 'react-native-vector-icons/Foundation';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UnifiedHeader from '../components/common/UnifiedHeader';
import Orders from "../components/profile.tsx/Orders";
import DeliveryAddress from "../pages/DeliveryAddress";
import Offers from "../components/profile.tsx/Offers";
import Wishlist from "../pages/Wishlist";
import Support from "../components/profile.tsx/Support";
import FAQ from "../components/profile.tsx/FAQ";
import TermsAndConditions from "../components/profile.tsx/TermsAndConditions";
import PrivacyPolicy from "../components/profile.tsx/PrivacyPolicy";
import Profile from "../tabs/Profile";
import { Platform, StatusBar } from "react-native";
import { AuthContext } from '../components/context/AuthProvider';




const Drawer = createDrawerNavigator();
const { width } = Dimensions.get('window');

// Custom Drawer Content Component
const CustomDrawerContent = (props: any) => {
  const { logout, isLoggedIn } = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-50));

  useEffect(() => {
    // Load user info
    loadUserInfo();

    // Animate drawer content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadUserInfo = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        setUserInfo(JSON.parse(userString));
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const menuItems = [
    {
      name: 'My Account',
      icon: (color: string, size: number) => <Feather name="user" size={size} color={color} />,
      screenName: 'My Account',
    },
    {
      name: 'My Orders',
      icon: (color: string, size: number) => <Feather name="box" size={size} color={color} />,
      screenName: 'Orders',
    },
    {
      name: 'Address',
      icon: (color: string, size: number) => <EvilIcons name="location" size={28} color={color} />,
      screenName: 'DeliveryAddress',
    },
    {
      name: 'Offers',
      icon: (color: string, size: number) => <MaterialCommunityIcons name="tag-outline" size={size} color={color} />,
      screenName: 'Offers',
    },
    {
      name: 'Wishlist',
      icon: (color: string, size: number) => <Foundation name="heart" size={size} color="#FF6B6B" />,
      screenName: 'Wishlist',
    },
    {
      name: 'Support',
      icon: (color: string, size: number) => <Feather name="headphones" size={size} color={color} />,
      screenName: 'Support',
    },
    {
      name: 'FAQ',
      icon: (color: string, size: number) => <SimpleLineIcons name="question" size={size} color={color} />,
      screenName: 'FAQ',
    },
    {
      name: 'Terms & Conditions',
      icon: (color: string, size: number) => <MaterialIcons name="verified-user" size={size} color={color} />,
      screenName: 'TermsAndConditions',
    },
    {
      name: 'Privacy Policy',
      icon: (color: string, size: number) => <MaterialIcons name="security" size={size} color={color} />,
      screenName: 'PrivacyPolicy',
    },
  ];

  const handleLogout = () => {
    logout();
    setTimeout(() => {
      props.navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
    }, 100);
  };

  return (
    <View style={styles.drawerContainer}>
      {/* Header Section with Gradient */}
      <LinearGradient
        colors={['#0077CC', '#0056B3']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* User Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {userInfo?.profileImage ? (
                <Image source={{ uri: userInfo.profileImage }} style={styles.avatarImage} />
              ) : (
                <MaterialIcons name="person" size={40} color="#FFFFFF" />
              )}
            </View>
            <View style={styles.onlineIndicator} />
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {userInfo?.username || userInfo?.name || 'Welcome!'}
            </Text>
            <Text style={styles.userEmail}>
              {userInfo?.email || 'user@example.com'}
            </Text>
            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Wishlist</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Reviews</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Menu Items */}
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.menuContainer}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map((item, index) => (
          <Animated.View
            key={item.screenName}
            style={[
              styles.menuItemContainer,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateX: slideAnim.interpolate({
                      inputRange: [-50, 0],
                      outputRange: [-50, 0],
                      extrapolate: 'clamp',
                    })
                  }
                ]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => props.navigation.navigate(item.screenName)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemIcon}>
                {item.icon('#0077CC', 24)}
              </View>
              <Text style={styles.menuItemText}>{item.name}</Text>
              <MaterialIcons name="chevron-right" size={20} color="#CCCCCC" />
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Logout Section */}
        <Animated.View
          style={[
            styles.logoutContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={styles.logoutIcon}>
              <MaterialCommunityIcons name="logout" size={24} color="#FF6B6B" />
            </View>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </DrawerContentScrollView>
    </View>
  );
};

// Wrapper component for Profile with UnifiedHeader
const ProfileWithHeader = ({ navigation }: any) => {
  return (
    <View style={{ flex: 1 }}>
      <UnifiedHeader
        title="My Account"
        showMenuButton={true}
        onMenuPress={() => navigation.openDrawer()}
        headerStyle="default"
      />
      <Profile />
    </View>
  );
};

export default function ProfileDrawer() {
  const { logout } = useContext(AuthContext);

  return (
    <Drawer.Navigator
      initialRouteName="My Account"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#FFFFFF',
          width: 300,
        },
        drawerType: 'slide',
        overlayColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >



      <Drawer.Screen
        name="My Account"
        component={ProfileWithHeader}
        options={{
          drawerIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}

      />
      <Drawer.Screen
        name="Orders"
        component={Orders}
        options={{
          title: "My Orders",
          headerShown: true,
          header: ({ navigation }) => (
            <UnifiedHeader
              title="MyOrders"
              showBackButton={true}
              onBackPress={() => navigation.goBack()}
              headerStyle="default"
            />
          ),
          drawerIcon: ({ color, size }) => <Feather name="box" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="DeliveryAddress"
        component={DeliveryAddress}
        options={{
          title: "My Orders",
          headerShown: true,
          header: ({ navigation }) => (
            <UnifiedHeader
              title="My Orders"
              showBackButton={true}
              onBackPress={() => navigation.goBack()}
              headerStyle="default"
            />
          ),
          drawerIcon: ({ color, size }) => <Feather name="box" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Offers"
        component={Offers}
        options={{
          title: "Offers",
          headerShown: true,
          header: ({ navigation }) => (
            <UnifiedHeader
              title="Offers"
              showBackButton={true}
              onBackPress={() => navigation.goBack()}
              headerStyle="default"
            />
          ),
          drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="tag-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Wishlist"
        component={Wishlist}
        options={{
          title: "Wishlist",
          headerShown: true,
          header: ({ navigation }) => (
            <UnifiedHeader
              title="Wishlist"
              showBackButton={true}
              onBackPress={() => navigation.goBack()}
              headerStyle="default"
            />
          ),
          drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="tag-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Support"
        component={Support}
        options={{
          title: "Support",
          headerShown: true,
          header: ({ navigation }) => (
            <UnifiedHeader
              title="Support"
              showBackButton={true}
              onBackPress={() => navigation.goBack()}
              headerStyle="default"
            />
          ),
          drawerIcon: ({ color, size }) => <Feather name="headphones" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="FAQ"
        component={FAQ}
        options={{
          title: "FAQ",
          headerShown: true,
          header: ({ navigation }) => (
            <UnifiedHeader
              title="FAQ"
              showBackButton={true}
              onBackPress={() => navigation.goBack()}
              headerStyle="default"
            />
          ),
          drawerIcon: ({ color, size }) => <Feather name="headphones" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="TermsAndConditions"
        component={TermsAndConditions}
       options={{
          title: "Terms & Conditions",
          headerShown: true,
          header: ({ navigation }) => (
            <UnifiedHeader
              title="Terms & Conditions
              "
              showBackButton={true}
              onBackPress={() => navigation.goBack()}
              headerStyle="default"
            />
          ),
          drawerIcon: ({ color, size }) => <Feather name="headphones" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicy}
        options={{
          title: "Privacy Policy",
          headerShown: true,
          header: ({ navigation }) => (
            <UnifiedHeader
              title="Privacy Policy"
              showBackButton={true}
              onBackPress={() => navigation.goBack()}
              headerStyle="default"
            />
          ),
          drawerIcon: ({ color, size }) => <Feather name="headphones" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Logout"
        component={() => null}
        listeners={({ navigation }) => ({
          focus: () => {
            logout();
            setTimeout(() => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Main" }],
              });
            }, 100);
          },
        })}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="logout" size={size} color={color} />
          ),
        }}
      />



    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarImage: {
    width: 74,
    height: 74,
    borderRadius: 37,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
    textAlign: 'center',
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 8,
  },
  menuContainer: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  menuItemContainer: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  logoutContainer: {
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
  },
});
