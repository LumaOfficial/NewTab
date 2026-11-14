/**
 * Built-in theme library and the CSS-variable generator.
 *
 * Themes are data, not stylesheets: a palette plus default surface/background
 * choices. The applied result is written to CSS variables on <html>, so every
 * component keeps using the same tokens and a future theme pack only needs
 * another entry in this list.
 */
import type {
  BackgroundSettings,
  CustomTheme,
  Density,
  FontChoice,
  ThemeCategoryId,
  ThemePreference,
} from '../storage/schema';

export interface ThemePalette {
  bg: string;
  bgGlowA: string;
  bgGlowB: string;
  surfaceRgb: [number, number, number];
  surfaceStrong: string;
  ink: string;
  inkSoft: string;
  inkFaint: string;
  line: string;
  lineStrong: string;
  accentInk: string;
}

export interface BuiltInTheme {
  id: string;
  name: string;
  category: ThemeCategoryId;
  description: string;
  /** Preferred colour mode when the theme is applied. */
  mode: ThemePreference;
  accent: string;
  background: BackgroundSettings;
  /** Typography the theme prefers. */
  font?: FontChoice;
  light: ThemePalette;
  dark: ThemePalette;
}

export const THEME_CATEGORIES: Array<{
  id: ThemeCategoryId;
  label: string;
  description: string;
}> = [
  { id: 'minimal', label: 'Minimal & clean', description: 'Quiet surfaces, generous space.' },
  {
    id: 'futuristic',
    label: 'Futuristic & glassy',
    description: 'Translucent panels and cool light.',
  },
  {
    id: 'colorful',
    label: 'Colorful & playful',
    description: 'Bright accents and friendly shapes.',
  },
  { id: 'nature', label: 'Nature-inspired', description: 'Deep greens, sand and sky.' },
  { id: 'cinematic', label: 'Dark & cinematic', description: 'Low light with a strong accent.' },
  {
    id: 'professional',
    label: 'Professional & elegant',
    description: 'Structured, neutral and precise.',
  },
  { id: 'retro', label: 'Retro & nostalgic', description: 'Warm film tones and old terminals.' },
];

const baseLight = (overrides: Partial<ThemePalette>): ThemePalette => ({
  bg: '#f1efea',
  bgGlowA: 'rgba(116, 96, 255, 0.22)',
  bgGlowB: 'rgba(255, 176, 118, 0.26)',
  surfaceRgb: [255, 255, 255],
  surfaceStrong: '#ffffff',
  ink: '#1b1917',
  inkSoft: '#55514b',
  inkFaint: '#78726a',
  line: 'rgba(28, 25, 23, 0.1)',
  lineStrong: 'rgba(28, 25, 23, 0.2)',
  accentInk: '#ffffff',
  ...overrides,
});

const baseDark = (overrides: Partial<ThemePalette>): ThemePalette => ({
  bg: '#0d0e13',
  bgGlowA: 'rgba(124, 104, 255, 0.28)',
  bgGlowB: 'rgba(255, 138, 92, 0.14)',
  surfaceRgb: [27, 29, 38],
  surfaceStrong: '#181a23',
  ink: '#f3f1ee',
  inkSoft: '#b6b1aa',
  inkFaint: '#8d877f',
  line: 'rgba(255, 255, 255, 0.1)',
  lineStrong: 'rgba(255, 255, 255, 0.2)',
  accentInk: '#14121f',
  ...overrides,
});

/**
 * Built-in themes paint through their palette (background + glows), so they
 * work in both light and dark mode. A theme only suggests concrete background
 * settings for the user to start from; switching colour mode never leaves a
 * light gradient behind dark surfaces.
 */
function background(_kind: BackgroundSettings['kind'], from: string, to: string): BackgroundSettings {
  return {
    kind: 'none',
    color: from,
    gradientFrom: from,
    gradientTo: to,
    gradientAngle: 140,
    animated: false,
    imageUrl: '',
    videoUrl: '',
    dim: 26,
  };
}

