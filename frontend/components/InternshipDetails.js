import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { applicationAPI, internshipAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCustomAlert } from './CustomAlert';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function getDeadlineStatus(iso) {
  if (!iso) return null;
  const now = new Date();
  const deadline = new Date(iso);
  const diffMs = deadline - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: 'Expired', color: '#dc2626', bg: '#fef2f2', urgent: false, expired: true };
  if (diffDays === 0) return { label: 'Closes today', color: '#d97706', bg: '#fffbeb', urgent: true, expired: false };
  if (diffDays <= 3) return { label: `${diffDays}d left`, color: '#d97706', bg: '#fffbeb', urgent: true, expired: false };
  if (diffDays <= 7) return { label: `${diffDays} days left`, color: '#2563eb', bg: '#eff6ff', urgent: false, expired: false };
  return { label: `${diffDays} days left`, color: '#3B82F6', bg: '#f0fdf4', urgent: false, expired: false };
}

function InfoRow({ icon, label, value, valueStyle }) {
  return (
    <View style={infoStyles.row}>
      <Ionicons name={icon} size={18} color="#a0aec0" style={{ marginRight: 12, marginTop: 1 }} />
      <View style={infoStyles.content}>
        <Text style={infoStyles.label}>{label}</Text>
        <Text style={[infoStyles.value, valueStyle]}>{value}</Text>
      </View>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  content: { flex: 1 },
  label: { fontSize: 11, fontWeight: '600', color: '#a0aec0', letterSpacing: 0.8, marginBottom: 2 },
  value: { fontSize: 15, fontWeight: '600', color: '#1a202c' },
});

