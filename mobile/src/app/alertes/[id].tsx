import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { Screen } from '@/components/Screen';
import { useAppTheme } from '@/hooks/useAppTheme';
const alerts: Record<string, { title: string; vehicle: string; priority: string }> = { essence: { title: 'Mettre de l’essence', vehicle: 'Renault Mégane', priority: 'Moyenne' }, controle: { title: 'Contrôle technique à prévoir', vehicle: 'Fiat Panda', priority: 'Élevée' }, entretien: { title: 'Entretien annuel validé', vehicle: 'Toyota Aygo', priority: 'Information' } };
export default function AlerteDetailScreen() { const { id } = useLocalSearchParams<{ id: string }>(); const alert = alerts[id || 'essence'] || alerts.essence; const { colors, spacing } = useAppTheme(); return <Screen><Text style={[styles.title, { color: colors.text }]}>{alert.title}</Text><AppCard><Text style={[styles.detail, { color: colors.mutedText }]}>Véhicule : {alert.vehicle}</Text><Text style={[styles.detail, { color: colors.mutedText }]}>Priorité : {alert.priority}</Text><Text style={[styles.detail, { color: colors.mutedText }]}>Cette alerte est issue des données de démonstration.</Text></AppCard><Text style={{ height: spacing.lg }} /><AppButton label="Marquer comme traitée" onPress={() => router.back()} /></Screen>; }
const styles = StyleSheet.create({ title: { fontSize: 28, fontWeight: '800', marginBottom: 20, marginTop: 8 }, detail: { fontSize: 15, lineHeight: 24, marginTop: 8 } });
