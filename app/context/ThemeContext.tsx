import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from '@/types/settings';
import { Colors } from '@/constants/theme';

const STORAGE_KEY_THEME = '@myManager:app_theme';

interface ThemeContextValue {
  theme: ThemeMode;
  isDark: boolean;
  colors: typeof Colors.light;
  setTheme: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize with system preference or light
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const sys = Appearance.getColorScheme();
    return sys === 'dark' ? 'dark' : 'light';
  });

  // Load saved theme preference on app start
  useEffect(() => {
    let isMounted = true;
    async function loadTheme() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY_THEME);
        if (saved === 'light' || saved === 'dark') {
          if (isMounted) {
            setThemeState(saved);
          }
        }
      } catch (error) {
        console.error('Error loading saved theme:', error);
      }
    }
    loadTheme();
    return () => {
      isMounted = false;
    };
  }, []);

  const setTheme = useCallback(async (mode: ThemeMode) => {
    setThemeState(mode);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_THEME, mode);
    } catch (error) {
      console.error('Error saving theme to AsyncStorage:', error);
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    const nextMode: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    await setTheme(nextMode);
  }, [theme, setTheme]);

  const value = useMemo<ThemeContextValue>(() => {
    const isDark = theme === 'dark';
    return {
      theme,
      isDark,
      colors: isDark ? Colors.dark : Colors.light,
      setTheme,
      toggleTheme,
    };
  }, [theme, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    const sys = Appearance.getColorScheme();
    const isDark = sys === 'dark';
    return {
      theme: isDark ? 'dark' : 'light',
      isDark,
      colors: isDark ? Colors.dark : Colors.light,
      setTheme: async () => {},
      toggleTheme: async () => {},
    };
  }
  return context;
}
