export default function ThemeToggle({ theme, onToggle }) {
  const nextTheme = theme === 'dark' ? 'clair' : 'sombre';

  return (
    <button
      className="btn-theme"
      type="button"
      onClick={onToggle}
      aria-label={`Activer le mode ${nextTheme}`}
      aria-pressed={theme === 'dark'}
    >
      Mode {nextTheme}
    </button>
  );
}
