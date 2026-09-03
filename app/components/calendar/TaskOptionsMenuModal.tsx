import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CalendarTaskItem } from '@/types/calendar';

interface TaskOptionsMenuModalProps {
  task: CalendarTaskItem | null;
  onClose: () => void;
  onRemove: () => void;
}

export function TaskOptionsMenuModal({
  task,
  onClose,
  onRemove,
}: TaskOptionsMenuModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  if (!task) return null;

  return (
    <Modal
      visible={!!task}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable style={styles.menuOverlay} onPress={onClose}>
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
              &ldquo;{task.text}&rdquo;
            </Text>
          </View>

          <View style={[styles.menuDivider, { backgroundColor: colors.cardBorder }]} />

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.menuOptionRemove}
            onPress={onRemove}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
            <Text style={[styles.menuRemoveText, { color: colors.danger }]}>Remove Task</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.menuOptionCancel}
            onPress={onClose}>
            <Text style={[styles.menuCancelText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
