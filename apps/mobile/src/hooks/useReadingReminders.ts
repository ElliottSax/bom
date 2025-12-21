/**
 * Reading Reminders Hook
 *
 * Manage push notifications for daily reading reminders
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const REMINDERS_KEY = '@bom_reading_reminders';

export interface ReminderSettings {
  enabled: boolean;
  time: { hour: number; minute: number };
  daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
  message: string;
  notificationIds: string[];
}

const DEFAULT_REMINDER: ReminderSettings = {
  enabled: false,
  time: { hour: 8, minute: 0 }, // 8:00 AM
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Every day
  message: "Time for your daily scripture study!",
  notificationIds: [],
};

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useReadingReminders() {
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_REMINDER);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    checkPermissions();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(REMINDERS_KEY);
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load reminder settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: ReminderSettings) => {
    try {
      await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (err) {
      console.error('Failed to save reminder settings:', err);
    }
  };

  const checkPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
    return status;
  };

  const requestPermissions = async (): Promise<boolean> => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    if (existingStatus === 'granted') {
      setPermissionStatus('granted');
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus(status);
    return status === 'granted';
  };

  // Cancel all existing reminders
  const cancelAllReminders = async () => {
    if (settings.notificationIds.length > 0) {
      await Promise.all(
        settings.notificationIds.map((id) =>
          Notifications.cancelScheduledNotificationAsync(id)
        )
      );
    }
  };

  // Schedule reminders based on settings
  const scheduleReminders = async (reminderSettings: ReminderSettings): Promise<string[]> => {
    const notificationIds: string[] = [];

    if (!reminderSettings.enabled || reminderSettings.daysOfWeek.length === 0) {
      return notificationIds;
    }

    // Get a random inspirational message
    const messages = [
      "Time for your daily scripture study!",
      "Feed your soul with scripture today.",
      "A few verses a day keeps the spirit at play!",
      "Your daily dose of inspiration awaits.",
      "Take a moment to read and reflect.",
      "Scripture time! Your spirit will thank you.",
      "Ready to learn something new today?",
    ];

    for (const dayOfWeek of reminderSettings.daysOfWeek) {
      const trigger: Notifications.WeeklyTriggerInput = {
        weekday: dayOfWeek + 1, // Expo uses 1-7 (Sunday = 1)
        hour: reminderSettings.time.hour,
        minute: reminderSettings.time.minute,
        repeats: true,
      };

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Scripture Study",
          body: messages[Math.floor(Math.random() * messages.length)],
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { type: 'reading_reminder' },
        },
        trigger,
      });

      notificationIds.push(id);
    }

    return notificationIds;
  };

  // Enable reminders
  const enableReminders = useCallback(async (): Promise<boolean> => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      return false;
    }

    await cancelAllReminders();
    const notificationIds = await scheduleReminders({ ...settings, enabled: true });

    const newSettings = { ...settings, enabled: true, notificationIds };
    await saveSettings(newSettings);

    return true;
  }, [settings]);

  // Disable reminders
  const disableReminders = useCallback(async () => {
    await cancelAllReminders();
    const newSettings = { ...settings, enabled: false, notificationIds: [] };
    await saveSettings(newSettings);
  }, [settings]);

  // Toggle reminders
  const toggleReminders = useCallback(async (): Promise<boolean> => {
    if (settings.enabled) {
      await disableReminders();
      return false;
    } else {
      return await enableReminders();
    }
  }, [settings.enabled, enableReminders, disableReminders]);

  // Update reminder time
  const updateTime = useCallback(async (hour: number, minute: number) => {
    await cancelAllReminders();

    const newSettings = {
      ...settings,
      time: { hour, minute },
      notificationIds: [],
    };

    if (settings.enabled) {
      const notificationIds = await scheduleReminders(newSettings);
      newSettings.notificationIds = notificationIds;
    }

    await saveSettings(newSettings);
  }, [settings]);

  // Update days of week
  const updateDaysOfWeek = useCallback(async (days: number[]) => {
    await cancelAllReminders();

    const newSettings = {
      ...settings,
      daysOfWeek: days,
      notificationIds: [],
    };

    if (settings.enabled) {
      const notificationIds = await scheduleReminders(newSettings);
      newSettings.notificationIds = notificationIds;
    }

    await saveSettings(newSettings);
  }, [settings]);

  // Toggle a specific day
  const toggleDay = useCallback(async (day: number) => {
    const newDays = settings.daysOfWeek.includes(day)
      ? settings.daysOfWeek.filter((d) => d !== day)
      : [...settings.daysOfWeek, day].sort();

    await updateDaysOfWeek(newDays);
  }, [settings.daysOfWeek, updateDaysOfWeek]);

  // Format time for display
  const formatTime = (hour: number, minute: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  // Get day names
  const getDayName = (day: number, short: boolean = false): string => {
    const names = short
      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return names[day];
  };

  // Check if reminders are set for every day
  const isEveryDay = settings.daysOfWeek.length === 7;

  // Check if reminders are set for weekdays only
  const isWeekdaysOnly =
    settings.daysOfWeek.length === 5 &&
    settings.daysOfWeek.includes(1) &&
    settings.daysOfWeek.includes(2) &&
    settings.daysOfWeek.includes(3) &&
    settings.daysOfWeek.includes(4) &&
    settings.daysOfWeek.includes(5) &&
    !settings.daysOfWeek.includes(0) &&
    !settings.daysOfWeek.includes(6);

  // Quick presets
  const setEveryDay = () => updateDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
  const setWeekdaysOnly = () => updateDaysOfWeek([1, 2, 3, 4, 5]);
  const setWeekendsOnly = () => updateDaysOfWeek([0, 6]);

  return {
    settings,
    loading,
    permissionStatus,
    requestPermissions,
    enableReminders,
    disableReminders,
    toggleReminders,
    updateTime,
    updateDaysOfWeek,
    toggleDay,
    formatTime,
    getDayName,
    isEveryDay,
    isWeekdaysOnly,
    setEveryDay,
    setWeekdaysOnly,
    setWeekendsOnly,
  };
}
