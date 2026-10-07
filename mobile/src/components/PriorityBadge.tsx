import { StyleSheet, Text, View } from 'react-native';
import type { AlertPriority } from '@/data/alerts';
import { useAppTheme } from '@/hooks/useAppTheme';

export function PriorityBadge({ priority }: { priority: AlertPriority }) {
  const { colors, radius, spacing } = useAppTheme();
  const style = {
    Information: { backgroundColor: colors.infoSoft, color: colors.info },
    Moyenne: { backgroundColor: colors.warningSoft, color: colors.warning },
    Élevée: { backgroundColor: colors.dangerSoft, color: colors.danger },
    Critique: { backgroundColor: colors.danger, color: '#FFFFFF' },
  }[priority];
  return <View accessibilityLabel={`Priorité : ${priority}`} style={[styles.badge, { backgroundColor: style.backgroundColor, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs }]}><Text style={[styles.text, { color: style.color }]}>{priority}</Text></View>;
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start' },
  text: { fontSize: 12, fontWeight: '800' },
});
