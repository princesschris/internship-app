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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useCustomAlert } from '../CustomAlert';

export default function OrganizationLoginScreen({ route, navigation }) {
  const { role } = route.params;
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const { showAlert, AlertComponent } = useCustomAlert();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogIn = async () => {
    if (!email || !password) {
      showAlert({ title: 'Missing Fields', message: 'Please enter your email and password.' });
      return;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      showAlert({ title: 'Invalid Email', message: 'Please enter a valid email address.' });
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      navigation.replace('MainTabs', { userRole: 'Organization' });
    } catch (error) {
      const msg = error.response?.data?.error?.message || error.message || 'Login failed';
      showAlert({ title: 'Login Failed', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle('Organization');
      navigation.replace('MainTabs', { userRole: 'Organization' });
    } catch (error) {
      if (error.message !== 'Google sign-in cancelled') {
        showAlert({ title: 'Google Sign-In Failed', message: error.message || 'Could not sign in with Google.' });
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {AlertComponent}
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="business-outline" size={32} color="#2563eb" />
          </View>
          <Text style={styles.title}>Organization Login</Text>
          <Text style={styles.subtitle}>Welcome back! Sign in to manage your internships.</Text>
        </View>

        <View style={styles.card}>
          {/* Google */}
          <TouchableOpacity
            style={[styles.googleButton, googleLoading && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={googleLoading || loading}
            activeOpacity={0.85}
          >
            {googleLoading ? (
              <ActivityIndicator color="#444" size="small" />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or sign in with email</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, focusedField === 'email' && styles.inputFocused]}
              placeholder="you@organization.com"
              placeholderTextColor="#b0b8c1"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading && !googleLoading}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.passwordWrapper, focusedField === 'password' && styles.inputFocused]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor="#b0b8c1"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!loading && !googleLoading}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(v => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#a0aec0"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot */}
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            disabled={loading || googleLoading}
            style={styles.forgotContainer}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Sign In */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleLogIn}
            disabled={loading || googleLoading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('OrganizationSignUp', { role })}
            disabled={loading || googleLoading}
            style={styles.linkContainer}
          >
            <Text style={styles.linkText}>
              Don't have an account?{' '}
              <Text style={styles.linkAccent}>Create one</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: '#f5f7fa' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 28 },
  iconContainer: {
    width: 64, height: 64, borderRadius: 18, backgroundColor: '#e8f0fe',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  iconText: { fontSize: 30 },
  title: { fontSize: 26, fontWeight: '700', color: '#1a202c', letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#718096', textAlign: 'center', lineHeight: 20 },
  card: {
    backgroundColor: '#ffffff', borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 12, elevation: 3,
  },
  googleButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#ffffff', borderWidth: 1.5, borderColor: '#e2e8f0',
    borderRadius: 12, paddingVertical: 13, marginBottom: 20, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  googleIcon: {
    fontSize: 17, fontWeight: '700', color: '#4285F4',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  googleButtonText: { fontSize: 15, fontWeight: '600', color: '#2d3748' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  dividerText: { fontSize: 12, color: '#a0aec0', fontWeight: '500' },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#4a5568', marginBottom: 6, letterSpacing: 0.2 },
  input: {
    backgroundColor: '#f7fafc', borderWidth: 1.5, borderColor: '#e2e8f0',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: '#1a202c',
  },
  inputFocused: { borderColor: '#4285F4', backgroundColor: '#fff' },
  passwordWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f7fafc', borderWidth: 1.5,
    borderColor: '#e2e8f0', borderRadius: 12,
  },
  passwordInput: {
    flex: 1, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: '#1a202c',
  },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 13 },
  forgotContainer: { alignSelf: 'flex-end', marginBottom: 6, marginTop: -6 },
  forgotText: { fontSize: 13, color: '#2563eb', fontWeight: '500' },
  primaryButton: {
    backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 15,
    alignItems: 'center', marginTop: 6, shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  buttonDisabled: { opacity: 0.55 },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  linkContainer: { marginTop: 18, alignItems: 'center' },
  linkText: { fontSize: 14, color: '#718096' },
  linkAccent: { color: '#2563eb', fontWeight: '600' },
});