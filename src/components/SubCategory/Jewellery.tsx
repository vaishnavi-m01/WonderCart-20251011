import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {  Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';

type data = {
    productId: number;
    image: string;
    title: string;
    price: number;
}
const Jewellery = ({ productId, image, title, price }: data) => {
    const navigation = useNavigation<any>();
    
    return (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("SeparateProductPage",{productId})} >
            <Image source={{ uri: image }} style={styles.image} />
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <Text style={styles.price}>₹{price}</Text>
        </TouchableOpacity>
    );
};

export default Jewellery


const styles = StyleSheet.create({
    card: {
        backgroundColor: "#F5F5F5",
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
        fontSize: 12,
        fontWeight: '600',
        color: '#333333',
        paddingTop: 2
    },

    price: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666666',
    },


});
