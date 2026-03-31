import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { billingService } from '../services/billingService';
import { Header } from '../components/Header';
import { StatusBadge } from '../components/Cards';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { Bill } from '../types';
import { useClinic } from '../hooks/useClinic';
import { generateDailyReport } from '../lib/reportUtils';

export default function BillingScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { clinicId } = useClinic();

  const [groupedBills, setGroupedBills] = useState<{ title: string; data: Bill[] }[]>([]);
  const [loading, setLoading] = useState(true);

  const groupBillsByDate = (bills: Bill[]) => {
    const groups: Record<string, Bill[]> = {};
    bills.forEach((bill) => {
      const d = new Date(bill.created_at);
      const dateLabel = d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      if (!groups[dateLabel]) groups[dateLabel] = [];
      groups[dateLabel].push(bill);
    });

    return Object.keys(groups)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map((date) => ({
        title: date,
        data: groups[date].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
      }));
  };

  const loadBills = useCallback(async () => {
    if (!clinicId) return;
    setLoading(true);
    const { data } = await billingService.getAll(clinicId);
    setGroupedBills(groupBillsByDate(data));
    setLoading(false);
  }, [clinicId]);

  useFocusEffect(
    useCallback(() => {
      loadBills();
    }, [loadBills])
  );

  const handleMarkPaid = async (bill: Bill) => {
    if (bill.payment_status === 'paid') return;
    Alert.alert('Mark as Paid', `Confirm NPR ${bill.total.toLocaleString()} from ${bill.patient?.full_name}?`, [
      {
        text: t('confirm'),
        onPress: async () => {
          await billingService.updatePaymentStatus(bill.id, 'paid');
          loadBills();
        },
      },
      { text: t('cancel'), style: 'cancel' },
    ]);
  };

  const renderItem = ({ item }: { item: Bill }) => (
    <View style={styles.billCard}>
      <View style={styles.billTop}>
        <View style={styles.billLeft}>
          <Text style={styles.patientName}>{item.patient?.full_name}</Text>
          <Text style={styles.billId}>#{item.id.substring(0, 8)}</Text>
          <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
        <View style={styles.billRight}>
          <Text style={styles.totalAmount}>NPR {item.total.toLocaleString()}</Text>
          <StatusBadge status={item.payment_status} label={item.payment_status === 'paid' ? t('billing.paid') : t('billing.unpaid')} />
        </View>
      </View>

      {/* Services */}
      <View style={styles.separator} />
      {item.items.map((service, idx) => (
        <View key={idx} style={styles.serviceRow}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.servicePrice}>NPR {service.price.toLocaleString()}</Text>
        </View>
      ))}

      {item.payment_status === 'unpaid' && (
        <TouchableOpacity style={styles.markPaidBtn} onPress={() => handleMarkPaid(item)}>
          <Ionicons name="checkmark-circle-outline" size={18} color={Colors.success} />
          <Text style={styles.markPaidText}>{t('billing.markPaid')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const handleDownloadReport = async (title: string, data: Bill[]) => {
    try {
      await generateDailyReport(title, data);
    } catch {
      Alert.alert('Error', t('billing.reportError'));
    }
  };

  const renderSectionHeader = ({ section }: { section: { title: string; data: Bill[] } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <TouchableOpacity 
        style={styles.downloadBtn} 
        onPress={() => handleDownloadReport(section.title, section.data)}
      >
        <Ionicons name="download-outline" size={18} color={Colors.primary} />
        <Text style={styles.downloadText}>{t('billing.downloadReport')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.screen}>
      <Header
        title={t('billing.title')}
        showLangToggle
        rightElement={
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddBill')}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        }
      />

      <SectionList
        sections={groupedBills}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        SectionSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={64} color={Colors.border} />
            <Text style={styles.emptyText}>
              {loading ? t('loading') : t('billing.noBills')}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.xl, paddingBottom: Spacing.huge },

  billCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  billTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  billLeft: { flex: 1 },
  patientName: { ...Typography.bodyLG, fontWeight: '700', color: Colors.textPrimary },
  billId: { ...Typography.caption, color: Colors.textMuted, marginTop: 2, fontFamily: 'monospace' },
  date: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  billRight: { alignItems: 'flex-end', gap: Spacing.xs },
  totalAmount: { ...Typography.h3, color: Colors.textPrimary, fontWeight: '800' },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    marginTop: Spacing.sm,
  },
  sectionTitle: { ...Typography.h2, color: Colors.textPrimary },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    gap: Spacing.xs,
  },
  downloadText: { ...Typography.labelSM, color: Colors.primary },

  separator: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  serviceName: { ...Typography.bodyMD, color: Colors.textSecondary },
  servicePrice: { ...Typography.labelMD, color: Colors.textPrimary },

  markPaidBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    backgroundColor: Colors.successLight,
    padding: Spacing.md,
    borderRadius: Radius.md,
    justifyContent: 'center',
  },
  markPaidText: { ...Typography.labelMD, color: Colors.success },

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
});
