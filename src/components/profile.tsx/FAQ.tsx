import { useNavigation } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import AntDesign from "react-native-vector-icons/AntDesign";

const FAQ = () => {
    const navigation = useNavigation();
 
    return (
        <View style={styles.container}>


            {/* <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <AntDesign name="arrowleft" color="#0077CC" size={26} style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.text}>FAQ</Text>
            </View> */}

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll} contentContainerStyle={{paddingBottom:20}}>
                <TouchableOpacity style={styles.section}>
                    <Text style={styles.title}>Return Replacement and Refunds</Text>
                    <AntDesign name="right" color="#0094FF" size={22} />

                </TouchableOpacity>
                <View style={styles.bottomLine} />


                <TouchableOpacity style={styles.section}>
                    <Text style={styles.title}>Cancellations</Text>
                    <AntDesign name="right" color="#0094FF" size={22} />

                </TouchableOpacity>
                <View style={styles.bottomLine} />


                <TouchableOpacity style={styles.section}>
                    <Text style={styles.title}>Return Replacement and Refunds</Text>
                    <AntDesign name="right" color="#0094FF" size={22} />

                </TouchableOpacity>
                <View style={styles.bottomLine} />


                <TouchableOpacity style={styles.section}>
                    <Text style={styles.title}>Cancellations</Text>
                    <AntDesign name="right" color="#0094FF" size={22} />

                </TouchableOpacity>
                <View style={styles.bottomLine} />

                <TouchableOpacity style={styles.section}>
                    <Text style={styles.title}>Return Replacement and Refunds</Text>
                    <AntDesign name="right" color="#0094FF" size={22} />

                </TouchableOpacity>
                <View style={styles.bottomLine} />



                <TouchableOpacity style={styles.section}>
                    <Text style={styles.title}>Cancellations</Text>
                    <AntDesign name="right" color="#0094FF" size={22} />

                </TouchableOpacity>
                <View style={styles.bottomLine} />


                <TouchableOpacity style={styles.section}>
                    <Text style={styles.title}>Return Replacement and Refunds</Text>
                    <AntDesign name="right" color="#0094FF" size={22} />

                </TouchableOpacity>
                <View style={styles.bottomLine} />


                <TouchableOpacity style={styles.section}>
                    <Text style={styles.title}>Cancellations</Text>
                    <AntDesign name="right" color="#0094FF" size={22} />

                </TouchableOpacity>
                <View style={styles.bottomLine} />


                <TouchableOpacity style={styles.section}>
                    <Text style={styles.title}>Return Replacement and Refunds</Text>
                    <AntDesign name="right" color="#0094FF" size={22} />

                </TouchableOpacity>
                <View style={styles.bottomLine} />


                <TouchableOpacity style={styles.section}>
                    <Text style={styles.title}>Cancellations</Text>
                    <AntDesign name="right" color="#0094FF" size={22} />

                </TouchableOpacity>
                <View style={styles.bottomLine} />

                <TouchableOpacity style={styles.section}>
                    <Text style={styles.title}>Return Replacement and Refunds</Text>
                    <AntDesign name="right" color="#0094FF" size={22} />

                </TouchableOpacity>
                <View style={styles.bottomLine} />


                <TouchableOpacity style={styles.section}>
                    <Text style={styles.title}>Cancellations</Text>
                    <AntDesign name="right" color="#0094FF" size={22} />

                </TouchableOpacity>
                <View style={styles.bottomLine} />



            </ScrollView>
        </View>

    )
}

export default FAQ

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        elevation: 5,
        paddingTop: 10,
        paddingBottom: 14,
        paddingHorizontal: 10,
    },

    text: {
        color: '#0077CC',
        fontSize: 20,
        marginLeft: 20,
        fontWeight: '900',
    },
    icon: {
        fontWeight: '900',
        marginLeft: 5
    },
    scroll: {
        paddingBottom: 20
    },
    section: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 20
    },
    title: {
        paddingLeft: 12,
        color: "#333333",
        fontFamily: "Jost",
        fontWeight: 600,
        fontSize: 13
    },

    bottomLine: {
        borderBottomColor: "#DEDEDE",
        borderBottomWidth: 1,
        width: "100%",
        marginTop: 15,
    },
})