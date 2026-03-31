import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Header } from '../components/Header';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { Patient, Appointment } from '../types';
import { appointmentsService } from '../services/appointmentsService';

export default function PatientDetailScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { patient } = route.params as { patient: Patient };

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    // Fetch appointments related to this patient
    // If the service doesn't have a getByPatientId, we might get all and filter, or skip for now.
    // For now we'll just try to filter for demonstration or rely on the core backend.
    try {
      const res = await appointmentsService.getByPatient(patient.id);
      setAppointments(res.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [patient]);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  return (
    <View style={styles.screen}>
      <Header
        title={t('patients.patientDetails')}
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Patient Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{patient.full_name?.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{patient.full_name}</Text>
          <Text style={styles.pidBadge}>{patient.patient_id}</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="call-outline" size={20} color={Colors.primary} />
              <View>
                <Text style={styles.infoLabel}>{t('patients.phone')}</Text>
                <Text style={styles.infoValue}>{patient.phone}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="person-outline" size={20} color={Colors.primary} />
              <View>
                <Text style={styles.infoLabel}>{t('patients.gender')} & {t('patients.age')}</Text>
                <Text style={styles.infoValue}>
                  {patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : ''}, {patient.age}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={20} color={Colors.primary} />
              <View>
                <Text style={styles.infoLabel}>{t('patients.address')}</Text>
                <Text style={styles.infoValue}>{patient.address}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Visit History Section */}
        <Text style={styles.sectionTitle}>{t('patients.visitHistory')}</Text>
        
        {appointments.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="calendar-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>{loading ? t('loading') : t('appointments.noAppointments')}</Text>
          </View>
        ) : (
          appointments.map((appt) => (
             <View key={appt.id} style={styles.historyCard}>
               <View style={styles.historyTop}>
                 <Text style={styles.historyDate}>{new Date(appt.appointment_date).toLocaleDateString()}</Text>
                 <Text style={styles.statusBadge}>{appt.status.toUpperCase()}</Text>
               </View>
               <View style={styles.historyDetails}>
                  <Text style={styles.historyDoctor}>{appt.doctor_name}</Text>
                  <Text style={styles.historyTime}>{appt.appointment_time}</Text>
               </View>
             </View>
          ))
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, paddingBottom: Spacing.huge },

  profileCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: Radius.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    ...Typography.h1,
    color: Colors.primary,
  },
  name: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  pidBadge: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    marginBottom: Spacing.lg,
  },
  infoGrid: {
    width: '100%',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: Radius.md,
    gap: Spacing.md,
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    ...Typography.bodyMD,
    color: Colors.textPrimary,
    fontWeight: '500',
  },

  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  
  historyCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  historyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm,
  },
  historyDate: {
    ...Typography.bodyLG,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  statusBadge: {
    ...Typography.caption,
    fontWeight: 'bold',
    color: Colors.primary,
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyDoctor: {
    ...Typography.bodyMD,
    color: Colors.textSecondary,
  },
  historyTime: {
    ...Typography.bodyMD,
    color: Colors.primary,
    fontWeight: '500',
  },

  emptyBox: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    ...Shadows.sm,
  },
  emptyText: {
    ...Typography.bodyMD,
    color: Colors.textMuted,
    marginTop: Spacing.md,
  },
});
