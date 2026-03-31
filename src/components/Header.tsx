import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { useTranslation } from 'react-i18next';
import { setStoredLanguage } from '../localization/i18n';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showLangToggle?: boolean;
  rightElement?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  showLangToggle = false,
  rightElement,
}) => {
  const { i18n } = useTranslation();
  const isNepali = i18n.language === 'ne';

  const toggleLanguage = async () => {
    await setStoredLanguage(isNepali ? 'en' : 'ne');
  };

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={26} color={Colors.textPrimary} />
          </TouchableOpacity>
        )}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
      <View style={styles.right}>
        {showLangToggle && (
          <TouchableOpacity onPress={toggleLanguage} style={styles.langButton}>
            <Text style={styles.langText}>{isNepali ? 'EN' : 'नेपाली'}</Text>
          </TouchableOpacity>
        )}
        {rightElement && rightElement}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  backButton: {
    padding: Spacing.xs,
    marginRight: Spacing.xs,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  langButton: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  langText: {
    ...Typography.labelSM,
    color: Colors.primary,
  },
});
