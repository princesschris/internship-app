import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const AVATAR_COLORS = ['#2563EB', '#7C3AED', '#EA580C', '#3B82F6', '#DC2626', '#0EA5E9'];

function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export default function ConversationsScreen({ navigation }) {
  const { userProfile } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations(true);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    if (diff < 604800000) return date.toLocaleDateString('en-US', { weekday: 'short' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        {conversations.filter(c => c.unread).length > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{conversations.filter(c => c.unread).length}</Text>
          </View>
        )}
      </View>

      {conversations.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="chatbubbles-outline" size={40} color="#2563EB" />
          </View>
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySubtitle}>Apply to internships to start messaging organizations</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.userId}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => {
            const color = getAvatarColor(item.userName);
            return (
              <TouchableOpacity
                style={styles.row}
                onPress={() => navigation.navigate('Chat', { recipientId: item.userId, recipientName: item.userName })}
                activeOpacity={0.75}
              >
                <View style={styles.avatarWrapper}>
                  <View style={[styles.avatar, { backgroundColor: color }]}>
                    <Text style={styles.avatarText}>{item.userName?.charAt(0).toUpperCase() || '?'}</Text>
                  </View>
                  {item.unread && <View style={styles.onlineDot} />}
                </View>

                <View style={styles.content}>
                  <View style={styles.topRow}>
                    <Text style={[styles.name, item.unread && styles.nameUnread]} numberOfLines={1}>
                      {item.userName || 'Unknown'}
                    </Text>
                    <Text style={styles.time}>{formatTime(item.lastMessageTime)}</Text>
                  </View>
                  <View style={styles.bottomRow}>
                    <Text style={[styles.preview, item.unread && styles.previewUnread]} numberOfLines={1}>
                      {item.lastMessage || 'No messages yet'}
                    </Text>
                    {item.unread && <View style={styles.unreadDot} />}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  headerBadge: {
    backgroundColor: '#EFF6FF', paddingHorizontal: 10,
    paddingVertical: 3, borderRadius: 20,
  },
  headerBadgeText: { fontSize: 13, fontWeight: '700', color: '#2563EB' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: '#EEF4FF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 20 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 14,
    backgroundColor: '#fff',
  },
  avatarWrapper: { position: 'relative', marginRight: 14 },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 13, height: 13, borderRadius: 7,
    backgroundColor: '#60A5FA', borderWidth: 2, borderColor: '#fff',
  },
  content: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontSize: 15.5, fontWeight: '600', color: '#334155', flex: 1, marginRight: 8 },
  nameUnread: { color: '#0F172A', fontWeight: '700' },
  time: { fontSize: 12, color: '#94A3B8' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  preview: { fontSize: 13.5, color: '#94A3B8', flex: 1, marginRight: 8 },
  previewUnread: { color: '#475569', fontWeight: '500' },
  unreadDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#2563EB' },
  separator: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 82 },
});