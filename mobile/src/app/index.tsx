import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { Screen } from '@/components/Screen';
import { StatusBadge } from '@/components/StatusBadge';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function HomeScreen() {
  const { colors, spacing, fontSize } = useAppTheme();

  return (
    <Screen>
      <Text style={[styles.eyebrow, { color: colors.primary }]}>CARLOG PRO MOBILE</Text>
      <Text style={[styles.title, { color: colors.text, fontSize: fontSize.display }]}>Design system</Text>
      <Text style={[styles.description, { color: colors.mutedText, fontSize: fontSize.bodyLarge }]}>Base visuelle prête pour votre application de gestion de flotte.</Text>
      <View style={{ height: spacing.xxl }} />
      <AppCard>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Renault Mégane</Text>
        <Text style={[styles.cardText, { color: colors.mutedText }]}>FF-069-VC · 48 230 km</Text>
        <View style={{ height: spacing.md }} />
        <StatusBadge status="En circulation" />
      </AppCard>
      <View style={{ height: spacing.lg }} />
      <AppCard highlighted>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Action rapide</Text>
        <Text style={[styles.cardText, { color: colors.mutedText }]}>Teste les composants, les couleurs et le mode sombre.</Text>
        <View style={{ height: spacing.lg }} />
        <AppButton label="Enregistrer un plein" onPress={() => undefined} />
        <View style={{ height: spacing.sm }} />
        <AppButton label="Voir les véhicules" variant="secondary" onPress={() => undefined} />
      </AppCard>
      <View style={{ height: spacing.lg }} />
      <AppButton label="Action indisponible" variant="danger" disabled onPress={() => undefined} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1.4, marginTop: 8 },
  title: { fontWeight: '800', marginTop: 8 },
  description: { lineHeight: 24, marginTop: 8 },
  cardTitle: { fontSize: 18, fontWeight: '800' },
  cardText: { fontSize: 14, marginTop: 4 },
});
