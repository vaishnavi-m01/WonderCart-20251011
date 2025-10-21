import React, { useRef, useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
    ScrollView,
    Image,
    KeyboardAvoidingView
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import Feather from 'react-native-vector-icons/Feather';
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamLists } from "../../navigation/type";
import apiClient from "../../services/apiBaseUrl";
import { RootStackParamList } from "../SeparateProduct";
import { Platform } from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from '@react-native-firebase/auth';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";



const SignUp = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    // const [roleId,setRoleId] = useState(2);
    const [showPassword, setShowPassword] = useState(false);
    const scrollRef = useRef<ScrollView>(null);


    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamLists>>();
    const goback = useNavigation();
    const route = useRoute<RouteProp<RootStackParamList, 'Profile'>>();
    const [loading, setLoading] = useState(false);

    const routes = useRoute<any>();
    const { from, productId } = routes.params || {};

    const [errors, setErrors] = useState({
        name: "",
        email: "",
        phone: "",
        password: ""
    });

    const validateEmail = (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        if (!value.trim()) return "Email is required";
        if (!emailRegex.test(value)) return "Invalid email format";
        return "";
    };

    const validatePhone = (value: string) => {
        if (!value.trim()) return "Phone is required";
        if (!/^\d{10}$/.test(value)) return "Phone must be 10 digits";
        return "";
    };

    const validatePassword = (value: string) => {
        if (!value.trim()) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";

        return "";
    };

    const validateName = (value: string) => {
        if (!value.trim()) return "Name is required";
        return "";
    };

    const handleBlur = (field: string, value: string) => {
        let error = "";
        switch (field) {
            case "name":
                error = validateName(value);
                break;
            case "email":
                error = validateEmail(value);
                break;
            case "phone":
                error = validatePhone(value);
                break;
            case "password":
                error = validatePassword(value);
                break;
            default:
                break;
        }
        setErrors(prev => ({ ...prev, [field]: error }));
    };


    // const handleGoogleLogin = async () => {
    //     try {
    //         await GoogleSignin.hasPlayServices();
    //         const userInfo = await GoogleSignin.signIn();
    //         console.log("Google User:", userInfo);
    //         // send userInfo.idToken or userInfo.user to your backend API
    //     } catch (error) {
    //         console.log("Google Login Error:", error);
    //     }
    // };






    const handleGoogleLogin = async () => {
        try {
            // Prompt user to pick a Google account
            const result: any = await GoogleSignin.signIn();
            const idToken = result?.user?.idToken;
            const user = result?.user;

            console.log("idToken", idToken)
            console.log("user", user)
            // Show user details in console
            console.log('Google Profile Info:', {
                name: user.name,
                email: user.email,
                idToken: idToken,
                photo: user.photo,
            });

            // Create Firebase credential with token
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);

            // Sign in with Firebase
            const firebaseUserCredential = await auth().signInWithCredential(googleCredential);

            console.log('Firebase user:', firebaseUserCredential.user);
        } catch (error) {
            console.error('Google Sign-In Error:', error);
        }
    };

    const handleRegister = async () => {
        if (loading) return;

        console.log("handleRegister clicked");

        const nameError = validateName(name);
        const emailError = validateEmail(email);
        const phoneError = validatePhone(phone);
        const passwordError = validatePassword(password);

        if (nameError || emailError || phoneError || passwordError) {
            setErrors({
                name: nameError,
                email: emailError,
                phone: phoneError,
                password: passwordError,
            });
            return;
        }

        try {
            setLoading(true);

            const payload = { name, email, phone, password, roleId: 2, activeStatus: true };
            console.log("SignUppayload", payload);

            const res = await apiClient.post("v1/user", payload);
            console.log("response", res);

            if (res.status === 200 || res.status === 201) {
                const user = res.data;
                await AsyncStorage.setItem("user", JSON.stringify(user));

                Alert.alert("Registered Successfully!");
                await syncGuestCartToServer(user.userId, user.token);
                await syncGuestWishlistToServer(user.userId, user.token);

                if (navigation.canGoBack()) {
                    navigation.pop(2);
                } else {
                    navigation.navigate("Main", { screen: "Home" });
                }
            } else {
                Alert.alert("Registration failed");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error during registration");
        } finally {
            setLoading(false);
        }
    };



    const syncGuestCartToServer = async (userId: any, token: any) => {

        try {
            const savedCart = await AsyncStorage.getItem('cartItems');
            const guestItems = savedCart ? JSON.parse(savedCart) : [];

            for (const item of guestItems) {
                console.log("Sending Cartt item:", {
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    price: item.price,
                });
                await apiClient.post(
                    `v1/cart/${userId}/items`,
                    {
                        productId: item.productId,
                        variantId: item.variantId,
                        quantity: item.quantity,
                        price: item.price,
                    },
                );
            }

            await AsyncStorage.removeItem('cartItems');

        } catch (error: any) {
            if (error.response) {
                console.error("Server AddToCart responded with error:", error.response);
                console.error("ADDTocartStatus:", error.response.status);
                console.error("AddtocartData:", error.response.data);
            } else if (error.request) {
                console.error(" No Add to cart response received:", error.request);
            } else {
                console.error(" Error setting up the request:", error.message);
            }
        }
    };

    const syncGuestWishlistToServer = async (userId: any, token: any) => {
        console.log("SyncGuestWishlistToserver")
        try {
            const savedWishlist = await AsyncStorage.getItem('wishlistItems');
            console.log("savedWishlist", savedWishlist)
            const guestItems = savedWishlist ? JSON.parse(savedWishlist) : [];

            const guestOnly = guestItems.filter((item: any) =>
                item.wishlistId && item.wishlistId.startsWith('guest-')
            );

            console.log("Local wishlist items to send:", guestOnly);

            for (const item of guestOnly) {
                console.log("Sending Wishlist:", {
                    userId,
                    productId: item.productId,
                    variantId: item.variantId,
                    token
                });

                const requestBody = {
                    userId: userId,
                    productId: item.productId,
                    variantId: item.variantId,
                    // createdAt: new Date().toISOString(),
                };

                console.log("SignUp Sending Wishlist item:", requestBody);

                await apiClient.post(
                    'v1/wishlist',
                    requestBody,
                    // {
                    //     headers: { Authorization: `Bearer ${token}` },
                    // }
                );
            }

            // Remove guest items from local storage
            const remaining = guestItems.filter(
                (item: any) => !(item.wishlistId && item.wishlistId.startsWith('guest-'))
            );
            await AsyncStorage.setItem('wishlistItems', JSON.stringify(remaining));

        } catch (error: any) {
            if (error.response) {
                console.error("Server responded with error:");
                console.error("WishlistStatus:", error.response.status);
                console.error("WishlistData:", error.response.data);
            } else if (error.request) {
                console.error("No response received:");
                console.error(error.request);
            } else {
                console.error("Error setting up the request:");
                console.error(error.message);
            }
        }
    };


    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: "#fff" }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <KeyboardAwareScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid={true}
                extraScrollHeight={Platform.OS === "ios" ? 20 : 20}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ justifyContent: "center", alignItems: "center", top: -15 }}>
                    <Image
                        source={require("../../assets/images/splash.png")}
                        style={{ height: 166, width: 166 }}
                    />
                </View>

                <Text style={styles.header}>Create Your Account</Text>

                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Your Name"
                        value={name}
                        onChangeText={setName}
                        onBlur={() => handleBlur("name", name)}
                    />
                    {errors.name ? <Text style={styles.error}>{errors.name}</Text> : null}

                    <TextInput
                        style={styles.input}
                        placeholder="Enter Your Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onBlur={() => handleBlur("email", email)}
                    />
                    {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}

                    <TextInput
                        style={styles.input}
                        placeholder="Enter Your Mobile Number"
                        value={phone}
                        onChangeText={(text) =>
                            setPhone(text.replace(/[^0-9]/g, "").slice(0, 10))
                        }
                        keyboardType="phone-pad"
                        onBlur={() => handleBlur("phone", phone)}
                    />
                    {errors.phone ? <Text style={styles.error}>{errors.phone}</Text> : null}

                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Enter Your Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            onBlur={() => handleBlur("password", password)}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Feather
                                name={showPassword ? "eye" : "eye-off"}
                                size={20}
                                color="#999"
                            />
                        </TouchableOpacity>
                    </View>
                    {errors.password ? (
                        <Text style={styles.error}>{errors.password}</Text>
                    ) : null}

                    <TouchableOpacity
                        style={[styles.button, loading && { opacity: 0.6 }]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? "Please wait..." : "Sign Up"}
                        </Text>
                    </TouchableOpacity>

                    {/* Divider Line with 'or' */}
                    <View style={styles.bottomContainer}>
                        <View style={styles.line} />
                        <Text style={styles.bottomtext}>or</Text>
                        <View style={styles.line} />
                    </View>

                    <Text style={styles.continueText}>Continue With</Text>

                    <View style={styles.row}>
                        <TouchableOpacity style={styles.btnContainer} onPress={handleGoogleLogin}>
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
            </KeyboardAwareScrollView>
        </KeyboardAvoidingView>
    );

};

