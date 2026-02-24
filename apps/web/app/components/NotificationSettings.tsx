'use client';

import { useNotifications } from '../hooks/useNotifications';

export function NotificationSettings() {
  const {
    settings,
    permission,
    supported,
    requestPermission,
    sendTestNotification,
    updateSettings,
    disableNotifications,
  } = useNotifications();

  if (!supported) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <p className="text-sm text-yellow-600 dark:text-yellow-400">
          ⚠️ Push notifications are not supported in your browser.
        </p>
      </div>
    );
  }

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      await sendTestNotification();
    }
  };

  return (
    <div className="space-y-6">
      {/* Enable/Disable Notifications */}
      <div className="bg-[var(--color-bg-secondary)] rounded-xl p-6 border border-[var(--color-border)]">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl">
              🔔
            </div>
            <div>
              <h3 className="font-bold text-lg">Push Notifications</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {permission === 'granted'
                  ? 'Stay on track with daily reminders'
                  : 'Enable notifications to stay consistent'}
              </p>
            </div>
          </div>

          {permission === 'granted' ? (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => {
                  if (e.target.checked) {
                    updateSettings({ enabled: true });
                  } else {
                    disableNotifications();
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-500/30 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          ) : (
            <button
              onClick={handleEnableNotifications}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition"
            >
              Enable
            </button>
          )}
        </div>

        {permission === 'denied' && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              ⚠️ Notifications are blocked. Please enable them in your browser settings.
            </p>
          </div>
        )}
      </div>

      {/* Notification Preferences */}
      {permission === 'granted' && settings.enabled && (
        <div className="bg-[var(--color-bg-secondary)] rounded-xl p-6 border border-[var(--color-border)]">
          <h4 className="font-semibold mb-4">Notification Preferences</h4>

          <div className="space-y-4">
            {/* Daily Verse */}
            <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span>📖</span>
                  <h5 className="font-medium">Daily Verse</h5>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Get inspired with a verse each morning
                </p>
                {settings.dailyVerse && (
                  <input
                    type="time"
                    value={settings.dailyVerseTime}
                    onChange={(e) => updateSettings({ dailyVerseTime: e.target.value })}
                    className="mt-2 px-3 py-1 bg-[var(--color-bg-tertiary)] rounded text-sm"
                  />
                )}
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.dailyVerse}
                  onChange={(e) => updateSettings({ dailyVerse: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-500/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            {/* Streak Reminder */}
            <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span>🔥</span>
                  <h5 className="font-medium">Streak Reminder</h5>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Don't break your streak!
                </p>
                {settings.streakReminder && (
                  <input
                    type="time"
                    value={settings.streakReminderTime}
                    onChange={(e) => updateSettings({ streakReminderTime: e.target.value })}
                    className="mt-2 px-3 py-1 bg-[var(--color-bg-tertiary)] rounded text-sm"
                  />
                )}
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.streakReminder}
                  onChange={(e) => updateSettings({ streakReminder: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-500/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            {/* Study Plan Reminder */}
            <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span>📅</span>
                  <h5 className="font-medium">Study Plan Reminder</h5>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Complete your daily reading goal
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.studyPlanReminder}
                  onChange={(e) => updateSettings({ studyPlanReminder: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-500/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            {/* Achievement Unlocks */}
            <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span>🏆</span>
                  <h5 className="font-medium">Achievement Unlocks</h5>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Celebrate your achievements
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.achievementUnlocks}
                  onChange={(e) => updateSettings({ achievementUnlocks: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-500/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            {/* Challenge Updates */}
            <div className="flex items-center justify-between py-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span>🎯</span>
                  <h5 className="font-medium">Challenge Updates</h5>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Track your challenge progress
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.challengeUpdates}
                  onChange={(e) => updateSettings({ challengeUpdates: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-500/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>

          {/* Test Notification Button */}
          <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
            <button
              onClick={sendTestNotification}
              className="w-full px-4 py-2 bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-secondary)] rounded-lg text-sm font-medium transition"
            >
              Send Test Notification
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Notification prompt modal
export function NotificationPromptModal({ onClose }: { onClose: () => void }) {
  const { requestPermission, sendTestNotification } = useNotifications();

  const handleEnable = async () => {
    const granted = await requestPermission();
    if (granted) {
      await sendTestNotification();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-bg-primary)] rounded-2xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
            🔔
          </div>
          <h2 className="text-2xl font-bold mb-2">Stay on Track</h2>
          <p className="text-[var(--color-text-secondary)]">
            Enable notifications to receive daily verse reminders and keep your study streak alive!
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-2xl">📖</span>
            <span>Daily verse inspiration</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-2xl">🔥</span>
            <span>Streak reminders</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-2xl">🏆</span>
            <span>Achievement unlocks</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] rounded-lg font-semibold transition"
          >
            Not Now
          </button>
          <button
            onClick={handleEnable}
            className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition"
          >
            Enable
          </button>
        </div>
      </div>
    </div>
  );
}
