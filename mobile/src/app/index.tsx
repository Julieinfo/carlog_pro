import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>
        CarLog <Text style={styles.logoAccent}>Pro</Text>
      </Text>
      <Text style={styles.title}>Mobile est prêt</Text>
      <Text style={styles.description}>Votre flotte, partout avec vous.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  logo: { marginBottom: 28, color: '#0F172A', fontSize: 28, fontWeight: '800' },
  logoAccent: { color: '#DC2626' },
  title: { color: '#0F172A', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  description: { marginTop: 10, color: '#475569', fontSize: 16, textAlign: 'center' },
});
