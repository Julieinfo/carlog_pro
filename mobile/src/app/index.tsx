import { Href, Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function IndexScreen() {
  const { user } = useAuth();
  const destination: Href = user ? '/(tabs)' : '/(auth)/connexion';
  return <Redirect href={destination} />;
}
