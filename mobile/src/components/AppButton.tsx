import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

type ButtonVariant = 'primary' | 'secondary' | 'danger';
type AppButtonProps = { label: string; onPress?: () => void; variant?: ButtonVariant; loading?: boolean; disabled?: boolean };

export function AppButton({ label, onPress, variant = 'primary', loading = false, disabled = false }: AppButtonProps) {
  const { colors, radius, spacing } = useAppTheme();
  const isDisabled = disabled || loading;
  const buttonColors = {
    primary: { background: colors.primary, pressed: colors.primaryPressed, text: '#FFFFFF', border: colors.primary },
    secondary: { background: colors.surface, pressed: colors.surfaceMuted, text: colors.text, border: colors.border },
    danger: { background: colors.danger, pressed: colors.danger, text: '#FFFFFF', border: colors.danger },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, {
        backgroundColor: isDisabled ? colors.disabled : pressed ? buttonColors.pressed : buttonColors.background,
        borderColor: isDisabled ? colors.disabled : buttonColors.border,
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
      }]}
    >
      {loading ? <ActivityIndicator color={buttonColors.text} /> : <Text style={[styles.label, { color: isDisabled ? colors.disabledText : buttonColors.text }]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', borderWidth: 1, justifyContent: 'center', minHeight: 48 },
  label: { fontSize: 16, fontWeight: '700' },
});
