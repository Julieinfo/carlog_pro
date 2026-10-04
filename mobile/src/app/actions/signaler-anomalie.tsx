import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { Screen } from '@/components/Screen';
import { useAppTheme } from '@/hooks/useAppTheme';
export default function SignalerAnomalieScreen() { const [saved, setSaved] = useState(false); const { colors, radius, spacing } = useAppTheme(); return <Screen><Text style={[styles.title, { color: colors.text }]}>Signaler une anomalie</Text><Text style={[styles.detail, { color: colors.mutedText }]}>Véhicule concerné : Renault Mégane</Text><TextInput multiline placeholder="Décrivez le problème observé" placeholderTextColor={colors.mutedText} style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, color: colors.text, marginTop: spacing.xl }]} />{saved ? <Text style={[styles.success, { color: colors.success }]}>Anomalie signalée avec succès.</Text> : <AppButton label="Signaler l’anomalie" onPress={() => setSaved(true)} />}{saved && <AppButton label="Retour aux actions" variant="secondary" onPress={() => router.replace('/(tabs)/actions')} />}</Screen>; }
const styles = StyleSheet.create({ title: { fontSize: 28, fontWeight: '800', marginTop: 8 }, detail: { fontSize: 15, marginTop: 8 }, input: { borderWidth: 1, minHeight: 140, padding: 16, textAlignVertical: 'top' }, success: { fontSize: 16, fontWeight: '700', marginVertical: 20 } });
