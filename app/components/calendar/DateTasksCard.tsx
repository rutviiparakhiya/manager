import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CalendarTaskItem } from '@/types/calendar';
import { formatDisplayDate } from '@/services/calendarStorage';

interface DateTasksCardProps {
  selectedDate: string;
  isToday: boolean;
  tasks: CalendarTaskItem[];
  onOpenAddModal: () => void;
  onToggleTask: (taskId: string) => void;
  onSelectTaskForMenu: (task: CalendarTaskItem) => void;
}

export function DateTasksCard({
  selectedDate,
  isToday,
  tasks,
  onOpenAddModal,
  onToggleTask,
  onSelectTaskForMenu,
}: DateTasksCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const formattedDate = formatDisplayDate(selectedDate);

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerTextCol}>
          <View style={styles.dateBadgeRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Date Tasks</Text>
            {isToday && (
              <View
                style={[
                  styles.todayPill,
                  {
                    backgroundColor: colors.primary,
                  },
                ]}>
                <Text style={styles.todayPillText}>Today</Text>
              </View>
            )}
          </View>
          <Text style={[styles.dateSubtitle, { color: colors.textSecondary }]}>
            {formattedDate}
          </Text>
        </View>
      </View>

      {/* Main Task Box */}
      <View
        style={[
          styles.cardBox,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.cardBorder,
          },
        ]}>
        {/* Card Top Bar with Count & Add Button */}
        <View style={[styles.cardTopBar, { borderBottomColor: colors.cardBorder }]}>
          <View style={styles.countBadgeContainer}>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onOpenAddModal}
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={`Add task for ${formattedDate}`}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Task List or Empty State */}
        {tasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.quoteBg }]}>
              <Ionicons name="calendar-outline" size={30} color={colors.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No tasks for this date</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Tap the + Add button above to create one.
            </Text>
          </View>
        ) : (
          <View style={styles.taskList}>
            {tasks.map((task, index) => {
              const isLast = index === tasks.length - 1;
              return (
                <View
                  key={task.id}
                  style={[
                    styles.taskRow,
                    !isLast && { borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
                  ]}>
                  {/* Complete Checkbox */}
                  <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={() => onToggleTask(task.id)}
                    style={styles.checkboxTouchTarget}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: task.completed ? colors.success : colors.cardBorder,
                          backgroundColor: task.completed ? colors.success : 'transparent',
                        },
                      ]}>
                      {task.completed && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                    </View>
                  </TouchableOpacity>

                  {/* Task Text */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onToggleTask(task.id)}
                    style={styles.taskTextWrapper}>
                    <Text
                      style={[
                        styles.taskText,
                        { color: task.completed ? colors.textMuted : colors.text },
                        task.completed && styles.taskTextCompleted,
                      ]}
                      numberOfLines={3}>
                      {task.text}
                    </Text>
                  </TouchableOpacity>

                  {/* Three Dots (⋮) Menu Button */}
                  <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={() => onSelectTaskForMenu(task)}
                    style={styles.menuButton}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Task options">
                    <Ionicons name="ellipsis-vertical" size={20} color={colors.icon} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  headerRow: {
    marginBottom: 12,
  },
  headerTextCol: {
    gap: 4,
  },
  dateBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  todayPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  todayPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  cardBox: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  countBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: 'center',
  },
  taskList: {
    paddingVertical: 4,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
  },
  checkboxTouchTarget: {
    padding: 6,
    marginRight: 6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskTextWrapper: {
    flex: 1,
    paddingVertical: 4,
    paddingRight: 8,
  },
  taskText: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  menuButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
