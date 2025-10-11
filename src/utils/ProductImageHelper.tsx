import { ProductType, VariantImageType, VariantType } from "../navigation/type";

export const getProductThumbnail = (product: ProductType): string | undefined => {
  return product.variants?.[0]?.variantImage?.[0]?.imageUrl;
};



export const getSelectedVariantImages = (product: ProductType): string[] => {
  const selectedVariantId = product.selectedVariantId ?? product.variants?.[0]?.variantId;

  const selectedVariant = product.variants?.find(v => v.variantId === selectedVariantId);

  if (!selectedVariant || !Array.isArray(selectedVariant.variantImage)) return [];

  return selectedVariant.variantImage.map(img => img.imageUrl).filter(Boolean);
};



export const homegetAllVariantImages = (product: any): string[] => {
  return product?.variant?.images?.map((img: any) => img.imageUrl) || [];
};





