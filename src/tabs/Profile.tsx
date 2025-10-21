import React, { forwardRef, useCallback, useEffect, useRef, useState, useImperativeHandle } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
  Alert,
  ToastAndroid,
} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Feather from "react-native-vector-icons/Feather";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useFocusEffect, useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../services/apiBaseUrl";

type RootStackParamLists = {
  Cart: { showOrders?: boolean; showAddress?: boolean; showOffers?: boolean; showSupport?: boolean; showFAQ?: boolean; showTerms?: boolean; showPrivacyPolicy?: boolean; };
};

const screenWidth = Dimensions.get("window").width;
const drawerWidth = screenWidth * 0.75;
const allowedTLDs = ['com', 'net', 'org', 'co', 'in'];

const Profile = forwardRef(({ isEditing }: { isEditing: boolean }, ref) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamLists>>();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-drawerWidth)).current;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigations = useNavigation<any>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState("");
  const [roleId, setRoleId] = useState("");
  const firstInputRef = useRef<TextInput>(null);
  const route = useRoute<any>();
  const [editing, setEditing] = useState(isEditing); 


  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setEditing(false); 
    }
  }, [isFocused]);


  // --- FOCUS FIRST INPUT WHEN EDITING ---
  useEffect(() => {
    if (isEditing && firstInputRef.current) firstInputRef.current.focus();
  }, [isEditing]);

  // --- LOAD USER DATA ---
  const checkLogin = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserId(user.userId || "");
        setName(user.name || "");
        setEmail(user.email || "");
        setPhone(user.phone || "");
        setPassword(user.password || "");
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setIsLoggedIn(false);
    }
    setLoading(false);
  };

  useEffect(() => { checkLogin(); }, [isFocused]);

  // --- VALIDATION FUNCTIONS ---
  const validateName = (text: string) => /^[A-Za-z\s]{0,30}$/.test(text);
  const validatePhone = (text: string) => /^\d{0,10}$/.test(text);

  const handleEmailChange = (text: string) => {
    const filtered = text.replace(/[^a-zA-Z0-9@._-]/g, '');
    const noMultipleDots = filtered.replace(/\.{2,}/g, '.');
    const validPartialEmail = noMultipleDots.replace(/@.*@/g, '@');
    const parts = validPartialEmail.split('.');
    if (parts.length > 1) {
      const last = parts[parts.length - 1];
      if (!allowedTLDs.some(tld => tld.startsWith(last))) return;
    }
    setEmail(validPartialEmail);
  };

  const validateEmailFormat = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(text)) return false;
    const tld = text.split('.').pop()?.toLowerCase();
    return tld ? allowedTLDs.includes(tld) : false;
  };

  // --- EXPOSE SAVE FUNCTION TO PARENT ---
  useImperativeHandle(ref, () => ({
    handleSaveProfile: async () => {
      if (!name) return ToastAndroid.show("Name is required", ToastAndroid.SHORT);
      if (!validateName(name)) return ToastAndroid.show("Name max 30 letters", ToastAndroid.SHORT);
      if (!email) return ToastAndroid.show("Email is required", ToastAndroid.SHORT);
      if (!validateEmailFormat(email)) return ToastAndroid.show("Invalid email format", ToastAndroid.SHORT);
      if (!phone) return ToastAndroid.show("Phone is required", ToastAndroid.SHORT);
      if (phone.length !== 10) return ToastAndroid.show("Phone must be 10 digits", ToastAndroid.SHORT);

      try {
        const payload = { userId, name, email, phone, roleId };
        const res = await apiClient.put(`v1/user/${userId}`, payload);
        if (res.status === 200 || res.status === 201) {
          await AsyncStorage.setItem('user', JSON.stringify(payload));
          ToastAndroid.show("Profile updated successfully", ToastAndroid.SHORT);
        } else {
          Alert.alert("Error", "Failed to update profile. Please try again.");
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    },
  }));

  // --- LOGOUT ---
  const handleLogout = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('cartItems');
      let guestCart = savedCart ? JSON.parse(savedCart) : [];
      const savedWishlist = await AsyncStorage.getItem('wishlistItems');
      let guestWishlist = savedWishlist ? JSON.parse(savedWishlist).filter((item: any) => item && item.wishlistId && String(item.wishlistId).startsWith('guest-')) : [];
      await AsyncStorage.clear();
      if (guestCart.length) await AsyncStorage.setItem('cartItems', JSON.stringify(guestCart));
      if (guestWishlist.length) await AsyncStorage.setItem('wishlistItems', JSON.stringify(guestWishlist));
      setName(""); setEmail(""); setPhone(""); setPassword(""); setIsLoggedIn(false);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };




  if (loading) return (<View style={styles.centeredContainer}><ActivityIndicator size="large" color="#0077CC" /></View>);
  if (!isLoggedIn) return (
    <View style={styles.welcomeContainer}>
      <View style={styles.welcomeContent}>
        <View style={styles.logoContainer}>
          <Text style={styles.welcomeTitle}>Welcome to WonderCart</Text>
          <Text style={styles.welcomeSubtitle}>Your one-stop shopping destination</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigations.navigate('SignUp', { from: route.params?.from, productId: route.params?.productId })}
          >
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigations.navigate('SignIn', { from: route.params?.from, productId: route.params?.productId })}
          >
            <Text style={styles.SignInbuttonText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <AntDesign name="shoppingcart" size={24} color="#0094FF" />
            <Text style={styles.featureText}>Easy Shopping</Text>
          </View>
          <View style={styles.featureItem}>
            <AntDesign name="heart" size={24} color="#0094FF" />
            <Text style={styles.featureText}>Save Favorites</Text>
          </View>
          <View style={styles.featureItem}>
            <Feather name="truck" size={24} color="#0094FF" />
            <Text style={styles.featureText}>Fast Delivery</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.profileInfo}>
        <View style={styles.imageContainer}>
          <Image source={require("../assets/images/profile.png")} style={styles.profileImage} />
          <TouchableOpacity style={styles.cameraIcon}><Feather name="camera" size={18} color="#fff" /></TouchableOpacity>
        </View>

        <View style={styles.inputFields}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.inputBox}
            value={name}
            onChangeText={(text) => { if (validateName(text)) setName(text); }}
            editable={isEditing}
            ref={firstInputRef}
          />

          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.inputBox}
            value={email}
            keyboardType="email-address"
            onChangeText={handleEmailChange}
            editable={isEditing}
          />

          <Text style={styles.inputLabel}>Phone</Text>
          <TextInput
            style={styles.inputBox}
            value={phone}
            keyboardType="phone-pad"
            onChangeText={(text) => { if (validatePhone(text)) setPhone(text); }}
            editable={isEditing}
          />
        </View>
      </View>
    </View>
  );
});

