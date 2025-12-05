import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Switch,
    TouchableOpacity,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { TabParamList } from '../SeparateProduct';


export type RootStackParamList = {
    Main: undefined | { screen: keyof TabParamList };
    //   NotificationDetails: { id: string }; 
};
const SettingsScreen = ({ closeModal }: { closeModal: () => void }) => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();


    const [settings, setSettings] = useState({
        orderUpdates: true,
        promotions: false,
        security: true,
        orderConfirmations: false,
        newsletter: true,
        sound: true,
        vibration: false,
    });

    const toggleSwitch = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={closeModal}>
                    <AntDesign name="left" color="#0077CC" size={22} style={styles.backButton} />
                </TouchableOpacity>
                <Text style={styles.text}>Notification Settings</Text>
            </View>

            <ScrollView style={styles.subcontainer} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Push Notifications</Text>

                <SettingRow
                    title="Order Updates"
                    subtitle="Get notified about order status changes"
                    value={settings.orderUpdates}
                    onToggle={() => toggleSwitch('orderUpdates')}
                />

                <SettingRow
                    title="Promotions & Offers"
                    subtitle="Receive promotional notifications and special offers"
                    value={settings.promotions}
                    onToggle={() => toggleSwitch('promotions')}
                />

                <SettingRow
                    title="Account Security"
                    subtitle="Important security and account notifications"
                    value={settings.security}
                    onToggle={() => toggleSwitch('security')}
                />

                <Text style={styles.title}>Email Notifications</Text>

                <SettingRow
                    title="Order Confirmations"
                    subtitle="Email receipts and order confirmations"
                    value={settings.orderConfirmations}
                    onToggle={() => toggleSwitch('orderConfirmations')}
                />

                <SettingRow
                    title="Weekly Newsletter"
                    subtitle="Weekly deals and product recommendations"
                    value={settings.newsletter}
                    onToggle={() => toggleSwitch('newsletter')}
                />

                <Text style={styles.title}>Preferences</Text>

                <SettingRow
                    title="Sound"
                    subtitle="Play sound for new notifications"
                    value={settings.sound}
                    onToggle={() => toggleSwitch('sound')}
                />

                <SettingRow
                    title="Vibration"
                    subtitle="Vibrate on new notifications"
                    value={settings.vibration}
                    onToggle={() => toggleSwitch('vibration')}
                />
            </ScrollView>
        </View>
    );
};

const SettingRow = ({
    title,
    subtitle,
    value,
    onToggle,
}: {
    title: string;
    subtitle: string;
    value: boolean;
    onToggle: () => void;
}) => (
    <View style={styles.row}>
        <View style={styles.textContainer}>
            <Text style={styles.rowtitle}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Switch
            trackColor={{ false: '#ccc', true: '#34C759' }}
            thumbColor="#fff"
            ios_backgroundColor="#ccc"
            onValueChange={onToggle}
            value={value}
        />
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
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
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        marginRight: 12,
    },
    text: {
        color: '#0077CC',
        fontSize: 20,
        marginLeft: 20,
        fontWeight: '900',
    },
    subcontainer: {
        paddingBottom: 20,
    },
    title: {
        fontWeight: '500',
        fontSize: 18,
        paddingVertical: 12,
        paddingHorizontal: 16,
        color: '#222',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    textContainer: {
        flex: 1,
        paddingRight: 8,
    },
    rowtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    subtitle: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
});

export default SettingsScreen;
