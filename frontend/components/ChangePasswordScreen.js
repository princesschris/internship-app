import React, { useState } from 'react';
import {  View, Text, TextInput, TouchableOpacity, StyleSheet,  ScrollView, ActivityIndicator, StatusBar} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCustomAlert } from './CustomAlert';
import api from '../services/api';

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const { showAlert, AlertComponent } = useCustomAlert();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const checks = {
    length: newPassword.length >= 6,
    match: newPassword === confirmPassword && newPassword.length > 0,
    different: newPassword !== currentPassword && newPassword.length > 0,
  };
  const allGood = checks.length && checks.match && checks.different;

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert({ title: 'Missing Fields', message: 'All fields are required.' }); return;
    }
    if (!allGood) {
      showAlert({ title: 'Invalid Password', message: 'Please meet all password requirements.' }); return;
    }
    setLoading(true);
    try {
      await api.post('/users/change-password', { currentPassword, newPassword });
      showAlert({ title: 'Password Changed', message: 'Your password has been updated successfully.', buttons: [
        { text: 'Done', onPress: () => navigation.goBack() }
      ] });
    } catch (error) {
      let msg = 'Failed to change password';
      if (error.response?.data?.error?.message) msg = error.response.data.error.message;
      else if (error.response?.status === 401) msg = 'Current password is incorrect';
      showAlert({ title: 'Error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const PasswordField = ({ label, value, onChange, show, onToggle, placeholder }) => (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.passwordRow}>
        <TextInput
          style={styles.passwordInput}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          secureTextEntry={!show}
          value={value}
          onChangeText={onChange}
          editable={!loading}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={onToggle} style={styles.eyeBtn}>
          <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const CheckItem = ({ label, passed }) => (
    <View style={styles.checkItem}>
      <View style={[styles.checkDot, { backgroundColor: passed ? '#3B82F6' : '#E2E8F0' }]}>
        <Ionicons name={passed ? 'checkmark' : 'remove'} size={10} color={passed ? '#fff' : '#94A3B8'} />
      </View>
      <Text style={[styles.checkText, { color: passed ? '#3B82F6' : '#94A3B8' }]}>{label}</Text>
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
          <Text style={styles.headerTitle}>Change Password</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.lockIconBox}>
          <Ionicons name="shield-checkmark" size={32} color="rgba(255,255,255,0.9)" />
        </View>
        <Text style={styles.headerSub}>Keep your account secure with a strong password</Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Update Password</Text>

          <PasswordField
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showCurrent}
            onToggle={() => setShowCurrent(v => !v)}
            placeholder="Enter current password"
          />
          <PasswordField
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            show={showNew}
            onToggle={() => setShowNew(v => !v)}
            placeholder="Minimum 6 characters"
          />
          <PasswordField
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirm}
            onToggle={() => setShowConfirm(v => !v)}
            placeholder="Re-enter new password"
          />
        </View>

        {}
        {newPassword.length > 0 && (
          <View style={styles.requirementsCard}>
            <Text style={styles.requirementsTitle}>Requirements</Text>
            <CheckItem label="At least 6 characters" passed={checks.length} />
            <CheckItem label="Passwords match" passed={checks.match} />
            <CheckItem label="Different from current password" passed={checks.different} />
          </View>
        )}

        {}
        <View style={styles.tipBox}>
          <Ionicons name="information-circle-outline" size={18} color="#2563EB" />
          <Text style={styles.tipText}>
            You'll need to log in again after changing your password.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, (!allGood || loading) && styles.saveBtnDisabled]}
          onPress={handleChangePassword}
          disabled={!allGood || loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={allGood && !loading ? ['#1D4ED8', '#3B82F6'] : ['#94A3B8', '#94A3B8']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.saveBtnGradient}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>Update Password</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: '#F1F5F9' 
  },
  header: { 
    paddingTop: 55, 
    paddingBottom: 24, 
    paddingHorizontal: 20 
  },
  headerRow: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 18,
  },
  backBtn: {
    width: 38, 
    height: 38, 
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)', 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#fff' 
  },
  lockIconBox: {
    width: 64, 
    height: 64, 
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 10,
  },
  headerSub: { 
    fontSize: 14, 
    color: 'rgba(255,255,255,0.75)', 
    lineHeight: 20 
  },
  scroll: { 
    flex: 1 
      },
  scrollContent: { 
    padding: 18, 
    paddingBottom: 40 
  },
  card: {
    backgroundColor: '#fff', 
    borderRadius: 18, 
    padding: 18, 
    marginBottom: 14,
    shadowColor: '#1E3A5F', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.06, 
    shadowRadius: 10, 
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15, 
    fontWeight: '700', 
    color: '#0F172A', 
    marginBottom: 16,
    paddingBottom: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9',
  },
  fieldBlock: { 
    marginBottom: 14 
  },
  fieldLabel: { 
    fontSize: 13,
     fontWeight: '600', 
     color: '#475569', 
     marginBottom: 6 
    },
  passwordRow: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#F8FAFC', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 12,
  },
  passwordInput: { 
    flex: 1, 
    padding: 13, 
    fontSize: 15, 
    color: '#1E293B' 
  },
  eyeBtn: { 
    padding: 13 
  },
  requirementsCard: {
    backgroundColor: '#fff', 
    borderRadius: 18, 
    padding: 16, 
    marginBottom: 14,
    shadowColor: '#1E3A5F', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.06, 
    shadowRadius: 10, 
    elevation: 2,
  },
  requirementsTitle: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#475569', 
    marginBottom: 12 
  },
  checkItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  checkDot: {
    width: 18, 
    height: 18, 
    borderRadius: 9,
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 10,
  },
  checkText: { 
    fontSize: 13.5, 
    fontWeight: '500' 
  },
  tipBox: {
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    gap: 10,
    backgroundColor: '#EEF4FF', 
    borderRadius: 14, 
    padding: 14, 
    marginBottom: 20,
    borderWidth: 1, 
    borderColor: '#BFDBFE',
  },
  tipText: { 
    flex: 1, 
    fontSize: 13, 
    color: '#1D4ED8', 
    lineHeight: 18 
  },
  saveBtn: {
    borderRadius: 16, 
    overflow: 'hidden',
    shadowColor: '#1D4ED8', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3,
     shadowRadius: 10, 
    elevation: 5,
  },
  saveBtnDisabled: { 
    shadowOpacity: 0 
  },
  saveBtnGradient: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 10, 
    paddingVertical: 17,
  },
  saveBtnText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '700' 
  },
});