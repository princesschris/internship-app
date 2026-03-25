// components/RoleSelectionScreen.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function RoleSelectionScreen({ navigation }) {
  const handleRoleSelect = (role) => {
    if (role === 'Student') {
      navigation.navigate('SignUp', { role });
    } else if (role === 'Organization') {
      navigation.navigate('OrganizationSignUp', { role });
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={['#1E3A8A', '#1D4ED8', '#2563EB', '#3B82F6']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      <View style={styles.blob3} />

      {/* Top section */}
      <View style={styles.topSection}>
        <View style={styles.logoBox}>
          <Image
            source={require('../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.appName}>InternshipApp</Text>
        <Text style={styles.tagline}>Nigeria's internship platform</Text>

        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <Ionicons name="location" size={11} color="rgba(255,255,255,0.9)" />
            <Text style={styles.pillText}>All 36 States + FCT</Text>
          </View>
          <View style={styles.pill}>
            <Ionicons name="briefcase" size={11} color="rgba(255,255,255,0.9)" />
            <Text style={styles.pillText}>Multiple Industries</Text>
          </View>
        </View>
      </View>

      {/* Bottom card */}
      <View style={styles.bottomCard}>
        <Text style={styles.cardTitle}>Get Started</Text>
        <Text style={styles.cardSubtitle}>Choose how you want to use the app</Text>

        {/* Student card */}
        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => handleRoleSelect('Student')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#2563EB', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.roleGradient}
          >
            <View style={styles.roleIconBox}>
              <Ionicons name="school" size={26} color="#2563EB" />
            </View>
            <View style={styles.roleTextBlock}>
              <Text style={styles.roleTitle}>I'm a Student</Text>
              <Text style={styles.roleDesc}>Find & apply for internships</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={26} color="rgba(255,255,255,0.85)" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Organization card */}
        <TouchableOpacity
          style={styles.roleCardOutline}
          onPress={() => handleRoleSelect('Organization')}
          activeOpacity={0.85}
        >
          <View style={[styles.roleIconBox, { backgroundColor: '#EEF4FF' }]}>
            <Ionicons name="business" size={26} color="#1D4ED8" />
          </View>
          <View style={styles.roleTextBlock}>
            <Text style={[styles.roleTitle, { color: '#1E293B' }]}>I'm an Organization</Text>
            <Text style={[styles.roleDesc, { color: '#64748B' }]}>Post internship opportunities</Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={26} color="#2563EB" />
        </TouchableOpacity>

        <Text style={styles.loginHint}>
          Already have an account?{' '}
          <Text
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            Sign In
          </Text>
        </Text>

        <View style={styles.footerNoteRow}>
          <Ionicons name="flag-outline" size={13} color="#94A3B8" />
          <Text style={styles.footerNote}> Built for Nigerian students & organizations</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  blob1: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.06)', top: -80, right: -80,
  },
  blob2: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.05)', top: height * 0.22, left: -60,
  },
  blob3: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.04)', top: height * 0.38, right: 20,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  logoBox: {
    width: 90, height: 90, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  logo: { width: 60, height: 60 },
  appName: {
    fontSize: 32, fontWeight: '800', color: '#fff',
    letterSpacing: -0.5, marginBottom: 6,
  },
  tagline: {
    fontSize: 15, color: 'rgba(255,255,255,0.75)',
    fontWeight: '400', marginBottom: 20,
  },
  pillRow: { flexDirection: 'row', gap: 10 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  pillText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  bottomCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1, shadowRadius: 20,
  },
  cardTitle: {
    fontSize: 24, fontWeight: '800', color: '#0F172A',
    marginBottom: 6, letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 14, color: '#94A3B8', marginBottom: 24,
  },
  roleCard: {
    borderRadius: 18, overflow: 'hidden', marginBottom: 12,
    shadowColor: '#1D4ED8', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 5,
  },
  roleGradient: {
    flexDirection: 'row', alignItems: 'center',
    padding: 18, gap: 14,
  },
  roleCardOutline: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 18, padding: 18, marginBottom: 22,
    borderWidth: 1.5, borderColor: '#E2E8F0',
    backgroundColor: '#FAFBFF',
  },
  roleIconBox: {
    width: 50, height: 50, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
  },
  roleTextBlock: { flex: 1 },
  roleTitle: {
    fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 3,
  },
  roleDesc: {
    fontSize: 13, color: 'rgba(255,255,255,0.8)',
  },
  loginHint: {
    textAlign: 'center', fontSize: 14, color: '#64748B',
    marginBottom: 16,
  },
  loginLink: {
    color: '#2563EB', fontWeight: '700',
  },
  footerNote: {
    textAlign: 'center', fontSize: 12, color: '#CBD5E1',
  },
});