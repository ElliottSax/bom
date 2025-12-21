/**
 * Settings Screen with Functional Controls
 *
 * All settings now persist and work properly
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme, ThemeMode } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';

export function SettingsScreen() {
  const { theme, setTheme, colors, isDark } = useTheme();
  const {
    settings,
    updateFontSize,
    updateLineHeight,
    toggleVerseNumbers,
    toggleParagraphView,
    toggleRedLetter,
    toggleDailyReminders,
    toggleAutoSaveNotes,
    toggleAutoSync,
    toggleWifiOnly,
    resetSettings,
  } = useSettings();

  const themeOptions: { label: string; value: ThemeMode }[] = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System', value: 'system' },
  ];

  const handleReset = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetSettings,
        },
      ]
    );
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    section: {
      backgroundColor: colors.surface,
      marginVertical: 10,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 10,
      textTransform: 'uppercase',
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingLabel: {
      fontSize: 16,
      color: colors.text,
    },
    settingDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    settingValue: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
    },
    themeOptions: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 10,
      gap: 10,
    },
    themeOption: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 15,
      backgroundColor: colors.background,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    themeOptionSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '15',
    },
    themeOptionText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    themeOptionTextSelected: {
      color: colors.primary,
    },
    sliderContainer: {
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sliderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    slider: {
      width: '100%',
      height: 40,
    },
    previewSection: {
      margin: 20,
      padding: 20,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    previewTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 12,
      textTransform: 'uppercase',
    },
    previewText: {
      color: colors.text,
    },
    resetButton: {
      margin: 20,
      padding: 16,
      backgroundColor: colors.error + '15',
      borderRadius: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.error + '30',
    },
    resetButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.error,
    },
    versionText: {
      textAlign: 'center',
      color: colors.textSecondary,
      fontSize: 12,
      marginBottom: 30,
    },
  });

  return (
    <ScrollView style={dynamicStyles.container}>
      {/* Theme Section */}
      <Text style={dynamicStyles.sectionTitle}>Appearance</Text>
      <View style={dynamicStyles.section}>
        <View style={dynamicStyles.themeOptions}>
          {themeOptions.map((option) => (
            <Pressable
              key={option.value}
              style={[
                dynamicStyles.themeOption,
                theme === option.value && dynamicStyles.themeOptionSelected,
              ]}
              onPress={() => setTheme(option.value)}
            >
              <Text
                style={[
                  dynamicStyles.themeOptionText,
                  theme === option.value && dynamicStyles.themeOptionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Reading Settings */}
      <Text style={dynamicStyles.sectionTitle}>Reading</Text>
      <View style={dynamicStyles.section}>
        {/* Font Size Slider */}
        <View style={dynamicStyles.sliderContainer}>
          <View style={dynamicStyles.sliderHeader}>
            <Text style={dynamicStyles.settingLabel}>Font Size</Text>
            <Text style={dynamicStyles.settingValue}>{settings.reading.fontSize}pt</Text>
          </View>
          <Slider
            style={dynamicStyles.slider}
            minimumValue={12}
            maximumValue={24}
            step={1}
            value={settings.reading.fontSize}
            onValueChange={updateFontSize}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
        </View>

        {/* Line Height Slider */}
        <View style={dynamicStyles.sliderContainer}>
          <View style={dynamicStyles.sliderHeader}>
            <Text style={dynamicStyles.settingLabel}>Line Spacing</Text>
            <Text style={dynamicStyles.settingValue}>{settings.reading.lineHeight.toFixed(1)}x</Text>
          </View>
          <Slider
            style={dynamicStyles.slider}
            minimumValue={1.2}
            maximumValue={2.0}
            step={0.1}
            value={settings.reading.lineHeight}
            onValueChange={updateLineHeight}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
        </View>

        <View style={dynamicStyles.settingItem}>
          <View style={{ flex: 1 }}>
            <Text style={dynamicStyles.settingLabel}>Show Verse Numbers</Text>
            <Text style={dynamicStyles.settingDescription}>
              Display verse numbers while reading
            </Text>
          </View>
          <Switch
            value={settings.reading.showVerseNumbers}
            onValueChange={toggleVerseNumbers}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={'#f4f3f4'}
          />
        </View>

        <View style={dynamicStyles.settingItem}>
          <View style={{ flex: 1 }}>
            <Text style={dynamicStyles.settingLabel}>Paragraph View</Text>
            <Text style={dynamicStyles.settingDescription}>
              Group verses into paragraphs
            </Text>
          </View>
          <Switch
            value={settings.reading.paragraphView}
            onValueChange={toggleParagraphView}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={'#f4f3f4'}
          />
        </View>

        <View style={[dynamicStyles.settingItem, { borderBottomWidth: 0 }]}>
          <View style={{ flex: 1 }}>
            <Text style={dynamicStyles.settingLabel}>Red Letter</Text>
            <Text style={dynamicStyles.settingDescription}>
              Highlight words of Christ in red
            </Text>
          </View>
          <Switch
            value={settings.reading.redLetter}
            onValueChange={toggleRedLetter}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={'#f4f3f4'}
          />
        </View>
      </View>

      {/* Text Preview */}
      <View style={dynamicStyles.previewSection}>
        <Text style={dynamicStyles.previewTitle}>Preview</Text>
        <Text
          style={[
            dynamicStyles.previewText,
            {
              fontSize: settings.reading.fontSize,
              lineHeight: settings.reading.fontSize * settings.reading.lineHeight,
            },
          ]}
        >
          {settings.reading.showVerseNumbers && (
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>1 </Text>
          )}
          And it came to pass that I, Nephi, being exceedingly young, having great desires
          to know of the mysteries of God...
        </Text>
      </View>

      {/* Study Tools */}
      <Text style={dynamicStyles.sectionTitle}>Study Tools</Text>
      <View style={dynamicStyles.section}>
        <View style={dynamicStyles.settingItem}>
          <View style={{ flex: 1 }}>
            <Text style={dynamicStyles.settingLabel}>Daily Reminders</Text>
            <Text style={dynamicStyles.settingDescription}>
              Get notifications for study plans
            </Text>
          </View>
          <Switch
            value={settings.study.dailyReminders}
            onValueChange={toggleDailyReminders}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={'#f4f3f4'}
          />
        </View>

        <View style={[dynamicStyles.settingItem, { borderBottomWidth: 0 }]}>
          <View style={{ flex: 1 }}>
            <Text style={dynamicStyles.settingLabel}>Auto-Save Notes</Text>
            <Text style={dynamicStyles.settingDescription}>
              Automatically save notes while typing
            </Text>
          </View>
          <Switch
            value={settings.study.autoSaveNotes}
            onValueChange={toggleAutoSaveNotes}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={'#f4f3f4'}
          />
        </View>
      </View>

      {/* Sync Settings */}
      <Text style={dynamicStyles.sectionTitle}>Sync & Backup</Text>
      <View style={dynamicStyles.section}>
        <View style={dynamicStyles.settingItem}>
          <View style={{ flex: 1 }}>
            <Text style={dynamicStyles.settingLabel}>Auto-Sync</Text>
            <Text style={dynamicStyles.settingDescription}>
              Sync data across devices automatically
            </Text>
          </View>
          <Switch
            value={settings.sync.autoSync}
            onValueChange={toggleAutoSync}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={'#f4f3f4'}
          />
        </View>

        <View style={[dynamicStyles.settingItem, { borderBottomWidth: 0 }]}>
          <View style={{ flex: 1 }}>
            <Text style={dynamicStyles.settingLabel}>Wi-Fi Only</Text>
            <Text style={dynamicStyles.settingDescription}>
              Only sync when connected to Wi-Fi
            </Text>
          </View>
          <Switch
            value={settings.sync.wifiOnly}
            onValueChange={toggleWifiOnly}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={'#f4f3f4'}
          />
        </View>
      </View>

      {/* Reset Button */}
      <Pressable style={dynamicStyles.resetButton} onPress={handleReset}>
        <Text style={dynamicStyles.resetButtonText}>Reset All Settings</Text>
      </Pressable>

      <Text style={dynamicStyles.versionText}>
        BOM Study Tools v1.0.0
      </Text>
    </ScrollView>
  );
}
