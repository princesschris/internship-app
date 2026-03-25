import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const API_URL = 'http://10.103.91.162:3000/api'
export const SOCKET_URL = 'http://10.103.91.162:3000'; 
console.log('🔗 Connecting to:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    console.log('Sending request to:', config.url);
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request setup failed:', error.message);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Got response from:', response.config.url);
    return response;
  },
  async (error) => {
    if (error.response) {
      console.error('Server error:', error.response.status);
      console.error('Error data:', error.response.data);
    } else if (error.request) {
      console.error('NETWORK ERROR - Cannot reach backend!');
      console.error('Tried to connect to:', API_URL);
      console.error('Make sure:');
      console.error('1. Backend is running (npm run dev)');
      console.error('2. Phone and computer on same WiFi');
      console.error('3. IP address is correct');
      console.error('4. Windows Firewall allows port 3000');
      
      Alert.alert(
        'Connection Error',
        'Cannot reach server. Make sure:\n\n' +
        '1. Backend is running\n' +
        '2. Same WiFi network\n' +
        '3. Correct IP in api.js',
        [{ text: 'OK' }]
      );
    } else {
      console.error('Error:', error.message);
    }
    
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Auth APIs
export const authAPI = {
  register: async (email, password, role, userData) => {
    try {
      console.log('Registering user with backend...');
      const response = await api.post('/auth/register', {
        email,
        password,
        role,
        userData,
      });
      console.log('Registration successful!');
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error.message);
      throw error;
    }
  },

  verify: async (token) => {
    const response = await api.post('/auth/verify', { token });
    return response.data;
  },
};

// User APIs
export const userAPI = {
  getProfile: async () => {
    console.log('Fetching user profile...');
    const response = await api.get('/users/me');
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateProfile: async (updates) => {
    const response = await api.put('/users/me', updates);
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete('/users/me');
    return response.data;
  },
};

// Internship APIs
export const internshipAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.state) params.append('state', filters.state);
    if (filters.types) params.append('types', filters.types.join(','));
    if (filters.status) params.append('status', filters.status);
    
    const response = await api.get(`/internships?${params.toString()}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/internships/${id}`);
    return response.data;
  },

  create: async (internshipData) => {
    const response = await api.post('/internships', internshipData);
    return response.data;
  },
  update: async (id, updates) => {
    const response = await api.put(`/internships/${id}`, updates);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/internships/${id}`);
    return response.data;
  },
};

// Application APIs
export const applicationAPI = {
  getAll: async (internshipId = null) => {
    const params = internshipId ? `?internshipId=${internshipId}` : '';
    const response = await api.get(`/applications${params}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },

  create: async (internshipId) => {
    const response = await api.post('/applications', { internshipId });
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/applications/${id}/status`, { status });
    return response.data;
  },

  withdraw: async (id) => {
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  },
};

// Message APIs
export const messageAPI = {
  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  getMessages: async (recipientId) => {
    const response = await api.get(`/messages/${recipientId}`);
    return response.data;
  },

  send: async (recipientId, text) => {
    const response = await api.post('/messages', { recipientId, text });
    return response.data;
  },

  markAsRead: async (messageId) => {
    const response = await api.patch(`/messages/${messageId}/read`);
    return response.data;
  },

  delete: async (messageId) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },
};