export const BUILT_IN_THEMES: BuiltInTheme[] = [
  {
    id: 'luma-calm',
    name: 'Luma Calm',
    category: 'minimal',
    description: 'The default Luma look: warm paper, soft light, violet accent.',
    mode: 'system',
    accent: '#5b4bd8',
    background: background('none', '#f1efea', '#ffffff'),
    light: baseLight({}),
    dark: baseDark({}),
  },
  {
    id: 'paper',
    name: 'Paper',
    category: 'minimal',
    description: 'Ink on warm paper, with almost no decoration.',
    mode: 'light',
    accent: '#3b3a36',
    background: background('solid', '#f7f4ee', '#f7f4ee'),
    light: baseLight({
      bg: '#f7f4ee',
      bgGlowA: 'rgba(0, 0, 0, 0.04)',
      bgGlowB: 'rgba(0, 0, 0, 0.02)',
      surfaceRgb: [255, 255, 255],
      ink: '#24211c',
      inkSoft: '#5d574e',
      inkFaint: '#847d72',
    }),
    dark: baseDark({ bg: '#171613', surfaceRgb: [32, 30, 26], surfaceStrong: '#201e1a' }),
  },
  {
    id: 'neon-glass',
    name: 'Neon Glass',
    category: 'futuristic',
    description: 'Deep space panels with a cyan and violet glow.',
    mode: 'dark',
    accent: '#5ee7ff',
    background: background('gradient', '#0b1224', '#2b0b3f'),
    light: baseLight({
      bg: '#eef4ff',
      bgGlowA: 'rgba(94, 231, 255, 0.35)',
      bgGlowB: 'rgba(160, 90, 255, 0.25)',
      surfaceRgb: [255, 255, 255],
      ink: '#0b1224',
      accentInk: '#041018',
    }),
    dark: baseDark({
      bg: '#070a14',
      bgGlowA: 'rgba(94, 231, 255, 0.3)',
      bgGlowB: 'rgba(160, 90, 255, 0.26)',
      surfaceRgb: [17, 23, 40],
      surfaceStrong: '#0f1526',
      ink: '#eaf7ff',
      inkSoft: '#9fb3c8',
      inkFaint: '#7488a0',
      line: 'rgba(130, 220, 255, 0.16)',
      lineStrong: 'rgba(130, 220, 255, 0.3)',
      accentInk: '#041018',
    }),
  },
  {
    id: 'aurora',
    name: 'Aurora',
    category: 'futuristic',
    description: 'Northern-light gradients behind frosted panels.',
    mode: 'dark',
    accent: '#8affc1',
    background: background('gradient', '#071b1f', '#1a0b2e'),
    light: baseLight({
      bg: '#eefaf5',
      bgGlowA: 'rgba(88, 224, 168, 0.35)',
      bgGlowB: 'rgba(120, 110, 255, 0.2)',
      ink: '#0c1f1b',
    }),
    dark: baseDark({
      bg: '#061013',
      bgGlowA: 'rgba(88, 224, 168, 0.3)',
      bgGlowB: 'rgba(120, 110, 255, 0.24)',
      surfaceRgb: [14, 30, 30],
      surfaceStrong: '#0c1e1e',
      ink: '#e8fff6',
      inkSoft: '#a3c8ba',
      inkFaint: '#7c9c91',
      accentInk: '#04140f',
    }),
  },
  {
    id: 'confetti',
    name: 'Confetti',
    category: 'colorful',
    description: 'Bright coral and sky blue with a playful bounce.',
    mode: 'light',
    accent: '#ff5d73',
    background: background('gradient', '#fff4e8', '#e9f3ff'),
    light: baseLight({
      bg: '#fff6ec',
      bgGlowA: 'rgba(255, 93, 115, 0.22)',
      bgGlowB: 'rgba(64, 160, 255, 0.22)',
      ink: '#241417',
      inkSoft: '#6b4c52',
      inkFaint: '#94757c',
      accentInk: '#ffffff',
    }),
    dark: baseDark({ bg: '#1a1013', surfaceRgb: [38, 24, 29], surfaceStrong: '#26181d' }),
  },
  {
    id: 'sunny-pop',
    name: 'Sunny Pop',
    category: 'colorful',
    description: 'Warm yellow, tangerine and a confident teal accent.',
    mode: 'light',
    accent: '#0f9d8f',
    background: background('gradient', '#fff3c4', '#ffe1cc'),
    light: baseLight({
      bg: '#fff6d9',
      bgGlowA: 'rgba(255, 178, 62, 0.32)',
      bgGlowB: 'rgba(15, 157, 143, 0.18)',
      ink: '#25301c',
      accentInk: '#ffffff',
    }),
    dark: baseDark({ bg: '#161408' }),
  },
  {
    id: 'forest',
    name: 'Forest',
    category: 'nature',
    description: 'Moss, bark and morning light.',
    mode: 'light',
    accent: '#2f7d4f',
    background: background('gradient', '#e9f2e4', '#f5efe2'),
    light: baseLight({
      bg: '#eef4e8',
      bgGlowA: 'rgba(66, 140, 88, 0.24)',
      bgGlowB: 'rgba(178, 148, 92, 0.2)',
      ink: '#1d2a1f',
      inkSoft: '#4c5a4a',
      inkFaint: '#70806c',
    }),
    dark: baseDark({
      bg: '#0c1410',
      bgGlowA: 'rgba(74, 160, 104, 0.22)',
      bgGlowB: 'rgba(178, 148, 92, 0.14)',
      surfaceRgb: [20, 32, 25],
      surfaceStrong: '#132019',
      ink: '#eaf5ea',
      inkSoft: '#b0c4b2',
      inkFaint: '#819684',
      accentInk: '#04170c',
    }),
  },
  {
    id: 'seabreeze',
    name: 'Sea breeze',
    category: 'nature',
    description: 'Pale sky, driftwood and ocean blue.',
    mode: 'system',
    accent: '#1f6f8b',
    background: background('gradient', '#e8f6fb', '#f3efe6'),
    light: baseLight({
      bg: '#edf7fa',
      bgGlowA: 'rgba(31, 111, 139, 0.2)',
      bgGlowB: 'rgba(224, 190, 140, 0.25)',
      ink: '#12262e',
    }),
    dark: baseDark({
      bg: '#081419',
      surfaceRgb: [16, 32, 38],
      surfaceStrong: '#0e2128',
      accentInk: '#04161c',
    }),
  },
  {
    id: 'midnight-cinema',
    name: 'Midnight Cinema',
    category: 'cinematic',
    description: 'Almost-black panels lit by a single amber accent.',
    mode: 'dark',
    accent: '#ffb257',
    background: background('gradient', '#08090c', '#1b1114'),
    light: baseLight({
      bg: '#f4f1ec',
      ink: '#191614',
      accentInk: '#1b1108',
    }),
    dark: baseDark({
      bg: '#08090c',
      bgGlowA: 'rgba(255, 178, 87, 0.16)',
      bgGlowB: 'rgba(120, 40, 60, 0.22)',
      surfaceRgb: [18, 19, 24],
      surfaceStrong: '#121319',
      ink: '#f6efe6',
      inkSoft: '#b7aca0',
      inkFaint: '#8a7f74',
      accentInk: '#1b1108',
    }),
  },
  {
    id: 'noir',
    name: 'Noir',
    category: 'cinematic',
    description: 'Monochrome, high contrast, one cool highlight.',
    mode: 'dark',
    accent: '#d7e3ff',
    background: background('solid', '#0a0a0c', '#0a0a0c'),
    light: baseLight({ bg: '#f2f2f4', accentInk: '#111420' }),
    dark: baseDark({
      bg: '#08080a',
      bgGlowA: 'rgba(255, 255, 255, 0.05)',
      bgGlowB: 'rgba(120, 150, 255, 0.1)',
      surfaceRgb: [18, 18, 21],
      surfaceStrong: '#131316',
      ink: '#f4f4f6',
      inkSoft: '#b4b4bc',
      inkFaint: '#8a8a93',
      accentInk: '#111420',
    }),
  },
  {
    id: 'executive',
    name: 'Executive',
    category: 'professional',
    description: 'Slate and navy with a confident blue accent.',
    mode: 'system',
    accent: '#2f5fd0',
    background: background('none', '#eef1f6', '#ffffff'),
    light: baseLight({
      bg: '#eef1f6',
      bgGlowA: 'rgba(47, 95, 208, 0.14)',
      bgGlowB: 'rgba(120, 140, 170, 0.12)',
      ink: '#141b2b',
      inkSoft: '#4d5666',
      inkFaint: '#74808f',
    }),
    dark: baseDark({
      bg: '#0b1020',
      surfaceRgb: [20, 27, 44],
      surfaceStrong: '#111829',
      ink: '#eef2fa',
    }),
  },
  {
    id: 'graphite',
    name: 'Graphite',
    category: 'professional',
    description: 'Neutral grey, precise lines, no distraction.',
    mode: 'light',
    accent: '#3f6b5e',
    background: background('solid', '#f0f0ee', '#f0f0ee'),
    light: baseLight({
      bg: '#f0f0ee',
      bgGlowA: 'rgba(0, 0, 0, 0.04)',
      bgGlowB: 'rgba(0, 0, 0, 0.02)',
      ink: '#1e1f1d',
    }),
    dark: baseDark({ bg: '#111211', surfaceRgb: [27, 28, 27], surfaceStrong: '#1a1b1a' }),
  },
  {
    id: 'terminal',
    name: 'Terminal',
    category: 'retro',
    description: 'Green phosphor on black, monospaced throughout.',
    mode: 'dark',
    accent: '#57f287',
    font: 'mono',
    background: background('solid', '#050a06', '#050a06'),
    light: baseLight({
      bg: '#e9f3ea',
      accentInk: '#04150a',
      ink: '#0b1a0f',
    }),
    dark: baseDark({
      bg: '#050a06',
      bgGlowA: 'rgba(87, 242, 135, 0.12)',
      bgGlowB: 'rgba(87, 242, 135, 0.06)',
      surfaceRgb: [10, 22, 13],
      surfaceStrong: '#0a160d',
      ink: '#c8ffd9',
      inkSoft: '#8fd6a5',
      inkFaint: '#69a97c',
      line: 'rgba(87, 242, 135, 0.18)',
      lineStrong: 'rgba(87, 242, 135, 0.32)',
      accentInk: '#04150a',
    }),
  },
  {
    id: 'sunset-80s',
    name: 'Sunset 80s',
    category: 'retro',
    description: 'Dusty pink, teal and a warm grain.',
    mode: 'light',
    accent: '#d94f8a',
    background: background('gradient', '#ffe8df', '#dfe9f5'),
    light: baseLight({
      bg: '#fdf0e6',
      bgGlowA: 'rgba(217, 79, 138, 0.2)',
      bgGlowB: 'rgba(48, 160, 160, 0.18)',
      ink: '#2a1a20',
      inkSoft: '#66505a',
      inkFaint: '#8d7681',
    }),
    dark: baseDark({
      bg: '#160d14',
      surfaceRgb: [34, 22, 30],
      surfaceStrong: '#22161e',
      accentInk: '#1c0710',
    }),
  },
];

