import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { appointmentsService } from '../services/appointmentsService';
import { Header } from '../components/Header';
import { StatusBadge } from '../components/Cards';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { Appointment, AppointmentStatus } from '../types';
import { useClinic } from '../hooks/useClinic';

const statusLabelMap: Record<AppointmentStatus, string> = {
  booked: 'Booked',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};

export default function AppointmentsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { clinicId } = useClinic();

  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const [selectedDate, setSelectedDate] = useState(today);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedApptForStatus, setSelectedApptForStatus] = useState<Appointment | null>(null);

  const loadAppointments = useCallback(async () => {
    if (!clinicId) return;
    setLoading(true);
    const { data } = await appointmentsService.getByDate(clinicId, selectedDate);
    setAppointments(data);
    setLoading(false);
  }, [selectedDate, clinicId]);

  useFocusEffect(
    useCallback(() => {
      loadAppointments();
    }, [loadAppointments])
  );

  const handleStatusChange = (appt: Appointment) => {
    if (appt.status === 'completed' || appt.status === 'cancelled') {
      Alert.alert('Status', 'This appointment is already finalized.');
      return;
    }
    setSelectedApptForStatus(appt);
  };

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    setSelectedApptForStatus(null);
    await appointmentsService.updateStatus(id, status);
    loadAppointments();
  };

  const renderItem = ({ item }: { item: Appointment }) => (
    <TouchableOpacity style={styles.apptCard} onPress={() => handleStatusChange(item)} activeOpacity={0.8}>
      <View style={styles.timeColumn}>
        <Text style={styles.time}>{item.appointment_time}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.apptInfo}>
        <Text style={styles.patientName}>{item.patient?.full_name}</Text>
        <Text style={styles.doctorName}>{item.doctor_name}</Text>
        {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
      </View>
      <StatusBadge status={item.status} label={statusLabelMap[item.status]} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <Header
        title={t('appointments.title')}
        showLangToggle
        rightElement={
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddAppointment')}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        }
      />

      {/* Calendar */}
      <Calendar
        current={selectedDate}
        onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: Colors.primary },
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
          textDayFontSize: 15,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 13,
        }}
        style={styles.calendar}
      />

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={64} color={Colors.border} />
            <Text style={styles.emptyText}>
              {loading ? t('loading') : t('appointments.noAppointments')}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Custom Action Sheet for Status */}
      <Modal visible={!!selectedApptForStatus} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.actionSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Update Status</Text>
              <TouchableOpacity onPress={() => setSelectedApptForStatus(null)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.sheetSubtitle}>
              For {selectedApptForStatus?.patient?.full_name}
            </Text>

            <TouchableOpacity style={styles.actionBtn} onPress={() => updateStatus(selectedApptForStatus!.id, 'completed')}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.actionText}>{t('appointments.markCompleted')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => updateStatus(selectedApptForStatus!.id, 'no_show')}>
              <Ionicons name="eye-off" size={20} color={Colors.secondary} />
              <Text style={styles.actionText}>{t('appointments.markNoShow')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, { borderBottomWidth: 0 }]} onPress={() => updateStatus(selectedApptForStatus!.id, 'cancelled')}>
              <Ionicons name="close-circle" size={20} color={Colors.danger} />
              <Text style={[styles.actionText, { color: Colors.danger }]}>{t('appointments.markCancelled')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  list: { padding: Spacing.xl, paddingBottom: Spacing.huge },

  apptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  timeColumn: { alignItems: 'center', minWidth: 50 },
  time: { ...Typography.labelMD, color: Colors.primary },
  divider: { width: 2, height: '100%', backgroundColor: Colors.border, borderRadius: 2 },
  apptInfo: { flex: 1 },
  patientName: { ...Typography.bodyLG, fontWeight: '700', color: Colors.textPrimary },
  doctorName: { ...Typography.bodySM, color: Colors.textSecondary, marginTop: 2 },
  notes: { ...Typography.caption, color: Colors.textMuted, marginTop: 2, fontStyle: 'italic' },

  addBtn: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  empty: { alignItems: 'center', paddingTop: Spacing.huge },
  emptyText: { ...Typography.bodyMD, color: Colors.textMuted, marginTop: Spacing.lg },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  actionSheet: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingBottom: Spacing.huge,
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sheetTitle: { ...Typography.h3, color: Colors.textPrimary },
  sheetSubtitle: { ...Typography.bodySM, color: Colors.textSecondary, marginBottom: Spacing.xl, marginTop: 4 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  actionText: { ...Typography.bodyLG, color: Colors.textPrimary, fontWeight: '500' },
});
