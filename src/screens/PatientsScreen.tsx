import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { patientsService } from '../services/patientsService';
import { Header } from '../components/Header';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';
import { Patient } from '../types';
import { useClinic } from '../hooks/useClinic';

export default function PatientsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { clinicId } = useClinic();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadPatients = useCallback(async () => {
    if (!clinicId) return;
    setLoading(true);
    const { data } = query.trim()
      ? await patientsService.search(clinicId, query.trim())
      : await patientsService.getAll(clinicId);
    setPatients(data);
    setLoading(false);
  }, [query, clinicId]);

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(loadPatients, 300);
      return () => clearTimeout(timer);
    }, [loadPatients])
  );

  const renderItem = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      style={styles.patientCard}
      onPress={() => navigation.navigate('PatientDetail', { patient: item })}
      activeOpacity={0.8}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.full_name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.full_name}</Text>
        <Text style={styles.phone}>
          <Ionicons name="call-outline" size={13} color={Colors.textSecondary} /> {item.phone}
        </Text>
        <Text style={styles.meta}>
          {item.gender.charAt(0).toUpperCase() + item.gender.slice(1)}, {item.age} yrs • {item.address}
        </Text>
      </View>
      <View style={styles.idBadge}>
        <Text style={styles.idText}>{item.patient_id}</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <Header
        title={t('patients.title')}
        showLangToggle
        rightElement={
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddPatient')}
          >
            <Ionicons name="person-add" size={20} color="#fff" />
          </TouchableOpacity>
        }
      />

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('patients.searchPlaceholder')}
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={patients}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={64} color={Colors.border} />
            <Text style={styles.emptyText}>
              {loading ? t('loading') : t('patients.noPatients')}
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

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    margin: Spacing.xl,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.bodyLG,
    color: Colors.textPrimary,
  },

  list: {
    padding: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.huge,
  },

  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...Typography.h2,
    color: Colors.primary,
  },
  info: { flex: 1 },
  name: { ...Typography.bodyLG, fontWeight: '700', color: Colors.textPrimary },
  phone: { ...Typography.bodySM, color: Colors.textSecondary, marginTop: 2 },
  meta: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },

  idBadge: { alignItems: 'center' },
  idText: { ...Typography.caption, color: Colors.primary, fontWeight: '600', marginBottom: 2 },

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
