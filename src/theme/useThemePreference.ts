import { useEffect, useState } from 'react';
import type { ThemePreference } from '../storage/schema';

type ResolvedTheme = 'light' | 'dark';

const QUERY = '(prefers-color-scheme: dark)';

/**
 * Applies the saved theme to <html data-theme="…"> and follows OS changes while
 * the preference is `system`. The whole token set swaps through that attribute,
 * so expanding the theme system later means adding tokens, not touching this.
 */
export function useThemePreference(preference: ThemePreference): ResolvedTheme {
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() =>
    typeof window.matchMedia === 'function' && window.matchMedia(QUERY).matches ? 'dark' : 'light',
  );

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;

    const media = window.matchMedia(QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    setSystemTheme(media.matches ? 'dark' : 'light');
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const resolved: ResolvedTheme = preference === 'system' ? systemTheme : preference;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolved;
    root.style.colorScheme = resolved;
  }, [resolved]);

  return resolved;
}
