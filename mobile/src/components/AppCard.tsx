import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

type AppCardProps = PropsWithChildren<{ highlighted?: boolean }>;

export function AppCard({ children, highlighted = false }: AppCardProps) {
  const { colors, radius, spacing } = useAppTheme();
  return <View style={[styles.card, { backgroundColor: colors.surface, borderColor: highlighted ? colors.primary : colors.border, borderRadius: radius.lg, padding: spacing.lg }]}>{children}</View>;
}

const styles = StyleSheet.create({ card: { borderWidth: 1 } });
