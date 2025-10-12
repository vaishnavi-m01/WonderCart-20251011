import React, { useState } from "react";
import { Image, StyleSheet, Text, View, TouchableOpacity, Animated } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import LinearGradient from 'react-native-linear-gradient';

type Data = {
   image: string;
   title: string;
};

const CategoryCard = ({ image, title }: Data) => {
   const [imageError, setImageError] = useState(false);
   const [pressed, setPressed] = useState(false);

   const fallbackImageUrl = `https://via.placeholder.com/300/0077CC/FFFFFF?text=${encodeURIComponent(title)}`;

   return (
      <View
         style={[styles.container, pressed && styles.pressedContainer]}
         pointerEvents="none"
      >
         <View style={styles.imageContainer}>
            <Image
               source={{ uri: imageError ? fallbackImageUrl : image }}
               style={styles.banner}
               resizeMode="cover"
               onError={() => setImageError(true)}
               onLoad={() => setImageError(false)}
            />
            <LinearGradient
               pointerEvents="none"
               colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)']}
               style={styles.gradientOverlay}
            />
            <View style={styles.categoryBadge}>
               <MaterialIcons name="category" size={16} color="#FFFFFF" />
            </View>
         </View>
         <View style={styles.content}>
            <View style={styles.textContainer}>
               <Text style={styles.title} numberOfLines={2}>
                  {title}
               </Text>
               <Text style={styles.subtitle}>Shop Now</Text>
            </View>
            <View style={styles.arrowContainer}>
               <AntDesign name="arrowright" size={16} color="#FFFFFF" />
            </View>
         </View>
      </View>
   );
};


export default CategoryCard;

const styles = StyleSheet.create({
   container: {
      backgroundColor: "#FFFFFF",
      borderRadius: 20,
      overflow: "hidden",
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 12,
      marginHorizontal: 8,
      marginVertical: 8,
      transform: [{ scale: 1 }],
   },
   pressedContainer: {
      transform: [{ scale: 0.98 }],
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 8,
      // backgroundColor:"red"
   },
   imageContainer: {
      position: 'relative',
      height: 140,
      overflow: 'hidden',
   },
   banner: {
      width: "100%",
      height: "100%",
      backgroundColor: "#F5F5F5",
   },
   gradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
   },
   categoryBadge: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(0, 119, 204, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#0077CC',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
   },
   content: {
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      minHeight: 80,
   },
   textContainer: {
      flex: 1,
      marginRight: 12,
   },
   title: {
      fontSize: 16,
      fontWeight: "700",
      color: "#1A1A1A",
      lineHeight: 22,
      marginBottom: 4,
      includeFontPadding: false,
   },
   subtitle: {
      fontSize: 12,
      fontWeight: "500",
      color: "#0077CC",
      opacity: 0.8,
   },
   arrowContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#0077CC',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#0077CC',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
      right:-4
   },
});
