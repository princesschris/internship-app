import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { applicationAPI } from '../services/api';
import { useCustomAlert } from './CustomAlert';

const TABS = [
  { key: 'all',        label: 'All',        color: '#2563EB', bg: '#EFF6FF' },
  { key: 'pending',    label: 'Pending',     color: '#D97706', bg: '#FFFBEB' },
  { key: 'accepted',   label: 'Approved',    color: '#3B82F6', bg: '#EFF6FF' },
  { key: 'waitlisted', label: 'Waitlisted',  color: '#7C3AED', bg: '#F5F3FF' },
  { key: 'rejected',   label: 'Rejected',    color: '#DC2626', bg: '#FEF2F2' },
];

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: '#D97706', bg: '#FFFBEB', icon: 'time-outline' },
  accepted:   { label: 'Approved',   color: '#3B82F6', bg: '#EFF6FF', icon: 'checkmark-circle-outline' },
  waitlisted: { label: 'Waitlisted', color: '#7C3AED', bg: '#F5F3FF', icon: 'pause-circle-outline' },
  rejected:   { label: 'Rejected',   color: '#DC2626', bg: '#FEF2F2', icon: 'close-circle-outline' },
};

const ACTIONS = {
  pending: [
    { label: 'Approve',   status: 'accepted',   color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Waitlist',  status: 'waitlisted', color: '#7C3AED', bg: '#F5F3FF' },
    { label: 'Reject',    status: 'rejected',   color: '#DC2626', bg: '#FEF2F2' },
  ],
  waitlisted: [
    { label: 'Approve',   status: 'accepted',   color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Reject',    status: 'rejected',   color: '#DC2626', bg: '#FEF2F2' },
  ],
  rejected: [
    { label: 'Approve',   status: 'accepted',   color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Waitlist',  status: 'waitlisted', color: '#7C3AED', bg: '#F5F3FF' },
  ],
  accepted: [
    { label: 'Waitlist',  status: 'waitlisted', color: '#7C3AED', bg: '#F5F3FF' },
    { label: 'Reject',    status: 'rejected',   color: '#DC2626', bg: '#FEF2F2' },
  ],
};

export default function RequestsScreen() {
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const { showAlert, AlertComponent } = useCustomAlert();

  const fetchApplications = async () => {
    try {
      const response = await applicationAPI.getAll();
      setApplications(response.applications || []);
    } catch (error) {
      showAlert({ title: 'Error', message: 'Failed to load requests. Please try again.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchApplications();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  const handleStatusChange = (application, newStatus, newLabel) => {
    const currentCfg = STATUS_CONFIG[application.status];
    showAlert({
      title: `${newLabel} Applicant?`,
      message: `Move ${application.studentName} from ${currentCfg.label} to ${STATUS_CONFIG[newStatus].label}?`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: newLabel,
          style: newStatus === 'rejected' ? 'destructive' : undefined,
          onPress: () => applyStatusChange(application._id, newStatus),
        },
      ],
    });
  };

  const applyStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const response = await applicationAPI.updateStatus(id, newStatus);
      setApplications(prev =>
        prev.map(a => a._id === id ? { ...a, status: newStatus } : a)
      );
      const cfg = STATUS_CONFIG[newStatus];
      showAlert({ title: 'Updated', message: `Applicant has been ${cfg.label.toLowerCase()}.` });
    } catch (error) {
      const msg = error.response?.data?.error?.message || 'Failed to update status.';
      showAlert({ title: 'Error', message: msg });
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = activeTab === 'all'
    ? applications
    : applications.filter(a => a.status === activeTab);

  const countFor = (key) => key === 'all'
    ? applications.length
    : applications.filter(a => a.status === key).length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderCard = (item) => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const actions = ACTIONS[item.status] || [];
    const isUpdating = updatingId === item._id;

    return (
      <View key={item._id} style={styles.card}>
        {}
        <View style={styles.cardHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {(item.studentName || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={styles.cardMeta}>
            <Text style={styles.studentName} numberOfLines={1}>{item.studentName || 'Unknown'}</Text>
            <Text style={styles.studentEmail} numberOfLines={1}>{item.studentEmail || ''}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.icon} size={12} color={cfg.color} />
            <Text style={[styles.statusPillText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        {}
        <View style={styles.internshipRow}>
          <Ionicons name="briefcase-outline" size={13} color="#94A3B8" />
          <Text style={styles.internshipTitle} numberOfLines={1}>{item.internshipTitle || 'Internship'}</Text>
        </View>

        {}
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={13} color="#94A3B8" />
          <Text style={styles.dateText}>Applied {formatDate(item.appliedAt || item.createdAt)}</Text>
        </View>

        {}
        {actions.length > 0 && (
          <View style={styles.actionsRow}>
            {isUpdating ? (
              <ActivityIndicator size="small" color="#2563EB" style={{ marginTop: 4 }} />
            ) : (
              actions.map((action) => (
                <TouchableOpacity
                  key={action.status}
                  style={[styles.actionBtn, { backgroundColor: action.bg, borderColor: action.color + '33' }]}
                  onPress={() => handleStatusChange(item, action.status, action.label)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.actionBtnText, { color: action.color }]}>{action.label}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      {AlertComponent}

      {}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Requests</Text>
        <View style={styles.headerCount}>
          <Text style={styles.headerCountText}>{applications.length}</Text>
        </View>
      </View>

      {}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = countFor(tab.key);
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  isActive && { backgroundColor: tab.color, borderColor: tab.color },
                ]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
                {count > 0 && (
                  <View style={[styles.tabBadge, isActive ? styles.tabBadgeActive : { backgroundColor: tab.bg }]}>
                    <Text style={[styles.tabBadgeText, { color: isActive ? tab.color : tab.color }]}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={[styles.listContent, filtered.length === 0 && styles.listEmpty]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
          showsVerticalScrollIndicator={false}
        >
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="document-text-outline" size={40} color="#CBD5E1" />
              </View>
              <Text style={styles.emptyTitle}>No requests here</Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'all'
                  ? 'Applications will appear here once students apply.'
                  : `No ${TABS.find(t => t.key === activeTab)?.label.toLowerCase()} requests yet.`}
              </Text>
            </View>
          ) : (
            filtered.map(renderCard)
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerCount: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  headerCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  tabsWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
    flexDirection: 'row',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#fff',
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  listEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  cardMeta: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 12,
    color: '#94A3B8',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    flexShrink: 0,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  internshipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  internshipTitle: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 21,
  },
});