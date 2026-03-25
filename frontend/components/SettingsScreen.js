import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import { useCustomAlert } from './CustomAlert';

export default function SettingsScreen({ navigation }) {
  const { userProfile, logOut, setUserProfile } = useAuth();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [profileImage, setProfileImage] = useState(userProfile?.profileImage || null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const pickProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert({ title: 'Permission Needed', message: 'Please allow access to your photo library to change your profile picture.' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled) await uploadProfileImage(result.assets[0].uri);
  };

  const takeProfilePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showAlert({ title: 'Permission Needed', message: 'Please allow camera access to take a profile photo.' });
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled) await uploadProfileImage(result.assets[0].uri);
  };

  const uploadProfileImage = async (uri) => {
    setUploadingImage(true);
    try {
      setProfileImage(uri);
      const response = await userAPI.updateProfile({ profileImage: uri });
      if (response?.user) setUserProfile(response.user);
      showAlert({ title: 'Updated', message: 'Profile picture changed successfully.' });
    } catch {
      showAlert({ title: 'Error', message: 'Could not update profile picture. Please try again.' });
      setProfileImage(userProfile?.profileImage || null);
    } finally {
      setUploadingImage(false);
    }
  };

  const showImageOptions = () => {
    showAlert({
      title: 'Change Profile Photo',
      message: 'Choose how you want to update your photo.',
      buttons: [
        { text: 'Take Photo', onPress: takeProfilePhoto },
        { text: 'Choose from Library', onPress: pickProfileImage },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  };

  const handleLogout = () => {
    showAlert({
      title: 'Log Out',
      message: 'Are you sure you want to log out?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logOut();
              navigation.replace('RoleSelection');
            } catch {
              showAlert({ title: 'Error', message: 'Failed to log out. Please try again.' });
            }
          },
        },
      ],
    });
  };

  const SettingRow = ({ icon, label, onPress, accent, badge, iconBg }) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconPill, { backgroundColor: iconBg || '#EEF4FF' }]}>
        <Ionicons name={icon} size={19} color={accent || '#2563EB'} />
      </View>
      <Text style={[styles.settingLabel, accent === '#EF4444' && { color: '#EF4444' }]}>
        {label}
      </Text>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={17} color="#CBD5E1" />
      )}
    </TouchableOpacity>
  );

  const SectionCard = ({ title, children }) => (
    <View style={styles.sectionBlock}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );

  const displayName = userProfile?.fullName || userProfile?.organizationName || 'User';
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      {AlertComponent}

      {}
      <LinearGradient
        colors={['#1D4ED8', '#2563EB', '#3B82F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />

        <Text style={styles.headerTitle}>Settings</Text>

        {}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={showImageOptions}
          activeOpacity={0.85}
        >
          <View style={styles.avatarWrapper}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={styles.cameraButton}>
              <Ionicons
                name={uploadingImage ? 'sync' : 'camera'}
                size={12}
                color="#fff"
              />
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{userProfile?.email}</Text>
            <View style={styles.rolePill}>
              <View style={styles.roleDot} />
              <Text style={styles.roleText}>{userProfile?.role || 'User'}</Text>
            </View>
          </View>
        </TouchableOpacity>

      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {}
        <SectionCard title="ACCOUNT">
          <SettingRow
            icon="person-outline"
            label="Edit Profile"
            onPress={() => navigation.navigate('EditProfile')}
            iconBg="#EEF4FF"
            accent="#2563EB"
          />
          <View style={styles.divider} />
          <SettingRow
            icon="lock-closed-outline"
            label="Change Password"
            onPress={() => navigation.navigate('ChangePassword')}
            iconBg="#EFF6FF"
            accent="#3B82F6"
          />
        </SectionCard>

        {}
        <SectionCard title="PREFERENCES">
          <SettingRow
            icon="notifications-outline"
            label="Notifications"
            onPress={() => showAlert({ title: 'Coming Soon', message: 'Notification settings will be available in a future update.' })}
            iconBg="#FFF7ED"
            accent="#EA580C"
            badge="Soon"
          />
          <View style={styles.divider} />
          <SettingRow
            icon="shield-checkmark-outline"
            label="Privacy & Security"
            onPress={() => showAlert({ title: 'Coming Soon', message: 'Privacy settings will be available in a future update.' })}
            iconBg="#F5F3FF"
            accent="#7C3AED"
            badge="Soon"
          />
        </SectionCard>

        {}
        <SectionCard title="SUPPORT">
          <SettingRow
            icon="help-buoy-outline"
            label="Help & Support"
            onPress={() => showAlert({ title: 'Help & Support', message: 'For assistance, email us at:\nsupport@internshipapp.ng' })}
            iconBg="#EFF6FF"
            accent="#0EA5E9"
          />
          <View style={styles.divider} />
          <SettingRow
            icon="information-circle-outline"
            label="About"
            onPress={() => showAlert({ title: 'About', message: 'InternshipApp v1.0.0\n\nConnecting Nigerian students with great opportunities.\n\n© 2024 InternshipApp' })}
            iconBg="#F8FAFC"
            accent="#64748B"
          />
        </SectionCard>

        {}
        <SectionCard>
          <SettingRow
            icon="log-out-outline"
            label="Log Out"
            onPress={handleLogout}
            iconBg="#FEF2F2"
            accent="#EF4444"
          />
        </SectionCard>

        <Text style={styles.versionText}>InternshipApp • Version 1.0.0</Text>
        <View style={styles.madeRow}>
          <Ionicons name="flag-outline" size={13} color="#CBD5E1" />
          <Text style={styles.madeText}>Made for Nigeria</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -40,
    right: -40,
  },
  decorCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: 10,
    left: -20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatarImg: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  avatarFallback: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    backgroundColor: '#1D4ED8',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 6,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#60A5FA',
    marginRight: 5,
  },
  roleText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 40,
  },
  sectionBlock: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1.2,
    marginBottom: 8,
    paddingLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  iconPill: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingLabel: {
    flex: 1,
    fontSize: 15.5,
    fontWeight: '500',
    color: '#1E293B',
  },
  badge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 68,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '500',
    marginTop: 8,
  },
  madeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    gap: 4,
  },
  madeText: {
    fontSize: 12,
    color: '#CBD5E1',
  },
});