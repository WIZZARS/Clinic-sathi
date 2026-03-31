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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { patientsService } from '../services/patientsService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Header } from '../components/Header';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { Gender } from '../types';
import { useClinic } from '../hooks/useClinic';

export default function AddPatientScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { clinicId } = useClinic();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!phone.trim()) e.phone = 'Phone number is required';
    else if (!/^[0-9]{10}$/.test(phone.trim())) e.phone = 'Phone number must be exactly 10 digits';
    if (!age.trim()) e.age = 'Age is required';
    else if (isNaN(Number(age)) || Number(age) <= 0 || Number(age) > 120) e.age = 'Enter a valid age';
    if (!address.trim()) e.address = 'Address is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    const { data, error } = await patientsService.create({
      full_name: fullName.trim(),
      phone: phone.trim(),
      age: Number(age),
      gender,
      address: address.trim(),
      clinic_id: clinicId!,
    });

    if (error) {
      Alert.alert('Error', 'Failed to register patient. Please try again.');
    } else {
      Alert.alert(
        '✅ Patient Registered',
        `Patient ID: ${data?.patient_id}\n${fullName} has been successfully registered.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    }
    setLoading(false);
  };

  const genders: Gender[] = ['male', 'female', 'other'];
  const genderLabels: Record<Gender, string> = {
    male: t('patients.male'),
    female: t('patients.female'),
    other: t('patients.other'),
  };

  return (
    <View style={styles.screen}>
      <Header
        title={t('patients.addNew')}
        showBack
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Input
            label={t('patients.fullName')}
            value={fullName}
            onChangeText={setFullName}
            placeholder="e.g. Ram Bahadur Thapa"
            leftIcon="person-outline"
            autoCapitalize="words"
            error={errors.fullName}
          />
          <Input
            label={t('patients.phone')}
            value={phone}
            onChangeText={setPhone}
            placeholder="98XXXXXXXX"
            leftIcon="call-outline"
            keyboardType="phone-pad"
            maxLength={10}
            error={errors.phone}
          />
          <Input
            label={t('patients.age')}
            value={age}
            onChangeText={setAge}
            placeholder="e.g. 35"
            leftIcon="calendar-outline"
            keyboardType="numeric"
            error={errors.age}
          />

          {/* Gender Selector */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('patients.gender')}</Text>
            <View style={styles.genderRow}>
              {genders.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderChip,
                    gender === g && styles.genderChipActive,
                  ]}
                  onPress={() => setGender(g)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.genderChipText,
                      gender === g && styles.genderChipTextActive,
                    ]}
                  >
                    {genderLabels[g]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Input
            label={t('patients.address')}
            value={address}
            onChangeText={setAddress}
            placeholder="e.g. Kathmandu, Bagmati"
            leftIcon="location-outline"
            autoCapitalize="words"
            error={errors.address}
          />

          <Button
            title={t('patients.registerButton')}
            onPress={handleRegister}
            loading={loading}
            size="lg"
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.huge,
  },
  fieldGroup: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    ...Typography.labelMD,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  genderChip: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  genderChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderChipText: {
    ...Typography.labelMD,
    color: Colors.textSecondary,
  },
  genderChipTextActive: {
    color: Colors.textOnDark,
  },
  submitBtn: {
    marginTop: Spacing.lg,
  },
});
