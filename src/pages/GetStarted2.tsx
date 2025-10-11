import { useNavigation } from "@react-navigation/native"
import { Image, StyleSheet, TouchableOpacity } from "react-native"
import { Text, View } from "react-native"

const GetStarted2 = () => {
    const navigation = useNavigation<any>();
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Easy & Secure Checkout</Text>
            <Text style={styles.title}>Fast payments with 100% security.</Text>
            <Text style={styles.text}>Multiple options for your convenience.</Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Main")}>
                <Text style={styles.buttonText} >Get Started</Text>
            </TouchableOpacity>

        
            <Image source={require("../assets/images/GetStarted2.png")} style={styles.img}></Image>
        </View>
    )
}

export default GetStarted2

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 25
    },
    header: {
        fontSize: 35,
        fontFamily: "LeagueSpartan-SemiBold",
        lineHeight: 50,
        textAlign: "center",
        color: "#000000",
        fontWeight: 900,
        letterSpacing: 2
    },
    title: {
        color: "#7B7B7B",
        fontWeight: 500,
        fontSize: 16,
        textAlign: "center",
        marginTop: 20,
        lineHeight: 22
    },
    text: {
        color: "#7B7B7B",
        marginTop: 25,
        fontWeight: "500",
        fontSize: 15
    },
    button: {
        marginTop: 22,
        borderRadius: 60,
        backgroundColor: "#007CEE",
        paddingHorizontal: 26,
        paddingVertical: 10
    },
    buttonText: {
        color: "#FFFFFF",
        fontWeight: 800,
        fontSize: 12,
        fontFamily: "Poppins"
    },
    img: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '55%',
    },
   
})
