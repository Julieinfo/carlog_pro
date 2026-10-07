import { Href, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';

type FormErrors = { email?: string; password?: string; form?: string };
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function ConnexionScreen() {
  const { signIn } = useAuth();
  const { colors, radius, spacing } = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignIn() {
    const nextErrors: FormErrors = {};
    if (!email.trim()) nextErrors.email = 'Veuillez saisir votre adresse e-mail.';
    else if (!isValidEmail(email.trim())) nextErrors.email = 'Veuillez saisir une adresse e-mail valide.';
    if (!password) nextErrors.password = 'Veuillez saisir votre mot de passe.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await signIn({ email, password });
      router.replace('/(tabs)' as Href);
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : 'Une erreur est survenue. Veuillez réessayer.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const clearFieldError = (field: 'email' | 'password') => {
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={[styles.logo, { color: colors.text }]}>CarLog <Text style={{ color: colors.primary }}>Pro</Text></Text>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>ESPACE ENTREPRISE</Text>
        <Text style={[styles.title, { color: colors.text }]}>Connexion</Text>
        <Text style={[styles.description, { color: colors.mutedText }]}>Accédez à votre espace de gestion de flotte.</Text>
        <Text style={[styles.label, { color: colors.text, marginTop: spacing.xl }]}>Adresse e-mail</Text>
        <TextInput
          accessibilityLabel="Adresse e-mail"
          autoCapitalize="none"
          autoComplete="email"
          editable={!isSubmitting}
          keyboardType="email-address"
          onChangeText={(value) => { setEmail(value); clearFieldError('email'); }}
          placeholder="nom@entreprise.fr"
          placeholderTextColor={colors.mutedText}
          style={[styles.input, { backgroundColor: colors.surface, borderColor: errors.email ? colors.danger : colors.border, borderRadius: radius.md, color: colors.text }]}
          value={email}
        />
        {errors.email ? <Text accessibilityLiveRegion="polite" style={[styles.error, { color: colors.danger }]}>{errors.email}</Text> : null}
        <Text style={[styles.label, { color: colors.text, marginTop: spacing.lg }]}>Mot de passe</Text>
        <View style={[styles.passwordContainer, { backgroundColor: colors.surface, borderColor: errors.password ? colors.danger : colors.border, borderRadius: radius.md }]}>
          <TextInput
            accessibilityLabel="Mot de passe"
            autoComplete="current-password"
            editable={!isSubmitting}
            onChangeText={(value) => { setPassword(value); clearFieldError('password'); }}
            onSubmitEditing={() => void handleSignIn()}
            placeholder="Votre mot de passe"
            placeholderTextColor={colors.mutedText}
            secureTextEntry={!showPassword}
            style={[styles.passwordInput, { color: colors.text }]}
            value={password}
          />
          <Pressable accessibilityLabel={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} accessibilityRole="button" disabled={isSubmitting} onPress={() => setShowPassword((current) => !current)}>
            <Text style={[styles.showPasswordText, { color: colors.primary }]}>{showPassword ? 'Masquer' : 'Afficher'}</Text>
          </Pressable>
        </View>
        {errors.password ? <Text accessibilityLiveRegion="polite" style={[styles.error, { color: colors.danger }]}>{errors.password}</Text> : null}
        <Text accessibilityRole="link" onPress={() => router.push('/(auth)/mot-de-passe-oublie')} style={[styles.link, { color: colors.primary }]}>Mot de passe oublié ?</Text>
        {errors.form ? <Text accessibilityLiveRegion="polite" style={[styles.formError, { backgroundColor: colors.dangerSoft, borderColor: colors.danger, borderRadius: radius.md, color: colors.danger }]}>{errors.form}</Text> : null}
        <View style={{ height: spacing.xl }} />
        <AppButton disabled={isSubmitting} label={isSubmitting ? 'Connexion…' : 'Se connecter'} onPress={() => void handleSignIn()} />
        <Text style={[styles.footer, { color: colors.mutedText }]}>Pas encore de compte ? <Text accessibilityRole="link" onPress={() => router.push('/(auth)/inscription')} style={{ color: colors.primary, fontWeight: '700' }}>Créer un compte</Text></Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  logo: { fontSize: 28, fontWeight: '800', marginBottom: 40 },
  eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  title: { fontSize: 30, fontWeight: '800', marginTop: 8 },
  description: { fontSize: 16, lineHeight: 24, marginTop: 8 },
  label: { fontSize: 14, fontWeight: '700' },
  input: { borderWidth: 1, fontSize: 16, minHeight: 52, marginTop: 8, paddingHorizontal: 16 },
  passwordContainer: { alignItems: 'center', borderWidth: 1, flexDirection: 'row', marginTop: 8, minHeight: 52, paddingLeft: 16 },
  passwordInput: { flex: 1, fontSize: 16, paddingVertical: 14 },
  showPasswordText: { fontSize: 13, fontWeight: '700', paddingHorizontal: 14 },
  error: { fontSize: 13, marginTop: 6 },
  link: { alignSelf: 'flex-end', fontSize: 14, fontWeight: '700', marginTop: 8 },
  formError: { borderWidth: 1, fontSize: 13, marginTop: 16, padding: 12 },
  footer: { fontSize: 14, marginTop: 24, textAlign: 'center' },
});
