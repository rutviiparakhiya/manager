import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CalendarTasksMap, CalendarTaskItem } from '@/types/calendar';
import {
  dateToDateKey,
  loadAllCalendarTasks,
  addCalendarTask,
  toggleCalendarTask,
  removeCalendarTask,
} from '@/services/calendarStorage';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { DateTasksCard } from '@/components/calendar/DateTasksCard';
import { AddCalendarTaskModal } from '@/components/calendar/AddCalendarTaskModal';
import { TaskOptionsMenuModal } from '@/components/calendar/TaskOptionsMenuModal';

export default function CalendarScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  // State for real current date
  const [currentRealDate, setCurrentRealDate] = useState<Date>(() => new Date());
  
  // Navigation month & year
  const [displayedYear, setDisplayedYear] = useState<number>(() => currentRealDate.getFullYear());
  const [displayedMonth, setDisplayedMonth] = useState<number>(() => currentRealDate.getMonth());
  
  // Selected date key ('YYYY-MM-DD')
  const [selectedDate, setSelectedDate] = useState<string>(() => dateToDateKey(currentRealDate));
  
  // Tasks mapping (keyed by 'YYYY-MM-DD')
  const [tasksMap, setTasksMap] = useState<CalendarTasksMap>({});
  
  // Modal states
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedTaskForMenu, setSelectedTaskForMenu] = useState<CalendarTaskItem | null>(null);

  // Real-world current year and today's date key
  const currentYear = currentRealDate.getFullYear();
  const currentMonth = currentRealDate.getMonth();
  const todayKey = dateToDateKey(currentRealDate);

  // Load all tasks from AsyncStorage
  const refreshTasks = useCallback(async () => {
    const loaded = await loadAllCalendarTasks();
    setTasksMap(loaded);
  }, []);

  // Reset to today's date and current month/year every time tab gains focus
  useFocusEffect(
    useCallback(() => {
      const now = new Date();
      setCurrentRealDate(now);
      setDisplayedYear(now.getFullYear());
      setDisplayedMonth(now.getMonth());
      setSelectedDate(dateToDateKey(now));
      refreshTasks();
    }, [refreshTasks])
  );

  // Navigation bounds:
  // Cannot navigate prior to January of the current year
  const canGoPrevious = !(displayedYear <= currentYear && displayedMonth <= 0);

  const handlePreviousMonth = () => {
    if (!canGoPrevious) return;
    if (displayedMonth === 0) {
      if (displayedYear > currentYear) {
        setDisplayedYear((y) => y - 1);
        setDisplayedMonth(11);
      }
    } else {
      setDisplayedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    // Infinite forward navigation
    if (displayedMonth === 11) {
      setDisplayedYear((y) => y + 1);
      setDisplayedMonth(0);
    } else {
      setDisplayedMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentRealDate(now);
    setDisplayedYear(now.getFullYear());
    setDisplayedMonth(now.getMonth());
    setSelectedDate(dateToDateKey(now));
  };

  // Tapping any date cell selects it and opens the add task flow
  const handleSelectDate = (dateKey: string) => {
    setSelectedDate(dateKey);
    // Parse date to check if we should align the displayed month
    const [y, m] = dateKey.split('-').map(Number);
    if (y && m) {
      const targetMonth = m - 1;
      // Allow syncing displayed month if within allowed range
      if (y > currentYear || (y === currentYear && targetMonth >= 0)) {
        setDisplayedYear(y);
        setDisplayedMonth(targetMonth);
      }
    }
    setIsAddModalVisible(true);
  };

  // Add task handler
  const handleAddTask = async (text: string) => {
    const updatedDateTasks = await addCalendarTask(selectedDate, text);
    setTasksMap((prev) => ({
      ...prev,
      [selectedDate]: updatedDateTasks,
    }));
    setIsAddModalVisible(false);
  };

  // Toggle task completion handler
  const handleToggleTask = async (taskId: string) => {
    const updatedDateTasks = await toggleCalendarTask(selectedDate, taskId);
    setTasksMap((prev) => ({
      ...prev,
      [selectedDate]: updatedDateTasks,
    }));
  };

  // Remove task handler
  const handleRemoveTask = async () => {
    if (!selectedTaskForMenu) return;
    const updatedDateTasks = await removeCalendarTask(selectedDate, selectedTaskForMenu.id);
    setTasksMap((prev) => {
      const updated = { ...prev };
      if (updatedDateTasks.length === 0) {
        delete updated[selectedDate];
      } else {
        updated[selectedDate] = updatedDateTasks;
      }
      return updated;
    });
    setSelectedTaskForMenu(null);
  };

  const selectedDateTasks = tasksMap[selectedDate] || [];
  const isSelectedDateToday = selectedDate === todayKey;
  const isCurrentMonthView = displayedYear === currentYear && displayedMonth === currentMonth;

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
            <View style={[styles.brandDot, { backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.appTagline, { color: colors.textSecondary }]}>
            Plan ahead, track tasks, and schedule your days.
          </Text>
        </View>

        {/* Calendar Month & Navigation Controls */}
        <CalendarHeader
          year={displayedYear}
          month={displayedMonth}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onJumpToToday={handleJumpToToday}
          canGoPrevious={canGoPrevious}
          isCurrentMonth={isCurrentMonthView}
        />

        {/* Calendar Month Grid */}
        <CalendarGrid
          year={displayedYear}
          month={displayedMonth}
          todayKey={todayKey}
          selectedDate={selectedDate}
          tasksMap={tasksMap}
          onSelectDate={handleSelectDate}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          canGoPrevious={canGoPrevious}
        />

        {/* Tasks for the Selected Date */}
        <DateTasksCard
          selectedDate={selectedDate}
          isToday={isSelectedDateToday}
          tasks={selectedDateTasks}
          onOpenAddModal={() => setIsAddModalVisible(true)}
          onToggleTask={handleToggleTask}
          onSelectTaskForMenu={(task) => setSelectedTaskForMenu(task)}
        />
      </ScrollView>

      {/* Add Task Modal */}
      <AddCalendarTaskModal
        visible={isAddModalVisible}
        selectedDate={selectedDate}
        existingTasks={selectedDateTasks}
        onClose={() => setIsAddModalVisible(false)}
        onAddTask={handleAddTask}
      />

      {/* Three-dots (⋮) Options / Remove Menu Modal */}
      <TaskOptionsMenuModal
        task={selectedTaskForMenu}
        onClose={() => setSelectedTaskForMenu(null)}
        onRemove={handleRemoveTask}
      />
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
    marginBottom: 16,
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
