import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarTaskItem, CalendarTasksMap } from '@/types/calendar';

const CALENDAR_STORAGE_KEY = '@myManager:calendar_tasks_store';

/**
 * Format year, month (0-indexed), and day into 'YYYY-MM-DD'
 */
export function formatDateKey(year: number, month: number, day: number): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

/**
 * Format a Date object into 'YYYY-MM-DD'
 */
export function dateToDateKey(date: Date): string {
  return formatDateKey(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Parses 'YYYY-MM-DD' into readable label (e.g. "Thursday, Sep 3, 2026")
 */
export function formatDisplayDate(dateKey: string): string {
  try {
    const [year, month, day] = dateKey.split('-').map(Number);
    if (!year || !month || !day) return dateKey;
    const d = new Date(year, month - 1, day);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${day}, ${year}`;
  } catch {
    return dateKey;
  }
}

/**
 * Load all calendar tasks mapped by date from AsyncStorage.
 */
export async function loadAllCalendarTasks(): Promise<CalendarTasksMap> {
  try {
    const raw = await AsyncStorage.getItem(CALENDAR_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.error('Error loading all calendar tasks:', error);
    return {};
  }
}

/**
 * Save all calendar tasks map to AsyncStorage.
 */
async function saveAllCalendarTasks(tasksMap: CalendarTasksMap): Promise<void> {
  try {
    await AsyncStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(tasksMap));
  } catch (error) {
    console.error('Error saving calendar tasks map:', error);
  }
}

/**
 * Load tasks for a specific date ('YYYY-MM-DD').
 */
export async function loadTasksForDate(dateKey: string): Promise<CalendarTaskItem[]> {
  try {
    const all = await loadAllCalendarTasks();
    const tasks = all[dateKey];
    return Array.isArray(tasks) ? tasks : [];
  } catch (error) {
    console.error(`Error loading tasks for date ${dateKey}:`, error);
    return [];
  }
}

/**
 * Add a new task for a specific date ('YYYY-MM-DD') and persist immediately.
 */
export async function addCalendarTask(dateKey: string, text: string): Promise<CalendarTaskItem[]> {
  const all = await loadAllCalendarTasks();
  const currentTasks = Array.isArray(all[dateKey]) ? all[dateKey] : [];

  const newTask: CalendarTaskItem = {
    id: `cal_task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    date: dateKey,
    text: text.trim(),
    completed: false,
    createdAt: Date.now(),
  };

  const updatedTasks = [newTask, ...currentTasks];
  all[dateKey] = updatedTasks;

  await saveAllCalendarTasks(all);
  return updatedTasks;
}

/**
 * Toggle task completion state for a specific date and persist immediately.
 */
export async function toggleCalendarTask(dateKey: string, taskId: string): Promise<CalendarTaskItem[]> {
  const all = await loadAllCalendarTasks();
  const currentTasks = Array.isArray(all[dateKey]) ? all[dateKey] : [];

  const updatedTasks = currentTasks.map((task) =>
    task.id === taskId ? { ...task, completed: !task.completed } : task
  );
  all[dateKey] = updatedTasks;

  await saveAllCalendarTasks(all);
  return updatedTasks;
}

/**
 * Remove a task by id for a specific date and persist immediately.
 * Tasks are ONLY removed via this explicit user action.
 */
export async function removeCalendarTask(dateKey: string, taskId: string): Promise<CalendarTaskItem[]> {
  const all = await loadAllCalendarTasks();
  const currentTasks = Array.isArray(all[dateKey]) ? all[dateKey] : [];

  const updatedTasks = currentTasks.filter((task) => task.id !== taskId);
  if (updatedTasks.length === 0) {
    delete all[dateKey];
  } else {
    all[dateKey] = updatedTasks;
  }

  await saveAllCalendarTasks(all);
  return updatedTasks;
}
