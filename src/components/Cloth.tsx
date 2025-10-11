import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';

type data = {
    productId: number;
    image: any;
    title: string;
    price: number;
}
const Cloth = ({ productId, image, title, price }: data) => {
    const navigation = useNavigation<any>();
  
    return (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("SeparateProductPage",{productId})} >
            <Image source={{ uri: image }} style={styles.image} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.price}>Under ₹{price}</Text>
        </TouchableOpacity>
    );
};

export default Cloth


const styles = StyleSheet.create({
    card: {
        backgroundColor: '#F5DEB3',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        width: '30%',
        margin: 6,
    },
    image: {
        width: '100%',
        height: 80,
        borderRadius: 5,
        resizeMode: 'cover',
    },
    title: {
        marginTop: 5,
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    price: {
        paddingTop: 5,
        color: "orange",
        fontWeight: "bold",
        fontSize: 13
    }
});
