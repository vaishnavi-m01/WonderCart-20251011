import { Image, StyleSheet, Text, View } from "react-native"
import Octicons from 'react-native-vector-icons/Octicons';

type data = {
    image:any;
    discount:number;
    productName:string;
}
const ProductNotification = ({image,discount,productName}:data) => {
    return (
    
            <View style={styles.cardContainer}>
                <View style={styles.subcontainer}>
                    <Image source={image} style={styles.Img} />
                    <Text style={styles.description}>
                    {productName}
                    </Text>
                    <Octicons name="x" color="#767575" size={22} style={styles.cancelIcon} />
                </View>
                <Text style={styles.offer}>{discount} OFF</Text>

            </View>


    )
}

export default ProductNotification

const styles = StyleSheet.create({
  

    title: {
        color: "#616063",
        paddingLeft: 8,
        fontFamily: "Poppins",
        fontWeight: 900,
        fontSize: 13
    },
    cardContainer: {
        borderRadius: 10,
        backgroundColor: "#E3F2FF",
        padding: 5,
        margin: 2,
        marginTop: 12
    },
    Img: {
        height: 80,
        width: 90
    },
    description: {
        fontWeight: 700,
        fontFamily: "Poppins",
        lineHeight: 22
    },
    cancelIcon: {
        paddingLeft: 17
    },
    column: {
        flexDirection: "column"
    },
    subcontainer: {
        flexDirection: "row"
    },
    offer: {
        backgroundColor: "#0094FF",
        borderRadius: 8,
        color: "#FFFFFF",
        fontWeight: 900,
        padding: 3,
        width: "20%",
        textAlign: "center",
        marginLeft: 95,
        top: -20,
        fontSize: 12
    }

})