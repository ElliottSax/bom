import { useState, useEffect, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';

export interface NotificationSettings {
  enabled: boolean;
  dailyVerse: boolean;
  dailyVerseTime: string; // HH:MM format
  streakReminder: boolean;
  streakReminderTime: string;
  studyPlanReminder: boolean;
  achievementUnlocks: boolean;
  challengeUpdates: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  dailyVerse: true,
  dailyVerseTime: '08:00',
  streakReminder: true,
  streakReminderTime: '20:00',
  studyPlanReminder: true,
  achievementUnlocks: true,
  challengeUpdates: true,
};

export function useNotifications() {
  const [settings, setSettings] = useLocalStorage<NotificationSettings>(
    'coc-notification-settings',
    DEFAULT_SETTINGS
  );

  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);

  // Check if notifications are supported
  useEffect(() => {
    setSupported('Notification' in window && 'serviceWorker' in navigator);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!supported) {
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        setSettings({ ...settings, enabled: true });

        // Register service worker for push notifications
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered:', registration);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [supported, settings, setSettings]);

  // Send a test notification
  const sendTestNotification = useCallback(async () => {
    if (permission !== 'granted') {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      await registration.showNotification('Book of Mormon Study Tools', {
        body: 'Notifications are working! You\'ll receive daily reminders to help you stay on track.',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: 'test-notification',
        vibrate: [200, 100, 200],
      });

      return true;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }, [permission]);

  // Schedule daily verse notification
  const scheduleDailyVerse = useCallback(async (time: string) => {
    if (permission !== 'granted') return;

    // In production, this would sync with a backend service
    // For now, we'll use localStorage to track the schedule
    localStorage.setItem('daily-verse-time', time);

    // Send immediate notification if enabled
    if (settings.dailyVerse) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('Daily Verse', {
        body: 'Check out today\'s verse for inspiration!',
        icon: '/icon-192.png',
        tag: 'daily-verse',
        data: { type: 'daily-verse' },
      });
    }
  }, [permission, settings.dailyVerse]);

  // Schedule streak reminder notification
  const scheduleStreakReminder = useCallback(async (time: string, currentStreak: number) => {
    if (permission !== 'granted' || !settings.streakReminder) return;

    const registration = await navigator.serviceWorker.ready;

    await registration.showNotification('Don\'t Break the Streak!', {
      body: `You're on a ${currentStreak}-day streak! Read today to keep it going 🔥`,
      icon: '/icon-192.png',
      tag: 'streak-reminder',
      data: { type: 'streak-reminder' },
      requireInteraction: true,
    });
  }, [permission, settings.streakReminder]);

  // Send achievement unlock notification
  const notifyAchievementUnlock = useCallback(async (achievementName: string, points: number) => {
    if (permission !== 'granted' || !settings.achievementUnlocks) return;

    const registration = await navigator.serviceWorker.ready;

    await registration.showNotification('Achievement Unlocked! 🏆', {
      body: `${achievementName} (+${points} points)`,
      icon: '/icon-192.png',
      tag: `achievement-${Date.now()}`,
      data: { type: 'achievement', name: achievementName },
      vibrate: [200, 100, 200, 100, 200],
    });
  }, [permission, settings.achievementUnlocks]);

  // Send challenge update notification
  const notifyChallengeUpdate = useCallback(async (message: string) => {
    if (permission !== 'granted' || !settings.challengeUpdates) return;

    const registration = await navigator.serviceWorker.ready;

    await registration.showNotification('Challenge Update', {
      body: message,
      icon: '/icon-192.png',
      tag: `challenge-${Date.now()}`,
      data: { type: 'challenge' },
    });
  }, [permission, settings.challengeUpdates]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings({ ...settings, ...newSettings });
  }, [settings, setSettings]);

  // Disable all notifications
  const disableNotifications = useCallback(() => {
    setSettings({ ...settings, enabled: false });
  }, [settings, setSettings]);

  return {
    settings,
    permission,
    supported,
    requestPermission,
    sendTestNotification,
    scheduleDailyVerse,
    scheduleStreakReminder,
    notifyAchievementUnlock,
    notifyChallengeUpdate,
    updateSettings,
    disableNotifications,
  };
}

// Helper to create service worker file
export const SERVICE_WORKER_CODE = `
// Service Worker for Push Notifications
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};

  event.waitUntil(
    self.registration.showNotification(data.title || 'BOM Study Tools', {
      body: data.body || 'You have a new notification',
      icon: data.icon || '/icon-192.png',
      badge: '/badge-72.png',
      data: data.data || {},
    })
  );
});
`;
