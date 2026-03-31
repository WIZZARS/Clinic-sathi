import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { appointmentsService } from '../services/appointmentsService';
import { patientsService } from '../services/patientsService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Header } from '../components/Header';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { Patient } from '../types';
import { useClinic } from '../hooks/useClinic';

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '13:00', '13:30', '14:00',
  '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
];

export default function AddAppointmentScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { clinicId } = useClinic();

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [doctorName, setDoctorName] = useState('');
  const d = new Date();
  const initDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const [date, setDate] = useState(initDate);
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [patientQuery, setPatientQuery] = useState('');
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [showPatientPicker, setShowPatientPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const searchPatients = async (q: string) => {
    setPatientQuery(q);
    if (!q.trim()) {
      const { data } = await patientsService.getAll(clinicId!);
      setPatientResults(data);
      return;
    }
    const { data } = await patientsService.search(clinicId!, q.trim());
    setPatientResults(data);
  };

  const handleBook = async () => {
    if (!selectedPatient) { Alert.alert('Error', 'Please select a patient'); return; }
    if (!doctorName.trim()) { Alert.alert('Error', 'Please enter doctor name'); return; }
    if (!date) { Alert.alert('Error', 'Please select a date'); return; }
    if (!time) { Alert.alert('Error', 'Please select a time slot'); return; }

    setLoading(true);
    const { error } = await appointmentsService.create({
      patient_id: selectedPatient.id,
      doctor_name: doctorName.trim(),
      appointment_date: date,
      appointment_time: time,
      notes: notes.trim() || undefined,
      status: 'booked',
      clinic_id: clinicId!,
    });

    if (error) {
      Alert.alert('Error', 'Failed to book appointment. Please try again.');
    } else {
      Alert.alert('✅ Appointment Booked', `Appointment for ${selectedPatient.full_name} booked at ${time} on ${date}`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
    setLoading(false);
  };

  return (
    <View style={styles.screen}>
      <Header title={t('appointments.newAppointment')} showBack onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {/* Patient Selector */}
          <Text style={styles.label}>{t('appointments.selectPatient')}</Text>
          <TouchableOpacity
            style={styles.selectorBtn}
            onPress={() => {
              setShowPatientPicker(true);
              searchPatients('');
            }}
          >
            <Ionicons name="person-outline" size={20} color={Colors.textMuted} />
            <Text style={[styles.selectorText, selectedPatient && { color: Colors.textPrimary }]}>
              {selectedPatient ? `${selectedPatient.full_name} (${selectedPatient.patient_id})` : t('appointments.selectPatient')}
            </Text>
            <Ionicons name="chevron-down" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <Input
            label={t('appointments.doctorName')}
            value={doctorName}
            onChangeText={setDoctorName}
            placeholder="Dr. Sharma"
            leftIcon="medical-outline"
            autoCapitalize="words"
          />

          <Text style={styles.label}>{t('appointments.selectDate')}</Text>
          <TouchableOpacity
            style={styles.selectorBtn}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={Colors.textMuted} />
            <Text style={[styles.selectorText, date && { color: Colors.textPrimary }]}>
              {date}
            </Text>
            <Ionicons name="chevron-down" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Time Slots */}
          <Text style={styles.label}>{t('appointments.selectTime')}</Text>
          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[styles.timeSlot, time === slot && styles.timeSlotActive]}
                onPress={() => setTime(slot)}
                activeOpacity={0.8}
              >
                <Text style={[styles.timeSlotText, time === slot && styles.timeSlotTextActive]}>
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label={t('appointments.notes')}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any special notes..."
            leftIcon="document-text-outline"
            multiline
            numberOfLines={3}
          />

          <Button title={t('appointments.bookButton')} onPress={handleBook} loading={loading} size="lg" style={styles.submitBtn} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.calendarContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('appointments.selectDate')}</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={26} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Calendar
              current={date}
              onDayPress={(day: { dateString: string }) => {
                setDate(day.dateString);
                setShowDatePicker(false);
              }}
              markedDates={{
                [date]: { selected: true, selectedColor: Colors.primary },
              }}
              theme={{
                backgroundColor: Colors.surface,
                calendarBackground: Colors.surface,
                selectedDayBackgroundColor: Colors.primary,
                selectedDayTextColor: '#fff',
                todayTextColor: Colors.primary,
                dayTextColor: Colors.textPrimary,
                textDisabledColor: Colors.textMuted,
                monthTextColor: Colors.textPrimary,
                arrowColor: Colors.primary,
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Patient Picker Modal */}
      <Modal visible={showPatientPicker} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('appointments.selectPatient')}</Text>
            <TouchableOpacity onPress={() => setShowPatientPicker(false)}>
              <Ionicons name="close" size={26} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <Input
            value={patientQuery}
            onChangeText={searchPatients}
            placeholder={t('patients.searchPlaceholder')}
            leftIcon="search-outline"
          />
          <FlatList
            data={patientResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.patientRow}
                onPress={() => {
                  setSelectedPatient(item);
                  setShowPatientPicker(false);
                  setPatientQuery('');
                  setPatientResults([]);
                }}
              >
                <View style={styles.patientAvatar}>
                  <Text style={styles.avatarText}>{item.full_name.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={styles.patientName}>{item.full_name}</Text>
                  <Text style={styles.patientMeta}>{item.patient_id} • {item.phone}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: Spacing.huge },

  label: { ...Typography.labelMD, color: Colors.textPrimary, marginBottom: Spacing.sm },

  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 56,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  selectorText: { flex: 1, ...Typography.bodyLG, color: Colors.textMuted },

  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  timeSlot: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  timeSlotActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  timeSlotText: { ...Typography.labelSM, color: Colors.textSecondary },
  timeSlotTextActive: { color: '#fff' },

  submitBtn: { marginTop: Spacing.lg },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: Spacing.xl },
  calendarContainer: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, ...Shadows.lg },

  modal: { flex: 1, backgroundColor: Colors.background, padding: Spacing.xl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  modalTitle: { ...Typography.h2, color: Colors.textPrimary },

  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  patientAvatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { ...Typography.h3, color: Colors.primary },
  patientName: { ...Typography.bodyLG, fontWeight: '600', color: Colors.textPrimary },
  patientMeta: { ...Typography.bodySM, color: Colors.textSecondary },
});
