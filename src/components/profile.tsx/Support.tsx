import { useNavigation } from "@react-navigation/native";
import { Image, StyleSheet, Text, TouchableOpacity, View, Animated, ScrollView, SafeAreaView } from "react-native"
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import UnifiedHeader from "../common/UnifiedHeader";
import { useState, useEffect } from "react";



const Support = () => {
    const navigation = useNavigation();
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(50));

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const supportOptions = [
        {
            id: 1,
            title: "Recent Orders",
            subtitle: "Track & manage orders",
            icon: "package-variant",
            color: "#4CAF50",
            gradient: ['#4CAF50', '#45A049'],
            action: "recentOrders"
        },
        {
            id: 2,
            title: "Returns & Refunds",
            subtitle: "Process returns",
            icon: "undo",
            color: "#FF9800",
            gradient: ['#FF9800', '#F57C00'],
            action: "returns"
        },
        {
            id: 3,
            title: "Cancellations",
            subtitle: "Cancel orders",
            icon: "close-circle",
            color: "#F44336",
            gradient: ['#F44336', '#D32F2F'],
            action: "cancellations"
        },
        {
            id: 4,
            title: "Live Chat",
            subtitle: "Get instant help",
            icon: "chat",
            color: "#2196F3",
            gradient: ['#2196F3', '#1976D2'],
            action: "liveChat"
        }
    ];

    const handleOptionPress = (action: string) => {
        // Handle different support actions
        console.log(`Support action: ${action}`);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Welcome Section */}
                <Animated.View 
                    style={[
                        styles.welcomeSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <LinearGradient
                        colors={['#0077CC', '#0056B3']}
                        style={styles.welcomeGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.welcomeContent}>
                            <MaterialIcons name="support-agent" size={48} color="#FFFFFF" />
                            <Text style={styles.welcomeTitle}>Hi! How can we help?</Text>
                            <Text style={styles.welcomeSubtitle}>
                                We're here to assist you with any questions
                            </Text>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Recent Order Section */}
                <Animated.View 
                    style={[
                        styles.recentOrderSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="history" size={24} color="#0077CC" />
                        <Text style={styles.sectionTitle}>Recent Order</Text>
                    </View>
                    
                    <View style={styles.orderCard}>
                        <View style={styles.productImages}>
                            <View style={styles.imageContainer}>
                                <Image 
                                    source={require('../../assets/images/facecream.png')} 
                                    style={styles.productImage} 
                                    resizeMode="contain" 
                                />
                            </View>
                            <View style={styles.imageContainer}>
                                <Image 
                                    source={require('../../assets/images/beautyCare2.png')} 
                                    style={styles.productImage} 
                                    resizeMode="contain" 
                                />
                            </View>
                        </View>
                        
                        <View style={styles.orderInfo}>
                            <View style={styles.statusContainer}>
                                <View style={styles.statusBadge}>
                                    <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                                    <Text style={styles.statusText}>Delivered</Text>
                                </View>
                            </View>
                            
                            <TouchableOpacity 
                                style={styles.returnButton}
                                activeOpacity={0.8}
                            >
                                <MaterialIcons name="undo" size={18} color="#FFFFFF" />
                                <Text style={styles.returnButtonText}>Return Items</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>

                {/* Support Options */}
                <Animated.View 
                    style={[
                        styles.optionsSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="help-outline" size={24} color="#0077CC" />
                        <Text style={styles.sectionTitle}>What do you need help with?</Text>
                    </View>

                    <View style={styles.optionsGrid}>
                        {supportOptions.map((option, index) => (
                            <Animated.View
                                key={option.id}
                                style={[
                                    styles.optionCard,
                                    {
                                        opacity: fadeAnim,
                                        transform: [
                                            {
                                                translateY: slideAnim.interpolate({
                                                    inputRange: [0, 50],
                                                    outputRange: [0, 50],
                                                    extrapolate: 'clamp',
                                                })
                                            }
                                        ]
                                    }
                                ]}
                            >
                                <TouchableOpacity
                                    style={styles.optionButton}
                                    onPress={() => handleOptionPress(option.action)}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={option.gradient}
                                        style={styles.optionGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <View style={styles.optionIcon}>
                                            <MaterialIcons name={option.icon as any} size={32} color="#FFFFFF" />
                                        </View>
                                        <Text style={styles.optionTitle}>{option.title}</Text>
                                        <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                                    </LinearGradient>
                    </TouchableOpacity>
                            </Animated.View>
                        ))}
                </View>
                </Animated.View>

                {/* Contact Information */}
                <Animated.View 
                    style={[
                        styles.contactSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.contactCard}>
                        <View style={styles.contactHeader}>
                            <Ionicons name="call" size={24} color="#0077CC" />
                            <Text style={styles.contactTitle}>Need More Help?</Text>
                </View>
                        <Text style={styles.contactText}>
                            Contact our support team for personalized assistance
                        </Text>
                        <TouchableOpacity style={styles.contactButton} activeOpacity={0.8}>
                            <MaterialIcons name="phone" size={20} color="#FFFFFF" />
                            <Text style={styles.contactButtonText}>Call Support</Text>
                        </TouchableOpacity>
                </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Support


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 30,
        flexGrow: 1,
    },
    
    // Welcome Section
    welcomeSection: {
        margin: 16,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    welcomeGradient: {
        padding: 24,
        alignItems: 'center',
    },
    welcomeContent: {
        alignItems: 'center',
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: 12,
        textAlign: 'center',
    },
    welcomeSubtitle: {
        fontSize: 14,
        color: '#E3F2FD',
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 16,
    },

    // Recent Order Section
    recentOrderSection: {
        margin: 16,
        marginTop: 0,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginLeft: 12,
        flex: 1,
    },
    orderCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: 'rgba(0, 119, 204, 0.1)',
    },
    productImages: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
    },
    imageContainer: {
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 8,
        marginHorizontal: 8,
        backgroundColor: '#F8FAFC',
    },
    productImage: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
    },
    orderInfo: {
        alignItems: 'center',
    },
    statusContainer: {
        marginBottom: 16,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0FDF4',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#166534',
        marginLeft: 6,
    },
    returnButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0077CC',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        shadowColor: '#0077CC',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    returnButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },

    // Support Options Section
    optionsSection: {
        margin: 16,
        marginTop: 8,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    optionCard: {
        width: '48%',
        marginBottom: 16,
    },
    optionButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    optionGradient: {
        padding: 16,
        alignItems: 'center',
        minHeight: 120,
        justifyContent: 'space-between',
    },
    optionIcon: {
        marginBottom: 8,
        marginTop: 8,
    },
    optionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 4,
        lineHeight: 18,
    },
    optionSubtitle: {
        fontSize: 10,
        color: '#E3F2FD',
        textAlign: 'center',
        lineHeight: 12,
        paddingHorizontal: 4,
        flexWrap: 'wrap',
    },

    // Contact Section
    contactSection: {
        margin: 16,
        marginTop: 8,
        marginBottom: 20,
    },
    contactCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: 'rgba(0, 119, 204, 0.1)',
    },
    contactHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    contactTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginLeft: 12,
    },
    contactText: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
        marginBottom: 16,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0077CC',
        paddingVertical: 14,
        borderRadius: 12,
        shadowColor: '#0077CC',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    contactButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
})