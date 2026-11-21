import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TaskItem, TaskSectionType } from '@/types/task';
import {
  addTask,
  loadTasks,
  removeTask,
  subscribeToTaskChanges,
  toggleTask,
  updateTask,
} from '@/services/taskStorage';

interface TaskSectionProps {
  title: string;
  section: TaskSectionType;
}

// Home day options. The 'yesterday' storage key is shown to the user as "Tomorrow".
const DAY_OPTIONS: { section: TaskSectionType; label: string }[] = [
  { section: 'today', label: 'Today' },
  { section: 'yesterday', label: 'Tomorrow' },
];

export function TaskSection({ title, section }: TaskSectionProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [taskText, setTaskText] = useState('');
  const [targetSection, setTargetSection] = useState<TaskSectionType>(section);
  const [selectedTaskForMenu, setSelectedTaskForMenu] = useState<TaskItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    const reload = () => {
      loadTasks(section)
        .then((items) => {
          if (isMounted) {
            setTasks(items);
          }
        })
        .catch(() => {});
    };
    reload();
    // Refresh this section instantly whenever any task changes (add/edit/move/remove).
    const unsubscribe = subscribeToTaskChanges(reload);
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [section]);

  const openAddModal = () => {
    setEditingTask(null);
    setTaskText('');
    setTargetSection(section);
    setIsTaskModalVisible(true);
  };

  const openEditModal = (task: TaskItem) => {
    setSelectedTaskForMenu(null);
    setEditingTask(task);
    setTaskText(task.text);
    setTargetSection(section);
    setIsTaskModalVisible(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalVisible(false);
    setEditingTask(null);
    setTaskText('');
  };

  const handleSubmitTask = async () => {
    const trimmed = taskText.trim();
    if (!trimmed) return;

    if (editingTask) {
      // Update the SAME task (same id) and optionally move it to another day.
      await updateTask(section, editingTask.id, { text: trimmed, section: targetSection });
    } else {
      const updated = await addTask(section, trimmed);
      setTasks(updated);
    }
    closeTaskModal();
  };

  const handleToggleTask = async (taskId: string) => {
    const updated = await toggleTask(section, taskId);
    setTasks(updated);
  };

  const handleRemoveTask = async () => {
    if (!selectedTaskForMenu) return;
    const updated = await removeTask(section, selectedTaskForMenu.id);
    setTasks(updated);
    setSelectedTaskForMenu(null);
  };

  return (
    <View style={styles.sectionWrapper}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
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
        {/* Card Header with count and circular '+' Button */}
        <View style={[styles.cardTopBar, { borderBottomColor: colors.cardBorder }]}>
          <View style={styles.countBadgeContainer}>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={openAddModal}
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={`Add task to ${title}`}>
            <Text style={styles.addButtonPlus}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Task List or Empty State */}
        {tasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.quoteBg }]}>
              <Ionicons name="clipboard-outline" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No tasks yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Tap the + button above to create one.
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
                    onPress={() => handleToggleTask(task.id)}
                    style={styles.checkboxTouchTarget}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: task.completed ? colors.primary : colors.cardBorder,
                          backgroundColor: task.completed ? colors.primary : 'transparent',
                        },
                      ]}>
                      {task.completed && (
                        <Ionicons name="checkmark-sharp" size={15} color="#FFFFFF" />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Task Text */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleToggleTask(task.id)}
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
                    onPress={() => setSelectedTaskForMenu(task)}
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

      {/* Add / Edit Task Modal (shared form, reused for both modes) */}
      <Modal
        visible={isTaskModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeTaskModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={closeTaskModal} />
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.cardBorder,
              },
            ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </Text>
              <TouchableOpacity
                onPress={closeTaskModal}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={22} color={colors.icon} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              {editingTask ? 'Updating' : 'Adding to'}: {title.replace(/\.+$/, '').trim()}
            </Text>

            <TextInput
              style={[
                styles.taskInput,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.cardBorder,
                },
              ]}
              placeholder="What do you need to do?"
              placeholderTextColor={colors.textMuted}
              value={taskText}
              onChangeText={setTaskText}
              autoFocus
              multiline
              maxLength={200}
            />

            {editingTask && (
              <>
                <Text style={[styles.dayLabel, { color: colors.textMuted }]}>Day</Text>
                <View style={styles.dayRow}>
                  {DAY_OPTIONS.map((option) => {
                    const isActive = targetSection === option.section;
                    return (
                      <TouchableOpacity
                        key={option.section}
                        activeOpacity={0.7}
                        onPress={() => setTargetSection(option.section)}
                        style={[
                          styles.dayChip,
                          {
                            backgroundColor: isActive ? colors.primary : 'transparent',
                            borderColor: isActive ? colors.primary : colors.cardBorder,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.dayChipText,
                            { color: isActive ? '#FFFFFF' : colors.textSecondary },
                          ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelBtn, { borderColor: colors.cardBorder }]}
                onPress={closeTaskModal}>
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  styles.submitBtn,
                  {
                    backgroundColor: taskText.trim() ? colors.primary : colors.cardBorder,
                  },
                ]}
                disabled={!taskText.trim()}
                onPress={handleSubmitTask}>
                <Text style={styles.submitBtnText}>
                  {editingTask ? 'Update Task' : 'Add Task'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Three-dots Menu Modal */}
      <Modal
        visible={!!selectedTaskForMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedTaskForMenu(null)}>
        <Pressable style={styles.menuOverlay} onPress={() => setSelectedTaskForMenu(null)}>
          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.cardBorder,
              },
            ]}>
            <View style={styles.menuTaskPreview}>
              <Text style={[styles.menuPreviewLabel, { color: colors.textMuted }]}>
                Selected Task:
              </Text>
              <Text
                style={[styles.menuPreviewText, { color: colors.text }]}
                numberOfLines={2}>
                &ldquo;{selectedTaskForMenu?.text}&rdquo;
              </Text>
            </View>

            <View style={[styles.menuDivider, { backgroundColor: colors.cardBorder }]} />

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.menuOptionEdit}
              onPress={() => {
                if (selectedTaskForMenu) openEditModal(selectedTaskForMenu);
              }}>
              <Ionicons name="create-outline" size={20} color={colors.primary} />
              <Text style={[styles.menuOptionEditText, { color: colors.primary }]}>Edit Task</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.menuOptionRemove}
              onPress={handleRemoveTask}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
              <Text style={[styles.menuRemoveText, { color: colors.danger }]}>Remove Task</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.menuOptionCancel}
              onPress={() => setSelectedTaskForMenu(null)}>
              <Text style={[styles.menuCancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionWrapper: {
    marginBottom: 28,
  },
  headerRow: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  cardBox: {
    borderRadius: 14,
    borderWidth: 1,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonPlus: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 26,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: Platform.OS === 'android' ? -2 : 0,
  },
  emptyContainer: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    paddingVertical: 2,
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
    opacity: 0.6,
  },
  menuButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  taskInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 18,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    minWidth: 90,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  menuCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  menuTaskPreview: {
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 10,
  },
  menuPreviewLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  menuPreviewText: {
    fontSize: 14,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  menuDivider: {
    height: 1,
    marginVertical: 6,
  },
  menuOptionEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  menuOptionEditText: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuOptionRemove: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  menuRemoveText: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuOptionCancel: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  menuCancelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  dayRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  dayChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
