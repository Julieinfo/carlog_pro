import { StyleSheet, Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { AppCard } from '@/components/AppCard';
import { useAppTheme } from '@/hooks/useAppTheme';
export default function PreferencesScreen() { const { colors } = useAppTheme(); return <Screen><Text style={[styles.title, { color: colors.text }]}>Préférences</Text><AppCard><Text style={[styles.text, { color: colors.text }]}>Mode clair ou sombre</Text><Text style={[styles.detail, { color: colors.mutedText }]}>Le thème suit automatiquement le réglage Android.</Text><Text style={[styles.text, { color: colors.text, marginTop: 20 }]}>Notifications</Text><Text style={[styles.detail, { color: colors.mutedText }]}>Les préférences seront connectées à l’API en phase 4.</Text></AppCard></Screen>; }
const styles = StyleSheet.create({ title: { fontSize: 28, fontWeight: '800', marginBottom: 20, marginTop: 8 }, text: { fontSize: 16, fontWeight: '700' }, detail: { fontSize: 14, marginTop: 6 } });
