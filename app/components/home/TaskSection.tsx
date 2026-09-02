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
import { addTask, loadTasks, removeTask, toggleTask } from '@/services/taskStorage';

interface TaskSectionProps {
  title: string;
  section: TaskSectionType;
}

export function TaskSection({ title, section }: TaskSectionProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedTaskForMenu, setSelectedTaskForMenu] = useState<TaskItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchTasks() {
      const items = await loadTasks(section);
      if (isMounted) {
        setTasks(items);
      }
    }
    fetchTasks();
    return () => {
      isMounted = false;
    };
  }, [section]);

  const handleAddTask = async () => {
    if (!newTaskText.trim()) return;
    const updated = await addTask(section, newTaskText);
    setTasks(updated);
    setNewTaskText('');
    setIsAddModalVisible(false);
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
        {/* Card Header with count and '+' Button */}
        <View style={[styles.cardTopBar, { borderBottomColor: colors.cardBorder }]}>
          <View style={styles.countBadgeContainer}>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsAddModalVisible(true)}
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={`Add task to ${title}`}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Task List or Empty State */}
        {tasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.quoteBg }]}>
              <Ionicons name="clipboard-outline" size={32} color={colors.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No tasks yet</Text>
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
                    onPress={() => handleToggleTask(task.id)}
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

      {/* Add Task Modal */}
      <Modal
        visible={isAddModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsAddModalVisible(false)} />
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.cardBorder,
              },
            ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Task</Text>
              <TouchableOpacity
                onPress={() => setIsAddModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={22} color={colors.icon} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Adding to: {title.replace(' :-', '')}
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
              value={newTaskText}
              onChangeText={setNewTaskText}
              autoFocus
              multiline
              maxLength={200}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelBtn, { borderColor: colors.cardBorder }]}
                onPress={() => {
                  setNewTaskText('');
                  setIsAddModalVisible(false);
                }}>
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  styles.submitBtn,
                  {
                    backgroundColor: newTaskText.trim() ? colors.primary : colors.cardBorder,
                  },
                ]}
                disabled={!newTaskText.trim()}
                onPress={handleAddTask}>
                <Text style={styles.submitBtnText}>Add Task</Text>
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
    borderRadius: 20,
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
    borderRadius: 18,
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
});
