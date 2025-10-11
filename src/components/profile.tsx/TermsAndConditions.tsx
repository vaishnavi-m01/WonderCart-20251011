import { useNavigation } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import AntDesign from 'react-native-vector-icons/AntDesign';

const TermsAndConditions = () => {
    const navigation = useNavigation();
    const handleClick = () => {
        navigation.navigate("Home" as never)
    }
    return (
        <View style={styles.container}>
            {/* <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <AntDesign name="arrowleft" color="#0077CC" size={26} style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.text}>Terms & Conditions</Text>
            </View> */}

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.subContainer}>
                    <Text style={styles.heading}>Prohibited items policies can vary depending on the context,
                        such as in online marketplaces, transportation, events, or
                        other specific situations. Generally, these policies are in
                        place to ensure safety, compliance with regulations, and to
                        prevent harm or misuse of goods and services</Text>

                    <Text style={styles.bottomLine}></Text>

                    <Text style={styles.title}>Personal Information</Text>
                    <Text style={styles.heading}>Prohibited items policies can vary depending on the context,
                        such as in online marketplaces, transportation, events, or
                        other specific situations. Generally, these policies are in
                        place to ensure safety, compliance with regulations, and to
                        prevent harm or misuse of goods and services</Text>

                    <Text style={styles.title}>Eligibility</Text>
                    <Text style={styles.heading}>Prohibited items policies can vary depending on the context,
                        such as in online marketplaces, transportation, events, or
                        other specific situations. Generally, these policies are in
                        place to ensure safety, compliance with regulations, and to
                        prevent harm or misuse of goods and services</Text>

                    <Text style={styles.title}>License & Site access</Text>
                    <Text style={styles.heading}>Prohibited items policies can vary depending on the context,
                        such as in online marketplaces, transportation, events, or
                        other specific situations. Generally, these policies are in
                        place to ensure safety, compliance with regulations, and to
                        prevent harm or misuse of goods and services</Text>

                    <Text style={styles.title}>License & Site access</Text>
                    <Text style={styles.heading}>Prohibited items policies can vary depending on the context,
                        such as in online marketplaces, transportation, events, or
                        other specific situations. Generally, these policies are in
                        place to ensure safety, compliance with regulations, and to
                        prevent harm or misuse of goods and services</Text>


                </View>
            </ScrollView>
        </View>
    )

}

export default TermsAndConditions

const styles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 2,
        backgroundColor: '#fff',
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
    subContainer: {
        paddingTop: 5
    },
    heading: {
        color: "#8A8A8A",
        fontFamily: "Jost",
        fontWeight: 500,
        paddingLeft: 12,
        fontSize: 15,
        lineHeight: 20
    },
    bottomLine: {
        borderBottomColor: "#DEDEDE",
        borderBottomWidth: 2,
        width: "95%",
        marginLeft: 12,
    },
    title: {
        marginTop: 18,
        paddingLeft: 12,
        fontFamily: "Jost",
        fontSize: 17,
        color: "#00A2F4",
        fontWeight: 700,
        marginBottom: 15
    }

})