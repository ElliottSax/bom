/**
 * Cloud Sync Screen
 *
 * Manage cloud sync settings and account connection
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useCloudSync } from '../hooks/useCloudSync';

export function CloudSyncScreen() {
  const { colors } = useTheme();
  const {
    config,
    status,
    loading,
    enableSync,
    disableSync,
    updateSettings,
    performSync,
    formatLastSync,
  } = useCloudSync();

  const [email, setEmail] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setIsConnecting(true);
    try {
      // In a real app, this would authenticate with your backend
      // For now, we'll just use the email as the user ID
      const userId = email.toLowerCase().trim();
      const success = await enableSync(userId);

      if (success) {
        Alert.alert('Connected', 'Your account is now syncing across devices.');
        setEmail('');
      } else {
        Alert.alert('Connection Failed', 'Please check your internet connection and try again.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to connect. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Account',
      'Your data will remain on this device but will no longer sync. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: disableSync,
        },
      ]
    );
  };

  const handleManualSync = async () => {
    if (status.isSyncing) return;

    const success = await performSync();
    if (success) {
      Alert.alert('Sync Complete', 'Your data has been synchronized.');
    } else if (status.error) {
      Alert.alert('Sync Failed', status.error);
    }
  };

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
        <Text style={[styles.headerIcon, { color: colors.primary }]}>☁️</Text>
        <Text style={[styles.title, { color: colors.text }]}>Cloud Sync</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Keep your bookmarks, notes, and progress in sync across all your devices
        </Text>
      </View>

      {/* Connection Status */}
      {config.enabled ? (
        <>
          {/* Connected Card */}
          <View style={[styles.card, { backgroundColor: colors.success + '15' }]}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusIcon}>✓</Text>
              <View style={styles.statusContent}>
                <Text style={[styles.statusTitle, { color: colors.success }]}>
                  Connected
                </Text>
                <Text style={[styles.statusEmail, { color: colors.textSecondary }]}>
                  {config.userId}
                </Text>
              </View>
              <Pressable
                style={[styles.disconnectButton, { borderColor: colors.error }]}
                onPress={handleDisconnect}
              >
                <Text style={[styles.disconnectText, { color: colors.error }]}>
                  Disconnect
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Sync Status */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Sync Status</Text>

            <View style={styles.syncStatusRow}>
              <View>
                <Text style={[styles.syncLabel, { color: colors.textSecondary }]}>
                  Last synced
                </Text>
                <Text style={[styles.syncValue, { color: colors.text }]}>
                  {formatLastSync(status.lastSyncAt)}
                </Text>
              </View>

              <View>
                <Text style={[styles.syncLabel, { color: colors.textSecondary }]}>
                  Pending changes
                </Text>
                <Text style={[styles.syncValue, { color: colors.text }]}>
                  {status.pendingChanges}
                </Text>
              </View>

              <View>
                <Text style={[styles.syncLabel, { color: colors.textSecondary }]}>
                  Connection
                </Text>
                <Text
                  style={[
                    styles.syncValue,
                    { color: status.isOnline ? colors.success : colors.error },
                  ]}
                >
                  {status.isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>

            {status.error && (
              <View style={[styles.errorBanner, { backgroundColor: colors.error + '15' }]}>
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {status.error}
                </Text>
              </View>
            )}

            <Pressable
              style={[
                styles.syncButton,
                { backgroundColor: colors.primary },
                status.isSyncing && styles.syncButtonDisabled,
              ]}
              onPress={handleManualSync}
              disabled={status.isSyncing}
            >
              {status.isSyncing ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.syncButtonText}>Sync Now</Text>
              )}
            </Pressable>
          </View>

          {/* Sync Settings */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Sync Settings</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Auto-Sync
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Automatically sync changes in background
                </Text>
              </View>
              <Switch
                value={config.autoSync}
                onValueChange={(value) => updateSettings({ autoSync: value })}
                trackColor={{ false: '#767577', true: colors.primary }}
                thumbColor="#f4f3f4"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Wi-Fi Only
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Only sync when connected to Wi-Fi
                </Text>
              </View>
              <Switch
                value={config.wifiOnly}
                onValueChange={(value) => updateSettings({ wifiOnly: value })}
                trackColor={{ false: '#767577', true: colors.primary }}
                thumbColor="#f4f3f4"
              />
            </View>
          </View>

          {/* What Syncs */}
          <View style={[styles.infoCard, { backgroundColor: colors.primary + '10' }]}>
            <Text style={[styles.infoTitle, { color: colors.primary }]}>
              What gets synced:
            </Text>
            <Text style={[styles.infoItem, { color: colors.text }]}>• Bookmarks</Text>
            <Text style={[styles.infoItem, { color: colors.text }]}>• Verse highlights</Text>
            <Text style={[styles.infoItem, { color: colors.text }]}>• Notes</Text>
            <Text style={[styles.infoItem, { color: colors.text }]}>• Reading progress</Text>
            <Text style={[styles.infoItem, { color: colors.text }]}>• Study plan progress</Text>
          </View>
        </>
      ) : (
        <>
          {/* Not Connected Card */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Connect Your Account
            </Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Enter your email to sync your data across all your devices.
            </Text>

            <TextInput
              style={[
                styles.emailInput,
                {
                  color: colors.text,
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
              placeholder="your@email.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Pressable
              style={[
                styles.connectButton,
                { backgroundColor: colors.primary },
                isConnecting && styles.connectButtonDisabled,
              ]}
              onPress={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.connectButtonText}>Connect Account</Text>
              )}
            </Pressable>
          </View>

          {/* Benefits */}
          <View style={[styles.benefitsCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Why use Cloud Sync?
            </Text>

            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>📱</Text>
              <View style={styles.benefitContent}>
                <Text style={[styles.benefitTitle, { color: colors.text }]}>
                  Multiple Devices
                </Text>
                <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
                  Access your notes and bookmarks on any device
                </Text>
              </View>
            </View>

            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>💾</Text>
              <View style={styles.benefitContent}>
                <Text style={[styles.benefitTitle, { color: colors.text }]}>
                  Automatic Backup
                </Text>
                <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
                  Never lose your study progress
                </Text>
              </View>
            </View>

            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>⚡</Text>
              <View style={styles.benefitContent}>
                <Text style={[styles.benefitTitle, { color: colors.text }]}>
                  Real-time Sync
                </Text>
                <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
                  Changes sync instantly across devices
                </Text>
              </View>
            </View>
          </View>
        </>
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  disconnectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 8,
  },
  disconnectText: {
    fontSize: 14,
    fontWeight: '500',
  },
  syncStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  syncLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  syncValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  syncButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  syncButtonDisabled: {
    opacity: 0.7,
  },
  syncButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  emailInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  connectButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  connectButtonDisabled: {
    opacity: 0.7,
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  benefitsCard: {
    margin: 16,
    marginTop: 8,
    padding: 20,
    borderRadius: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  benefitDescription: {
    fontSize: 14,
  },
  infoCard: {
    margin: 16,
    marginTop: 8,
    padding: 20,
    borderRadius: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoItem: {
    fontSize: 14,
    lineHeight: 24,
  },
  bottomSpacer: {
    height: 40,
  },
});
