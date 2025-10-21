import { NavigatorScreenParams } from "@react-navigation/native";

export type Category = {
  categoryId: number;
  name: string;
  imageUrl: string;
  parentId: number | null;
};

export type RootStackParamList = {
  Home: undefined;
  Category: undefined;
  SubCategoriesListOfProducts: { categoryId: number, category: string };
  CategoriesProduct: { categoryId?: number, categoryName?: string, product?: any; searchProduct?: any; category?: any };
  ProductList: { categoryId: number, categoryName: string }
  TopSellerProduct: { topSellerProduct: any }
  TrendingNow: { trendingProducts: ProductType[] };
}

type TabsParamList = {
  Home: undefined;
  Cart: undefined;
  Profile: undefined;
};

export type RootStackParamLists = {
  SignUp: undefined;
  Main: NavigatorScreenParams<TabsParamList>;
  DeliveryAddress: undefined;
  ProductList: {
    categoryId: number;
    categoryName?: string;
  },
  SeparateProductPage: { productId: number };
};


export type VariantImageType = {
  imageId: number;
  imageUrl: string;
  altText: string;
};

export type VariantType = {
  variantId: number;
  price: number;
  stock: number;
  sku: string;
  variantImage?: VariantImageType[];
};

export interface ProductType {
  productId: number;
  title: string;
  description: string;
  categoryId: number;
  categoryName: string;
  thumbnail?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  offer?: number;
  images: any[];
  variants?: VariantType[];
  selectedVariantId?: number;
}


export type Address = {
  addressId: number;
  userId: number;
  countryId: number | null;
  stateId: number | null;
  type: string;
  line1: string;
  line2: string;
  city: string;
  pinCode: string;
};


type ReviewImageType = {
  id: number;
  imageUrl: string;
  productReviewId: number;
};

export type ReviewType = {
  productReviewId: number;
  productId: number;
  variantId: number;
  userId: number;
  username: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  imagesList?: ReviewImageType[]; 
};






