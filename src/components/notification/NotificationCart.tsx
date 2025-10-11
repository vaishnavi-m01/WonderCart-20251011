import dayjs from 'dayjs';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface CartItemProps {
  item: {
    id: number;
    name: string;
    price?: number;
    image?: string;
    message?: string;
    createdAt?: string;
    type: 'orderShipped' | 'orderDelivered' | 'promotion' | 'profile' | 'systemMsg';
    isRead?: boolean;
  };
  onDelete: (id: number) => void;
}

const NotificationCart = ({ item, onDelete, onRead }: CartItemProps & { onRead: (id: number) => void }) => {

  const renderRightActions = () => (
    <TouchableOpacity style={styles.deleteBox} onPress={() => onDelete(item.id)}>
      <Icon name="trash-can-outline" size={24} color="#fff" />
      <Text style={styles.deleteLabel}>Delete</Text>
    </TouchableOpacity>
  );

  const getIconDetails = () => {
    switch (item.type) {
      case 'orderShipped':
        return { name: 'truck-delivery-outline', bg: '#E3F2FD', color: '#1976D2' };
      case 'orderDelivered':
        return { name: 'check-circle-outline', bg: '#E8F5E9', color: '#388E3C' };
      case 'profile':
        return { name: 'account-circle-outline', bg: '#FFF3E0', color: '#FB8C00' };
      case 'systemMsg':
        return { name: 'information-outline', bg: '#F3E5F5', color: '#8E24AA' };
      default:
        return { name: 'bell-outline', bg: '#E0E0E0', color: '#555' };
    }
  };

  const getRelativeTime = (dateString: string): string => {
    const now = dayjs();
    const past = dayjs(dateString);

    const diffInMinutes = now.diff(past, 'minute');
    const diffInHours = now.diff(past, 'hour');
    const diffInDays = now.diff(past, 'day');
    const diffInWeeks = now.diff(past, 'week');

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  };

  const handlePress = () => {
    if (!item.isRead) {
      onRead(item.id);
    }
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.cartItem,
          { backgroundColor: item.isRead ? '#fff' : '#E3F2FF' },
        ]}
      >
        {item.type === 'promotion' && item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={[styles.iconContainer, { backgroundColor: getIconDetails().bg }]}>
            <Icon name={getIconDetails().name} size={28} color={getIconDetails().color} />
          </View>
        )}

        <View style={styles.details}>
          <Text style={styles.name}>{item.name}</Text>
          {item.message ? (
            <Text style={styles.price}>{item.message}</Text>
          ) : item.price ? (
            <Text style={styles.price}>₹ {item.price}</Text>
          ) : null}
          <Text style={styles.timeText}>
            {item.createdAt ? getRelativeTime(item.createdAt) : ''}
          </Text>

        </View>

        {!item.isRead && (
          <View style={styles.dotContainer}>
            <View style={styles.unreadDot} />
          </View>
        )}
      </Pressable>
    </Swipeable>
  );
};

export default NotificationCart;

const styles = StyleSheet.create({
  cartItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  price: {
    marginTop: 4,
    fontSize: 14,
    color: '#666',
  },
  deleteBox: {
    width: 70,
    backgroundColor: '#FF7F7F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  dotContainer: {
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1976D2',
  },
  timeText: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 5,
  }

});
