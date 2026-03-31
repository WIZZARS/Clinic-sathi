import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

export default function SignUpScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [clinicName, setClinicName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    clinicName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!clinicName.trim()) newErrors.clinicName = t('auth.clinicNameRequired');
    if (!email.trim()) newErrors.email = t('auth.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = t('auth.emailInvalid');
    if (!password) newErrors.password = t('auth.passwordRequired');
    else if (password.length < 6) newErrors.password = t('auth.passwordMin');
    if (!confirmPassword) newErrors.confirmPassword = t('auth.confirmPasswordRequired');
    else if (password !== confirmPassword) newErrors.confirmPassword = t('auth.passwordMismatch');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          clinic_name: clinicName,
        },
      },
    });
    if (error) {
      Alert.alert(t('auth.signUpFailed'), error.message);
    } else {
      Alert.alert(
        t('auth.signUpSuccess'),
        t('auth.signUpSuccessMessage'),
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Logo / Branding */}
        <View style={styles.heroSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🏥</Text>
          </View>
          <Text style={styles.brandName}>{t('appName')}</Text>
          <Text style={styles.tagline}>Nepal Clinic Management</Text>
        </View>

        {/* Sign Up Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('auth.signUpTitle')}</Text>
          <Text style={styles.cardSubtitle}>{t('auth.signUpSubtitle')}</Text>

          <View style={styles.form}>
            <Input
              label={t('auth.clinicName')}
              value={clinicName}
              onChangeText={setClinicName}
              autoCapitalize="words"
              leftIcon="business-outline"
              placeholder={t('auth.clinicNamePlaceholder')}
              error={errors.clinicName}
            />
            <Input
              label={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
              placeholder="clinic@example.com"
              error={errors.email}
            />
            <Input
              label={t('auth.password')}
              value={password}
              onChangeText={setPassword}
              isPassword
              leftIcon="lock-closed-outline"
              placeholder="••••••••"
              error={errors.password}
            />
            <Input
              label={t('auth.confirmPassword')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              leftIcon="shield-checkmark-outline"
              placeholder="••••••••"
              error={errors.confirmPassword}
            />
            <Button
              title={t('auth.signUpButton')}
              onPress={handleSignUp}
              loading={loading}
              size="lg"
              style={styles.signUpButton}
            />
          </View>

          {/* Link to Login */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>{t('auth.alreadyHaveAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>{t('auth.loginLink')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: {
    flexGrow: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.lg,
  },
  logoEmoji: {
    fontSize: 48,
  },
  brandName: {
    ...Typography.displayMD,
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    ...Typography.bodyMD,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    ...Shadows.lg,
  },
  cardTitle: {
    ...Typography.h1,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    ...Typography.bodyMD,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxl,
  },
  form: {
    gap: Spacing.xs,
  },
  signUpButton: {
    marginTop: Spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  footerText: {
    ...Typography.bodySM,
    color: Colors.textSecondary,
  },
  footerLink: {
    ...Typography.labelSM,
    color: Colors.primary,
  },
});
