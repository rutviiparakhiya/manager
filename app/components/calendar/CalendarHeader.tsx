import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CalendarHeaderProps {
  year: number;
  month: number; // 0-indexed (0 = Jan, 11 = Dec)
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onJumpToToday: () => void;
  canGoPrevious: boolean;
  isCurrentMonth: boolean;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function CalendarHeader({
  year,
  month,
  onPreviousMonth,
  onNextMonth,
  onJumpToToday,
  canGoPrevious,
  isCurrentMonth,
}: CalendarHeaderProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const monthName = MONTH_NAMES[month] ?? '';

  return (
    <View style={styles.container}>
      {/* Month & Year Title with "Today" badge if current */}
      <View style={styles.titleWrapper}>
        <View style={styles.titleRow}>
          <Text style={[styles.monthText, { color: colors.text }]}>{monthName}</Text>
          <Text style={[styles.yearText, { color: colors.textSecondary }]}>{year}</Text>
        </View>
        {isCurrentMonth && (
          <View style={[styles.currentMonthBadge, { backgroundColor: colors.quoteBg, borderColor: colors.quoteBorder }]}>
            <View style={[styles.currentMonthDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.currentMonthText, { color: colors.primary }]}>Current</Text>
          </View>
        )}
      </View>

      {/* Navigation Controls: [<] [Today] [>] */}
      <View style={styles.controlsRow}>
        {/* Jump to Today Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onJumpToToday}
          style={[
            styles.todayButton,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.cardBorder,
            },
          ]}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
          <Ionicons name="today-outline" size={14} color={colors.primary} />
          <Text style={[styles.todayButtonText, { color: colors.primary }]}>Today</Text>
        </TouchableOpacity>

        {/* Previous Month Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPreviousMonth}
          disabled={!canGoPrevious}
          style={[
            styles.navButton,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.cardBorder,
              opacity: canGoPrevious ? 1 : 0.35,
            },
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Previous month"
          accessibilityState={{ disabled: !canGoPrevious }}>
          <Ionicons name="chevron-back" size={18} color={colors.text} />
        </TouchableOpacity>

        {/* Next Month Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onNextMonth}
          style={[
            styles.navButton,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.cardBorder,
            },
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Next month">
          <Ionicons name="chevron-forward" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  monthText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  yearText: {
    fontSize: 18,
    fontWeight: '600',
  },
  currentMonthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  currentMonthDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  currentMonthText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  navButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
});
