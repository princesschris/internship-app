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
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useCustomAlert } from '../CustomAlert';

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
  'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano',
  'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT'
];

export default function OrganizationSignUpScreen({ route, navigation }) {
  const { role } = route.params;
  const { signUp, signInWithGoogle } = useAuth();
  const [orgName, setOrgName] = useState('');
  const { showAlert, AlertComponent } = useCustomAlert();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [state, setState] = useState('Lagos');
  const [localGov, setLocalGov] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignUp = async () => {
    if (!orgName || !email || !password || !confirmPassword || !primaryPhone || !state || !localGov) {
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
      await signUp(email, password, 'Organization', {
        organizationName: orgName,
        primaryPhone,
        secondaryPhone,
        state,
        localGovernment: localGov,
      });
      showAlert({ title: 'Welcome!', message: `${orgName} has been registered successfully.` });
      navigation.replace('MainTabs', { userRole: 'Organization' });
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
            <Ionicons name="business-outline" size={32} color="#2563eb" />
          </View>
          <Text style={styles.title}>Create Organization Account</Text>
          <Text style={styles.subtitle}>Post internships and connect with talented students.</Text>
        </View>

        <View style={styles.card}>
          {/* Google */}
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

          {/* Organization Details */}
          <Text style={styles.sectionLabel}>Organization Details</Text>

          <InputField
            id="orgName"
            label="Organization Name"
            required
            placeholder="e.g. Acme Corp Nigeria"
            value={orgName}
            onChangeText={setOrgName}
          />
          <InputField
            id="email"
            label="Email Address"
            required
            placeholder="contact@organization.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Location */}
          <Text style={styles.sectionLabel}>Location</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>State <Text style={styles.required}>*</Text></Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={state}
                onValueChange={setState}
                enabled={!loading && !googleLoading}
                style={styles.picker}
              >
                {nigerianStates.map(s => (
                  <Picker.Item key={s} label={s} value={s} />
                ))}
              </Picker>
            </View>
          </View>

          <InputField
            id="localGov"
            label="Local Government Area"
            required
            placeholder="e.g. Ikeja"
            value={localGov}
            onChangeText={setLocalGov}
          />

          {/* Contact */}
          <Text style={styles.sectionLabel}>Contact</Text>

          <InputField
            id="primaryPhone"
            label="Primary Phone"
            required
            placeholder="+234 800 000 0000"
            value={primaryPhone}
            onChangeText={setPrimaryPhone}
            keyboardType="phone-pad"
          />
          <InputField
            id="secondaryPhone"
            label="Secondary Phone"
            placeholder="Optional"
            value={secondaryPhone}
            onChangeText={setSecondaryPhone}
            keyboardType="phone-pad"
          />

          {/* Security */}
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

          {/* Submit */}
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
            onPress={() => navigation.navigate('OrganizationLogin', { role: 'Organization' })}
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
    width: 64, height: 64, borderRadius: 18, backgroundColor: '#e8f0fe',
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
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, marginTop: 6,
  },
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#4a5568', marginBottom: 6, letterSpacing: 0.2 },
  required: { color: '#e53e3e' },
  input: {
    backgroundColor: '#f7fafc', borderWidth: 1.5, borderColor: '#e2e8f0',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: '#1a202c',
  },
  inputFocused: { borderColor: '#4285F4', backgroundColor: '#fff' },
  pickerWrapper: {
    backgroundColor: '#f7fafc', borderWidth: 1.5, borderColor: '#e2e8f0',
    borderRadius: 12, overflow: 'hidden',
  },
  picker: { height: 50, color: '#1a202c' },
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
    backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 15,
    alignItems: 'center', marginTop: 8, shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  buttonDisabled: { opacity: 0.55 },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  linkContainer: { marginTop: 18, alignItems: 'center' },
  linkText: { fontSize: 14, color: '#718096' },
  linkAccent: { color: '#2563eb', fontWeight: '600' },
  bottomSpacer: { height: 40 },
});