export default Profile;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', elevation: 5, paddingTop: 10, paddingBottom: 14, paddingHorizontal: 10 },
  text: { flex: 1, color: '#0094FF', fontSize: 20, fontWeight: '900', textAlign: 'center' },
  editIcon: { textAlign: "left", alignSelf: "flex-end", paddingLeft: 150, fontWeight: "900" },
  profileInfo: { alignItems: "center", marginTop: 30, paddingHorizontal: 20 },
  imageContainer: { position: "relative", alignItems: "center", justifyContent: "center" },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  cameraIcon: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#0094FF", borderRadius: 12, padding: 5 },
  inputFields: { width: "100%", marginTop: 40 },
  inputLabel: { fontSize: 14, color: "#333333", marginBottom: 4, fontWeight: "500" },
  inputBox: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, fontSize: 14, color: "#333", marginBottom: 15 },
  overlay: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.4)" },
  drawer: { position: "absolute", top: 0, bottom: 0, width: drawerWidth, backgroundColor: "#fff", paddingTop: 60, paddingHorizontal: 20, elevation: 5 },
  drawerItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  drawerText: { marginLeft: 15, fontSize: 16, color: "#333" },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 5 },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  welcomeContainer: { flex: 1, backgroundColor: '#fff' },
  welcomeContent: { flex: 1, padding: 30, justifyContent: 'space-between' },
  logoContainer: { alignItems: 'center', marginTop: 80 },
  welcomeTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#0077CC',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1.2,

    textShadowColor: 'rgba(0, 119, 204, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    lineHeight: 36
  },
  welcomeSubtitle: { fontSize: 16, color: '#666', textAlign: "center", marginBottom: 10 },
  buttonContainer: { marginVertical: 20 },
  primaryButton: {
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 15,
    borderColor: "#0077CC",
    borderWidth: 2,
    backgroundColor: 'transparent'
  },
  secondaryButton: {
    backgroundColor: '#0077CC',
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#0077CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: "center" },
  SignInbuttonText: { color: '#0077CC', fontSize: 16, fontWeight: 'bold', textAlign: "center" },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 40,
    paddingHorizontal: 20
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 15
  },
  featureText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500'
  },
});
