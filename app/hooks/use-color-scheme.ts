import { useContext } from 'react';
import { Appearance } from 'react-native';
import { ThemeContext } from '@/context/ThemeContext';

export function useColorScheme(): 'light' | 'dark' {
  const context = useContext(ThemeContext);
  if (context) {
    return context.theme;
  }
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}
