import { useNavigation } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"


const PrivacyPolicy = () => {
    const navigation = useNavigation();

    return (
        <View>
            {/* <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <AntDesign name="arrowleft" color="#0077CC" size={26} style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.text}>Privacy Policy</Text>
            </View> */}

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.subContainer}>
                    <Text style={styles.heading}>Prohibited items policies can vary depending on the context,
                        such as in online marketplaces, transportation, events, or
                        other specific situations. Generally, these policies are in
                        place to ensure safety, compliance with regulations, and to
                        prevent harm or misuse of goods and services</Text>

                    <Text style={styles.bottomLine}></Text>

                    <Text style={styles.title}>Prohibited items policy</Text>
                    <Text style={styles.heading}>Prohibited items policies can vary depending on the context,
                        such as in online marketplaces, transportation, events, or
                        other specific situations. Generally, these policies are in
                        place to ensure safety, compliance with regulations, and to
                        prevent harm or misuse of goods and services. Here's a brief overview of what you might find in prohibited items policies{`\n`}in different contexts:
                        {`\n`}Online Marketplaces:</Text>

                    <Text style={styles.paragraph}>Illegal Items: Items that are prohibited by law, such as drugs, counterfeit goods, stolen property, etc.
                        {`\n`} Hazardous Materials: Goods that pose a risk to health, safety, or the environment.
                        Restricted or Regulated Items: Items that require special permissions, licenses, or are subject to specific regulations. {`\n`}

                        Dangerous Goods: Items that are hazardous during transportation, such as explosives, flammable materials, corrosives, etc.
                        Illegal Items: Items that are prohibited by law, such as drugs, counterfeit goods, stolen property, etc.{`\n`}

                        Hazardous Materials: Goods that pose a risk to health, safety, or the environment.
                        Restricted or Regulated Items: Items that require special permissions, licenses, or are subject to specific regulations.

                    </Text>

                </View>
            </ScrollView>

        </View>
    )
}

export default PrivacyPolicy

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
    subContainer: {
        paddingTop: 5,
        marginBottom: 60
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
    },
    paragraph: {
        color: "#8A8A8A",
        fontFamily: "Jost",
        fontWeight: 500,
        paddingLeft: 58,
        fontSize: 15,
        lineHeight: 20
    }

})