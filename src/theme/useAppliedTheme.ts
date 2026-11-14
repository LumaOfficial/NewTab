import { useEffect, useMemo, useState } from 'react';
import type { DashboardSettings, CustomTheme } from '../storage/schema';
import { buildThemeVariables, resolvePalette } from './themes';

type ResolvedTheme = 'light' | 'dark';

const QUERY = '(prefers-color-scheme: dark)';

/**
 * Applies a workspace's theme to <html> as CSS variables.
 *
 * Every visual token — palette, accent, font, radius, surface transparency,
 * blur, density and motion speed — is written here, so components never need
 * to know which theme is active. Custom themes resolve through the same path.
 */
export function useAppliedTheme(settings: DashboardSettings, customThemes: CustomTheme[]): ResolvedTheme {
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

  const resolved: ResolvedTheme = settings.theme === 'system' ? systemTheme : settings.theme;

  useEffect(() => {
    const root = document.documentElement;

    root.dataset.theme = resolved;
    root.style.colorScheme = resolved;

    const vars = buildThemeVariables({
      themeId: settings.themeId,
      mode: resolved,
      customThemes,
      accentColor: settings.surface.accentColor,
      textColor: settings.typography.textColor,
      font: settings.typography.font,
      customFont: settings.typography.customFont,
      fontSize: settings.typography.size,
      widgetOpacity: settings.surface.opacity,
      widgetBlur: settings.surface.blur,
      radius: settings.surface.radius,
      shadow: settings.surface.shadow,
      animation: settings.accessibility.reducedMotion ? 'none' : settings.motion.animation,
      density: settings.motion.density,
      colorBlindSafe: settings.accessibility.colorBlindSafe,
    });

    for (const [name, value] of Object.entries(vars)) {
      root.style.setProperty(name, value);
    }

    root.dataset.contrast = settings.accessibility.highContrast ? 'high' : 'normal';
    root.dataset.textSpacing = settings.accessibility.textSpacing;
    root.dataset.largeText = settings.accessibility.largeText ? 'true' : 'false';
    root.dataset.motion = settings.accessibility.reducedMotion
      ? 'reduced'
      : settings.motion.animation;
    root.dataset.density = settings.motion.density;
    root.style.fontSize = `${settings.typography.size + (settings.accessibility.largeText ? 2 : 0)}px`;
  }, [resolved, settings, customThemes]);

  return resolved;
}

/** The palette currently painted, for previews that need real colours. */
export function useThemePreviewPalette(
  themeId: string,
  mode: 'light' | 'dark',
  customThemes: CustomTheme[],
) {
  return useMemo(() => resolvePalette(themeId, mode, customThemes), [themeId, mode, customThemes]);
}