export function getBuiltInTheme(id: string): BuiltInTheme {
  return BUILT_IN_THEMES.find((theme) => theme.id === id) ?? BUILT_IN_THEMES[0];
}

export function themesByCategory(category: ThemeCategoryId): BuiltInTheme[] {
  return BUILT_IN_THEMES.filter((theme) => theme.category === category);
}

const FONT_STACKS: Record<string, string> = {
  sans: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  serif: "ui-serif, Georgia, Cambria, 'Times New Roman', serif",
  mono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
  rounded:
    "'Nunito', 'Varela Round', ui-rounded, 'Segoe UI', 'SF Pro Rounded', system-ui, sans-serif",
};

const DENSITY_GAP: Record<Density, string> = {
  compact: '10px',
  cozy: '16px',
  spacious: '24px',
};

const DENSITY_PAD: Record<Density, string> = {
  compact: '14px',
  cozy: '20px',
  spacious: '28px',
};

export interface ThemeApplication {
  resolvedMode: 'light' | 'dark';
  palette: ThemePalette;
}

/** Resolve a theme id (built-in or custom) to the palette it paints. */
export function resolvePalette(
  themeId: string,
  mode: 'light' | 'dark',
  customThemes: CustomTheme[],
): ThemePalette {
  const custom = customThemes.find((theme) => theme.id === themeId);
  const builtIn = getBuiltInTheme(custom?.baseThemeId ?? themeId);
  const palette = mode === 'dark' ? builtIn.dark : builtIn.light;
  if (!custom) return palette;
  return palette;
}

