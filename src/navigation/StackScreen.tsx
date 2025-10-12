import React from 'react';
import { TouchableOpacity, StyleSheet, Platform, StatusBar, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AntDesign from 'react-native-vector-icons/AntDesign';
import UnifiedHeader from '../components/common/UnifiedHeader';
import Splash from '../tabs/Splash';
import TabNavigator from './TabNavigator';
import SeparateProductDetails from '../components/SeparateProductDetails';
import CategoriesProduct from '../pages/CategoriesProduct';
import SubCategoriesListOfProducts from '../pages/SubCategoriesListOfProducts';
import FullScreenImage from '../pages/FullScreenImage';
import SignIn from '../components/profile.tsx/SignIn';
import SignUp from '../components/profile.tsx/SignUp';
import DeliveryAddress from '../pages/DeliveryAddress';
import DeliveryAddressForm from '../pages/DeliveryAddressForm';
import PaymentPage from '../pages/PaymentPage';
import Wishlist from '../pages/Wishlist';
import Payment from '../pages/Payment';
import OrderDetails from '../pages/OrderDetails';
import Orders from '../components/profile.tsx/Orders';
import CheckOut from '../pages/CheckOut';
import ProductList from '../pages/ProductList';
import RecentlyViewedAllProduct from '../pages/RecentlyViewedAllProduct';
import OrderHistory from '../pages/OrderHistory';
import Offers from '../components/profile.tsx/Offers';
import Support from '../components/profile.tsx/Support';
import FAQ from '../components/profile.tsx/FAQ';
import TermsAndConditions from '../components/profile.tsx/TermsAndConditions';
import PrivacyPolicy from '../components/profile.tsx/PrivacyPolicy';
import SeparateProductPage from '../pages/SeparateProductPage';
import TopSellerProduct from '../pages/TopSellerProduct';
import JewelleryProduct from '../pages/JewelleryProduct';
import OnboardingScreen from '../pages/OnboardingScreen';
import GetStartedSwiper from '../pages/GetStartedSwiper';
import GetStarted1 from '../pages/GetStarted1';
import GetStarted2 from '../pages/GetStarted2';
import GetStarted3 from '../pages/GetStarted3';
import ProductReviewAddPhoto from '../pages/ProductReviewAddPhoto';

export type RootStackParamList = {
  Splash: undefined;
  Main: undefined;
  ProductDetails: undefined;
  Home: undefined;
  SubCategoriesListOfProducts: undefined;
  Cart: undefined;
  CategoriesProduct: undefined;
  FullScreenImage: undefined;
  SignUp: undefined;
  SignIn: undefined;
  DeliveryAddress: { refresh?: boolean } | undefined;
  DeliveryAddressForm: { editAddress?: any } | undefined;
  PaymentPage: undefined;
  Wishlist: undefined;
  Payment: undefined;
  OrderDetails: undefined;
  ProductList: undefined;
  Orders: undefined;
  CheckOut: undefined;
  RecentlyViewedAllProduct: undefined;
  OrderHistory: undefined;
  Offers: undefined;
  Support: undefined;
  FAQ: undefined;
  TermsAndConditions: undefined;
  PrivacyPolicy: undefined;
  SeparateProductPage: { productId: string };
  TopSellerProduct: undefined;
  JewelleryProduct: undefined;
  Onboarding: undefined;
  GetStarted1: undefined;
  GetStarted2: undefined;
  GetStarted3: undefined;
  GetStartedSwiper: undefined;
  ProductReviewAddPhoto: undefined;

};

const Stack = createNativeStackNavigator<RootStackParamList>();
// const headerHeight = 10;


const StackScreen = () => (
  <NavigationContainer>
    <Stack.Navigator
      screenOptions={{
        header: ({ navigation, route, options, back }) => (
          <UnifiedHeader
            title={options.title ?? route.name}
            showBackButton={!!back}
            onBackPress={() => navigation.goBack()}
            headerStyle="default"

          />
        ),
      }}
    >


      <Stack.Screen name="Splash" component={Splash} options={{ headerShown: false }} />
      <Stack.Screen name="GetStartedSwiper" component={GetStartedSwiper} options={{ headerShown: false }} />
      <Stack.Screen name="GetStarted1" component={GetStarted1} options={{ headerShown: false }} />
      <Stack.Screen name="GetStarted2" component={GetStarted2} options={{ headerShown: false }} />
      <Stack.Screen name="GetStarted3" component={GetStarted3} options={{ headerShown: false }} />
      <Stack.Screen name="ProductReviewAddPhoto" component={ProductReviewAddPhoto} options={{
        headerShown: true,
        title: "Add Photos & Videos",
      }} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetails" component={SeparateProductDetails} />
      <Stack.Screen
        name="TopSellerProduct"
        component={TopSellerProduct}
        options={{
          headerShown: true,
          title: "Top Seller",
        }}
      />
      <Stack.Screen
        name="JewelleryProduct"
        component={JewelleryProduct}
        options={{
          headerShown: true,
          title: "Jewellery",
        }}
      />
      <Stack.Screen name="SubCategoriesListOfProducts" component={SubCategoriesListOfProducts} options={{ headerShown: false }} />
      <Stack.Screen name="CategoriesProduct" component={CategoriesProduct} options={{ headerShown: false }} />
      <Stack.Screen name="SeparateProductPage" component={SeparateProductPage} options={{ headerShown: false }} />
      <Stack.Screen name="FullScreenImage" component={FullScreenImage} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="DeliveryAddress" component={DeliveryAddress}     options={{
          headerShown: true,
          title: "Delivery Address",
        }}/>
      <Stack.Screen name="DeliveryAddressForm" component={DeliveryAddressForm} options={{ headerShown: false }} />
      <Stack.Screen name="PaymentPage" component={PaymentPage} options={{ headerShown: false }} />
      <Stack.Screen name="Wishlist" component={Wishlist}  options={{ headerShown: true }}/>
      <Stack.Screen name="Payment" component={Payment} />
      <Stack.Screen name="OrderDetails" component={OrderDetails} options={{ headerShown: false }} />
      <Stack.Screen name="Orders" component={Orders} />
      <Stack.Screen name="ProductList" component={ProductList} />
      <Stack.Screen name="CheckOut" component={CheckOut} />
      <Stack.Screen name="RecentlyViewedAllProduct" component={RecentlyViewedAllProduct} options={{ headerShown: false }} />
      <Stack.Screen name="OrderHistory" component={OrderHistory} />
      <Stack.Screen name="Offers" component={Offers} />
      <Stack.Screen name="Support" component={Support} />
      <Stack.Screen name="FAQ" component={FAQ} />
      <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default StackScreen;
