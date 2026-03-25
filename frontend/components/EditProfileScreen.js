// components/EditProfileScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Image, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import { useCustomAlert } from './CustomAlert';

export default function EditProfileScreen({ navigation }) {
  const { userProfile, setUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const { showAlert, AlertComponent } = useCustomAlert();
  const [profileImage, setProfileImage] = useState(userProfile?.profileImage || null);

  const [firstName, setFirstName] = useState(userProfile?.firstName || '');
  const [lastName, setLastName] = useState(userProfile?.lastName || '');
  const [organizationName, setOrganizationName] = useState(userProfile?.organizationName || '');
  const [primaryPhone, setPrimaryPhone] = useState(userProfile?.primaryPhone || '');
  const [secondaryPhone, setSecondaryPhone] = useState(userProfile?.secondaryPhone || '');
  const [state, setState] = useState(userProfile?.state || '');
  const [localGovernment, setLocalGovernment] = useState(userProfile?.localGovernment || '');

  const isStudent = userProfile?.role === 'Student';
  const displayName = userProfile?.fullName || userProfile?.organizationName || 'User';
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { showAlert({ title: 'Permission Denied', message: 'We need camera roll permissions.' }); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.6,
    });
    if (!result.canceled) setProfileImage(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { showAlert({ title: 'Permission Denied', message: 'We need camera permissions.' }); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.6 });
    if (!result.canceled) setProfileImage(result.assets[0].uri);
  };

  const showImageOptions = () => {
    showAlert({ title: 'Change Profile Photo', message: '', buttons: [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Library', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ] });
  };

  const handleSave = async () => {
    if (isStudent && (!firstName || !lastName)) {
      showAlert({ title: 'Missing Fields', message: 'First name and last name are required.' }); return;
    }
    if (!isStudent && (!organizationName || !primaryPhone)) {
      showAlert({ title: 'Missing Fields', message: 'Organization name and primary phone are required.' }); return;
    }
    setLoading(true);
    try {
      const updates = isStudent
        ? { firstName, lastName, fullName: `${firstName} ${lastName}`, profileImage }
        : { organizationName, primaryPhone, secondaryPhone, state, localGovernment, profileImage };
      const response = await userAPI.updateProfile(updates);
      setUserProfile(response.user);
      showAlert({ title: 'Saved', message: 'Profile updated successfully!', buttons: [{ text: 'Done', onPress: () => navigation.goBack() }] });
    } catch (error) {
      showAlert({ title: 'Error', message: error.response?.data?.error?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, value, onChangeText, placeholder, keyboardType, editable = true, disabled }) => (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, disabled && styles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        keyboardType={keyboardType}
        editable={editable && !loading && !disabled}
        autoCapitalize="none"
      />
    </View>
  );

  return (
    <View style={styles.screen}>
      {AlertComponent}
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1D4ED8', '#2563EB', '#3B82F6']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Avatar in header */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={showImageOptions} activeOpacity={0.85}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap to change photo</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{isStudent ? 'Personal Info' : 'Organization Info'}</Text>

          {isStudent ? (
            <>
              <InputField label="First Name *" value={firstName} onChangeText={setFirstName} placeholder="First Name" />
              <InputField label="Last Name *" value={lastName} onChangeText={setLastName} placeholder="Last Name" />
            </>
          ) : (
            <>
              <InputField label="Organization Name *" value={organizationName} onChangeText={setOrganizationName} placeholder="Organization Name" />
              <InputField label="Primary Phone *" value={primaryPhone} onChangeText={setPrimaryPhone} placeholder="+234..." keyboardType="phone-pad" />
              <InputField label="Secondary Phone" value={secondaryPhone} onChangeText={setSecondaryPhone} placeholder="Optional" keyboardType="phone-pad" />
              <InputField label="State" value={state} onChangeText={setState} placeholder="e.g., Lagos" />
              <InputField label="Local Government" value={localGovernment} onChangeText={setLocalGovernment} placeholder="e.g., Ikeja" />
            </>
          )}

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Email</Text>
            <View style={styles.inputDisabledBox}>
              <Ionicons name="lock-closed-outline" size={15} color="#94A3B8" style={{ marginRight: 8 }} />
              <Text style={styles.inputDisabledText}>{userProfile?.email}</Text>
            </View>
            <Text style={styles.helperText}>Email cannot be changed</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={loading ? ['#94A3B8', '#94A3B8'] : ['#1D4ED8', '#3B82F6']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.saveBtnGradient}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { paddingTop: 55, paddingBottom: 28, paddingHorizontal: 20 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  avatarSection: { alignItems: 'center' },
  avatarWrapper: { position: 'relative' },
  avatarImg: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.8)',
  },
  avatarFallback: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarInitials: { fontSize: 30, fontWeight: '700', color: '#fff' },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: -2,
    backgroundColor: '#1D4ED8', width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2.5, borderColor: '#fff',
  },
  avatarHint: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 10 },
  scroll: { flex: 1 },
  scrollContent: { padding: 18, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 16,
    shadowColor: '#1E3A5F', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  cardTitle: {
    fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 16,
    paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  fieldBlock: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: {
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 12, padding: 13, fontSize: 15, color: '#1E293B',
  },
  inputDisabled: { backgroundColor: '#F1F5F9', color: '#94A3B8' },
  inputDisabledBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 12, padding: 13,
  },
  inputDisabledText: { fontSize: 15, color: '#94A3B8' },
  helperText: { fontSize: 12, color: '#94A3B8', marginTop: 5 },
  saveBtn: {
    borderRadius: 16, overflow: 'hidden',
    shadowColor: '#1D4ED8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  saveBtnDisabled: { shadowOpacity: 0 },
  saveBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 17,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});