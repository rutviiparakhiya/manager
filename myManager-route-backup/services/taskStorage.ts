import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskItem, TaskSectionType } from '@/types/task';
import { getISTDateKey, getDaysDiffIST } from '@/utils/timezone';
import { syncPendingTasksNotification } from './notificationService';

const STORAGE_KEYS: Record<TaskSectionType, string> = {
  today: '@myManager:tasks_today',
  yesterday: '@myManager:tasks_yesterday',
};

const STORAGE_KEY_LAST_ROLLOVER = '@myManager:last_rollover_ist_date';

/**
 * Check and execute the 12:00 AM IST midnight task rollover.
 * - Today's Tasks get cleared.
 * - Yesterday's Tasks move into Today's Tasks.
 * - Yesterday's Tasks becomes empty.
 * - Calendar tab tasks remain completely untouched.
 */
export async function checkAndApplyMidnightRollover(): Promise<boolean> {
  try {
    const currentISTKey = getISTDateKey();
    const lastRolloverDate = await AsyncStorage.getItem(STORAGE_KEY_LAST_ROLLOVER);

    // Initial run: set baseline to today so we don't accidentally wipe current day's tasks
    if (!lastRolloverDate) {
      await AsyncStorage.setItem(STORAGE_KEY_LAST_ROLLOVER, currentISTKey);
      return false;
    }

    // Check if an IST calendar midnight has crossed
    if (lastRolloverDate !== currentISTKey) {
      const daysDiff = getDaysDiffIST(lastRolloverDate, currentISTKey);

      if (daysDiff >= 1) {
        const rawYesterday = await AsyncStorage.getItem(STORAGE_KEYS.yesterday);
        const parsedYesterday: TaskItem[] = rawYesterday ? JSON.parse(rawYesterday) : [];

        if (daysDiff === 1) {
          // Exactly 1 day passed: Yesterday's tasks become Today's tasks; Yesterday is cleared
          await AsyncStorage.setItem(STORAGE_KEYS.today, JSON.stringify(parsedYesterday));
          await AsyncStorage.setItem(STORAGE_KEYS.yesterday, JSON.stringify([]));

          // Sync 11:50 PM notification for the newly rolled-over Today's tasks
          syncPendingTasksNotification(parsedYesterday).catch(() => {});
        } else {
          // 2 or more days passed: Both Yesterday and Today are cleared
          await AsyncStorage.setItem(STORAGE_KEYS.today, JSON.stringify([]));
          await AsyncStorage.setItem(STORAGE_KEYS.yesterday, JSON.stringify([]));

          syncPendingTasksNotification([]).catch(() => {});
        }

        // Record the rollover completion
        await AsyncStorage.setItem(STORAGE_KEY_LAST_ROLLOVER, currentISTKey);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error during midnight rollover check:', error);
    return false;
  }
}

/**
 * Load tasks for a specific section from AsyncStorage.
 * Automatically checks for midnight rollover before loading.
 */
export async function loadTasks(section: TaskSectionType): Promise<TaskItem[]> {
  try {
    await checkAndApplyMidnightRollover();

    const raw = await AsyncStorage.getItem(STORAGE_KEYS[section]);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const tasks = Array.isArray(parsed) ? parsed : [];

    // If loading today's tasks, ensure notifications are synced
    if (section === 'today') {
      syncPendingTasksNotification(tasks).catch(() => {});
    }

    return tasks;
  } catch (error) {
    console.error(`Error loading tasks for ${section}:`, error);
    return [];
  }
}

/**
 * Save tasks for a specific section to AsyncStorage.
 */
export async function saveTasks(section: TaskSectionType, tasks: TaskItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS[section], JSON.stringify(tasks));
    if (section === 'today') {
      syncPendingTasksNotification(tasks).catch(() => {});
    }
  } catch (error) {
    console.error(`Error saving tasks for ${section}:`, error);
  }
}

/**
 * Add a new task item and persist to AsyncStorage immediately.
 */
export async function addTask(section: TaskSectionType, text: string): Promise<TaskItem[]> {
  const current = await loadTasks(section);
  const newTask: TaskItem = {
    id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    text: text.trim(),
    completed: false,
    createdAt: Date.now(),
  };
  const updated = [newTask, ...current];
  await saveTasks(section, updated);
  return updated;
}

/**
 * Toggle task completion state and persist immediately.
 */
export async function toggleTask(section: TaskSectionType, taskId: string): Promise<TaskItem[]> {
  const current = await loadTasks(section);
  const updated = current.map((item) =>
    item.id === taskId ? { ...item, completed: !item.completed } : item
  );
  await saveTasks(section, updated);
  return updated;
}

/**
 * Explicitly remove a task by id and persist immediately.
 * Tasks are ONLY removed via this explicit user action.
 */
export async function removeTask(section: TaskSectionType, taskId: string): Promise<TaskItem[]> {
  const current = await loadTasks(section);
  const updated = current.filter((item) => item.id !== taskId);
  await saveTasks(section, updated);
  return updated;
}
