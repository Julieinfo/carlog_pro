/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const Theme = {
  light: {
    background: '#F6F8FB',
    backgroundElement: '#F1F5F9',
    backgroundSelected: '#E2E8F0',
    surface: '#FFFFFF',
    surfaceMuted: '#F1F5F9',
    text: '#10213D',
    mutedText: '#64748B',
    textSecondary: '#64748B',
    border: '#D9E1EA',
    primary: '#E52525',
    primaryPressed: '#C91F1F',
    primarySoft: '#FEE2E2',
    success: '#16A34A',
    successSoft: '#DCFCE7',
    warning: '#D97706',
    warningSoft: '#FEF3C7',
    danger: '#DC2626',
    dangerSoft: '#FEE2E2',
    info: '#2563EB',
    infoSoft: '#DBEAFE',
    disabled: '#CBD5E1',
    disabledText: '#94A3B8',
  },
  dark: {
    background: '#0B1220',
    backgroundElement: '#19263A',
    backgroundSelected: '#263650',
    surface: '#121C2E',
    surfaceMuted: '#19263A',
    text: '#F8FAFC',
    mutedText: '#A8B5C7',
    textSecondary: '#A8B5C7',
    border: '#2E3E55',
    primary: '#FF4A4A',
    primaryPressed: '#E53939',
    primarySoft: '#4A1D24',
    success: '#4ADE80',
    successSoft: '#153B29',
    warning: '#FBBF24',
    warningSoft: '#4A3511',
    danger: '#F87171',
    dangerSoft: '#4B2028',
    info: '#60A5FA',
    infoSoft: '#172E50',
    disabled: '#334155',
    disabledText: '#7C8A9D',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 },
  radius: { sm: 8, md: 12, lg: 16, pill: 999 },
  fontSize: { caption: 12, body: 14, bodyLarge: 16, subtitle: 18, title: 24, display: 30 },
} as const;

export const Colors = Theme;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type ThemeMode = 'light' | 'dark';
export type AppColors = (typeof Theme)[ThemeMode];

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
