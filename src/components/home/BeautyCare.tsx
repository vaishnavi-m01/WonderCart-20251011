// import React from "react";
// import { Image, StyleSheet, Text, View, Dimensions } from "react-native";
// import LinearGradient from "react-native-linear-gradient";

// const beautyCare = [
//   { id: "1", image: require("../../assets/images/beautyCare1.png") },
//   { id: "2", image: require("../../assets/images/beautyCare2.png") },
//   { id: "3", image: require("../../assets/images/beautyCare3.png") },
//   { id: "4", image: require("../../assets/images/beautyCare2.png") },
// ];

// const BeautyCare = () => {
//   return (
//     <LinearGradient
//       colors={["#FFEAB4", "#C6FCFF"]}
//       start={{ x: 0, y: 0 }}
//       end={{ x: 0, y: 1 }}
//     >
//       <View style={styles.container}>
//         <View style={styles.leftSide}>
//           <Text style={styles.title}>Beauty Care</Text>
//           <Text style={styles.header}>Personalized Care Routine</Text>
//           <View style={styles.imgContainer}>
//             <Image
//               source={require("../../assets/images/beautyCare1.png")}
//               style={styles.mainImage}
//               resizeMode="contain"
//             />
//             <Text style={styles.discount}>25% OFF</Text>
//           </View>
//         </View>

        
//         <View style={styles.rightSide}>
//           <View style={styles.cardGrid}>
//             {beautyCare.map((item) => (
//               <View key={item.id} style={styles.card}>
//                 <Image
//                   source={item.image}
//                   style={styles.cardImage}
//                   resizeMode="cover"
//                 />
//                 <View style={styles.content}>
//                   <Text style={styles.cardText}>
//                     Combo{'\n'}Offer{'\n'}15% OFF
//                   </Text>
//                 </View>

//               </View>
//             ))}
//           </View>
//         </View>
//       </View>
//     </LinearGradient>
//   );
// };

// export default BeautyCare;

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     padding: 10,
//     width: "100%",
//   },
//   leftSide: {
//     width: "40%",
//     paddingRight: 10,
//   },
//   rightSide: {
//     width: "60%",
//     justifyContent: "center",
//   },
//   title: {
//     fontWeight: "bold",
//     fontSize: 20,
//     color: "#303030",
//     marginBottom: 4,
//   },
//   header: {
//     fontWeight: "600",
//     fontSize: 14,
//     color: "#303030",
//   },
//   imgContainer: {
//     width: "90%",
//     height: 150,
//     backgroundColor: "#fff",
//     marginTop: 10,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     elevation: 2,
//     shadowColor: "#000",
//     padding: 10,
//   },
//   mainImage: {
//     width: 80,
//     height: 80,
//     marginBottom: 6,
//   },
//   discount: {
//     fontWeight: "bold",
//     fontSize: 16,
//     color: "#4A4A4A",
//   },
//   cardGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//     minHeight: 200, // Ensures 2 rows fit
//   },
//   card: {
//     width: "48%",
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     marginBottom: 10,
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 4,
//   },
//   cardImage: {
//     width: 50,
//     height: 60,
//     borderRadius: 8,
//     // marginRight: 5,
//   },
//   content: {
//     backgroundColor: "#FFE5E5",
//     flexShrink: 1,
//     paddingVertical: 3,
//     paddingHorizontal: 3,
//     borderTopLeftRadius: 10,
//     borderBottomLeftRadius: 10,
//   },
//   cardText: {
//     fontSize: 9,
//     fontWeight: "bold",
//     color: "#4A4A4A",
//     textAlign: "center",
//     flexShrink: 1,
//     paddingBottom: 2,
//     lineHeight: 12,
//   },
// });
