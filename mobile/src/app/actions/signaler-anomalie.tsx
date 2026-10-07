import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Screen } from '@/components/Screen';
import { vehicles } from '@/data/vehicles';
import { useAppTheme } from '@/hooks/useAppTheme';
import { pickIncidentImage, takeIncidentPhoto } from '@/services/media';

export default function SignalerAnomalieScreen() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId?: string }>();
  const vehicle = vehicles.find((item) => item.id === vehicleId) ?? vehicles[0];
  const { colors, radius, spacing } = useAppTheme();
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState('');
  const [saved, setSaved] = useState(false);

  async function handleMediaAction(action: typeof pickIncidentImage) {
    try {
      setMediaError('');
      const asset = await action();
      if (asset) setImageUri(asset.uri);
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : 'Impossible d’ajouter cette image.');
    }
  }

  if (saved) {
    return <Screen><Text style={[styles.title, { color: colors.text }]}>Anomalie signalée</Text><Text style={[styles.detail, { color: colors.mutedText }]}>Le signalement pour {vehicle.brand} {vehicle.model} a bien été enregistré.</Text><View style={{ height: spacing.xl }} /><AppButton label="Retour aux actions" variant="secondary" onPress={() => router.replace('/(tabs)/actions')} /></Screen>;
  }

  return <Screen>
    <Text style={[styles.title, { color: colors.text }]}>Signaler une anomalie</Text>
    <Text style={[styles.detail, { color: colors.mutedText }]}>Véhicule concerné : {vehicle.brand} {vehicle.model}</Text>
    <TextInput accessibilityLabel="Description de l’anomalie" multiline value={description} onChangeText={setDescription} placeholder="Décrivez le problème observé" placeholderTextColor={colors.mutedText} style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, color: colors.text, marginTop: spacing.xl }]} />
    <Text style={[styles.label, { color: colors.text, marginTop: spacing.lg }]}>Photo facultative</Text>
    <View style={[styles.mediaActions, { marginTop: spacing.sm }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Choisir une photo dans la galerie" onPress={() => void handleMediaAction(pickIncidentImage)} style={[styles.mediaButton, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}><Text style={[styles.mediaButtonText, { color: colors.text }]}>Galerie</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Prendre une photo" onPress={() => void handleMediaAction(takeIncidentPhoto)} style={[styles.mediaButton, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}><Text style={[styles.mediaButtonText, { color: colors.text }]}>Prendre une photo</Text></Pressable>
    </View>
    {imageUri ? <View style={{ marginTop: spacing.md }}><Image accessibilityLabel="Photo jointe au signalement" source={{ uri: imageUri }} style={[styles.preview, { borderRadius: radius.md }]} /><Pressable accessibilityRole="button" accessibilityLabel="Supprimer la photo" onPress={() => setImageUri(null)} style={{ marginTop: spacing.sm }}><Text style={{ color: colors.danger, fontWeight: '800' }}>Supprimer la photo</Text></Pressable></View> : null}
    {mediaError ? <Text accessibilityLiveRegion="polite" style={[styles.error, { color: colors.danger }]}>{mediaError}</Text> : null}
    <View style={{ height: spacing.xl }} />
    <AppButton label="Signaler l’anomalie" onPress={() => setSaved(true)} />
  </Screen>;
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', marginTop: 8 },
  detail: { fontSize: 15, lineHeight: 21, marginTop: 8 },
  label: { fontSize: 14, fontWeight: '700' },
  input: { borderWidth: 1, minHeight: 140, padding: 16, textAlignVertical: 'top' },
  mediaActions: { flexDirection: 'row', gap: 12 },
  mediaButton: { alignItems: 'center', borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 48, paddingHorizontal: 12 },
  mediaButtonText: { fontSize: 14, fontWeight: '800' },
  preview: { height: 220, width: '100%' },
  error: { fontSize: 13, marginTop: 8 },
});
