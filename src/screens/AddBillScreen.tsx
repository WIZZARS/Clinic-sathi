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
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { billingService } from '../services/billingService';
import { patientsService } from '../services/patientsService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Header } from '../components/Header';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { Patient, BillItem, PaymentStatus } from '../types';
import { useClinic } from '../hooks/useClinic';

export default function AddBillScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { clinicId } = useClinic();

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [items, setItems] = useState<BillItem[]>([{ name: 'Consultation', price: 500 }]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [loading, setLoading] = useState(false);
  const [patientQuery, setPatientQuery] = useState('');
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [showPatientPicker, setShowPatientPicker] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');

  const total = items.reduce((sum, item) => sum + item.price, 0);

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

  const addService = () => {
    if (!newServiceName.trim()) { Alert.alert('Error', 'Enter service name'); return; }
    const price = parseFloat(newServicePrice);
    if (isNaN(price) || price <= 0) { Alert.alert('Error', 'Enter a valid price'); return; }
    setItems([...items, { name: newServiceName.trim(), price }]);
    setNewServiceName('');
    setNewServicePrice('');
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleCreate = async () => {
    if (!selectedPatient) { Alert.alert('Error', 'Please select a patient'); return; }
    if (items.length === 0) { Alert.alert('Error', 'Add at least one service'); return; }

    setLoading(true);
    const { error } = await billingService.create({
      patient_id: selectedPatient.id,
      items,
      total,
      payment_status: paymentStatus,
      clinic_id: clinicId!,
    });

    if (error) {
      Alert.alert('Error', 'Failed to create bill. Please try again.');
    } else {
      Alert.alert('✅ Bill Created', `Bill of NPR ${total.toLocaleString()} created for ${selectedPatient.full_name}`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
    setLoading(false);
  };

  return (
    <View style={styles.screen}>
      <Header title={t('billing.newBill')} showBack onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {/* Patient Selector */}
          <Text style={styles.label}>{t('billing.selectPatient')}</Text>
          <TouchableOpacity style={styles.selectorBtn} onPress={() => { setShowPatientPicker(true); searchPatients(''); }}>
            <Ionicons name="person-outline" size={20} color={Colors.textMuted} />
            <Text style={[styles.selectorText, selectedPatient && { color: Colors.textPrimary }]}>
              {selectedPatient ? `${selectedPatient.full_name} (${selectedPatient.patient_id})` : t('billing.selectPatient')}
            </Text>
            <Ionicons name="chevron-down" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Services List */}
          <Text style={styles.label}>{t('billing.addService')}</Text>
          {items.map((item, idx) => (
            <View key={idx} style={styles.serviceRow}>
              <Text style={styles.serviceName}>{item.name}</Text>
              <Text style={styles.servicePrice}>NPR {item.price.toLocaleString()}</Text>
              <TouchableOpacity onPress={() => removeItem(idx)} style={styles.removeBtn}>
                <Ionicons name="close-circle" size={22} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add Service Form */}
          <View style={styles.addServiceRow}>
            <View style={styles.serviceNameInput}>
              <Input
                value={newServiceName}
                onChangeText={setNewServiceName}
                placeholder={t('billing.serviceName')}
              />
            </View>
            <View style={styles.servicePriceInput}>
              <Input
                value={newServicePrice}
                onChangeText={setNewServicePrice}
                placeholder="NPR"
                keyboardType="numeric"
              />
            </View>
            <TouchableOpacity style={styles.addServiceBtn} onPress={addService}>
              <Ionicons name="add-circle" size={44} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t('billing.totalAmount')}</Text>
            <Text style={styles.totalValue}>NPR {total.toLocaleString()}</Text>
          </View>

          {/* Payment Status */}
          <Text style={styles.label}>{t('billing.paymentStatus')}</Text>
          <View style={styles.paymentRow}>
            {(['paid', 'unpaid'] as PaymentStatus[]).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.paymentChip, paymentStatus === s && (s === 'paid' ? styles.paidActive : styles.unpaidActive)]}
                onPress={() => setPaymentStatus(s)}
              >
                <Ionicons
                  name={s === 'paid' ? 'checkmark-circle' : 'time-outline'}
                  size={20}
                  color={paymentStatus === s ? '#fff' : Colors.textSecondary}
                />
                <Text style={[styles.paymentChipText, paymentStatus === s && { color: '#fff' }]}>
                  {s === 'paid' ? t('billing.paid') : t('billing.unpaid')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button title={t('billing.createBillButton')} onPress={handleCreate} loading={loading} size="lg" style={styles.submitBtn} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Patient Picker Modal */}
      <Modal visible={showPatientPicker} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('billing.selectPatient')}</Text>
            <TouchableOpacity onPress={() => setShowPatientPicker(false)}>
              <Ionicons name="close" size={26} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <Input value={patientQuery} onChangeText={searchPatients} placeholder={t('patients.searchPlaceholder')} leftIcon="search-outline" />
          <FlatList
            data={patientResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.patientRow}
                onPress={() => { setSelectedPatient(item); setShowPatientPicker(false); setPatientQuery(''); setPatientResults([]); }}
              >
                <View style={styles.patientAvatar}>
                  <Text style={styles.avatarText}>{item.full_name.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={styles.pName}>{item.full_name}</Text>
                  <Text style={styles.pMeta}>{item.patient_id} • {item.phone}</Text>
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
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, minHeight: 56,
    gap: Spacing.sm, marginBottom: Spacing.lg,
  },
  selectorText: { flex: 1, ...Typography.bodyLG, color: Colors.textMuted },

  serviceRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceHover, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.sm,
  },
  serviceName: { flex: 1, ...Typography.bodyMD, color: Colors.textPrimary },
  servicePrice: { ...Typography.labelMD, color: Colors.primary },
  removeBtn: { padding: Spacing.xs },

  addServiceRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  serviceNameInput: { flex: 2 },
  servicePriceInput: { flex: 1 },
  addServiceBtn: { marginTop: -Spacing.lg },

  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.primary + '10', borderRadius: Radius.md,
    padding: Spacing.lg, marginBottom: Spacing.lg,
  },
  totalLabel: { ...Typography.h3, color: Colors.textPrimary },
  totalValue: { ...Typography.h1, color: Colors.primary, fontWeight: '800' },

  paymentRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  paymentChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  paidActive: { backgroundColor: Colors.success, borderColor: Colors.success },
  unpaidActive: { backgroundColor: Colors.danger, borderColor: Colors.danger },
  paymentChipText: { ...Typography.labelMD, color: Colors.textSecondary },

  submitBtn: { marginTop: Spacing.sm },

  modal: { flex: 1, backgroundColor: Colors.background, padding: Spacing.xl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  modalTitle: { ...Typography.h2, color: Colors.textPrimary },
  patientRow: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.lg,
    backgroundColor: Colors.surface, borderRadius: Radius.md, marginBottom: Spacing.sm,
    gap: Spacing.md, ...Shadows.sm,
  },
  patientAvatar: { width: 44, height: 44, borderRadius: Radius.full, backgroundColor: Colors.primary + '20', justifyContent: 'center', alignItems: 'center' },
  avatarText: { ...Typography.h3, color: Colors.primary },
  pName: { ...Typography.bodyLG, fontWeight: '600', color: Colors.textPrimary },
  pMeta: { ...Typography.bodySM, color: Colors.textSecondary },
});
