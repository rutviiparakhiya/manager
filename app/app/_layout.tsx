import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import 'react-native-reanimated';

import {
  useFonts,
  DancingScript_400Regular,
  DancingScript_700Bold,
} from '@expo-google-fonts/dancing-script';
import { Ionicons } from '@expo/vector-icons';

import { AppThemeProvider } from '@/context/ThemeContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { requestNotificationPermissions } from '@/services/notificationService';
import { checkAndApplyMidnightRollover } from '@/services/taskStorage';
import { getNextISTMidnightTimestamp } from '@/utils/timezone';

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
    DancingScript: DancingScript_400Regular,
    DancingScript_400Regular,
    DancingScript_700Bold,
    ...Ionicons.font,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => { });
    }
  }, [fontsLoaded, fontError]);

  // Request notification permissions on app mount
  useEffect(() => {
    requestNotificationPermissions().catch(() => { });
  }, []);

  // Check midnight rollover on app resume / state change and set exact midnight timer
  useEffect(() => {
    // Check rollover on launch
    checkAndApplyMidnightRollover().catch(() => { });

    // Listen for app coming to foreground
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        checkAndApplyMidnightRollover().catch(() => { });
      }
    });

    // Schedule exact 12:00 AM IST midnight rollover timer while app remains open
    let midnightTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduleNextMidnight = () => {
      const nextMidnightMs = getNextISTMidnightTimestamp();
      const delay = Math.max(1000, nextMidnightMs - Date.now() + 500); // 500ms grace past midnight
      midnightTimer = setTimeout(async () => {
        await checkAndApplyMidnightRollover().catch(() => { });
        scheduleNextMidnight();
      }, delay);
    };

    scheduleNextMidnight();

    return () => {
      subscription.remove();
      if (midnightTimer) clearTimeout(midnightTimer);
    };
  }, []);

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
