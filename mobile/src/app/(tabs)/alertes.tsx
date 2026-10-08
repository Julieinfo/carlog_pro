import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppCard } from '@/components/AppCard';
import { PriorityBadge } from '@/components/PriorityBadge';
import { Screen } from '@/components/Screen';
import { alerts, type AlertStatus } from '@/data/alerts';
import { useAppTheme } from '@/hooks/useAppTheme';

const filters: ('Toutes' | AlertStatus)[] = ['Toutes', 'Active', 'Traitée'];

export default function AlertesScreen() {
  const { colors, spacing } = useAppTheme();
  const [filter, setFilter] = useState<(typeof filters)[number]>('Toutes');
  const visibleAlerts = useMemo(() => alerts.filter((alert) => filter === 'Toutes' || alert.status === filter), [filter]);
  return <Screen>
    <Text style={[styles.title, { color: colors.text }]}>Alertes</Text>
    <Text style={[styles.description, { color: colors.mutedText }]}>Suivez les événements importants de votre flotte.</Text>
    <View style={styles.filters}>{filters.map((item) => { const selected = item === filter; return <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setFilter(item)} style={[styles.filter, { backgroundColor: selected ? colors.primary : colors.surface, borderColor: selected ? colors.primary : colors.border }]}><Text style={{ color: selected ? '#FFFFFF' : colors.text, fontSize: 13, fontWeight: '800' }}>{item}</Text></Pressable>; })}</View>
    {visibleAlerts.length === 0 ? <View style={styles.empty}><Text style={[styles.emptyTitle, { color: colors.text }]}>Aucune alerte</Text><Text style={[styles.description, { color: colors.mutedText }]}>Aucune alerte ne correspond à ce filtre.</Text></View> : visibleAlerts.map((alert) => <Pressable key={alert.id} onPress={() => router.push({ pathname: '/alertes/[id]', params: { id: alert.id } })} style={({ pressed }) => ({ marginBottom: spacing.md, opacity: pressed ? 0.8 : 1 })}><AppCard highlighted={alert.priority === 'Élevée'}><View style={styles.row}><View style={styles.content}><Text style={[styles.alertTitle, { color: colors.text }]}>{alert.title}</Text><Text style={[styles.description, { color: colors.mutedText }]}>{alert.vehicleName}</Text><Text style={[styles.status, { color: alert.status === 'Active' ? colors.danger : colors.success }]}>{alert.status}</Text></View><PriorityBadge priority={alert.priority} /></View></AppCard></Pressable>)}
  </Screen>;
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', marginTop: 8 },
  description: { fontSize: 14, lineHeight: 21, marginTop: 6 },
  filters: { flexDirection: 'row', gap: 8, marginVertical: 20 },
  filter: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  row: { alignItems: 'flex-start', flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  content: { flex: 1 },
  alertTitle: { fontSize: 16, fontWeight: '800' },
  status: { fontSize: 13, fontWeight: '700', marginTop: 10 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '800' },
});
