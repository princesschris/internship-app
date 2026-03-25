import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../contexts/AuthContext';
import { internshipAPI } from '../services/api';
import { useCustomAlert } from './CustomAlert';

const nigerianStates = [
  'All', 'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
  'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano',
  'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT'
];

const jobTypes = ['Tech', 'Marketing', 'Engineering', 'Data', 'Design', 'Finance', 'Healthcare', 'Education','Agriculture'];

function getDeadlineChip(iso) {
  if (!iso) return null;
  const now = new Date();
  const deadline = new Date(iso);
  const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: 'Closed', color: '#dc2626', bg: '#fef2f2' };
  if (diffDays === 0) return { label: 'Closes today', color: '#d97706', bg: '#fffbeb' };
  if (diffDays <= 3) return { label: `${diffDays}d left`, color: '#d97706', bg: '#fffbeb' };
  if (diffDays <= 7) return { label: `${diffDays} days left`, color: '#2563eb', bg: '#eff6ff' };
  return { label: `${diffDays} days left`, color: '#3B82F6', bg: '#f0fdf4' };
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export default function InternshipListScreen({ navigation }) {
  const { userProfile, logOut } = useAuth();
  const role = userProfile?.role || 'Student';
  const isOrg = role === 'Organization';

  const [internships, setInternships] = useState([]);
  const { showAlert, AlertComponent } = useCustomAlert();
  const [selectedState, setSelectedState] = useState('All');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchInternships(); }, [selectedState, selectedTypes]);

  const fetchInternships = async () => {
    try {
      setLoading(true);

      const filters = {
        status: 'active',
        ...(!isOrg && selectedState !== 'All' && { state: selectedState }),
        ...(!isOrg && selectedTypes.length > 0 && { types: selectedTypes }),
      };
      const response = await internshipAPI.getAll(filters);
      setInternships(response.internships);
    } catch (error) {
      showAlert({ title: 'Error', message: 'Failed to load internships. Please try again.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchInternships(); };

  const toggleType = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleLogout = async () => {
    try { await logOut(); navigation.replace('RoleSelection'); }
    catch { showAlert({ title: 'Error', message: 'Failed to logout' }); }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
      {AlertComponent}
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>
          {isOrg ? 'Loading your internships...' : 'Loading internships...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>
            {isOrg ? (userProfile?.organizationName || 'Organization') : 'Explore'}
          </Text>
          <Text style={styles.title}>
            {isOrg ? 'My Internship Listings' : 'Available Internships'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {}
      {!isOrg && (
        <>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={selectedState} style={styles.picker} onValueChange={setSelectedState}>
              {nigerianStates.map(s => <Picker.Item key={s} label={s} value={s} />)}
            </Picker>
          </View>
          <View style={styles.tagsContainer}>
            {jobTypes.map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.tag, selectedTypes.includes(type) && styles.selectedTag]}
                onPress={() => toggleType(type)}
              >
                <Text style={[styles.tagText, selectedTypes.includes(type) && styles.selectedTagText]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {}
      {isOrg && (
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            {internships.length} active {internships.length === 1 ? 'listing' : 'listings'}
          </Text>
        </View>
      )}

      {}
      {internships.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>{isOrg ? '📋' : '🔍'}</Text>
          <Text style={styles.emptyText}>{isOrg ? 'No listings yet' : 'No internships found'}</Text>
          <Text style={styles.emptySubtext}>
            {isOrg ? 'Tap + to post your first internship.' : 'Try adjusting your filters or check back later.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={internships}
          keyExtractor={(item) => item._id || item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
          renderItem={({ item }) => {
            const chip = getDeadlineChip(item.applicationDeadline);
            const isExpired = chip?.label === 'Closed';
            return (
              <TouchableOpacity
                style={[styles.card, isExpired && styles.cardExpired]}
                onPress={() => navigation.navigate('InternshipDetail', { internshipId: item._id, userRole: role })}
                activeOpacity={0.85}
              >
                <View style={styles.cardTop}>
                  <Text style={[styles.cardTitle, isExpired && styles.cardTitleMuted]}>{item.title}</Text>
                  {chip && (
                    <View style={[styles.deadlineChip, { backgroundColor: chip.bg }]}>
                      <Text style={[styles.deadlineChipText, { color: chip.color }]}>{chip.label}</Text>
                    </View>
                  )}
                </View>

                {!isOrg && <Text style={styles.cardOrg}>{item.organizationName}</Text>}

                <Text style={styles.cardLocation}>📍 {item.localGovernment}, {item.state}</Text>

                {}
                {(item.startDate || item.applicationDeadline) && (
                  <View style={styles.dateRow}>
                    {item.startDate && (
                      <Text style={styles.dateText}>🚀 Starts {fmtDate(item.startDate)}</Text>
                    )}
                    {item.applicationDeadline && (
                      <Text style={[styles.dateText, isExpired && { color: '#dc2626' }]}>
                        Deadline {fmtDate(item.applicationDeadline)}
                      </Text>
                    )}
                  </View>
                )}

                <View style={styles.cardTags}>
                  {item.types?.map((type, index) => (
                    <View key={index} style={styles.cardTag}>
                      <Text style={styles.cardTagText}>{type}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.listContent}
        />
      )}

      {}
      {isOrg && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddInternship')}
          activeOpacity={0.85}
        >
          <Text style={styles.addButtonText}>+ Add Internship</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f7fa', gap: 10,
  },
  loadingText: { fontSize: 15, color: '#718096' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  headerGreeting: {
    fontSize: 12, color: '#a0aec0', fontWeight: '500',
    marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.8,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#1a202c', letterSpacing: -0.3 },
  logoutButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  logoutText: { color: '#718096', fontSize: 13, fontWeight: '500' },
  pickerContainer: {
    backgroundColor: '#ffffff', marginHorizontal: 16, marginTop: 14,
    borderRadius: 12, borderWidth: 1.5, borderColor: '#e2e8f0', overflow: 'hidden',
  },
  picker: { height: 50, color: '#1a202c' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingTop: 10, paddingBottom: 4 },
  tag: {
    paddingVertical: 6, paddingHorizontal: 14, margin: 4,
    borderWidth: 1.5, borderColor: '#2563eb', borderRadius: 20, backgroundColor: '#ffffff',
  },
  selectedTag: { backgroundColor: '#2563eb' },
  tagText: { color: '#2563eb', fontSize: 12, fontWeight: '600' },
  selectedTagText: { color: '#ffffff' },
  summaryBar: {
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#e2e8f0', backgroundColor: '#fff',
  },
  summaryText: { fontSize: 13, color: '#718096', fontWeight: '500' },
  listContent: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#ffffff', borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardExpired: { opacity: 0.7, borderWidth: 1, borderColor: '#fecaca' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1a202c', flex: 1, paddingRight: 8 },
  cardTitleMuted: { color: '#718096' },
  deadlineChip: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  deadlineChipText: { fontSize: 11, fontWeight: '700' },
  cardOrg: { fontSize: 13, color: '#4a5568', fontWeight: '500', marginBottom: 4 },
  cardLocation: { fontSize: 13, color: '#718096', marginBottom: 8 },
  dateRow: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  dateText: { fontSize: 12, color: '#718096', fontWeight: '500' },
  cardTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cardTag: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  cardTagText: { fontSize: 11, color: '#2563eb', fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 14 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#2d3748', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#718096', textAlign: 'center', lineHeight: 22 },
  addButton: {
    position: 'absolute', bottom: 30, right: 24,
    backgroundColor: '#2563eb', paddingVertical: 14, paddingHorizontal: 22,
    borderRadius: 30, shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  addButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
});