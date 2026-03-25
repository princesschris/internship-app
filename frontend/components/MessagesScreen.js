import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, TextInput, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { useCustomAlert } from './CustomAlert';
import api from '../services/api';

const AVATAR_COLORS = ['#2563EB', '#7C3AED', '#EA580C', '#3B82F6', '#DC2626', '#0EA5E9', '#D97706'];

function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export default function MessagesScreen({ navigation }) {
  const { authToken, userProfile } = useAuth();
  const [conversations, setConversations] = useState([]);
  const { showAlert, AlertComponent } = useCustomAlert();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const fetchConversations = async (silent = false) => {
    if (!authToken) { setLoading(false); setRefreshing(false); return; }
    if (!silent) setLoading(true);
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data.conversations || []);
    } catch (error) {
      if (!silent) showAlert({ title: 'Connection Error', message: 'Could not load messages.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const searchMessages = async (query) => {
    if (!query?.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const response = await api.get(`/messages/search?query=${encodeURIComponent(query)}`);
      setSearchResults(response.data.messages || []);
    } catch {  }
    finally { setSearching(false); }
  };

  useFocusEffect(useCallback(() => {

    fetchConversations();
  }, [authToken]));

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    if (diff < 604800000) return date.toLocaleDateString('en-US', { weekday: 'short' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const unreadCount = conversations.filter(c => c.unread).length;

  if (!authToken) {
    return (
      <View style={styles.emptyScreen}>
      {AlertComponent}
        <Ionicons name="lock-closed-outline" size={48} color="#CBD5E1" />
        <Text style={styles.emptyTitle}>Not Logged In</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.replace('RoleSelection')}>
          <Text style={styles.loginBtnText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.emptyScreen}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={['#1D4ED8', '#2563EB', '#3B82F6']}
        style={styles.header}
      >
        <View style={styles.decorCircle} />
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Messages</Text>
            {unreadCount > 0 && (
              <Text style={styles.headerSub}>{unreadCount} unread conversation{unreadCount > 1 ? 's' : ''}</Text>
            )}
          </View>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={17} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={q => { setSearchQuery(q); setShowSearch(true); if (q.length > 2) searchMessages(q); else setSearchResults([]); }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); setShowSearch(false); }}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {showSearch && searchQuery.length > 0 ? (
        <View style={{ flex: 1 }}>
          {searching ? (
            <View style={styles.emptyScreen}><ActivityIndicator color="#2563EB" /></View>
          ) : searchResults.length === 0 ? (
            <View style={styles.emptyScreen}>
              <Ionicons name="search-outline" size={40} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No results</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={item => item._id}
              contentContainerStyle={{ paddingTop: 8 }}
              renderItem={({ item }) => {
                const isMe = item.senderId === userProfile?._id;
                const name = isMe ? item.recipientName : item.senderName;
                const id = isMe ? item.recipientId : item.senderId;
                const color = getAvatarColor(name);
                return (
                  <TouchableOpacity
                    style={styles.convoItem}
                    onPress={() => { setShowSearch(false); setSearchQuery(''); navigation.navigate('Chat', { recipientId: id, recipientName: name }); }}
                  >
                    <View style={[styles.avatar, { backgroundColor: color }]}>
                      <Text style={styles.avatarText}>{name?.charAt(0).toUpperCase() || '?'}</Text>
                    </View>
                    <View style={styles.convoContent}>
                      <Text style={styles.convoName}>{name}</Text>
                      <Text style={styles.convoMsg} numberOfLines={1}>{item.text}</Text>
                    </View>
                    <Text style={styles.convoTime}>{formatTime(item.timestamp)}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.emptyScreen}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="chatbubbles-outline" size={40} color="#2563EB" />
          </View>
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySubtitle}>
            Message an organization from an internship posting to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.userId}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchConversations(); }} tintColor="#2563EB" />}
          contentContainerStyle={{ paddingTop: 8 }}
          renderItem={({ item }) => {
            const color = getAvatarColor(item.userName);
            return (
              <TouchableOpacity
                style={styles.convoItem}
                onPress={() => navigation.navigate('Chat', { recipientId: item.userId, recipientName: item.userName })}
                activeOpacity={0.75}
              >
                <View style={styles.avatarWrapper}>
                  <View style={[styles.avatar, { backgroundColor: color }]}>
                    <Text style={styles.avatarText}>{item.userName?.charAt(0).toUpperCase() || '?'}</Text>
                  </View>
                  {item.unread && <View style={styles.onlineDot} />}
                </View>

                <View style={styles.convoContent}>
                  <Text style={[styles.convoName, item.unread && { color: '#0F172A' }]} numberOfLines={1}>
                    {item.userName || 'Unknown'}
                  </Text>
                  <Text style={[styles.convoMsg, item.unread && styles.convoMsgUnread]} numberOfLines={1}>
                    {item.lastMessage || 'No messages yet'}
                  </Text>
                </View>

                <View style={styles.convoRight}>
                  <Text style={styles.convoTime}>{formatTime(item.lastMessageTime)}</Text>
                  {item.unread && (
                    <View style={styles.unreadDot} />
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F1F5F9' },
  header: {
    paddingTop: 55, paddingBottom: 16, paddingHorizontal: 20, overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)', top: -50, right: -50,
  },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 14,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  unreadBadge: {
    backgroundColor: '#EF4444', width: 26, height: 26, borderRadius: 13,
    justifyContent: 'center', alignItems: 'center',
  },
  unreadBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  searchInput: { flex: 1, fontSize: 15, color: '#fff' },
  emptyScreen: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F1F5F9', padding: 30,
  },
  emptyIconBox: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: '#EEF4FF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#334155', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 20 },
  loginBtn: {
    marginTop: 16, backgroundColor: '#2563EB',
    paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12,
  },
  loginBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  convoItem: {
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
  convoContent: { flex: 1 },
  convoName: { fontSize: 15.5, fontWeight: '600', color: '#334155', marginBottom: 3 },
  convoMsg: { fontSize: 13.5, color: '#94A3B8' },
  convoMsgUnread: { color: '#475569', fontWeight: '500' },
  convoRight: { alignItems: 'flex-end', gap: 6 },
  convoTime: { fontSize: 12, color: '#94A3B8' },
  unreadDot: {
    width: 9, height: 9, borderRadius: 5, backgroundColor: '#2563EB',
  },
  separator: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 82 },
});