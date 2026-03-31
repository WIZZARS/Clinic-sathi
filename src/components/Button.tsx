import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  icon,
}) => {
  const buttonStyles: ViewStyle[] = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    disabled || loading ? styles.disabled : {},
    style || {},
  ];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`textSize_${size}`],
    styles[`textVariant_${variant}`],
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? Colors.primary : Colors.textOnDark}
          size="small"
        />
      ) : (
        <>
          {icon && icon}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    ...Shadows.md,
  },

  // Sizes
  size_sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, minHeight: 44 },
  size_md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, minHeight: 52 },
  size_lg: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xxl, minHeight: 60 },

  // Variants
  variant_primary: { backgroundColor: Colors.primary },
  variant_secondary: { backgroundColor: Colors.secondary },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
    ...({ shadowColor: 'transparent' } as any),
    elevation: 0,
  },
  variant_danger: { backgroundColor: Colors.danger },
  variant_success: { backgroundColor: Colors.success },

  disabled: { opacity: 0.5 },

  // Text
  text: { fontWeight: '700' },
  textSize_sm: { ...Typography.labelSM },
  textSize_md: { ...Typography.labelMD },
  textSize_lg: { ...Typography.labelLG },

  textVariant_primary: { color: Colors.textOnDark },
  textVariant_secondary: { color: Colors.textOnDark },
  textVariant_outline: { color: Colors.primary },
  textVariant_danger: { color: Colors.textOnDark },
  textVariant_success: { color: Colors.textOnDark },
});
