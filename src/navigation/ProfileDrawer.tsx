import React, { useContext, useState, useEffect, useRef } from "react";
import { createDrawerNavigator, DrawerContentScrollView } from "@react-navigation/drawer";
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
import { AuthContext } from '../components/context/AuthProvider';
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
import AntDesign from "react-native-vector-icons/AntDesign";
import apiClient from "../services/apiBaseUrl";
import { drawerNavigationRef } from "./navigationRef";
import TabNavigator from "./TabNavigator";

const Drawer = createDrawerNavigator();
const { width } = Dimensions.get('window');

const CustomDrawerContent = (props: any) => {
  const { logout } = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [stats, setStats] = useState({ orderCount: 0, wishListCount: 0, reviewCount: 0 });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    loadUserInfo();

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const loadUserInfo = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        setUserInfo(user);
        const overview = await apiClient.get(`v2/orders/getUserOverView/${user.userId}`);
        setStats(overview.data);
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const menuItems = [
    { name: 'My Account', icon: (color: string, size: number) => <Feather name="user" size={size} color={color} />, screenName: 'My Account' },
    { name: 'My Orders', icon: (color: string, size: number) => <Feather name="box" size={size} color={color} />, screenName: 'Orders' },
    { name: 'Address', icon: (color: string, size: number) => <EvilIcons name="location" size={28} color={color} />, screenName: 'DeliveryAddress' },
    { name: 'Offers', icon: (color: string, size: number) => <MaterialCommunityIcons name="tag-outline" size={size} color={color} />, screenName: 'Offers' },
    { name: 'Wishlist', icon: (color: string, size: number) => <Foundation name="heart" size={size} color="#FF6B6B" />, screenName: 'Wishlist' },
    { name: 'Support', icon: (color: string, size: number) => <Feather name="headphones" size={size} color={color} />, screenName: 'Support' },
    { name: 'FAQ', icon: (color: string, size: number) => <SimpleLineIcons name="question" size={size} color={color} />, screenName: 'FAQ' },
    { name: 'Terms & Conditions', icon: (color: string, size: number) => <MaterialIcons name="verified-user" size={size} color={color} />, screenName: 'TermsAndConditions' },
    { name: 'Privacy Policy', icon: (color: string, size: number) => <MaterialIcons name="security" size={size} color={color} />, screenName: 'PrivacyPolicy' },
  ];

  const handleLogout = () => {
    logout();
    setTimeout(() => props.navigation.reset({ index: 0, routes: [{ name: "Main" }] }), 100);
  };

  return (
    <View style={styles.drawerContainer}>
      <LinearGradient colors={['#0077CC', '#0056B3']} style={styles.headerGradient}>
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {userInfo?.profileImage ? <Image source={{ uri: userInfo.profileImage }} style={styles.avatarImage} /> :
                <MaterialIcons name="person" size={40} color="#FFFFFF" />}
            </View>
            <View style={styles.onlineIndicator} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userInfo?.username || 'Welcome!'}</Text>
            <Text style={styles.userEmail}>{userInfo?.email || 'user@example.com'}</Text>
            <View style={styles.userStats}>
              <View style={styles.statItem}><Text style={styles.statNumber}>{stats.orderCount}</Text><Text style={styles.statLabel}>Orders</Text></View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}><Text style={styles.statNumber}>{stats.wishListCount}</Text><Text style={styles.statLabel}>Wishlist</Text></View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}><Text style={styles.statNumber}>{stats.reviewCount}</Text><Text style={styles.statLabel}>Reviews</Text></View>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      <DrawerContentScrollView {...props} contentContainerStyle={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => (
          <Animated.View key={item.screenName} style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
            <TouchableOpacity style={styles.menuItem} onPress={() => props.navigation.navigate(item.screenName)}>
              <View style={styles.menuItemIcon}>{item.icon('#0077CC', 24)}</View>
              <Text style={styles.menuItemText}>{item.name}</Text>
              <MaterialIcons name="chevron-right" size={20} color="#CCCCCC" />
            </TouchableOpacity>
          </Animated.View>
        ))}

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <View style={styles.logoutIcon}><MaterialCommunityIcons name="logout" size={24} color="#FF6B6B" /></View>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </DrawerContentScrollView>
    </View>
  );
};

const ProfileWithHeader = ({ navigation }: any) => {
  const [isEditing, setEditing] = useState(false);
  const profileRef = useRef<any>(null);

  const handleSave = async () => {
    if (profileRef.current) await profileRef.current.handleSaveProfile();
    setEditing(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <UnifiedHeader
        title="My Account"
        showMenuButton={true}
        onMenuPress={() => navigation.openDrawer()}
        rightIcon={
          !isEditing ? <TouchableOpacity onPress={() => setEditing(true)}><MaterialIcons name="edit" size={22} color="#0094FF" /></TouchableOpacity> :
            <TouchableOpacity onPress={handleSave}><AntDesign name="check" size={24} color="#0094FF" /></TouchableOpacity>
        }
      />
      <Profile ref={profileRef} isEditing={isEditing} />
    </View>
  );
};

export default function ProfileDrawer() {
  const { logout } = useContext(AuthContext);

  return (

    <Drawer.Navigator
      // ref={drawerNavigationRef}
      initialRouteName="My Account"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        header: ({ navigation, route, options }) => {
          const titleMap: any = {
            "My Account": "My Account",
            Orders: "My Orders",
            DeliveryAddress: "Address",
            Offers: "Offers",
            Wishlist: "Wishlist",
            Support: "Support",
            FAQ: "FAQ",
            TermsAndConditions: "Terms & Conditions",
            PrivacyPolicy: "Privacy Policy",
          };
          return (
            <UnifiedHeader
              title={titleMap[route.name]}
              showMenuButton={true}
              onMenuPress={() => navigation.openDrawer()}
            />
          );
        },
        drawerStyle: { backgroundColor: '#FFFFFF', width: 300 },
        drawerType: 'slide',
        overlayColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >

      <Drawer.Screen name="My Account" component={ProfileWithHeader} options={{ headerShown: false }}
      />
      <Drawer.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
      <Drawer.Screen name="Orders" component={Orders} />
      <Drawer.Screen name="DeliveryAddress" component={DeliveryAddress} />
      <Drawer.Screen name="Offers" component={Offers} />
      <Drawer.Screen name="Wishlist" component={Wishlist} />
      <Drawer.Screen name="Support" component={Support} />
      <Drawer.Screen name="FAQ" component={FAQ} />
      <Drawer.Screen name="TermsAndConditions" component={TermsAndConditions} />
      <Drawer.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  headerGradient: { paddingTop: 40, paddingBottom: 30, paddingHorizontal: 20 },
  headerContent: { alignItems: 'center' },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
  avatarImage: { width: 74, height: 74, borderRadius: 37 },
  onlineIndicator: { position: 'absolute', bottom: 2, right: 2, width: 20, height: 20, borderRadius: 10, backgroundColor: '#4CAF50', borderWidth: 3, borderColor: '#fff' },
  userInfo: { alignItems: 'center' },
  userName: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 },
  userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  userStats: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16 },
  statItem: { alignItems: 'center', paddingHorizontal: 8 },
  statNumber: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 2 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  statDivider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 8 },
  menuContainer: { paddingTop: 20, paddingBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 16, marginVertical: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  menuItemIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuItemText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, backgroundColor: '#FFF5F5', borderRadius: 12, borderWidth: 1, borderColor: '#FEE2E2', marginHorizontal: 16, marginTop: 20 },
  logoutIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  logoutText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#FF6B6B' },
});
