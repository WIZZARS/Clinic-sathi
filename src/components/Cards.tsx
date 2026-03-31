import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color = Colors.primary,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.iconWrapper, { backgroundColor: color + '18' }]}>
        {icon}
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

interface InfoCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export const Card: React.FC<InfoCardProps> = ({ children, style, padding }) => {
  return (
    <View style={[styles.infoCard, padding !== undefined ? { padding } : {}, style]}>
      {children}
    </View>
  );
};

interface StatusBadgeProps {
  status: 'booked' | 'completed' | 'cancelled' | 'no_show' | 'paid' | 'unpaid';
  label: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const colorMap: Record<string, { bg: string; text: string }> = {
    booked: { bg: Colors.primary + '18', text: Colors.primary },
    completed: { bg: Colors.successLight, text: Colors.success },
    cancelled: { bg: Colors.dangerLight, text: Colors.danger },
    no_show: { bg: Colors.warningLight, text: Colors.warning },
    paid: { bg: Colors.successLight, text: Colors.success },
    unpaid: { bg: Colors.dangerLight, text: Colors.danger },
  };

  const colors = colorMap[status] || colorMap.booked;

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.badgeText, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'flex-start',
    ...Shadows.md,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  value: {
    ...Typography.h1,
    marginBottom: Spacing.xs,
  },
  label: {
    ...Typography.bodySM,
    color: Colors.textSecondary,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  badgeText: {
    ...Typography.labelSM,
    fontSize: 12,
  },
});
