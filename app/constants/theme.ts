import { Platform } from 'react-native';

const primaryColor = '#4F46E5'; // Modern vibrant indigo
const primaryLight = '#6366F1';

export const Colors = {
  light: {
    primary: primaryColor,
    primaryLight: primaryLight,
    text: '#0F172A', // Slate 900
    textSecondary: '#64748B', // Slate 500
    textMuted: '#94A3B8', // Slate 400
    background: '#F8FAFC', // Slate 50
    cardBackground: '#FFFFFF',
    cardBorder: '#E2E8F0', // Slate 200
    tint: primaryColor,
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: primaryColor,
    tabBarBackground: '#FFFFFF',
    danger: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    quoteBg: '#F1F5F9',
    quoteBorder: '#CBD5E1',
    quoteAccent: '#818CF8',
    toggleTrackInactive: '#E2E8F0',
  },
  dark: {
    primary: primaryLight,
    primaryLight: '#818CF8',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    background: '#0B0F19', // Deep slate / charcoal (true dark, not pitch black)
    cardBackground: '#151D2E', // Sufficiently elevated card surface with subtle contrast
    cardBorder: '#232E42', // Refined subtle card border
    tint: '#818CF8',
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: '#818CF8',
    tabBarBackground: '#111726',
    danger: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    quoteBg: '#1B2438',
    quoteBorder: '#2A374F',
    quoteAccent: '#818CF8',
    toggleTrackInactive: '#1E293B',
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
