import {
    ActivityIndicator,
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationCart from '../components/notification/NotificationCart';
import SettingsScreen from '../components/notification/SettingScreen';
import UnifiedHeader from '../components/common/UnifiedHeader';


type NotificationType = 'promotion' | 'orderShipped' | 'orderDelivered' | 'systemMsg' | 'profile';

interface NotificationItem {
    id: number;
    type: NotificationType;
    name: string;
    message?: string;
    image?: string;
    createdAt?: string;
    isRead?: boolean;
}

const FILTERS_ALL = ['All', 'Promotion', 'System'];
const FILTERS_LOGGED_IN = ['Orders', 'Account'];

const dummyNotifications: NotificationItem[] = [
    {
        id: 1,
        type: 'promotion',
        name: 'Discount on Necklace!',
        message: 'Get up to 50% off on all gadgets.',
        image: 'http://103.146.234.88:3011/api/public/v1/variant/imageUpload/serve/1_62c2d137-ba5d-4645-83c3-7ee23b16921f_shop1.png',
        createdAt: '2025-07-09T18:09:34.149727',
        isRead: false,
    },
    {
        id: 2,
        type: 'orderShipped',
        name: 'Order Shipped',
        message: 'Your order #1243 has been shipped.',
        createdAt: '2025-07-08T15:22:25.072815',
        isRead: false,
    },
    {
        id: 3,
        type: 'orderDelivered',
        name: 'Order Delivered',
        message: 'Your order #1243 has been delivered.',
        createdAt: '2025-07-16T17:55:50.845167',
        isRead: false,
    },
    {
        id: 4,
        type: 'systemMsg',
        name: 'System Maintenance',
        message: 'App will be down from 2 AM to 4 AM.',
        createdAt: '2025-07-17T10:36:18.884867',
        isRead: false,
    },
    {
        id: 5,
        type: 'profile',
        name: 'Profile Updated',
        message: 'Your account details were updated.',
        createdAt: '2025-08-04T06:30:00Z',
        isRead: false,
    },
    {
        id: 6,
        type: 'promotion',
        name: 'Festival Offer!',
        message: 'Buy 1 Get 1 Free on fashion wear.',
        image: 'http://103.146.234.88:3011/api/public/v1/variant/imageUpload/serve/1_192e0264-94e7-47ae-a8ca-2d35f2946922_featured2.jpeg',
        createdAt: '2025-08-04T09:26:50.000Z',
        isRead: false,
    },
];


const Notification = () => {
    const navigation = useNavigation<any>();
    const [active, setActive] = useState('All');
    const [filters, setFilters] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const [notifications, setNotifications] = useState<NotificationItem[]>(dummyNotifications);


    const [showSettings, setShowSettings] = useState(false);





    const checkLogin = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            const isLoggedIn = !!userData;
            const finalFilters = isLoggedIn ? [...FILTERS_ALL, ...FILTERS_LOGGED_IN] : FILTERS_ALL;
            setFilters(finalFilters);
        } catch (error) {
            setFilters(FILTERS_ALL);
        }
        setLoading(false);
    };

    useEffect(() => {
        checkLogin();
    }, []);

    const handleDelete = (id: number) => {
        setNotifications(prev => prev.filter(item => item.id !== id));
    };

    useEffect(() => {
        const loadReadNotifications = async () => {
            try {
                const readIdsString = await AsyncStorage.getItem("readNotificationIds");
                const readIds = readIdsString ? JSON.parse(readIdsString) : [];

                const updated = dummyNotifications.map(item => ({
                    ...item,
                    isRead: readIds.includes(item.id),
                }));

                setNotifications(updated);
            } catch (e) {
                console.error('Error loading read notifications:', e);
            }
        };

        loadReadNotifications();
    }, []);



    const handleMarkAsRead = async (id: number) => {
        try {
            const newNotifications = notifications.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
            );
            setNotifications(newNotifications);

            const stored = await AsyncStorage.getItem('readNotificationIds');
            const current = stored ? JSON.parse(stored) : [];

            if (!current.includes(id)) {
                current.push(id);
                await AsyncStorage.setItem('readNotificationIds', JSON.stringify(current));
            }
        } catch (e) {
            console.error('Error updating read status', e);
        }
    };


    const filterNotifications = () => {
        if (active === 'All') return notifications;
        if (active === 'Promotion') return notifications.filter(i => i.type === 'promotion');
        if (active === 'System') return notifications.filter(i => i.type === 'systemMsg');
        if (active === 'Orders') return notifications.filter(i => i.type === 'orderShipped' || i.type === 'orderDelivered');
        if (active === 'Account') return notifications.filter(i => i.type === 'profile');
        return notifications;
    };

    if (loading) return <ActivityIndicator size="small" color="#007bff" />;

    return (
        <View style={styles.container}>
            <UnifiedHeader
                title="Notification"
                showMenuButton={false}
                rightIcon={
                    <TouchableOpacity onPress={() => setShowSettings(true)}>
                        <MaterialIcons name="settings" size={24} color="#0077CC" />
                    </TouchableOpacity>
                }
                headerStyle="default"
            />

            {/* Filters */}
            <View style={styles.filtercontainer}>
                {filters.map(label => (
                    <TouchableOpacity
                        key={label}
                        style={[styles.filterBox, active === label && styles.activeBox]}
                        onPress={() => setActive(label)}
                    >
                        <Text style={[styles.filterText, active === label && styles.activeText]}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filterNotifications()}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <NotificationCart
                        item={item}
                        onDelete={handleDelete}
                        onRead={handleMarkAsRead}
                    />
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                style={styles.scrollContainer}
            />

            <Modal
                animationType="slide"
                visible={showSettings}
                onRequestClose={() => setShowSettings(false)}
            >
                <SafeAreaView style={{ flex: 1 }}>

                    <SettingsScreen closeModal={() => setShowSettings(false)} />
                </SafeAreaView>
            </Modal>
        </View>
    );
};

export default Notification;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flex: 1,
        // paddingBottom: 20,
        marginLeft: 8,
        marginRight: 8
    },
    filtercontainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: 8,
        backgroundColor: '#FFFFFF',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 10,
    },
    filterBox: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#f2f2f2',
    },
    activeBox: {
        backgroundColor: '#007bff',
    },
    filterText: {
        color: '#333',
        fontSize: 13,
    },
    activeText: {
        color: '#fff',
        fontWeight: 'bold',
    },

    closeButton: {
        padding: 10,
        alignSelf: 'flex-end',
    },
});
