import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
import ProductReviewAddPhoto from '../pages/ProductReviewAddPhoto';
import TrendingNow from '../pages/TrendingNow';
import ReviewFullImage from '../pages/ReviewFullImage';
import { ReviewType } from './type';
import ProfileDrawer from './ProfileDrawer';
import AddressPage from '../pages/Address';

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
  ProductReviewAddPhoto: undefined;
  TrendingNow: undefined;
  ReviewFullImage: { review: ReviewType };
  ProfileDrawer: undefined;
  Address: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
export const navigationRef = createNavigationContainerRef();

const StackScreen = () => {

  useEffect(() => {
    const backAction = () => {
      if (!navigationRef.isReady()) return false;

      const state = navigationRef.getState();
      const routesCount = state?.routes?.length || 0;
      const currentRoute = navigationRef.getCurrentRoute()?.name;

      // If 8 or more pages deep, go directly to Home/Main
      if (routesCount >= 8 && currentRoute !== 'Main') {
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
        return true;
      }

      if (navigationRef.canGoBack()) {
        navigationRef.goBack();
        return true;
      }

      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
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
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={ProfileDrawer} options={{ headerShown: false }} />

        <Stack.Screen name="ProductDetails" component={SeparateProductDetails} />
        <Stack.Screen name="TopSellerProduct" component={TopSellerProduct} options={{ headerShown: true, title: "Top Seller" }} />
        <Stack.Screen name="JewelleryProduct" component={JewelleryProduct} options={{ headerShown: true, title: "Jewellery" }} />
        <Stack.Screen name="TrendingNow" component={TrendingNow} options={{ headerShown: true, title: "Trending Now" }} />
        <Stack.Screen name="SubCategoriesListOfProducts" component={SubCategoriesListOfProducts} options={{ headerShown: false }} />
        <Stack.Screen name="CategoriesProduct" component={CategoriesProduct} options={{ headerShown: false }} />
        <Stack.Screen name="SeparateProductPage" component={SeparateProductPage} options={{ headerShown: false }} />
        <Stack.Screen name="ReviewFullImage" component={ReviewFullImage} options={{ headerShown: true, title: "Review" }} />
        <Stack.Screen name="FullScreenImage" component={FullScreenImage} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="DeliveryAddress" component={DeliveryAddress} options={{ headerShown: true, title: "Delivery Address" }} />
        <Stack.Screen name="Address" component={AddressPage} options={{ headerShown: true }} />
        <Stack.Screen name="DeliveryAddressForm" component={DeliveryAddressForm} options={{ headerShown: false }} />
        <Stack.Screen name="PaymentPage" component={PaymentPage} options={{ headerShown: false }} />
        <Stack.Screen name="Wishlist" component={Wishlist} options={{ headerShown: true }} />
        <Stack.Screen name="Payment" component={Payment} />
        <Stack.Screen name="OrderDetails" component={OrderDetails} options={{ headerShown: false }} />
        <Stack.Screen name="Orders" component={Orders} />
        <Stack.Screen name="ProductList" component={ProductList} />
        <Stack.Screen name="CheckOut" component={CheckOut} />
        <Stack.Screen name="RecentlyViewedAllProduct" component={RecentlyViewedAllProduct} options={{ headerShown: true, title: "Recently View" }} />
        <Stack.Screen name="OrderHistory" component={OrderHistory} options={{ headerShown: true, title: "Order History" }} />
        <Stack.Screen name="Offers" component={Offers} />
        <Stack.Screen name="Support" component={Support} />
        <Stack.Screen name="FAQ" component={FAQ} />
        <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
        <Stack.Screen name="ProductReviewAddPhoto" component={ProductReviewAddPhoto} options={{ headerShown: true, title: "Add Photos & Videos" }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackScreen;