export default function InternshipDetailScreen({ route, navigation }) {
  const { internshipId } = route.params;
  const { userProfile } = useAuth();
  const userRole = userProfile?.role;

  const [internship, setInternship] = useState(null);
  const { showAlert, AlertComponent } = useCustomAlert();
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyLoading, setApplyLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchInternship();
      if (userRole === 'Student') checkApplicationStatus();
      else if (userRole === 'Organization') fetchApplications();
    }, [])
  );

  const fetchInternship = async () => {
    try {
      const response = await internshipAPI.getById(internshipId);
      setInternship(response.internship);
    } catch (error) {
      showAlert({ title: 'Error', message: 'Failed to load internship details' });
      navigation.goBack();
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const response = await applicationAPI.getAll(internshipId);
      const mine = response.applications.find(a => a.studentId === userProfile._id);
      if (mine) { setHasApplied(true); setApplicationStatus(mine.status); }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await applicationAPI.getAll(internshipId);
      setApplications(response.applications);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    showAlert({ title: 'Send Connection Request?', message: 'Applying will send a connection request to this organization. If accepted, you can message each other.', buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request',
          onPress: async () => {
            try {
              setApplyLoading(true);
              await applicationAPI.create(internshipId);
              setHasApplied(true);
              setApplicationStatus('pending');
              showAlert({ title: 'Request Sent!', message: "You'll be notified when the organization responds." });
            } catch (error) {
              showAlert({ title: 'Error', message: error.response?.data?.error?.message || 'Failed to submit application.' });
            } finally {
              setApplyLoading(false);
            }
          }
        }
      ] });
  };

  const handleAccept = async (appId) => {
    showAlert({ title: 'Accept Connection?', message: 'This allows you and the student to message each other.', buttons: [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Accept', onPress: async () => {
        try {
          await applicationAPI.updateStatus(appId, 'accepted');
          showAlert({ title: 'Connected!', message: 'You can now message this student.' });
          fetchApplications();
        } catch { showAlert({ title: 'Error', message: 'Failed to accept.' }); }
      }}
    ] });
  };

  const handleReject = async (appId) => {
    showAlert({ title: 'Reject Application', message: 'Are you sure?', buttons: [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: async () => {
        try {
          await applicationAPI.updateStatus(appId, 'rejected');
          fetchApplications();
        } catch { showAlert({ title: 'Error', message: 'Failed to reject.' }); }
      }}
    ] });
  };

  const getStatusColor = (s) => ({ accepted: '#3B82F6', rejected: '#dc2626' }[s] || '#d97706');
  const getStatusLabel = (s) => ({ accepted: 'Connected', rejected: 'Rejected' }[s] || 'Pending...');

  if (loading || !internship) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const deadlineStatus = getDeadlineStatus(internship.applicationDeadline);
  const isExpired = deadlineStatus?.expired;

  return (
    <>
      {AlertComponent}
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {}
      <View style={styles.heroCard}>
        {}
        {isExpired && (
          <View style={styles.expiredBanner}>
            <Text style={styles.expiredBannerText}>⛔  Applications Closed</Text>
          </View>
        )}

        <View style={styles.heroTop}>
          <Text style={styles.heroTitle}>{internship.title}</Text>
          <View style={styles.heroPillRow}>
            {deadlineStatus && (
              <View style={[styles.deadlinePill, { backgroundColor: deadlineStatus.bg }]}>
                <Text style={[styles.deadlinePillText, { color: deadlineStatus.color }]}>
                  {deadlineStatus.urgent && '⚠ '}{deadlineStatus.label}
                </Text>
              </View>
            )}
            {userRole === 'Organization' && (
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => navigation.navigate('EditInternship', { internship })}
                activeOpacity={0.8}
              >
                <Ionicons name="pencil" size={13} color="#2563eb" />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.heroOrg}>{internship.organizationName}</Text>
        <Text style={styles.heroLocation}>📍 {internship.localGovernment}, {internship.state}</Text>

        {}
        <View style={styles.tagRow}>
          {internship.types?.map((type, i) => (
            <View key={i} style={styles.typeTag}>
              <Text style={styles.typeTagText}>{type}</Text>
            </View>
          ))}
        </View>
      </View>

      {}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        {internship.startDate && (
          <InfoRow icon="rocket-outline" label="START DATE" value={formatDate(internship.startDate)} />
        )}
        {internship.applicationDeadline && (
          <InfoRow
            icon="calendar-outline"
            label="APPLICATION DEADLINE"
            value={formatDate(internship.applicationDeadline)}
            valueStyle={isExpired ? { color: '#dc2626' } : deadlineStatus?.urgent ? { color: '#d97706' } : {}}
          />
        )}
        {internship.duration && (
          <InfoRow icon="time-outline" label="DURATION" value={internship.duration} />
        )}
      </View>

      {}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.bodyText}>{internship.description}</Text>
      </View>

      {internship.requirements ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          <Text style={styles.bodyText}>{internship.requirements}</Text>
        </View>
      ) : null}

      {}
      {userRole === 'Student' && (
        <View style={styles.section}>
          {isExpired ? (
            <View style={styles.expiredBox}>
              <Ionicons name="lock-closed-outline" size={20} color="#DC2626" />
              <Text style={styles.expiredBoxTitle}>Applications Closed</Text>
              <Text style={styles.expiredBoxSub}>
                The deadline for this internship was {formatDate(internship.applicationDeadline)}.
              </Text>
            </View>
          ) : hasApplied ? (
            <View style={styles.statusBox}>
              <Ionicons
                name={applicationStatus === 'accepted' ? 'checkmark-circle' : applicationStatus === 'rejected' ? 'close-circle' : 'time'}
                size={48}
                color={getStatusColor(applicationStatus)}
              />
              <Text style={styles.statusLabel}>Connection Status</Text>
              <Text style={[styles.statusValue, { color: getStatusColor(applicationStatus) }]}>
                {getStatusLabel(applicationStatus)}
              </Text>
              {applicationStatus === 'accepted' && (
                <TouchableOpacity
                  style={styles.messageBtn}
                  onPress={() => navigation.navigate('Chat', {
                    recipientId: internship.organizationId,
                    recipientName: internship.organizationName,
                  })}
                >
                  <Ionicons name="chatbubbles" size={18} color="#fff" />
                  <Text style={styles.messageBtnText}>Message Organization</Text>
                </TouchableOpacity>
              )}
              {applicationStatus === 'pending' && (
                <Text style={styles.pendingHint}>Waiting for the organization to respond.</Text>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.applyBtn, applyLoading && styles.btnDisabled]}
              onPress={handleApply}
              disabled={applyLoading}
              activeOpacity={0.85}
            >
              {applyLoading
                ? <ActivityIndicator color="#fff" />
                : <>
                    <Ionicons name="paper-plane" size={18} color="#fff" />
                    <Text style={styles.applyBtnText}>Send Connection Request</Text>
                  </>
              }
            </TouchableOpacity>
          )}
        </View>
      )}

      {}
      {userRole === 'Organization' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Connection Requests ({applications.length})
          </Text>
          {applications.length === 0 ? (
            <View style={styles.emptyApps}>
              <Ionicons name="people-outline" size={36} color="#a0aec0" style={{ marginBottom: 8 }} />
              <Text style={styles.emptyAppsText}>No requests yet</Text>
            </View>
          ) : (
            applications.map((app) => (
              <View key={app._id} style={styles.appCard}>
                <View style={styles.appCardTop}>
                  <Ionicons name="person-circle" size={40} color="#2563eb" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.appName}>{app.studentName}</Text>
                    <Text style={styles.appEmail}>{app.studentEmail}</Text>
                  </View>
                  <Text style={[styles.appStatus, { color: getStatusColor(app.status) }]}>
                    {getStatusLabel(app.status)}
                  </Text>
                </View>
                <Text style={styles.appDate}>
                  Requested: {new Date(app.appliedAt).toLocaleDateString()}
                </Text>
                {app.status === 'pending' && (
                  <View style={styles.appBtnRow}>
                    <TouchableOpacity style={[styles.appBtn, styles.acceptBtn]} onPress={() => handleAccept(app._id)}>
                      <Ionicons name="checkmark-circle" size={16} color="#fff" />
                      <Text style={styles.appBtnText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.appBtn, styles.rejectBtn]} onPress={() => handleReject(app._id)}>
                      <Ionicons name="close-circle" size={16} color="#fff" />
                      <Text style={styles.appBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {app.status === 'accepted' && (
                  <TouchableOpacity
                    style={styles.messageBtn}
                    onPress={() => navigation.navigate('Chat', { recipientId: app.studentId, recipientName: app.studentName })}
                  >
                    <Ionicons name="chatbubbles" size={16} color="#fff" />
                    <Text style={styles.messageBtnText}>Send Message</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  content: { padding: 16 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f7fa' },

  heroCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    overflow: 'hidden',
  },
  expiredBanner: {
    backgroundColor: '#fef2f2', marginHorizontal: -20, marginTop: -20,
    marginBottom: 14, paddingVertical: 8, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#fecaca',
  },
  expiredBannerText: { color: '#dc2626', fontWeight: '700', fontSize: 13 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 },
  heroTitle: { fontSize: 20, fontWeight: '700', color: '#1a202c', flex: 1, paddingRight: 10, letterSpacing: -0.3 },
  heroPillRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#eff6ff', borderWidth: 1.5, borderColor: '#bfdbfe',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  editBtnText: { fontSize: 12, fontWeight: '700', color: '#2563eb' },
  deadlinePillText: { fontSize: 11, fontWeight: '700' },
  heroOrg: { fontSize: 14, color: '#4a5568', fontWeight: '500', marginBottom: 4 },
  heroLocation: { fontSize: 13, color: '#718096', marginBottom: 12 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  typeTag: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  typeTagText: { fontSize: 11, color: '#2563eb', fontWeight: '600' },

  section: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a202c', marginBottom: 14 },
  bodyText: { fontSize: 14, color: '#4a5568', lineHeight: 22 },

  expiredBox: { alignItems: 'center', paddingVertical: 20 },
  expiredBoxIcon: { fontSize: 40, marginBottom: 10 },
  expiredBoxTitle: { fontSize: 17, fontWeight: '700', color: '#dc2626', marginBottom: 6 },
  expiredBoxSub: { fontSize: 13, color: '#718096', textAlign: 'center', lineHeight: 20 },

  statusBox: { alignItems: 'center', paddingVertical: 16 },
  statusLabel: { fontSize: 12, color: '#a0aec0', fontWeight: '600', marginTop: 12, letterSpacing: 0.5 },
  statusValue: { fontSize: 18, fontWeight: '700', marginTop: 4, marginBottom: 14 },
  pendingHint: { fontSize: 13, color: '#a0aec0', textAlign: 'center', lineHeight: 19 },

  applyBtn: {
    backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  btnDisabled: { opacity: 0.55 },
  applyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  messageBtn: {
    backgroundColor: '#2563eb', borderRadius: 10, paddingVertical: 11, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4,
  },
  messageBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  emptyApps: { alignItems: 'center', paddingVertical: 28 },
  emptyAppsIcon: { fontSize: 36, marginBottom: 8 },
  emptyAppsText: { fontSize: 14, color: '#a0aec0' },
  appCard: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, marginBottom: 10,
  },
  appCardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  appName: { fontSize: 15, fontWeight: '700', color: '#1a202c' },
  appEmail: { fontSize: 12, color: '#718096' },
  appStatus: { fontSize: 12, fontWeight: '700' },
  appDate: { fontSize: 12, color: '#a0aec0', marginBottom: 10 },
  appBtnRow: { flexDirection: 'row', gap: 10 },
  appBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 10, borderRadius: 8,
  },
  acceptBtn: { backgroundColor: '#3B82F6' },
  rejectBtn: { backgroundColor: '#dc2626' },
  appBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});