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
import { formatDisplayDate } from '@/services/calendarStorage';
import { CalendarTaskItem } from '@/types/calendar';

interface AddCalendarTaskModalProps {
  visible: boolean;
  selectedDate: string;
  existingTasks?: CalendarTaskItem[];
  onClose: () => void;
  onAddTask: (text: string) => void;
}

export function AddCalendarTaskModal({
  visible,
  selectedDate,
  existingTasks = [],
  onClose,
  onAddTask,
}: AddCalendarTaskModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [taskText, setTaskText] = useState('');

  // Reset text when modal opens
  useEffect(() => {
    if (visible) {
      setTaskText('');
    }
  }, [visible]);

  const handleAdd = () => {
    if (!taskText.trim()) return;
    onAddTask(taskText.trim());
    setTaskText('');
  };

  const formattedDate = formatDisplayDate(selectedDate);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.cardBorder,
            },
          ]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Task</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={colors.icon} />
            </TouchableOpacity>
          </View>

          {/* Subtitle with formatted date */}
          <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
            Date: <Text style={{ fontWeight: '700', color: colors.primary }}>{formattedDate}</Text>
          </Text>

          {/* Existing tasks badge if any */}
          {existingTasks.length > 0 && (
            <View style={[styles.existingBadge, { backgroundColor: colors.quoteBg, borderColor: colors.quoteBorder }]}>
              <Ionicons name="layers-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.existingBadgeText, { color: colors.textSecondary }]}>
                {existingTasks.length} {existingTasks.length === 1 ? 'task already scheduled' : 'tasks already scheduled'}
              </Text>
            </View>
          )}

          {/* Input field */}
          <TextInput
            style={[
              styles.taskInput,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.cardBorder,
              },
            ]}
            placeholder="What do you need to do on this date?"
            placeholderTextColor={colors.textMuted}
            value={taskText}
            onChangeText={setTaskText}
            autoFocus
            multiline
            maxLength={200}
          />

          {/* Action buttons */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn, { borderColor: colors.cardBorder }]}
              onPress={onClose}>
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
              onPress={handleAdd}>
              <Text style={styles.submitBtnText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 12,
  },
  existingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  existingBadgeText: {
    fontSize: 12,
    fontWeight: '500',
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
});
