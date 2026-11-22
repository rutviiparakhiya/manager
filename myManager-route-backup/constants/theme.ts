import { Platform } from 'react-native';

/**
 * myManager Brand Color Palette:
 * - Light Mode: Clean mint & crisp white surfaces with vibrant Royal Blue accent (#2563EB)
 * - Dark Mode: Deep Navy surfaces (#18192E / #242646) with luminous Azure Sky Blue accent (#38BDF8)
 */
export const Colors = {
  light: {
    // Primary brand accents (crisp royal blue)
    primary: '#2563EB',
    primaryLight: '#3B82F6',
    tint: '#2563EB',

    // Text hierarchy
    text: '#0F172A', // Deep slate navy
    textSecondary: '#475569', // Medium slate
    textMuted: '#94A3B8', // Muted slate

    // Surfaces & borders
    background: '#F0F9F8', // Soft crisp mint canvas
    cardBackground: '#FFFFFF', // Clean crisp white card
    cardBorder: '#D2ECE8', // Soft mint-slate border
    cardHeaderBg: '#F8FAFC',

    // Interactive & navigation
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#2563EB',
    tabBarBackground: '#FFFFFF',
    toggleTrackInactive: '#E2E8F0',

    // Feedback & accents (all blue accents, zero green)
    danger: '#EF4444',
    success: '#2563EB', // Blue task completion & checkmarks
    warning: '#F59E0B',
    quoteBg: '#EFF6FF', // Soft ice-blue quote surface
    quoteBorder: '#BFDBFE', // Light blue quote border
    quoteAccent: '#2563EB',
  },
  dark: {
    // Primary brand accents (luminous azure sky blue with maximum contrast on deep navy)
    primary: '#38BDF8',
    primaryLight: '#60A5FA',
    tint: '#38BDF8',

    // Text hierarchy
    text: '#F8FAFC', // Crisp light slate
    textSecondary: '#A5B4CB', // Soft lavender slate
    textMuted: '#6B7294', // Muted indigo slate

    // Surfaces & borders
    background: '#18192E', // Deep night navy
    cardBackground: '#242646', // Refined navy surface (#26264B / #282A4E family)
    cardBorder: '#363963', // Indigo-navy border
    cardHeaderBg: '#20223E',

    // Interactive & navigation
    icon: '#A5B4CB',
    tabIconDefault: '#6B7294',
    tabIconSelected: '#38BDF8',
    tabBarBackground: '#1D1F38',
    toggleTrackInactive: '#2C2E52',

    // Feedback & accents (all blue accents, zero green)
    danger: '#F87171',
    success: '#38BDF8', // Luminous blue task completion & checkmarks
    warning: '#FBBF24',
    quoteBg: '#1E2548', // Deep navy-blue accent surface
    quoteBorder: '#2F3C6E',
    quoteAccent: '#38BDF8',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
