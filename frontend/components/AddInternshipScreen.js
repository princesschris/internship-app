// screens/AddInternshipScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../contexts/AuthContext';
import { internshipAPI } from '../services/api';
import { useCustomAlert } from './CustomAlert';

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
  'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano',
  'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT'
];

const jobTypes = ['Tech', 'Marketing', 'Engineering', 'Agriculture', 'Data', 'Design', 'Finance', 'Healthcare', 'Education'];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(date) {
  if (!date) return null;
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

// ─── Inline date picker bottom sheet (no native dependency) ──────────────────
function DatePickerModal({ visible, value, label, minDate, onConfirm, onCancel }) {
  const today = new Date();
  const base = value || (minDate && minDate > today ? minDate : today);
  const [day, setDay] = useState(base.getDate());
  const [month, setMonth] = useState(base.getMonth() + 1);
  const [year, setYear] = useState(base.getFullYear());

  const minYear = (minDate || today).getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => minYear + i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleConfirm = () => {
    const date = new Date(year, month - 1, day);
    const min = minDate || today;
    // Normalize to start of day for comparison
    const minNorm = new Date(min.getFullYear(), min.getMonth(), min.getDate());
    const dateNorm = new Date(year, month - 1, day);
    if (dateNorm < minNorm) {
      showAlert({ title: 'Invalid Date', message: `Please choose a date from ${formatDate(minNorm)} or later.` });
      return;
    }
    onConfirm(date);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={dpStyles.overlay}>
        <View style={dpStyles.sheet}>
          <Text style={dpStyles.title}>{label}</Text>
          <View style={dpStyles.wheelRow}>
            <View style={dpStyles.wheel}>
              <Text style={dpStyles.wheelLabel}>DAY</Text>
              <Picker selectedValue={day} onValueChange={setDay} style={dpStyles.picker}>
                {days.map(d => <Picker.Item key={d} label={String(d).padStart(2,'0')} value={d} />)}
              </Picker>
            </View>
            <View style={dpStyles.wheel}>
              <Text style={dpStyles.wheelLabel}>MONTH</Text>
              <Picker selectedValue={month} onValueChange={setMonth} style={dpStyles.picker}>
                {MONTHS.map((m, i) => <Picker.Item key={i} label={m} value={i + 1} />)}
              </Picker>
            </View>
            <View style={dpStyles.wheel}>
              <Text style={dpStyles.wheelLabel}>YEAR</Text>
              <Picker selectedValue={year} onValueChange={setYear} style={dpStyles.picker}>
                {years.map(y => <Picker.Item key={y} label={String(y)} value={y} />)}
              </Picker>
            </View>
          </View>
          <View style={dpStyles.btnRow}>
            <TouchableOpacity style={dpStyles.cancelBtn} onPress={onCancel}>
              <Text style={dpStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={dpStyles.confirmBtn} onPress={handleConfirm}>
              <Text style={dpStyles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AddInternshipScreen({ navigation }) {
  const { userProfile } = useAuth();
  const { showAlert, AlertComponent } = useCustomAlert();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [duration, setDuration] = useState('');
  const [state, setState] = useState('Lagos');
  const [localGov, setLocalGov] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [deadline, setDeadline] = useState(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(null); // 'start' | 'deadline' | null

  const today = new Date();

  const toggleType = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleAdd = async () => {
    if (!title || !description || !state || !localGov || selectedTypes.length === 0) {
      showAlert({ title: 'Missing Fields', message: 'Please fill in all required fields and select at least one category.' });
      return;
    }
    if (!startDate) {
      showAlert({ title: 'Missing Date', message: 'Please set a start date for the internship.' });
      return;
    }
    if (!deadline) {
      showAlert({ title: 'Missing Date', message: 'Please set an application deadline.' });
      return;
    }
    const deadlineNorm = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
    const todayNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (deadlineNorm <= todayNorm) {
      showAlert({ title: 'Invalid Deadline', message: 'Application deadline must be a future date.' });
      return;
    }

    setLoading(true);
    try {
      await internshipAPI.create({
        title,
        description,
        requirements,
        duration,
        state,
        localGovernment: localGov,
        types: selectedTypes,
        startDate: startDate.toISOString(),
        applicationDeadline: deadline.toISOString(),
      });
      showAlert({ title: 'Posted!', message: 'Your internship has been published.' });
      navigation.goBack();
    } catch (error) {
      const msg = error.response?.data?.error?.message || error.message || 'Failed to post internship.';
      showAlert({ title: 'Error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {AlertComponent}
      <Text style={styles.pageTitle}>Post New Internship</Text>

      {/* BASICS */}
      <Text style={styles.sectionLabel}>BASICS</Text>

      <Text style={styles.label}>Title <Text style={styles.req}>*</Text></Text>
      <TextInput
        style={[styles.input, focused === 'title' && styles.inputFocused]}
        placeholder="e.g. Software Engineer Intern"
        placeholderTextColor="#b0b8c1"
        value={title} onChangeText={setTitle} editable={!loading}
        onFocus={() => setFocused('title')} onBlur={() => setFocused(null)}
      />

      <Text style={styles.label}>Description <Text style={styles.req}>*</Text></Text>
      <TextInput
        style={[styles.input, styles.textArea, focused === 'desc' && styles.inputFocused]}
        placeholder="Describe the role and responsibilities"
        placeholderTextColor="#b0b8c1"
        value={description} onChangeText={setDescription}
        multiline numberOfLines={4} editable={!loading}
        onFocus={() => setFocused('desc')} onBlur={() => setFocused(null)}
      />

      <Text style={styles.label}>Requirements</Text>
      <TextInput
        style={[styles.input, styles.textArea, focused === 'req' && styles.inputFocused]}
        placeholder="Required skills and qualifications"
        placeholderTextColor="#b0b8c1"
        value={requirements} onChangeText={setRequirements}
        multiline numberOfLines={3} editable={!loading}
        onFocus={() => setFocused('req')} onBlur={() => setFocused(null)}
      />

      <Text style={styles.label}>Duration</Text>
      <TextInput
        style={[styles.input, focused === 'dur' && styles.inputFocused]}
        placeholder="e.g. 3 months, 6 months"
        placeholderTextColor="#b0b8c1"
        value={duration} onChangeText={setDuration} editable={!loading}
        onFocus={() => setFocused('dur')} onBlur={() => setFocused(null)}
      />

      {/* DATES */}
      <Text style={styles.sectionLabel}>DATES</Text>

      <View style={styles.dateRow}>
        <View style={styles.dateCol}>
          <Text style={styles.label}>Internship Start <Text style={styles.req}>*</Text></Text>
          <TouchableOpacity
            style={[styles.dateBtn, startDate && styles.dateBtnActive]}
            onPress={() => setPickerOpen('start')}
            disabled={loading}
          >
            <Text style={styles.dateBtnIcon}>📅</Text>
            <Text style={[styles.dateBtnText, !startDate && styles.dateBtnPlaceholder]}>
              {startDate ? formatDate(startDate) : 'Pick date'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateCol}>
          <Text style={styles.label}>Apply By <Text style={styles.req}>*</Text></Text>
          <TouchableOpacity
            style={[styles.dateBtn, deadline && styles.dateBtnActive]}
            onPress={() => setPickerOpen('deadline')}
            disabled={loading}
          >
            <Ionicons name="calendar-outline" size={18} color="#2563EB" />
            <Text style={[styles.dateBtnText, !deadline && styles.dateBtnPlaceholder]}>
              {deadline ? formatDate(deadline) : 'Pick deadline'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.dateHint}>
        ⓘ  Applications automatically close on the deadline date and the listing will be marked expired.
      </Text>

      {/* LOCATION */}
      <Text style={styles.sectionLabel}>LOCATION</Text>

      <Text style={styles.label}>State <Text style={styles.req}>*</Text></Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={state} onValueChange={setState} enabled={!loading} style={styles.picker}>
          {nigerianStates.map(s => <Picker.Item key={s} label={s} value={s} />)}
        </Picker>
      </View>

      <Text style={styles.label}>Local Government Area <Text style={styles.req}>*</Text></Text>
      <TextInput
        style={[styles.input, focused === 'lga' && styles.inputFocused]}
        placeholder="e.g. Ikeja"
        placeholderTextColor="#b0b8c1"
        value={localGov} onChangeText={setLocalGov} editable={!loading}
        onFocus={() => setFocused('lga')} onBlur={() => setFocused(null)}
      />

      {/* CATEGORIES */}
      <Text style={styles.sectionLabel}>CATEGORIES</Text>
      <Text style={styles.label}>Select at least one <Text style={styles.req}>*</Text></Text>
      <View style={styles.tagsContainer}>
        {jobTypes.map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.tag, selectedTypes.includes(type) && styles.selectedTag]}
            onPress={() => toggleType(type)}
            disabled={loading}
          >
            <Text style={[styles.tagText, selectedTypes.includes(type) && styles.selectedTagText]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* SUBMIT */}
      <TouchableOpacity
        style={[styles.submitBtn, loading && styles.btnDisabled]}
        onPress={handleAdd}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.submitBtnText}>Post Internship</Text>
        }
      </TouchableOpacity>

      <View style={{ height: 50 }} />

      {/* Date Picker Modals */}
      <DatePickerModal
        visible={pickerOpen === 'start'}
        value={startDate}
        label="Select Start Date"
        minDate={today}
        onConfirm={(d) => { setStartDate(d); setPickerOpen(null); }}
        onCancel={() => setPickerOpen(null)}
      />
      <DatePickerModal
        visible={pickerOpen === 'deadline'}
        value={deadline}
        label="Select Application Deadline"
        minDate={today}
        onConfirm={(d) => { setDeadline(d); setPickerOpen(null); }}
        onCancel={() => setPickerOpen(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  content: { padding: 20, paddingTop: 28 },
  pageTitle: { fontSize: 24, fontWeight: '700', color: '#1a202c', marginBottom: 24, letterSpacing: -0.5 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#a0aec0',
    letterSpacing: 1.2, marginBottom: 12, marginTop: 8,
  },
  label: { fontSize: 13, fontWeight: '600', color: '#4a5568', marginBottom: 6 },
  req: { color: '#e53e3e' },
  input: {
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e2e8f0',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: '#1a202c', marginBottom: 14,
  },
  inputFocused: { borderColor: '#2563eb' },
  textArea: { height: 90, textAlignVertical: 'top' },
  pickerWrapper: {
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e2e8f0',
    borderRadius: 12, marginBottom: 14, overflow: 'hidden',
  },
  picker: { height: 50, color: '#1a202c' },
  dateRow: { flexDirection: 'row', gap: 12, marginBottom: 0 },
  dateCol: { flex: 1 },
  dateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e2e8f0',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 13, marginBottom: 10,
  },
  dateBtnActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  dateBtnIcon: { fontSize: 14 },
  dateBtnText: { fontSize: 13, fontWeight: '600', color: '#2563eb', flex: 1 },
  dateBtnPlaceholder: { color: '#b0b8c1', fontWeight: '400' },
  dateHint: { fontSize: 12, color: '#a0aec0', lineHeight: 18, marginBottom: 20 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  tag: {
    paddingVertical: 8, paddingHorizontal: 14,
    borderWidth: 1.5, borderColor: '#2563eb', borderRadius: 20, backgroundColor: '#fff',
  },
  selectedTag: { backgroundColor: '#2563eb' },
  tagText: { color: '#2563eb', fontSize: 13, fontWeight: '600' },
  selectedTagText: { color: '#fff' },
  submitBtn: {
    backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 8, elevation: 5,
  },
  btnDisabled: { opacity: 0.55 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});

const dpStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  title: { fontSize: 16, fontWeight: '700', color: '#1a202c', textAlign: 'center', marginBottom: 16 },
  wheelRow: { flexDirection: 'row' },
  wheel: { flex: 1 },
  wheelLabel: {
    fontSize: 10, fontWeight: '700', color: '#a0aec0',
    textAlign: 'center', letterSpacing: 1, marginBottom: 4,
  },
  picker: { height: 160 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#e2e8f0', alignItems: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: '#718096' },
  confirmBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: '#2563eb', alignItems: 'center',
  },
  confirmText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});