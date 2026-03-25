import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import api from '../services/api';

const AuthContext = createContext();

GoogleSignin.configure({
  webClientId: Constants.expoConfig?.extra?.googleWebClientId,
  offlineAccess: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const user = await AsyncStorage.getItem('userProfile');
      if (token && user) {
        setAuthToken(token);
        setUserProfile(JSON.parse(user));
        setCurrentUser({ token });
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const persistAuth = async (token, user) => {
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('userProfile', JSON.stringify(user));
    setAuthToken(token);
    setUserProfile(user);
    setCurrentUser({ token });
  };

  const signUp = async (email, password, role, userData) => {
    try {
      const response = await api.post('/auth/register', { email, password, role, userData });
      const { token, user } = response.data;
      await persistAuth(token, user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      await persistAuth(token, user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async (role) => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const googleUser = await GoogleSignin.signIn();
      const idToken = googleUser.idToken || googleUser.data?.idToken;
      if (!idToken) throw new Error('No ID token returned from Google');
      const response = await api.post('/auth/google', { idToken, role });
      const { token, user } = response.data;
      await persistAuth(token, user);
      return user;
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Google sign-in cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Google sign-in already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services not available');
      }
      throw error;
    }
  };

  const logOut = async () => {
    try {
      try { await GoogleSignin.signOut(); } catch (_) {}
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userProfile');
      setAuthToken(null);
      setUserProfile(null);
      setCurrentUser(null);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    currentUser,
    userProfile,
    authToken,
    signUp,
    signIn,
    signInWithGoogle,
    logOut,
    setUserProfile,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};