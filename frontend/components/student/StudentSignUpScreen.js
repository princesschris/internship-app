import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useCustomAlert } from '../CustomAlert';

export default function StudentSignUpScreen({ route, navigation }) {
  const { role } = route.params;
  const { signUp, signInWithGoogle } = useAuth();
  const [firstName, setFirstName] = useState('');
  const { showAlert, AlertComponent } = useCustomAlert();
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      showAlert({ title: 'Missing Fields', message: 'Please fill in all required fields.' });
      return;
    }
    if (password !== confirmPassword) {
      showAlert({ title: 'Password Mismatch', message: 'Passwords do not match.' });
      return;
    }
    if (password.length < 6) {
      showAlert({ title: 'Weak Password', message: 'Password must be at least 6 characters.' });
      return;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      showAlert({ title: 'Invalid Email', message: 'Please enter a valid email address.' });
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, 'Student', {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
      });
      showAlert({ title: 'Welcome!', message: `Account created for ${firstName} ${lastName}.` });
      navigation.replace('MainTabs', { userRole: 'Student' });
    } catch (error) {
      const msg = error.response?.data?.error?.message || error.message || 'Failed to create account.';
      showAlert({ title: 'Registration Failed', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle('Student');
      navigation.replace('MainTabs', { userRole: 'Student' });
    } catch (error) {
      if (error.message !== 'Google sign-in cancelled') {
        showAlert({ title: 'Google Sign-In Failed', message: error.message || 'Could not sign in with Google.' });
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const InputField = ({ label, required, id, ...props }) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>
        {label}{required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[styles.input, focusedField === id && styles.inputFocused]}
        placeholderTextColor="#b0b8c1"
        editable={!loading && !googleLoading}
        onFocus={() => setFocusedField(id)}
        onBlur={() => setFocusedField(null)}
        {...props}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {AlertComponent}
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="school-outline" size={32} color="#3B82F6" />
          </View>
          <Text style={styles.title}>Create Student Account</Text>
          <Text style={styles.subtitle}>Join thousands of students finding internships.</Text>
        </View>

        <View style={styles.card}>
          {}
          <TouchableOpacity
            style={[styles.googleButton, googleLoading && styles.buttonDisabled]}
            onPress={handleGoogleSignUp}
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
            <Text style={styles.dividerText}>or register with email</Text>
            <View style={styles.dividerLine} />
          </View>

          {}
          <Text style={styles.sectionLabel}>Personal Information</Text>

          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <Text style={styles.label}>First Name <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, focusedField === 'firstName' && styles.inputFocused]}
                placeholder="John"
                placeholderTextColor="#b0b8c1"
                value={firstName}
                onChangeText={setFirstName}
                editable={!loading && !googleLoading}
                onFocus={() => setFocusedField('firstName')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            <View style={styles.nameField}>
              <Text style={styles.label}>Last Name <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, focusedField === 'lastName' && styles.inputFocused]}
                placeholder="Doe"
                placeholderTextColor="#b0b8c1"
                value={lastName}
                onChangeText={setLastName}
                editable={!loading && !googleLoading}
                onFocus={() => setFocusedField('lastName')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          <InputField
            id="email"
            label="Email Address"
            required
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {}
          <Text style={styles.sectionLabel}>Security</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password <Text style={styles.required}>*</Text></Text>
            <View style={[styles.passwordWrapper, focusedField === 'password' && styles.inputFocused]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Min. 6 characters"
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

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirm Password <Text style={styles.required}>*</Text></Text>
            <View style={[styles.passwordWrapper, focusedField === 'confirmPassword' && styles.inputFocused]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Re-enter your password"
                placeholderTextColor="#b0b8c1"
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!loading && !googleLoading}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowConfirm(v => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#a0aec0"
                />
              </TouchableOpacity>
            </View>
          </View>

          {}
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading || googleLoading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('StudentLogin', { role: 'Student' })}
            disabled={loading || googleLoading}
            style={styles.linkContainer}
          >
            <Text style={styles.linkText}>
              Already have an account?{' '}
              <Text style={styles.linkAccent}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: '#f5f7fa' },
  scrollContainer: { flexGrow: 1, padding: 24, paddingTop: 40 },
  header: { alignItems: 'center', marginBottom: 28 },
  iconContainer: {
    width: 64, height: 64, borderRadius: 18, backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  iconText: { fontSize: 30 },
  title: { fontSize: 24, fontWeight: '700', color: '#1a202c', letterSpacing: -0.5, marginBottom: 6, textAlign: 'center' },
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
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#a0aec0',
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, marginTop: 4,
  },
  nameRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  nameField: { flex: 1 },
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#4a5568', marginBottom: 6, letterSpacing: 0.2 },
  required: { color: '#e53e3e' },
  input: {
    backgroundColor: '#f7fafc', borderWidth: 1.5, borderColor: '#e2e8f0',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: '#1a202c',
  },
  inputFocused: { borderColor: '#60A5FA', backgroundColor: '#fff' },
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
  primaryButton: {
    backgroundColor: '#3B82F6', borderRadius: 12, paddingVertical: 15,
    alignItems: 'center', marginTop: 8, shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  buttonDisabled: { opacity: 0.55 },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  linkContainer: { marginTop: 18, alignItems: 'center' },
  linkText: { fontSize: 14, color: '#718096' },
  linkAccent: { color: '#3B82F6', fontWeight: '600' },
  bottomSpacer: { height: 40 },
});