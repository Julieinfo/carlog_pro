import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';

function RootNavigator() {
  const { mode } = useAppTheme();
  return <><StatusBar style={mode === 'dark' ? 'light' : 'dark'} /><Stack screenOptions={{ headerShown: false }} /></>;
}

export default function RootLayout() {
  return <AuthProvider><RootNavigator /></AuthProvider>;
}
