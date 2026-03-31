import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

export default function LoginScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email address';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Login Failed', error.message);
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

        {/* Login Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('auth.loginTitle')}</Text>
          <Text style={styles.cardSubtitle}>{t('auth.loginSubtitle')}</Text>

          <View style={styles.form}>
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
            <Button
              title={t('auth.loginButton')}
              onPress={handleLogin}
              loading={loading}
              size="lg"
              style={styles.loginButton}
            />
          </View>

          {/* Link to Sign Up */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>{t('auth.noAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.footerLink}>{t('auth.signUpLink')}</Text>
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
  loginButton: {
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
