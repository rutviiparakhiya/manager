import { Platform } from 'react-native';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import {
  requestPermissionsAsync,
  getPermissionsAsync,
} from 'expo-notifications/build/NotificationPermissions';
import scheduleNotificationAsync from 'expo-notifications/build/scheduleNotificationAsync';
import cancelScheduledNotificationAsync from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskItem } from '@/types/task';
import { getNextIST1150PMTimestamp } from '@/utils/timezone';

const STORAGE_KEY_NOTIFICATION_ID = '@myManager:pending_tasks_notification_id';
const NOTIFICATION_IDENTIFIER = 'myManager-pending-tasks-1150pm-ist';

// Configure foreground notification behavior for local notifications
// (Does not register for or use any push tokens)
try {
  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.warn('Could not set notification handler:', e);
}

/**
 * Request local notification permissions on app startup.
 * Handles granted, denied, and web gracefully with no crashes.
 * Never requests or registers for remote/push tokens.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const { status: existingStatus } = await getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.warn('Notification permission request failed (safely caught):', error);
    return false;
  }
}

/**
 * Cancel any existing pending-tasks local notification.
 */
export async function cancelPendingTasksNotification(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    await cancelScheduledNotificationAsync(NOTIFICATION_IDENTIFIER);
    await AsyncStorage.removeItem(STORAGE_KEY_NOTIFICATION_ID);
  } catch {
    // Ignore if not scheduled
  }
}

/**
 * Synchronize the 11:50 PM IST local notification based on current Today's Tasks.
 * - If there are pending/incomplete tasks in Today's Tasks: schedule local reminder for 11:50 PM IST.
 * - If zero tasks or all completed: cancel the local notification.
 * - Purely local notification: zero push/device token registration.
 */
export async function syncPendingTasksNotification(todayTasks: TaskItem[]): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    const hasPendingTasks = todayTasks.some((task) => !task.completed);

    if (!hasPendingTasks) {
      await cancelPendingTasksNotification();
      return;
    }

    // Cancel existing reminder to avoid duplication
    await cancelPendingTasksNotification();

    const targetTimestamp = getNextIST1150PMTimestamp();

    await scheduleNotificationAsync({
      identifier: NOTIFICATION_IDENTIFIER,
      content: {
        title: "Today's Tasks Reminder",
        body: 'You have pending tasks — check your Today’s Tasks before the day ends.',
        sound: true,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: targetTimestamp,
      },
    });

    await AsyncStorage.setItem(STORAGE_KEY_NOTIFICATION_ID, targetTimestamp.toString());
  } catch (error) {
    console.warn('Error syncing pending tasks notification:', error);
  }
}
