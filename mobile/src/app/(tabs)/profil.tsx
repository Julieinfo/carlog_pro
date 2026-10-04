import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
export default function ProfilScreen() { const { user, signOut } = useAuth(); const { colors, spacing } = useAppTheme(); return <Screen><Text style={[styles.title, { color: colors.text }]}>Profil</Text><AppCard><Text style={[styles.name, { color: colors.text }]}>{user?.firstName} {user?.lastName}</Text><Text style={[styles.detail, { color: colors.mutedText }]}>{user?.role}</Text><Text style={[styles.detail, { color: colors.mutedText }]}>{user?.email}</Text></AppCard><View style={{ height: spacing.lg }} /><AppButton label="Préférences" variant="secondary" onPress={() => router.push('/preferences')} /><View style={{ height: spacing.sm }} /><AppButton label="Se déconnecter" variant="danger" onPress={() => { signOut(); router.replace('/(auth)/connexion'); }} /></Screen>; }
const styles = StyleSheet.create({ title: { fontSize: 28, fontWeight: '800', marginTop: 8, marginBottom: 20 }, name: { fontSize: 20, fontWeight: '800' }, detail: { fontSize: 14, marginTop: 6 } });
