/**
 * Reading Reminders Screen
 *
 * Configure daily reading reminder notifications
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../contexts/ThemeContext';
import { useReadingReminders } from '../hooks/useReadingReminders';

export function RemindersScreen() {
  const { colors } = useTheme();
  const {
    settings,
    loading,
    permissionStatus,
    requestPermissions,
    toggleReminders,
    updateTime,
    toggleDay,
    formatTime,
    getDayName,
    isEveryDay,
    isWeekdaysOnly,
    setEveryDay,
    setWeekdaysOnly,
    setWeekendsOnly,
  } = useReadingReminders();

  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleToggleReminders = async () => {
    if (!settings.enabled && permissionStatus !== 'granted') {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          'Notifications Disabled',
          'Please enable notifications in your device settings to receive reading reminders.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
          ]
        );
        return;
      }
    }

    const success = await toggleReminders();
    if (!success && !settings.enabled) {
      Alert.alert('Error', 'Failed to enable reminders. Please try again.');
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      updateTime(selectedDate.getHours(), selectedDate.getMinutes());
    }
  };

  const days = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerIcon, { color: colors.primary }]}>🔔</Text>
        <Text style={[styles.title, { color: colors.text }]}>Reading Reminders</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Get notified daily to keep your scripture study consistent
        </Text>
      </View>

      {/* Main Toggle */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleContent}>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>
              Daily Reminders
            </Text>
            <Text style={[styles.toggleDescription, { color: colors.textSecondary }]}>
              {settings.enabled
                ? `Reminding you at ${formatTime(settings.time.hour, settings.time.minute)}`
                : 'Turn on to receive reminders'}
            </Text>
          </View>
          <Switch
            value={settings.enabled}
            onValueChange={handleToggleReminders}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor="#f4f3f4"
          />
        </View>
      </View>

      {/* Time Picker */}
      <View style={[styles.card, { backgroundColor: colors.surface, opacity: settings.enabled ? 1 : 0.5 }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Reminder Time</Text>
        <Pressable
          style={[styles.timeButton, { backgroundColor: colors.background }]}
          onPress={() => settings.enabled && setShowTimePicker(true)}
          disabled={!settings.enabled}
        >
          <Text style={[styles.timeText, { color: colors.primary }]}>
            {formatTime(settings.time.hour, settings.time.minute)}
          </Text>
          <Text style={[styles.timeHint, { color: colors.textSecondary }]}>
            Tap to change
          </Text>
        </Pressable>

        {showTimePicker && (
          <DateTimePicker
            value={new Date(2000, 0, 1, settings.time.hour, settings.time.minute)}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </View>

      {/* Days of Week */}
      <View style={[styles.card, { backgroundColor: colors.surface, opacity: settings.enabled ? 1 : 0.5 }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Remind Me On</Text>

        {/* Quick Presets */}
        <View style={styles.presets}>
          <Pressable
            style={[
              styles.presetButton,
              { backgroundColor: isEveryDay ? colors.primary : colors.background },
            ]}
            onPress={() => settings.enabled && setEveryDay()}
            disabled={!settings.enabled}
          >
            <Text
              style={[
                styles.presetText,
                { color: isEveryDay ? '#ffffff' : colors.text },
              ]}
            >
              Every Day
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.presetButton,
              { backgroundColor: isWeekdaysOnly ? colors.primary : colors.background },
            ]}
            onPress={() => settings.enabled && setWeekdaysOnly()}
            disabled={!settings.enabled}
          >
            <Text
              style={[
                styles.presetText,
                { color: isWeekdaysOnly ? '#ffffff' : colors.text },
              ]}
            >
              Weekdays
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.presetButton,
              {
                backgroundColor:
                  settings.daysOfWeek.length === 2 &&
                  settings.daysOfWeek.includes(0) &&
                  settings.daysOfWeek.includes(6)
                    ? colors.primary
                    : colors.background,
              },
            ]}
            onPress={() => settings.enabled && setWeekendsOnly()}
            disabled={!settings.enabled}
          >
            <Text
              style={[
                styles.presetText,
                {
                  color:
                    settings.daysOfWeek.length === 2 &&
                    settings.daysOfWeek.includes(0) &&
                    settings.daysOfWeek.includes(6)
                      ? '#ffffff'
                      : colors.text,
                },
              ]}
            >
              Weekends
            </Text>
          </Pressable>
        </View>

        {/* Day Buttons */}
        <View style={styles.daysGrid}>
          {days.map((day) => {
            const isSelected = settings.daysOfWeek.includes(day);
            return (
              <Pressable
                key={day}
                style={[
                  styles.dayButton,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.background,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => settings.enabled && toggleDay(day)}
                disabled={!settings.enabled}
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: isSelected ? '#ffffff' : colors.text },
                  ]}
                >
                  {getDayName(day, true)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Tips */}
      <View style={[styles.tipsCard, { backgroundColor: colors.primary + '10' }]}>
        <Text style={[styles.tipsTitle, { color: colors.primary }]}>Tips for Consistent Study</Text>
        <View style={styles.tipsList}>
          <Text style={[styles.tipItem, { color: colors.text }]}>
            • Set a time that works with your daily routine
          </Text>
          <Text style={[styles.tipItem, { color: colors.text }]}>
            • Start with just 5-10 minutes per day
          </Text>
          <Text style={[styles.tipItem, { color: colors.text }]}>
            • Use a study plan to stay on track
          </Text>
          <Text style={[styles.tipItem, { color: colors.text }]}>
            • Build a streak to stay motivated
          </Text>
        </View>
      </View>

      {/* Current Status */}
      {settings.enabled && (
        <View style={[styles.statusCard, { backgroundColor: colors.success + '15' }]}>
          <Text style={[styles.statusIcon]}>✓</Text>
          <View style={styles.statusContent}>
            <Text style={[styles.statusTitle, { color: colors.success }]}>
              Reminders Active
            </Text>
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              {settings.daysOfWeek.length === 7
                ? `Every day at ${formatTime(settings.time.hour, settings.time.minute)}`
                : `${settings.daysOfWeek.length} days/week at ${formatTime(settings.time.hour, settings.time.minute)}`}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    margin: 16,
    marginTop: 8,
    padding: 20,
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleContent: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 14,
  },
  timeButton: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 36,
    fontWeight: '600',
  },
  timeHint: {
    fontSize: 12,
    marginTop: 4,
  },
  presets: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  presetText: {
    fontSize: 13,
    fontWeight: '500',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tipsCard: {
    margin: 16,
    marginTop: 8,
    padding: 20,
    borderRadius: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    lineHeight: 20,
  },
  statusCard: {
    flexDirection: 'row',
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 14,
    marginTop: 2,
  },
  bottomSpacer: {
    height: 40,
  },
});
