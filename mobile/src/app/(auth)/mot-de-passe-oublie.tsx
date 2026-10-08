import { router } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { Screen } from '@/components/Screen';
import { useAppTheme } from '@/hooks/useAppTheme';
export default function ForgotPasswordScreen() {
  const { colors, radius, spacing } = useAppTheme();
  return <Screen><View style={styles.container}><Text style={[styles.eyebrow, { color: colors.primary }]}>CARLOG PRO</Text><Text style={[styles.title, { color: colors.text }]}>Mot de passe oublié</Text><Text style={[styles.description, { color: colors.mutedText }]}>Saisissez votre adresse e-mail. Un lien de réinitialisation sera envoyé si un compte existe.</Text><TextInput accessibilityLabel="Adresse e-mail de récupération" keyboardType="email-address" placeholder="nom@entreprise.fr" placeholderTextColor={colors.mutedText} style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, color: colors.text }]} /><View style={{ height: spacing.xl }} /><AppButton label="Envoyer le lien" onPress={() => router.replace('/(auth)/connexion')} /><Text accessibilityRole="link" onPress={() => router.back()} style={[styles.link, { color: colors.primary }]}>← Retour à la connexion</Text></View></Screen>;
}
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center' }, eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2 }, title: { fontSize: 28, fontWeight: '800', marginTop: 8 }, description: { fontSize: 16, lineHeight: 24, marginTop: 10 }, input: { borderWidth: 1, fontSize: 16, minHeight: 52, marginTop: 24, paddingHorizontal: 16 }, link: { fontSize: 14, fontWeight: '700', marginTop: 16, textAlign: 'center' } });