export default SignUp;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 20,
    },

    header: {
        textAlign: "center",
        fontFamily: "Jost",
        fontWeight: "900",
        top: -32,
        marginBottom: 5
    },

    text: {
        color: '#0077CC',
        fontSize: 20,
        marginLeft: 20,
        fontWeight: '900',
    },
    icon: {
        fontWeight: '900',
        marginLeft: 5
    },
    form: {
        flex: 1,
        top: -8
    },
    input: {
        borderWidth: 2,
        borderColor: "#F2F2F2",
        borderRadius: 30,
        padding: 12,
        marginBottom: 10
    },
    error: {
        color: "red",
        marginBottom: 10,
        marginLeft: 4
    },
    passwordContainer: {
        flexDirection: "row",
        borderWidth: 2,
        borderColor: "#F2F2F2",
        borderRadius: 30,
        paddingHorizontal: 12,
        alignItems: "center",
        marginBottom: 5
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 12,
    },
    button: {
        backgroundColor: '#007CEE',
        padding: 15,
        borderRadius: 30,
        alignItems: "center",
        marginTop: 28,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16
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
        fontFamily: "Jost"
    },
    continueText: {
        textAlign: "center",
        color: "#000000",
        fontWeight: "500",
        fontSize: 12
    },
    row: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 15,
        marginTop: 20,
        marginBottom: 30
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
