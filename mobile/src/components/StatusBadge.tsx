import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

type VehicleStatus = 'Disponible' | 'En circulation' | 'En entretien' | 'Immobilisé';
type StatusBadgeProps = { status: VehicleStatus };

export function StatusBadge({ status }: StatusBadgeProps) {
  const { colors, radius, spacing } = useAppTheme();
  const statusStyle = {
    Disponible: { backgroundColor: colors.successSoft, color: colors.success },
    'En circulation': { backgroundColor: colors.infoSoft, color: colors.info },
    'En entretien': { backgroundColor: colors.warningSoft, color: colors.warning },
    Immobilisé: { backgroundColor: colors.dangerSoft, color: colors.danger },
  }[status];

  return <View accessibilityLabel={`Statut du véhicule : ${status}`} style={[styles.badge, { backgroundColor: statusStyle.backgroundColor, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs }]}><Text style={[styles.label, { color: statusStyle.color }]}>{status}</Text></View>;
}

const styles = StyleSheet.create({ badge: { alignSelf: 'flex-start' }, label: { fontSize: 12, fontWeight: '700' } });
