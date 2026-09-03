import React, { useMemo, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PanResponder,
} from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CalendarDayInfo, CalendarTasksMap } from '@/types/calendar';
import { formatDateKey } from '@/services/calendarStorage';

interface CalendarGridProps {
  year: number;
  month: number; // 0-indexed
  todayKey: string;
  selectedDate: string;
  tasksMap: CalendarTasksMap;
  onSelectDate: (dateKey: string) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  canGoPrevious: boolean;
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export function CalendarGrid({
  year,
  month,
  todayKey,
  selectedDate,
  tasksMap,
  onSelectDate,
  onPreviousMonth,
  onNextMonth,
  canGoPrevious,
}: CalendarGridProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Configure PanResponder for horizontal month swiping
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only capture horizontal swipes, allowing vertical scrolling to pass through
        const { dx, dy } = gestureState;
        return Math.abs(dx) > 25 && Math.abs(dx) > Math.abs(dy) * 1.8;
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, vx } = gestureState;
        // Swipe Left -> Next Month
        if (dx < -40 || vx < -0.3) {
          onNextMonth();
        }
        // Swipe Right -> Previous Month (if allowed)
        else if ((dx > 40 || vx > 0.3) && canGoPrevious) {
          onPreviousMonth();
        }
      },
    })
  ).current;

  // Build grid days
  const gridDays = useMemo<CalendarDayInfo[]>(() => {
    const days: CalendarDayInfo[] = [];

    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0-6 (Sun-Sat)
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPreviousMonth = new Date(year, month, 0).getDate();

    // Previous month leading days
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonth = month === 0 ? 11 : month - 1;
    for (let i = 0; i < firstDayOfWeek; i++) {
      const dayNum = daysInPreviousMonth - firstDayOfWeek + 1 + i;
      const key = formatDateKey(prevYear, prevMonth, dayNum);
      const tasks = tasksMap[key] || [];
      days.push({
        dayNumber: dayNum,
        dateKey: key,
        isCurrentMonth: false,
        isToday: key === todayKey,
        isSelected: key === selectedDate,
        hasTasks: tasks.length > 0,
        taskCount: tasks.length,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const key = formatDateKey(year, month, d);
      const tasks = tasksMap[key] || [];
      days.push({
        dayNumber: d,
        dateKey: key,
        isCurrentMonth: true,
        isToday: key === todayKey,
        isSelected: key === selectedDate,
        hasTasks: tasks.length > 0,
        taskCount: tasks.length,
      });
    }

    // Trailing days from next month to complete the row
    const nextYear = month === 11 ? year + 1 : year;
    const nextMonth = month === 11 ? 0 : month + 1;
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const key = formatDateKey(nextYear, nextMonth, i);
      const tasks = tasksMap[key] || [];
      days.push({
        dayNumber: i,
        dateKey: key,
        isCurrentMonth: false,
        isToday: key === todayKey,
        isSelected: key === selectedDate,
        hasTasks: tasks.length > 0,
        taskCount: tasks.length,
      });
    }

    return days;
  }, [year, month, todayKey, selectedDate, tasksMap]);

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.cardContainer,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorder,
        },
      ]}>
      {/* Weekday Header Row */}
      <View style={[styles.weekdaysRow, { borderBottomColor: colors.cardBorder }]}>
        {WEEKDAYS.map((day, index) => {
          const isWeekend = index === 0 || index === 6;
          return (
            <View key={day} style={styles.weekdayCell}>
              <Text
                style={[
                  styles.weekdayText,
                  {
                    color: isWeekend ? colors.primary : colors.textMuted,
                  },
                ]}>
                {day}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Grid of Days */}
      <View style={styles.gridContainer}>
        {gridDays.map((dayItem) => {
          const isSelected = dayItem.isSelected;
          const isToday = dayItem.isToday;
          const isCurrentMonth = dayItem.isCurrentMonth;
          const hasTasks = dayItem.hasTasks;

          // Determine cell text color
          let textColor = colors.text;
          if (!isCurrentMonth) {
            textColor = colors.textMuted;
          } else if (isSelected) {
            textColor = '#FFFFFF';
          } else if (isToday) {
            textColor = colors.primary;
          }

          return (
            <TouchableOpacity
              key={dayItem.dateKey}
              activeOpacity={0.65}
              onPress={() => onSelectDate(dayItem.dateKey)}
              style={styles.dayCellWrapper}
              accessibilityLabel={`Date ${dayItem.dateKey}${dayItem.hasTasks ? `, has ${dayItem.taskCount} tasks` : ''}`}>
              <View
                style={[
                  styles.dayCellCircle,
                  // Selected State
                  isSelected && {
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.35,
                    shadowRadius: 4,
                    elevation: 3,
                  },
                  // Today (when NOT selected)
                  !isSelected && isToday && {
                    borderColor: colors.primary,
                    borderWidth: 1.8,
                    backgroundColor: colors.quoteBg,
                  },
                ]}>
                <Text
                  style={[
                    styles.dayNumberText,
                    { color: textColor },
                    (isToday || isSelected) && styles.dayNumberBold,
                    !isCurrentMonth && styles.dayNumberDimmed,
                  ]}>
                  {dayItem.dayNumber}
                </Text>

                {/* Task Indicator Dot */}
                {hasTasks && (
                  <View
                    style={[
                      styles.taskDot,
                      {
                        backgroundColor: isSelected
                          ? '#FFFFFF'
                          : colors.primary,
                      },
                    ]}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  weekdaysRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellWrapper: {
    width: '14.2857%', // 7 columns
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayCellCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayNumberText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dayNumberBold: {
    fontWeight: '800',
  },
  dayNumberDimmed: {
    opacity: 0.35,
  },
  taskDot: {
    position: 'absolute',
    bottom: 3,
    width: 4.5,
    height: 4.5,
    borderRadius: 2.25,
  },
});
