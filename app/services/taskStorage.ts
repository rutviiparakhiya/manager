import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskItem, TaskSectionType } from '@/types/task';

const STORAGE_KEYS: Record<TaskSectionType, string> = {
  today: '@myManager:tasks_today',
  yesterday: '@myManager:tasks_yesterday',
};

/**
 * Load tasks for a specific section from AsyncStorage.
 */
export async function loadTasks(section: TaskSectionType): Promise<TaskItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS[section]);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
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
