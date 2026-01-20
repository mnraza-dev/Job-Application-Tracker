import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { FlatList, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemeContext } from './_layout';

import { Application, Interview } from '../types';

const STORAGE_KEY = '@job_applications';

const STATUSES = ['Applied', 'Interviewing', 'Rejected', 'Not Selected', 'Selected'];

const POSITIONS = [
  'Software Engineer', 'Senior Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'React Developer', 'Node.js Developer', 'Java Developer',
  'MERN Developer', 'DevOps Engineer', 'Frontend Engineer', 'Other',
];

const INTERVIEW_TYPES = [
  'Phone Screen', 'Technical Round 1', 'Technical Round 2', 'Technical Round 3',
  'HR Round', 'Onsite', 'Other',
];

const primaryColor = '#2196F3';

export default function FormScreen() {
  const { isDark } = useContext(ThemeContext);
  const router = useRouter();
  const params = useLocalSearchParams<{ appJson?: string }>();
  const application: Application | undefined = params.appJson ? JSON.parse(params.appJson) : undefined;
  const isEdit = !!application;

  const backgroundColor = isDark ? '#000000' : '#ffffff';
  const surfaceColor = isDark ? '#1c1c1c' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const placeholderColor = isDark ? '#888888' : '#999999';
  const borderColor = isDark ? '#333333' : '#dddddd';
  const subtitleColor = isDark ? '#aaaaaa' : '#666666';

  const [company, setCompany] = useState(application?.company ?? '');
  const [position, setPosition] = useState(application?.position ?? '');
  const [customPosition, setCustomPosition] = useState(POSITIONS.includes(application?.position ?? '') ? '' : (application?.position ?? ''));
  const [status, setStatus] = useState<Application['status']>(application?.status ?? 'Applied');
  const [notes, setNotes] = useState(application?.notes ?? '');
  const [interviews, setInterviews] = useState<Interview[]>(application?.interviews ?? []);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [interviewType, setInterviewType] = useState('Phone Screen');
  const [interviewNotes, setInterviewNotes] = useState('');

  const [showPositionModal, setShowPositionModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);

  const displayedPosition = position === 'Other' ? (customPosition || 'Other') : position;

  const addInterview = () => {
    if (!selectedDate) return;
    const dateStr = selectedDate.toISOString().split('T')[0];
    setInterviews([...interviews, { date: dateStr, type: interviewType, notes: interviewNotes }]);
    setSelectedDate(null);
    setInterviewNotes('');
    setInterviewType('Phone Screen');
  };

  const removeInterview = (index: number) => {
    setInterviews(interviews.filter((_, i) => i !== index));
  };

  const saveApplication = async () => {
    if (!company.trim() || !displayedPosition.trim()) return;

    const finalPosition = position === 'Other' ? customPosition.trim() || 'Other' : position;

    const newApp: Application = {
      id: isEdit ? application!.id : Date.now(),
      company,
      position: finalPosition,
      status,
      notes,
      interviews,
      dateApplied: isEdit ? application!.dateApplied : new Date().toISOString(),
    };

    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      let apps: Application[] = jsonValue ? JSON.parse(jsonValue) : [];
      if (isEdit) {
        apps = apps.map((app) => (app.id === application!.id ? newApp : app));
      } else {
        apps.push(newApp);
      }
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
      router.back();
    } catch (e) {
      console.error(e);
    }
  };

  const renderDropdownItem = ({ item, onSelect }: { item: string; onSelect: (val: string) => void }) => (
    <TouchableOpacity style={styles.dropdownItem} onPress={() => onSelect(item)}>
      <Text style={[styles.dropdownText, { color: textColor }]}>{item}</Text>
      {(position === item || interviewType === item) && <Ionicons name="checkmark" size={24} color={primaryColor} />}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.surface, { backgroundColor: surfaceColor }]}>
          {/* Company */}
          <Text style={[styles.label, { color: textColor }]}>Company</Text>
          <TextInput
            value={company}
            onChangeText={setCompany}
            placeholder="Enter company name"
            placeholderTextColor={placeholderColor}
            style={[styles.textInput, { borderColor, color: textColor }]}
          />

          {/* Position Dropdown */}
          <Text style={[styles.label, { color: textColor }]}>Position</Text>
          <TouchableOpacity style={[styles.dropdownTrigger, { borderColor }]} onPress={() => setShowPositionModal(true)}>
            <Text style={[styles.dropdownSelected, { color: displayedPosition ? textColor : placeholderColor }]}>
              {displayedPosition || 'Select position'}
            </Text>
            <Ionicons name="chevron-down" size={24} color={textColor} />
          </TouchableOpacity>

          {position === 'Other' && (
            <>
              <Text style={[styles.label, { color: textColor }]}>Custom Position</Text>
              <TextInput
                value={customPosition}
                onChangeText={setCustomPosition}
                placeholder="Enter custom position"
                placeholderTextColor={placeholderColor}
                style={[styles.textInput, { borderColor, color: textColor }]}
              />
            </>
          )}

          {/* Status */}
          <Text style={[styles.label, { color: textColor }]}>Status</Text>
          <View style={styles.statusRow}>
            {STATUSES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.statusOption, status === s && styles.statusSelected]}
                onPress={() => setStatus(s as Application['status'])}
              >
                <Ionicons name={status === s ? 'radio-button-on' : 'radio-button-off'} size={24} color={primaryColor} />
                <Text style={[styles.statusText, { color: textColor }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Notes */}
          <Text style={[styles.label, { color: textColor }]}>General Notes (optional)</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any notes..."
            placeholderTextColor={placeholderColor}
            multiline
            style={[styles.textInput, styles.multilineInput, { borderColor, color: textColor }]}
          />

          {/* Interviews List */}
          <Text style={[styles.sectionTitle, { color: textColor }]}>Interviews</Text>
          {interviews.length === 0 ? (
            <Text style={[styles.emptyText, { color: placeholderColor }]}>No interviews added yet</Text>
          ) : (
            <View>
              {interviews.map((item, index) => (
                <View key={index} style={[styles.interviewItem, { borderColor }]}>
                  <View>
                    <Text style={[styles.interviewTitle, { color: textColor }]}>{item.date} — {item.type}</Text>
                    {item.notes ? <Text style={[styles.interviewNotes, { color: subtitleColor }]}>{item.notes}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => removeInterview(index)}>
                    <Ionicons name="trash" size={24} color="#f44336" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Add Interview Section */}
          <Text style={[styles.sectionTitle, { color: textColor }]}>Add New Interview</Text>

          {/* Date Picker */}
          <TouchableOpacity style={[styles.dateTrigger, { borderColor }]} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar" size={24} color={primaryColor} />
            <Text style={[styles.dateText, { color: selectedDate ? textColor : placeholderColor }]}>
              {selectedDate ? selectedDate.toLocaleDateString() : 'Select date'}
            </Text>
          </TouchableOpacity>

          {/* Interview Type Dropdown */}
          <Text style={[styles.label, { color: textColor }]}>Interview Type</Text>
          <TouchableOpacity style={[styles.dropdownTrigger, { borderColor }]} onPress={() => setShowTypeModal(true)}>
            <Text style={[styles.dropdownSelected, { color: textColor }]}>{interviewType}</Text>
            <Ionicons name="chevron-down" size={24} color={textColor} />
          </TouchableOpacity>

          {/* Interview Notes */}
          <Text style={[styles.label, { color: textColor }]}>Interview Notes (optional)</Text>
          <TextInput
            value={interviewNotes}
            onChangeText={setInterviewNotes}
            placeholder="Add notes..."
            placeholderTextColor={placeholderColor}
            multiline
            style={[styles.textInput, styles.multilineInput, { borderColor, color: textColor }]}
          />

          {/* Add Interview Button */}
          <TouchableOpacity
            style={[styles.actionButton, { opacity: selectedDate ? 1 : 0.5 }]}
            disabled={!selectedDate}
            onPress={addInterview}
          >
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Add Interview</Text>
          </TouchableOpacity>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={saveApplication}>
            <Ionicons name="save" size={24} color="#fff" />
            <Text style={styles.saveButtonText}>{isEdit ? 'Update Application' : 'Save Application'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Position Modal */}
      <Modal visible={showPositionModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: surfaceColor }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Select Position</Text>
              <TouchableOpacity onPress={() => setShowPositionModal(false)}>
                <Ionicons name="close" size={28} color={textColor} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={POSITIONS}
              renderItem={({ item }) => renderDropdownItem({ item, onSelect: (val) => { setPosition(val); setShowPositionModal(false); } })}
              keyExtractor={(item) => item}
            />
          </View>
        </View>
      </Modal>

      {/* Type Modal */}
      <Modal visible={showTypeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: surfaceColor }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Select Type</Text>
              <TouchableOpacity onPress={() => setShowTypeModal(false)}>
                <Ionicons name="close" size={28} color={textColor} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={INTERVIEW_TYPES}
              renderItem={({ item }) => renderDropdownItem({ item, onSelect: (val) => { setInterviewType(val); setShowTypeModal(false); } })}
              keyExtractor={(item) => item}
            />
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.dateModalContent, { backgroundColor: surfaceColor }]}>
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
              onChange={(event, date) => {
                if (date) setSelectedDate(date);
                setShowDatePicker(false);
              }}
            />
            <TouchableOpacity style={styles.closeDateBtn} onPress={() => setShowDatePicker(false)}>
              <Text style={styles.closeDateText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  surface: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
  label: { fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 8 },
  textInput: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
  },
  multilineInput: { minHeight: 100, textAlignVertical: 'top' },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
  },
  dropdownSelected: { fontSize: 16 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 8 },
  statusOption: { flexDirection: 'row', alignItems: 'center', padding: 12, width: '48%' },
  statusSelected: { backgroundColor: primaryColor + '20', borderRadius: 12 },
  statusText: { marginLeft: 8, fontSize: 16 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 32, marginBottom: 12 },
  interviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  interviewTitle: { fontSize: 16, fontWeight: '600' },
  interviewNotes: { fontSize: 14, marginTop: 4 },
  emptyText: { fontStyle: 'italic', fontSize: 16, marginVertical: 16 },
  dateTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  dateText: { fontSize: 16 },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: primaryColor,
    borderRadius: 16,
    padding: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#4caf50',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  saveButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', maxHeight: '80%', backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#ddd' },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  dropdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  dropdownText: { fontSize: 18 },
  dateModalContent: { borderRadius: 20, padding: 20, alignItems: 'center' },
  closeDateBtn: { marginTop: 20, padding: 12 },
  closeDateText: { fontSize: 18, color: primaryColor, fontWeight: '600' },
});