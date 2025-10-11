
import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Linking,
    TouchableWithoutFeedback,
    Image,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Share from 'react-native-share';
import Clipboard from '@react-native-clipboard/clipboard';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Foundation from 'react-native-vector-icons/Foundation';
import { JSX } from 'react/jsx-runtime';


type Props = {
    productName: string;
    description?: string;
    image: any;

};

type ShareOption = {
    id: string;
    name: string;
    icon: JSX.Element;
    action: () => void;
};

const ShareComponent: React.FC<Props> = ({ productName, description, image }) => {
    const [visible, setVisible] = useState(false);

    const message = `Check this out:  ${productName}\n\n${description}`;

    const handleNativeShare = async () => {
        try {
            await Share.open({
                title: productName,
                message: `${productName}\n\n${description}`,
                // url: image[0],
            });
        } catch (error) {
            console.error('Native Share Error:', error);
        }
    };

    const shareOptions: ShareOption[] = [
        {
            id: 'whatsapp',
            name: 'WhatsApp',
            icon: <FontAwesome name="whatsapp" size={30} color="#25D366" />,
            action: () => {
                Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`);
                setVisible(false);
            },
        },
        {
            id: 'telegram',
            name: 'Telegram',
            icon: <FontAwesome name="telegram" size={30} color="#0088cc" />,
            action: () => {
                Linking.openURL(`tg://msg?text=${encodeURIComponent(message)}`);
                setVisible(false);
            },
        },
        {
            id: 'snapchat',
            name: 'Snapchat',
            icon: <FontAwesome name="snapchat-ghost" size={30} color="#FFFC00" />,
            action: () => {
                console.log('Snapchat pressed');
                setVisible(false);
            },
        },
        {
            id: 'facebook',
            name: 'Facebook',
            icon: <FontAwesome name="facebook" size={30} color="#4267B2" />,
            action: () => {
                Linking.openURL(`fb://facewebmodal/f?href=https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(message)}`);
                setVisible(false);
            },
        },
        {
            id: 'messages',
            name: 'Messages',
            icon: <MaterialIcons name="message" size={30} color="#34B7F1" />,
            action: () => {
                Linking.openURL(`sms:?body=${encodeURIComponent(message)}`);
                setVisible(false);
            },
        },
        {
            id: 'email',
            name: 'Email',
            icon: <MaterialIcons name="email" size={30} color="#D44638" />,
            action: () => {
                Linking.openURL(`mailto:?subject=Check this out&body=${encodeURIComponent(message)}`);
                setVisible(false);
            },
        },
        {
            id: 'copy',
            name: 'Copy',
            icon: <MaterialIcons name="content-copy" size={30} color="#333" />,
            action: () => {
                Clipboard.setString(message);
                setVisible(false);
            },
        },
        {
            id: 'more',
            name: 'More',
            icon: <AntDesign name="ellipsis1" size={30} color="#333" />,
            action: handleNativeShare,
        },
    ];

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => setVisible(true)}>
                <AntDesign name="sharealt" size={24} color="#212121" />
            </TouchableOpacity>

            <Modal
                visible={visible}
                animationType="slide"
                transparent
                onRequestClose={() => setVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setVisible(false)} >
                    <View style={styles.modalBackground}>
                        <View style={styles.modalContainer}>
                            <View style={styles.row}>
                                <Text style={styles.headerText}>Share this product with friends</Text>
                                <TouchableOpacity style={styles.closeButton} onPress={() => setVisible(false)}>
                                    <Ionicons name="close" size={30} color="#555555" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.productContainer}>
                                <View style={styles.ImageContainer}>
                                    <Image
                                        source={typeof image[0] === 'string' ? { uri: image[0] } : image[0]}
                                        style={styles.Image}
                                    />

                                </View>
                                <View style={styles.iconContainer}>
                                    {[...Array(5)].map((_, i) => (
                                        <Foundation key={i} name="star" color="#FFBB0C" size={16} />
                                    ))}
                                    <Text style={styles.rating}>5.0</Text>
                                </View>
                                <View style={styles.productDetails}>
                                    <Text style={styles.label}>
                                        {productName}, {description}
                                    </Text>

                                </View>
                            </View>

                            <FlatList
                                data={shareOptions}
                                keyExtractor={(item) => item.id}
                                numColumns={4}
                                contentContainerStyle={styles.gridContainer}
                                renderItem={({ item }) => (
                                    <TouchableOpacity style={styles.optionItem} onPress={item.action}>
                                        {item.icon}
                                        <Text style={styles.optionText}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            />

                            {/* <TouchableOpacity onPress={() => setVisible(false)} style={styles.cancelBtn}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity> */}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

export default ShareComponent;

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: '#00000077',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        paddingTop: 20,
        paddingBottom: 10,
    },
    headerText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 15,
        paddingLeft: 18
    },
    gridContainer: {
        alignItems: 'center',
        paddingBottom: 10,
    },
    optionItem: {
        alignItems: 'center',
        margin: 15,
        width: 60,
    },
    optionText: {
        marginTop: 5,
        fontSize: 12,
        textAlign: 'center',
    },
    cancelBtn: {
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderColor: '#ddd',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
    },
    row: {
        flexDirection: "row",
    },
    closeButton: {
        position: 'absolute',
        top: -9,
        right: 20,
        padding: 5,
        borderRadius: 20,
    },
    productContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,

        margin: 5,
        marginLeft: 12,
        marginRight: 12,
    },
    Image: {
        height: 120,
        width: 120,
        resizeMode: "contain",
    },
    ImageContainer: {
        alignItems: "center",
        paddingTop: 5
    },
    iconContainer: {
        flexDirection: "row",
        gap: 5,
        paddingLeft: 15,
        paddingTop: 7,
        marginBottom: 10
    },
    rating: {
        fontSize: 10,
        fontWeight: "bold",
        bottom: -2,
        paddingLeft: 3
    },
    productDetails: {
        backgroundColor: "#C5C6C7",
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5
    },
    label: {
        color: "#616569",
        fontWeight: "600",
        lineHeight: 25,
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 5,
        paddingBottom: 5,
        justifyContent: "center"
    }
});
