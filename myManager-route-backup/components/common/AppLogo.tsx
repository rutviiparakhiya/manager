import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AppLogoProps {
  size?: number;
}

export function AppLogo({ size = 34 }: AppLogoProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const iconSize = Math.round(size * 0.58);
  const borderRadius = Math.round(size * 0.28);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: borderRadius,
          backgroundColor: colors.primary,
          shadowColor: colors.primary,
        },
      ]}>
      <Ionicons name="checkmark-done" size={iconSize} color="#FFFFFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
});
