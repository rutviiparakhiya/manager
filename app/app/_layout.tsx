import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import {
  useFonts,
  LobsterTwo_400Regular,
  LobsterTwo_700Bold,
  LobsterTwo_400Regular_Italic,
  LobsterTwo_700Bold_Italic,
} from '@expo-google-fonts/lobster-two';

import { AppThemeProvider } from '@/context/ThemeContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Prevent splash screen from auto-hiding before font assets are loaded
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore in environments where splash screen cannot be prevented
});

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigationContent() {
  const colorScheme = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    LobsterTwo_400Regular,
    LobsterTwo_700Bold,
    LobsterTwo_400Regular_Italic,
    LobsterTwo_700Bold_Italic,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <RootNavigationContent />
    </AppThemeProvider>
  );
}
