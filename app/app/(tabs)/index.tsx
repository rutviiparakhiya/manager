import React, { useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MotivationalQuoteCard } from '@/components/home/MotivationalQuoteCard';
import { TaskSection } from '@/components/home/TaskSection';
import { checkAndApplyMidnightRollover } from '@/services/taskStorage';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      checkAndApplyMidnightRollover().catch(() => {});
    }, [])
  );

  return (
    <View style={[styles.screenContainer, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Clean Header with only app name */}
        <View style={styles.headerContainer}>
          <Text style={[styles.appName, { color: colors.text }]}>myManager</Text>
        </View>

        {/* Motivational Quote Section */}
        <MotivationalQuoteCard />

        {/* Today's Tasks */}
        <TaskSection title="Today's Tasks..." section="today" />

        {/* Tomorrow's Tasks */}
        <TaskSection title="Tomorrow's Tasks....." section="yesterday" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  headerContainer: {
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
});
