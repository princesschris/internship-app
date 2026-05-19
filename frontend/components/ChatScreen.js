import React, { useState, useEffect, useRef } from 'react';
import {View,Text,TextInput,TouchableOpacity,FlatList,StyleSheet,KeyboardAvoidingView,Platform,ActivityIndicator,Modal} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useCustomAlert } from './CustomAlert';
import api, { SOCKET_URL } from '../services/api';
import io from 'socket.io-client';

export default function ChatScreen({ route, navigation }) {
  const { recipientId, recipientName } = route.params;
  const { userProfile } = useAuth();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const flatListRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({ title: recipientName });
    connectWebSocket();
    fetchMessages();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [recipientId]);

  const connectWebSocket = () => {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join', userProfile?._id);
    });

    socketRef.current.on('new_message', (message) => {
      if (message.senderId === recipientId || message.recipientId === recipientId) {
        setMessages(prev => [...prev, message]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        if (message.senderId === recipientId) markMessageAsRead(message._id);
      }
    });

    socketRef.current.on('typing_status', ({ userId, isTyping }) => {
      if (userId === recipientId) setIsTyping(isTyping);
    });

    socketRef.current.on('message_read', ({ messageId, readAt }) => {
      setMessages(prev =>
        prev.map(msg => msg._id === messageId ? { ...msg, read: true, readAt } : msg)
      );
    });

    socketRef.current.on('message_deleted', ({ messageId }) => {
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    });
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/${recipientId}`);
      setMessages(response.data.messages || []);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
    } catch (error) {
      console.error('Fetch messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || sending) return;
    const textToSend = messageText.trim();
    setMessageText('');
    setSending(true);
    sendTypingIndicator(false);

    try {
      const response = await api.post('/messages', { recipientId, text: textToSend });
      setMessages(prev => [...prev, response.data.messageData]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      showAlert({ title: 'Error', message: error.response?.data?.error?.message || 'Failed to send message.' });
      setMessageText(textToSend);
    } finally {
      setSending(false);
    }
  };

  const sendTypingIndicator = (typing) => {
    socketRef.current?.emit('typing', {
      recipientId,
      senderId: userProfile?._id,
      isTyping: typing,
    });
  };

  const handleTextChange = (text) => {
    setMessageText(text);
    sendTypingIndicator(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => sendTypingIndicator(false), 2000);
  };

  const markMessageAsRead = async (messageId) => {
    try {
      await api.patch(`/messages/${messageId}/read`);
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const handleDeleteMessage = (message) => {
    setSelectedMessage(message);
    setShowDeleteModal(true);
  };

  const deleteMessage = async (deleteFor) => {
    if (!selectedMessage) return;
    try {
      await api.delete(`/messages/${selectedMessage._id}?deleteFor=${deleteFor}`);
      setMessages(prev => prev.filter(msg => msg._id !== selectedMessage._id));
      setShowDeleteModal(false);
      setSelectedMessage(null);
    } catch (error) {
      showAlert({ title: 'Error', message: error.response?.data?.error?.message || 'Failed to delete message.' });
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.senderId === userProfile?._id;
    return (
      <TouchableOpacity
        style={[styles.messageContainer, isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer]}
        onLongPress={() => isMyMessage && handleDeleteMessage(item)}
        activeOpacity={0.85}
      >
        <View style={[styles.messageBubble, isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble]}>
          <Text style={[styles.messageText, isMyMessage ? styles.myMessageText : styles.theirMessageText]}>
            {item.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[styles.timestamp, isMyMessage ? styles.myTimestamp : styles.theirTimestamp]}>
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isMyMessage && (
              <Text style={styles.readReceipt}>{item.read ? '✓✓' : '✓'}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        {AlertComponent}
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {AlertComponent}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => {
          if (messages.length > 0) flatListRef.current?.scrollToEnd({ animated: true });
        }}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Ionicons name="chatbubble-ellipses-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyChatText}>No messages yet. Say hello!</Text>
          </View>
        }
      />

      {isTyping && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>{recipientName} is typing...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#94A3B8"
          value={messageText}
          onChangeText={handleTextChange}
          multiline
          maxLength={500}
          editable={!sending}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!messageText.trim() || sending) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!messageText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="send" size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Message</Text>
            <Text style={styles.modalText}>Choose how you want to delete this message</Text>

            <TouchableOpacity style={styles.modalButton} onPress={() => deleteMessage('me')}>
              <Text style={styles.modalButtonText}>Delete for me</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.modalButtonDanger]} onPress={() => deleteMessage('everyone')}>
              <Text style={styles.modalButtonText}>Delete for everyone</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={() => { setShowDeleteModal(false); setSelectedMessage(null); }}
            >
              <Text style={[styles.modalButtonText, styles.modalButtonCancelText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
     backgroundColor: '#F1F5F9' 
    },
  loadingContainer: { 
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#F1F5F9' 
  },
  messagesList: { 
    padding: 16, 
    paddingBottom: 8 
  },
  emptyChat: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingTop: 80, 
    gap: 12 
  },
  emptyChatText: { 
    fontSize: 14, 
    color: '#94A3B8' 
  },
  messageContainer: { 
    marginBottom: 8, 
    flexDirection: 'row' 
  },
  myMessageContainer: { 
    justifyContent: 'flex-end' 
  },
  theirMessageContainer: { 
    justifyContent: 'flex-start' 
  },
  messageBubble: { 
    maxWidth: '75%', 
    padding: 12, 
    borderRadius: 18 
  },
  myMessageBubble: { 
    backgroundColor: '#2563EB', 
    borderBottomRightRadius: 4 
  },
  theirMessageBubble: { 
    backgroundColor: '#fff', 
    borderBottomLeftRadius: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 4, 
    elevation: 1 
  },
  messageText: { 
    fontSize: 15, 
    lineHeight: 21 
  },
  myMessageText: { 
    color: '#fff' 
  },
  theirMessageText: { 
    color: '#1E293B' 
  },
  messageFooter: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 4, 
    gap: 4 
  },
  timestamp: { 
    fontSize: 11 
  },
  myTimestamp: { 
    color: 'rgba(255,255,255,0.65)' 
  },
  theirTimestamp: { 
    color: '#94A3B8' 
  },
  readReceipt: { 
    fontSize: 11, 
    color: 'rgba(255,255,255,0.65)' 

  },
  typingIndicator: { paddingHorizontal: 20, 
    paddingVertical: 8, 
    backgroundColor: '#F1F5F9' 

  },
  typingText: { 
    fontSize: 13, 
    fontStyle: 'italic', 
    color: '#94A3B8' 
  },
  inputContainer: {
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    padding: 12, 
    gap: 10,
    backgroundColor: '#fff', 
    borderTopWidth: 1, 
    borderTopColor: '#E2E8F0',
  },
  input: {
    flex: 1, 
    backgroundColor: '#F8FAFC', 
    borderRadius: 22,
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    fontSize: 15,
    color: '#1E293B', 
    maxHeight: 100, 
    borderWidth: 1.5, 
    borderColor: '#E2E8F0',
  },
  sendButton: {
    width: 44, height: 44, 
    borderRadius: 22,
    backgroundColor: '#2563EB', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#2563EB', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 4,
  },
  sendButtonDisabled: { 
    backgroundColor: '#CBD5E1', 
    shadowOpacity: 0 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 24, 
    width: '80%', 
    maxWidth: 360 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#0F172A', 
    marginBottom: 8 
  },
  modalText: { 
    fontSize: 14, 
    color: '#64748B', 
    marginBottom: 20 
  },
  modalButton: { 
    backgroundColor: '#2563EB', 
    padding: 14, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginBottom: 10 
  },
  modalButtonDanger: { 
    backgroundColor: '#DC2626' 
  },
  modalButtonCancel: { 
    backgroundColor: 'transparent', 
    borderWidth: 1.5, 
    borderColor: '#E2E8F0' 

  },
  modalButtonText: { 
    color: '#fff', 
    fontSize: 15, 
    fontWeight: '600' },
  modalButtonCancelText: { 
    color: '#64748B' 
  },
});