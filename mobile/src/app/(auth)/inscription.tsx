import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { Screen } from '@/components/Screen';
import { useAppTheme } from '@/hooks/useAppTheme';
export default function InscriptionScreen() { const { colors } = useAppTheme(); return <Screen><View style={styles.container}><Text style={[styles.eyebrow, { color: colors.primary }]}>CARLOG PRO</Text><Text style={[styles.title, { color: colors.text }]}>Créer un compte entreprise</Text><Text style={[styles.description, { color: colors.mutedText }]}>L’inscription complète sera ajoutée avec l’authentification réelle. Pour le moment, utilisez la démonstration.</Text><AppButton label="Retour à la connexion" variant="secondary" onPress={() => router.replace('/(auth)/connexion')} /></View></Screen>; }
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center' }, eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2 }, title: { fontSize: 28, fontWeight: '800', marginTop: 8 }, description: { fontSize: 16, lineHeight: 24, marginBottom: 24, marginTop: 10 } });
