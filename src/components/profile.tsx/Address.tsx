import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Modal,
    ScrollView,
} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";


const data = [
    {
        name: "Vaishnavi.M", street: "5-4-57(1) KamaRaj Nagar, Keela Surandai.", city: "Keela Surandai", state: "TAMIL NADU", pincode: "627 859", phone: "1234567890",
    },
    {
        name: "Sankari.M", street: "5-4-57(1) KamaRaj Nagar, Keela Surandai.", city: "Keela Surandai", state: "TAMIL NADU", pincode: "627 859", phone: "1234567890",
    },
]
const Address = () => {
    const navigation = useNavigation();
    const [selectedAddress, setSelectedAddress] = useState("Vaishnavi");
    const [isModalVisible, setModalVisible] = useState(false);


    // Editable fields state
    const [editData, setEditData] = useState({
        name: "Vaishnavi.M",
        street: "5-4-57(1) KamaRaj Nagar, Keela Surandai.",
        city: "Keela Surandai",
        state: "TAMIL NADU",
        pincode: "627 859",
        phone: "1234567890",
    });

    const handleClick = () => {
        navigation.navigate("Home" as never);
    };

    const openEditModal = () => {
        setModalVisible(true);
    };

    const closeEditModal = () => {
        setModalVisible(false);
    };

    const handleChange = (field: string, value: string) => {
        setEditData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleClick}>
                    <AntDesign name="left" color="#0077CC" size={22} style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.text}>Address</Text>
            </View>


            <View style={styles.addressRow}>
                <TouchableOpacity onPress={() => setSelectedAddress("Vaishnavi")}>
                    <Ionicons
                        name={selectedAddress === "Vaishnavi" ? "radio-button-on" : "radio-button-off"}
                        size={20}
                        color="#0094FF"
                        style={styles.radio}
                    />
                </TouchableOpacity>
                
                <View style={styles.subcontainer}>
                    <View style={styles.row}>
                        <Text style={styles.Name}>{editData.name}</Text>
                        <TouchableOpacity onPress={openEditModal}>
                            <MaterialIcons name="edit" color="#0094FF" size={22} style={styles.editIcon} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.street}>{editData.street}</Text>
                    <Text style={styles.details}>{editData.city}</Text>
                    <Text style={styles.details}>{editData.state}, {editData.pincode}</Text>
                    <Text style={styles.details}>India</Text>
                    <View style={styles.row}>
                        <Text style={styles.details}>Phone Number: {editData.phone}</Text>
                        <TouchableOpacity>
                            <Text style={styles.removeText}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <View style={styles.bottomLine} />

            <TouchableOpacity style={styles.button}>
                <Text style={styles.btnText}>Add a New Address</Text>
            </TouchableOpacity>

            {/* Modal for Edit */}
            <Modal visible={isModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <ScrollView>
                            <Text style={styles.modalTitle}>Edit Address</Text>
                            {["name", "street", "city", "state", "pincode", "phone"].map((field) => (
                                <TextInput
                                    key={field}
                                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                    value={editData[field as keyof typeof editData]}
                                    onChangeText={(value) => handleChange(field, value)}
                                    style={styles.input}
                                />
                            ))}
                            <TouchableOpacity style={styles.saveBtn} onPress={closeEditModal}>
                                <Text style={styles.saveBtnText}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={closeEditModal} style={styles.cancelBtn}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Address;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    text: {
        color: "#0077CC",
        fontSize: 20,
        marginLeft: 20,
        fontWeight: "900",
        marginBottom: 20,
        bottom: -9,
    },
    icon: {
        fontWeight: "900",
    },
    subcontainer: {
        paddingTop: 10,
        paddingLeft: 12,
        lineHeight: 30,
        margin: 4,
        flex: 1,
    },
    Name: {
        fontWeight: "800",
        fontFamily: "Jost",
        fontSize: 14,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    street: {
        fontFamily: "Jost",
        fontWeight: "600",
        fontSize: 13,
        paddingTop: 2,
    },
    details: {
        paddingTop: 4,
        fontWeight: "400",
        fontSize: 13,
    },
    editIcon: {
        top: -6,
    },
    removeText: {
        color: "#0094FF",
        fontWeight: "900",
        top: 3,
        fontSize: 13,
    },
    bottomLine: {
        borderBottomColor: "#DEDEDE",
        borderBottomWidth: 2,
        width: "100%",
        marginTop: 5,
        paddingTop: 8,
    },
    addressRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 10,
    },
    radio: {
        marginTop: 18,
        marginLeft: 10,
        marginRight: 6,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "#00000099",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "90%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center",
        color: "#0094FF",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    button: {
        backgroundColor: "#E3F2FF",
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 25,
    },
    btnText: {
        color: "#535353",
        fontWeight: 700
    },
    saveBtn: {
        backgroundColor: "#0094FF",
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 5,
    },
    saveBtnText: {
        color: "#fff",
        fontWeight: "bold",
    },
    cancelBtn: {
        padding: 10,
        alignItems: "center",
        marginTop: 5,
    },
    cancelBtnText: {
        color: "#0094FF",
        fontWeight: "bold",
    },

});
