import { useColorScheme } from 'react-native';

import { Theme, type ThemeMode } from '@/constants/theme';

export function useAppTheme() {
  const systemTheme = useColorScheme();
  const mode: ThemeMode = systemTheme === 'dark' ? 'dark' : 'light';

  return {
    mode,
    colors: Theme[mode],
    spacing: Theme.spacing,
    radius: Theme.radius,
    fontSize: Theme.fontSize,
  };
}