export interface ThemeVariablesInput {
  themeId: string;
  mode: 'light' | 'dark';
  customThemes: CustomTheme[];
  accentColor: string | null;
  textColor: string | null;
  font: string;
  customFont?: string;
  fontSize: number;
  widgetOpacity: number;
  widgetBlur: number;
  radius: number;
  shadow: 'none' | 'soft' | 'strong';
  animation: 'full' | 'subtle' | 'none';
  density: Density;
  colorBlindSafe: boolean;
}

function rgba(rgb: [number, number, number], alpha: number): string {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

export function buildThemeVariables(input: ThemeVariablesInput): { [key: string]: string } {
  const palette = resolvePalette(input.themeId, input.mode, input.customThemes);
  const accent = input.accentColor ?? getBuiltInTheme(input.themeId).accent;
  const surfaceAlpha = Math.min(1, Math.max(0.4, input.widgetOpacity / 100));
  const custom = input.customThemes.find((theme) => theme.id === input.themeId);

  const strongShadow = `0 30px 60px -24px ${rgba(palette.surfaceRgb, 0.6)}`;
  const shadowSet =
    input.shadow === 'none'
      ? { sm: 'none', md: 'none', lg: 'none' }
      : input.shadow === 'strong'
        ? { sm: 'none', md: strongShadow, lg: strongShadow }
        : {
            sm: '0 1px 2px rgba(24, 20, 15, 0.05), 0 2px 10px rgba(24, 20, 15, 0.04)',
            md: '0 14px 32px -14px rgba(24, 20, 15, 0.3)',
            lg: '0 34px 70px -28px rgba(20, 16, 12, 0.4)',
          };

  const speed = input.animation === 'none' ? '0ms' : input.animation === 'subtle' ? '2' : '1';

  const vars: { [key: string]: string } = {
    '--bg': palette.bg,
    '--bg-glow-a': palette.bgGlowA,
    '--bg-glow-b': palette.bgGlowB,
    '--surface': rgba(palette.surfaceRgb, surfaceAlpha),
    '--surface-strong': palette.surfaceStrong,
    '--surface-muted': rgba(hexToRgb(input.textColor ?? palette.ink), 0.06),
    '--surface-hover': rgba(hexToRgb(input.textColor ?? palette.ink), 0.11),
    '--ink': input.textColor ?? palette.ink,
    '--ink-soft': palette.inkSoft,
    '--ink-faint': palette.inkFaint,
    '--line': palette.line,
    '--line-strong': palette.lineStrong,
    '--accent': input.colorBlindSafe ? (input.mode === 'dark' ? '#7cb7ff' : '#1e5fbf') : accent,
    '--accent-ink': palette.accentInk,
    '--accent-soft': rgba(hexToRgb(accent), 0.16),
    '--focus': input.colorBlindSafe ? '#1e5fbf' : accent,
    '--shadow-sm': shadowSet.sm,
    '--shadow-md': shadowSet.md,
    '--shadow-lg': shadowSet.lg,
    '--radius-xs': `${Math.max(0, input.radius - 10)}px`,
    '--radius-sm': `${Math.max(0, input.radius - 6)}px`,
    '--radius-md': `${input.radius}px`,
    '--radius-lg': `${input.radius + 6}px`,
    '--font-sans':
      input.customFont && input.customFont.trim()
        ? `${input.customFont.trim()}, ${FONT_STACKS[input.font] ?? FONT_STACKS.sans}`
        : FONT_STACKS[input.font] ?? FONT_STACKS.sans,
    '--font-base': `${input.fontSize}px`,
    '--card-blur': `${input.widgetBlur}px`,
    '--density-gap': DENSITY_GAP[input.density],
    '--density-pad': DENSITY_PAD[input.density],
    '--motion-fast': input.animation === 'none' ? '0ms' : `${Math.round(120 * Number(speed))}ms`,
    '--motion-base': input.animation === 'none' ? '0ms' : `${Math.round(190 * Number(speed))}ms`,
    '--motion-slow': input.animation === 'none' ? '0ms' : `${Math.round(320 * Number(speed))}ms`,
    '--theme-mode': input.mode,
    '--custom-theme': custom ? '1' : '0',
  };

  return vars;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((char) => char + char)
          .join('')
      : clean;
  const value = Number.parseInt(full, 16);
  if (!Number.isFinite(value)) return [91, 75, 216];
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/** Background CSS for the layer behind the dashboard. */
export function backgroundStyle(background: BackgroundSettings): {
  style: Record<string, string>;
  kind: BackgroundSettings['kind'];
} {
  if (background.kind === 'gradient') {
    return {
      kind: 'gradient',
      style: {
        backgroundImage: `linear-gradient(${background.gradientAngle}deg, ${background.gradientFrom}, ${background.gradientTo})`,
        backgroundSize: background.animated ? '220% 220%' : '100% 100%',
      },
    };
  }

  if (background.kind === 'solid') {
    return { kind: 'solid', style: { backgroundColor: background.color } };
  }

  return { kind: 'none', style: {} };
}
