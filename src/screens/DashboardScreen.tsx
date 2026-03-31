import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { appointmentsService } from '../services/appointmentsService';
import { billingService } from '../services/billingService';
import { patientsService } from '../services/patientsService';
import { StatCard, Card, StatusBadge } from '../components/Cards';
import { Header } from '../components/Header';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { Appointment } from '../types';
import { useClinic } from '../hooks/useClinic';

const statusLabelMap: Record<string, string> = {
  booked: 'Booked',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};

export default function DashboardScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { clinicId, clinicName } = useClinic();

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'dashboard.greetingMorning';
    if (hour < 18) return 'dashboard.greetingAfternoon';
    return 'dashboard.greetingEvening';
  };

  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalPatientsToday: 0,
    upcomingCount: 0,
    revenueToday: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);

  const loadData = useCallback(async () => {
    if (!clinicId) return;
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const [apptToday, upcoming, revenue] = await Promise.all([
      appointmentsService.getByDate(clinicId, today),
      appointmentsService.getUpcoming(clinicId),
      billingService.getTodayRevenue(clinicId),
    ]);

    setTodayAppointments(apptToday.data);
    setStats({
      totalPatientsToday: apptToday.data.length,
      upcomingCount: upcoming.data.length,
      revenueToday: revenue,
    });
  }, [clinicId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout', 'Logout'),
      t('logoutConfirm', 'Are you sure you want to log out?'),
      [
        { text: t('cancel', 'Cancel'), style: 'cancel' },
        { 
          text: t('logout', 'Logout'), 
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
          }
        }
      ]
    );
  };

  const quickActions = [
    {
      id: 'addPatient',
      label: t('dashboard.addPatient'),
      icon: 'person-add-outline' as const,
      color: Colors.primary,
      onPress: () => navigation.navigate('Patients', { screen: 'AddPatient' }),
    },
    {
      id: 'newAppointment',
      label: t('dashboard.newAppointment'),
      icon: 'calendar-outline' as const,
      color: Colors.secondary,
      onPress: () => navigation.navigate('Appointments', { screen: 'AddAppointment' }),
    },
    {
      id: 'newBill',
      label: t('dashboard.newBill'),
      icon: 'receipt-outline' as const,
      color: Colors.success,
      onPress: () => navigation.navigate('Billing', { screen: 'AddBill' }),
    },
  ];

  return (
    <View style={styles.screen}>
      <Header 
        title={t('dashboard.title')} 
        showLangToggle 
        rightElement={
          <TouchableOpacity onPress={handleLogout} style={{ padding: 4 }}>
            <Ionicons name="log-out-outline" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
        }
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Banner */}
        <View style={styles.banner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{t(getGreetingTime())} 👋</Text>
            {clinicName ? <Text style={styles.clinicName}>{clinicName}</Text> : null}
            <Text style={styles.date}>{new Date().toLocaleDateString('en-NP', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
          </View>
          <View style={styles.logoSmall}>
            <Text style={{ fontSize: 28 }}>🏥</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            label={t('dashboard.totalPatients')}
            value={stats.totalPatientsToday}
            icon={<Ionicons name="people-outline" size={24} color={Colors.primary} />}
            color={Colors.primary}
          />
          <StatCard
            label={t('dashboard.upcomingAppointments')}
            value={stats.upcomingCount}
            icon={<Ionicons name="calendar-outline" size={24} color={Colors.secondary} />}
            color={Colors.secondary}
          />
        </View>

        {/* Revenue Card */}
        <Card style={styles.revenueCard}>
          <View style={styles.revenueRow}>
            <View style={[styles.revenueIcon, { backgroundColor: Colors.success + '18' }]}>
              <Ionicons name="cash-outline" size={28} color={Colors.success} />
            </View>
            <View>
              <Text style={styles.revenueLabel}>{t('dashboard.revenueToday')}</Text>
              <Text style={styles.revenueValue}>
                NPR {stats.revenueToday.toLocaleString()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}</Text>
        <View style={styles.actionsRow}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionBtn, { borderColor: action.color + '30' }]}
              onPress={action.onPress}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                <Ionicons name={action.icon} size={24} color="#fff" />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Schedule */}
        <Text style={styles.sectionTitle}>{t('dashboard.todaySchedule')}</Text>
        {todayAppointments.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>{t('dashboard.emptySchedule')}</Text>
          </Card>
        ) : (
          todayAppointments.map((appt) => (
            <Card key={appt.id} style={styles.apptCard}>
              <View style={styles.apptRow}>
                <View style={styles.apptLeft}>
                  <Text style={styles.apptTime}>{appt.appointment_time}</Text>
                  <Text style={styles.apptName}>{appt.patient?.full_name}</Text>
                  <Text style={styles.apptDoctor}>{appt.doctor_name}</Text>
                </View>
                <StatusBadge
                  status={appt.status}
                  label={statusLabelMap[appt.status] || appt.status}
                />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, paddingBottom: Spacing.huge, gap: Spacing.md },

  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xs,
    ...Shadows.lg,
  },
  greeting: { ...Typography.h2, color: '#fff' },
  clinicName: { ...Typography.bodyMD, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  date: { ...Typography.bodySM, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  logoSmall: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statsRow: { flexDirection: 'row', gap: Spacing.md },

  revenueCard: { marginVertical: 0 },
  revenueRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  revenueIcon: { width: 56, height: 56, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  revenueLabel: { ...Typography.bodySM, color: Colors.textSecondary },
  revenueValue: { ...Typography.h1, color: Colors.success, marginTop: 2 },

  sectionTitle: { ...Typography.h3, color: Colors.textPrimary, marginTop: Spacing.sm },

  actionsRow: { flexDirection: 'row', gap: Spacing.md },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderWidth: 1.5,
    ...Shadows.sm,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionLabel: { ...Typography.labelSM, color: Colors.textPrimary, textAlign: 'center' },

  apptCard: { marginBottom: 0 },
  apptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  apptLeft: { flex: 1 },
  apptTime: { ...Typography.labelMD, color: Colors.primary, marginBottom: 2 },
  apptName: { ...Typography.bodyLG, color: Colors.textPrimary, fontWeight: '600' },
  apptDoctor: { ...Typography.bodySM, color: Colors.textSecondary },

  emptyText: { ...Typography.bodyMD, color: Colors.textMuted, textAlign: 'center', paddingVertical: Spacing.md },
});
