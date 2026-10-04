import { Href, router } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function ConnexionScreen() {
  const { signIn } = useAuth(); const { colors, radius, spacing } = useAppTheme();
  return <Screen><View style={styles.container}>
    <Text style={[styles.logo, { color: colors.text }]}>CarLog <Text style={{ color: colors.primary }}>Pro</Text></Text>
    <Text style={[styles.eyebrow, { color: colors.primary }]}>ESPACE ENTREPRISE</Text>
    <Text style={[styles.title, { color: colors.text }]}>Connexion</Text>
    <Text style={[styles.description, { color: colors.mutedText }]}>Accédez à votre espace de gestion de flotte.</Text>
    <Text style={[styles.label, { color: colors.text, marginTop: spacing.xxl }]}>Adresse e-mail</Text>
    <TextInput accessibilityLabel="Adresse e-mail" autoCapitalize="none" keyboardType="email-address" placeholder="nom@entreprise.fr" placeholderTextColor={colors.mutedText} style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, color: colors.text }]} />
    <Text style={[styles.label, { color: colors.text, marginTop: spacing.lg }]}>Mot de passe</Text>
    <TextInput accessibilityLabel="Mot de passe" secureTextEntry placeholder="Votre mot de passe" placeholderTextColor={colors.mutedText} style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, color: colors.text }]} />
    <Text accessibilityRole="link" onPress={() => router.push('/(auth)/mot-de-passe-oublie')} style={[styles.link, { color: colors.primary }]}>Mot de passe oublié ?</Text>
    <View style={{ height: spacing.xl }} /><AppButton label="Se connecter" onPress={() => { signIn(); router.replace('/(tabs)' as Href); }} />
    <Text style={[styles.footer, { color: colors.mutedText }]}>Pas encore de compte ? <Text accessibilityRole="link" onPress={() => router.push('/(auth)/inscription')} style={{ color: colors.primary, fontWeight: '700' }}>Créer un compte</Text></Text>
    <Text style={[styles.demo, { color: colors.mutedText }]}>Démonstration portfolio : utilisez uniquement des données fictives.</Text>
  </View></Screen>;
}
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center' }, logo: { fontSize: 28, fontWeight: '800', marginBottom: 48 }, eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2 }, title: { fontSize: 30, fontWeight: '800', marginTop: 8 }, description: { fontSize: 16, lineHeight: 24, marginTop: 8 }, label: { fontSize: 14, fontWeight: '700' }, input: { borderWidth: 1, fontSize: 16, minHeight: 52, marginTop: 8, paddingHorizontal: 16 }, link: { fontSize: 14, fontWeight: '700', marginTop: 8, textAlign: 'right' }, footer: { fontSize: 14, marginTop: 24, textAlign: 'center' }, demo: { fontSize: 12, marginTop: 32, textAlign: 'center' } });
