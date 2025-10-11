import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ToastAndroid,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../services/apiBaseUrl";
import Feather from "react-native-vector-icons/Feather";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

type RootStackParamList = {
  Main: { screen: string } | undefined;
  SeparateProductPage: { productId: number };
};

const SignIn = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<any>();
  const { from, productId } = route.params || {};

  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const allowedTLDs = ["com", "org", "net", "in"];

  const validateEmail = (text: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!text) return "Email is required";
    if (!emailRegex.test(text)) return "Invalid email format";
    const tld = text.split(".").pop()?.toLowerCase();
    if (!tld || !allowedTLDs.includes(tld)) return "Invalid email domain";
    return "";
  };

  const validatePassword = (text: string): string => {
    if (!text) return "Password is required";
    if (text.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log("Google User:", userInfo);
    } catch (error) {
      console.log("Google Login Error:", error);
    }
  };

  const handleSignIn = async () => {
    const emailError = validateEmail(emailId);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const response = await apiClient.post("v1/login/user", {
        emailId,
        password,
      });
      const data = response.data;

      await AsyncStorage.setItem("userToken", data.token);
      const userId = data.userId;

      const profileRes = await apiClient.get(`/v1/user/${userId}`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      await AsyncStorage.setItem("user", JSON.stringify(profileRes.data));

      await syncGuestWishlistToServer(userId, data.token);
      await syncGuestCartToServer(userId, data.token);

      ToastAndroid.show("Login Success", ToastAndroid.SHORT);

      if (navigation.canGoBack()) {
        navigation.pop(2);
      } else {
        navigation.navigate("Main", { screen: "Home" });
      }
    } catch (error: any) {
      console.log("Login error", error?.response?.data || error.message);
      ToastAndroid.show("Login failed. Please try again.", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  const syncGuestCartToServer = async (userId: any, token: any) => {
    try {
      const savedCart = await AsyncStorage.getItem("cartItems");
      const guestItems = savedCart ? JSON.parse(savedCart) : [];
      for (const item of guestItems) {
        await apiClient.post(
          `v1/cart/${userId}/items`,
          {
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      await AsyncStorage.removeItem("cartItems");
    } catch (error) {
      console.log("Cart sync error:", error);
    }
  };

  const syncGuestWishlistToServer = async (userId: any, token: any) => {
    try {
      const savedWishlist = await AsyncStorage.getItem("wishlistItems");
      const guestItems = savedWishlist ? JSON.parse(savedWishlist) : [];
      for (const item of guestItems) {
        if (item.wishlistId?.startsWith("guest-")) {
          await apiClient.post(
            "v1/wishlist",
            {
              userId,
              productId: item.productId,
              variantId: item.variantId,
              createdAt: new Date().toISOString(),
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }
    } catch (error) {
      console.log("Wishlist sync error:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Image
              source={require("../../assets/images/splash.png")}
              style={{ height: 166, width: 166 }}
            />
          </View>

          <Text style={styles.header}>Login</Text>

          <View style={styles.form}>
            <TextInput
              style={[
                styles.input,
                // errors.email ? { borderColor: "red" } : null,
              ]}
              placeholder="Enter your Email"
              value={emailId}
              onChangeText={(text) => {
                setEmailId(text);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}

            <View
              style={[
                styles.passwordContainer,
                // errors.password ? { borderColor: "red" } : null,
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password)
                    setErrors((prev) => ({ ...prev, password: "" }));
                }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}

            <TouchableOpacity
              style={styles.button}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.bottomContainer}>
              <View style={styles.line} />
              <Text style={styles.bottomtext}>or</Text>
              <View style={styles.line} />
            </View>

            <Text style={styles.continueText}>Continue With</Text>

            <View style={styles.row}>
              <TouchableOpacity
                style={styles.btnContainer}
                onPress={handleGoogleLogin}
              >
                <View style={styles.btn}>
                  <Image
                    source={require("../../assets/images/google.png")}
                    style={styles.icons}
                  />
                  <Text style={styles.btnText}>Google</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnContainer}>
                <View style={styles.btn}>
                  <Image
                    source={require("../../assets/images/facebook.png")}
                    style={styles.icons}
                  />
                  <Text style={styles.btnText}>Facebook</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingBottom: 20,
  },
  header: {
    textAlign: "center",
    fontFamily: "Jost",
    fontWeight: "900",
    top: -15,
    marginBottom: 5,
    fontSize: 24,
    color: "#000",
  },
  form: {
    flex: 1,
    paddingHorizontal: 12,
    margin: 10,
  },
  input: {
    borderWidth: 2,
    borderColor: "#F2F2F2",
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginLeft: 10,
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#007CEE",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 40,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  passwordContainer: {
    flexDirection: "row",
    borderWidth: 2,
    borderColor: "#F2F2F2",
    borderRadius: 30,
    paddingHorizontal: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
    marginTop: 20,
  },
  line: {
    flex: 1,
    height: 1.2,
    backgroundColor: "#000000",
  },
  bottomContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  bottomtext: {
    marginHorizontal: 10,
    fontSize: 13,
    color: "#000000",
    fontWeight: "600",
    fontFamily: "Jost",
  },
  continueText: {
    textAlign: "center",
    color: "#000000",
    fontWeight: "500",
    fontSize: 12,
  },
  btnContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 140,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  icons: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
  btnText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
});
