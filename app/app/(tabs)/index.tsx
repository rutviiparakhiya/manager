import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MotivationalQuoteCard } from '@/components/home/MotivationalQuoteCard';
import { TaskSection } from '@/components/home/TaskSection';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

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
        {/* Top-left App Name Header */}
        <View style={styles.headerContainer}>
          <View style={styles.brandRow}>
            <Text style={[styles.appName, { color: colors.text }]}>myManager</Text>
            <View style={[styles.brandDot, { backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.appTagline, { color: colors.textSecondary }]}>
            Stay organized, focused, and motivated.
          </Text>
        </View>

        {/* Motivational Quote Box */}
        <MotivationalQuoteCard />

        {/* Today's Tasks */}
        <TaskSection title="Today's Tasks :-" section="today" />

        {/* Yesterday's Tasks */}
        <TaskSection title="Yesterday's Tasks" section="yesterday" />
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
    marginBottom: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: 0.1,
  },
});
