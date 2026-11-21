import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { ThemeMode } from '@/types/settings';

export function ThemeToggleCard() {
  const { theme, isDark, colors, setTheme } = useAppTheme();

  const handleSelectTheme = (selectedMode: ThemeMode) => {
    if (selectedMode !== theme) {
      setTheme(selectedMode);
    }
  };

  return (
    <View style={styles.sectionWrapper}>
      {/* Section Header */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
      </View>

      {/* Card Container */}
      <View
        style={[
          styles.cardBox,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.cardBorder,
          },
        ]}>
        {/* Card Header & Description */}
        <View style={styles.cardHeader}>
          <View style={styles.titleWithIcon}>
            <View
              style={[
                styles.iconBadge,
                {
                  backgroundColor: colors.quoteBg,
                  borderColor: colors.quoteBorder,
                },
              ]}>
              <Ionicons
                name={isDark ? 'moon' : 'sunny'}
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={styles.textColumn}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Theme Mode</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                {isDark ? 'Dark theme is currently active' : 'Light theme is currently active'}
              </Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={[styles.cardDivider, { backgroundColor: colors.cardBorder }]} />

        {/* Segmented Selector */}
        <View
          style={[
            styles.segmentContainer,
            {
              backgroundColor: colors.background,
              borderColor: colors.cardBorder,
            },
          ]}>
          {/* Light Mode Option */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleSelectTheme('light')}
            style={[
              styles.segmentOption,
              !isDark && [
                styles.segmentOptionActive,
                {
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                },
              ],
            ]}
            accessibilityRole="button"
            accessibilityLabel="Switch to Light Theme">
            <Ionicons
              name={!isDark ? 'sunny' : 'sunny-outline'}
              size={18}
              color={!isDark ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentText,
                {
                  color: !isDark ? '#FFFFFF' : colors.textSecondary,
                  fontWeight: !isDark ? '700' : '500',
                },
              ]}>
              Light
            </Text>
          </TouchableOpacity>

          {/* Dark Mode Option */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleSelectTheme('dark')}
            style={[
              styles.segmentOption,
              isDark && [
                styles.segmentOptionActive,
                {
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                },
              ],
            ]}
            accessibilityRole="button"
            accessibilityLabel="Switch to Dark Theme">
            <Ionicons
              name={isDark ? 'moon' : 'moon-outline'}
              size={18}
              color={isDark ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentText,
                {
                  color: isDark ? '#FFFFFF' : colors.textSecondary,
                  fontWeight: isDark ? '700' : '500',
                },
              ]}>
              Dark
            </Text>
          </TouchableOpacity>
        </View>

        {/* Informational Footer */}
        <View style={styles.infoFooter}>
          <Ionicons name="color-palette-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.infoFooterText, { color: colors.textMuted }]}>
            Theme applies across Home, Calendar, Settings, and navigation.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionWrapper: {
    marginBottom: 26,
  },
  sectionHeaderRow: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  cardBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 14,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  cardDivider: {
    height: 1,
    marginBottom: 14,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    gap: 6,
  },
  segmentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
  },
  segmentOptionActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentText: {
    fontSize: 14,
  },
  infoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  infoFooterText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
});
