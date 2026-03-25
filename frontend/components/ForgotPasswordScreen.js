import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useCustomAlert } from './CustomAlert';
import api from '../services/api';

export function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const { showAlert, AlertComponent } = useCustomAlert();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async () => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!email || !emailRegex.test(email)) {
      showAlert({ title: 'Invalid Email', message: 'Please enter a valid email address.' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (error) {

      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {AlertComponent}
        <View style={styles.scrollContainer}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: '#EFF6FF' }]}>
              <Text style={styles.iconText}>✉️</Text>
            </View>
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.subtitle}>
              If <Text style={styles.emailHighlight}>{email}</Text> is registered, we've sent a password reset link. It expires in 1 hour.
            </Text>
          </View>

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Back to Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ghostButton}
              onPress={() => { setSent(false); }}
              activeOpacity={0.85}
            >
              <Text style={styles.ghostButtonText}>Resend email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="key-outline" size={28} color="#2563EB" />
          </View>
          <Text style={styles.title}>Forgot password?</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a link to reset your password.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, focused && styles.inputFocused]}
              placeholder="you@example.com"
              placeholderTextColor="#b0b8c1"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.linkContainer}
            disabled={loading}
          >
            <Text style={styles.linkText}>
              ← <Text style={styles.linkAccent}>Back to Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function ResetPasswordScreen({ route, navigation }) {
  const { token = '', email = '' } = route?.params || {};
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      showAlert({ title: 'Missing Fields', message: 'Please fill in both password fields.' });
      return;
    }
    if (password.length < 6) {
      showAlert({ title: 'Weak Password', message: 'Password must be at least 6 characters.' });
      return;
    }
    if (password !== confirmPassword) {
      showAlert({ title: 'Mismatch', message: 'Passwords do not match.' });
      return;
    }
    if (!token || !email) {
      showAlert({ title: 'Invalid Link', message: 'This reset link is invalid. Please request a new one.' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        token,
        newPassword: password,
      });
      setSuccess(true);
    } catch (error) {
      const msg = error.response?.data?.error?.message || 'Failed to reset password.';
      showAlert({ title: 'Error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="checkmark-circle-outline" size={28} color="#3B82F6" />
          </View>
          <Text style={styles.title}>Password reset!</Text>
          <Text style={styles.subtitle}>
            Your password has been updated. You can now sign in with your new password.
          </Text>
        </View>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.replace('RoleSelection')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: '#e8f0fe' }]}>
            <Ionicons name="lock-closed-outline" size={28} color="#2563EB" />
          </View>
          <Text style={styles.title}>Set new password</Text>
          <Text style={styles.subtitle}>
            Choose a strong password for <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={[styles.input, focused === 'password' && styles.inputFocused]}
              placeholder="Min. 6 characters"
              placeholderTextColor="#b0b8c1"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={[styles.input, focused === 'confirm' && styles.inputFocused]}
              placeholder="Re-enter your password"
              placeholderTextColor="#b0b8c1"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
              onFocus={() => setFocused('confirm')}
              onBlur={() => setFocused(null)}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleReset}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Reset Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f7fa',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  iconText: { fontSize: 30 },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a202c',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  emailHighlight: {
    color: '#2563eb',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  fieldGroup: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: '#f7fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#1a202c',
  },
  inputFocused: {
    borderColor: '#2563eb',
    backgroundColor: '#fff',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: { opacity: 0.55 },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  ghostButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  ghostButtonText: {
    color: '#4a5568',
    fontSize: 15,
    fontWeight: '600',
  },
  linkContainer: {
    marginTop: 18,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#718096',
  },
  linkAccent: {
    color: '#2563eb',
    fontWeight: '600',
  },
});