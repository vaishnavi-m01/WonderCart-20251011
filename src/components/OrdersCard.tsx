import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Foundation from 'react-native-vector-icons/Foundation';


type data = {
    id: number;
    image: any;
    productName: string,
    price: string;
    originalPrice: string;
    discount: number;
    deliveryStatus: string;
    orderDay: string;
}
const OrdersCard = ({ id, image, productName, price, originalPrice, discount, deliveryStatus, orderDay }: data) => {
    return (
        <View style={styles.subContainer}>
            <View style={styles.imgBorder}>
                <Image source={image} style={styles.productImage} resizeMode="contain" />
            </View>
            <View>
                <Text style={styles.productName}>{productName}</Text>
                <View style={styles.iconContainer}>
                    <Foundation name="star" color="#FFBB0C" size={16} />
                    <Foundation name="star" color="#FFBB0C" size={16} />
                    <Foundation name="star" color="#FFBB0C" size={16} />
                    <Foundation name="star" color="#FFBB0C" size={16} />
                    <Foundation name="star" color="#FFBB0C" size={16} />
                    <Text style={styles.rating}>5.0</Text>
                </View>
                <View style={styles.iconContainer}>
                    <Text style={styles.amount}>₹{price}</Text>
                    {originalPrice && originalPrice > price && (
                        <Text style={styles.originalPrice}>₹{originalPrice}</Text>
                    )}
                    {discount && discount > 0 && (
                        <Text style={styles.discount}>{discount}% OFF</Text>
                    )}
                </View>
                <View style={styles.row}>
                    <Text style={styles.deliveryStatus}>{deliveryStatus} </Text>
                    <Text style={styles.orderday}>{orderDay}</Text>
                    <TouchableOpacity style={styles.btn}>
                        <Text style={styles.btnText}>Buy Again</Text>
                    </TouchableOpacity>
                </View>



            </View>
        </View>
    )
}

export default OrdersCard


const styles = StyleSheet.create({
    subContainer: {
        borderWidth: 2,
        borderColor: "#58585840",
        shadowColor: "#58585840",
       
        padding: 8,
        borderRadius: 5,
        flexDirection: "row",
        width: "100%",
    },
    imgBorder: {
        borderWidth: 1,
        borderColor: "#D9D9D9",
        padding: 5,
        borderRadius: 8
    },
    productImage: {
        width: 100,
        height: 100,
        marginBottom: 6,
        resizeMode: 'contain',
    },
    productName: {
        fontSize: 12,
        paddingLeft: 12,
        color: "#414141",
        fontWeight: 900,
        fontFamily: "Jost",
        lineHeight: 18
    },
    iconContainer: {
        flexDirection: "row",
        gap: 5,
        paddingLeft: 10,
        paddingTop: 7
    },
    rating: {
        fontSize: 10,
        fontWeight: "bold",
        bottom: -2,
        paddingLeft: 3
    },
    amount: {
        fontWeight: 900,
        top: 1
    },
    originalPrice: {
        fontSize: 10,
        color: 'gray',
        textDecorationLine: 'line-through',
        paddingLeft: 5,
        top: 4
    },
    discount: {
        color: "#0094FF",
        fontSize: 12,
        fontWeight: 900,
        bottom: -2,
        paddingLeft: 5
    },
    deliveryStatus: {
        fontFamily: "Jost",
        fontSize: 11,
        color: "gray"
    },
    orderday: {
        fontFamily: "Jost",
        fontSize: 10,
        color: "#414141",
        fontWeight: "bold",
        top: 1,
        gap: 0
    },
    row: {
        flexDirection: "row",
        paddingTop: 8,
        paddingLeft: 10
    },
    btn: {
        borderWidth: 1,
        borderColor: "#059ff8",
        borderRadius: 8,
        padding: 5,
        backgroundColor: "#059ff8",
        marginLeft: 15,
        top: -1
    },
    btnText: {
        color: "#FFFFFF",
        fontFamily: "Jost",
        fontWeight: 800,
        fontSize: 12
    }
})