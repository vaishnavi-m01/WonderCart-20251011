import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Text, Image, StyleSheet, View, TouchableOpacity } from "react-native";

interface RecentlyViewedProps {
  productId: number;

  image: any;
  name: string;
  price: string | number;
}

const RecentlyViewed = ({ productId, image, name, price }: RecentlyViewedProps) => {

  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity onPress={() =>
      navigation.navigate("SeparateProductPage", {
        productId: productId,
      })
    }>
      <View style={styles.container}>
        <View style={styles.card}>
          <Image source={image} style={styles.image} />
          <View style={styles.textContainer}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.price}>₹{price}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )

}





export default RecentlyViewed;


const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    borderColor: "#E0E5E9",
    backgroundColor: "#fff",
  },
  image: {
    height: 60,
    width: 60,
    borderRadius: 10,
    marginRight: 12,
  },
  textContainer: {
    justifyContent: "center",
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0094FF",
  },
});
