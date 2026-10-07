import { Href, Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function IndexScreen() {
  const { user, isLoading } = useAuth();
  const { colors } = useAppTheme();

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.logo, { color: colors.text }]}>
          CarLog <Text style={{ color: colors.primary }}>Pro</Text>
        </Text>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={[styles.loadingText, { color: colors.mutedText }]}>
          Chargement sécurisé…
        </Text>
      </View>
    );
  }

  const destination: Href = user ? '/(tabs)' : '/(auth)/connexion';
  return <Redirect href={destination} />;
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 30, fontWeight: '800', marginBottom: 24 },
  loadingText: { fontSize: 14, marginTop: 14 },
});
