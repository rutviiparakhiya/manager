import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeToggleCard } from '@/components/settings/ThemeToggleCard';
import { QuoteIntervalCard } from '@/components/settings/QuoteIntervalCard';

export default function SettingsScreen() {
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
        {/* Brand Header */}
        <View style={styles.headerContainer}>
          <View style={styles.brandRow}>
            <Text style={[styles.appName, { color: colors.text }]}>myManager</Text>
          </View>
          <Text style={[styles.appTagline, { color: colors.textSecondary }]}>
            Preferences, appearance, and quote settings.
          </Text>
        </View>

        {/* Appearance / Theme Toggle Card */}
        <ThemeToggleCard />

        {/* Motivational Quotes Interval Setting Card */}
        <QuoteIntervalCard />

        {/* App Info Card */}
        <View style={styles.aboutWrapper}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          </View>

          <View
            style={[
              styles.aboutCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.cardBorder,
              },
            ]}>
            <View style={styles.aboutRow}>
              <View style={[styles.aboutIconCircle, { backgroundColor: colors.quoteBg }]}>
                <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.aboutTextCol}>
                <Text style={[styles.aboutTitle, { color: colors.text }]}>myManager</Text>
                <Text style={[styles.aboutSubtitle, { color: colors.textSecondary }]}>
                  Version 1.0.0 • Expo SDK 54
                </Text>
              </View>
            </View>

            <View style={[styles.aboutDivider, { backgroundColor: colors.cardBorder }]} />

            <View style={styles.aboutDetailsList}>
              <View style={styles.aboutDetailItem}>
                <Ionicons name="shield-checkmark-outline" size={16} color={colors.success} />
                <Text style={[styles.aboutDetailText, { color: colors.textSecondary }]}>
                  Offline-First & Local Storage (AsyncStorage)
                </Text>
              </View>
              <View style={styles.aboutDetailItem}>
                <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
                <Text style={[styles.aboutDetailText, { color: colors.textSecondary }]}>
                  Motivational Quotes & Daily Task Organizer
                </Text>
              </View>
            </View>
          </View>
        </View>
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
  aboutWrapper: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  aboutCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aboutIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aboutTextCol: {
    flex: 1,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  aboutSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  aboutDivider: {
    height: 1,
    marginVertical: 14,
  },
  aboutDetailsList: {
    gap: 8,
  },
  aboutDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aboutDetailText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
