/**
 * Cloud Sync Hook
 *
 * Sync user data (bookmarks, notes, highlights, progress) across devices
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { logger } from '../utils/logger';

const log = logger.scope('CloudSync');

// Storage keys
const SYNC_CONFIG_KEY = '@bom_sync_config';
const SYNC_QUEUE_KEY = '@bom_sync_queue';
const LAST_SYNC_KEY = '@bom_last_sync';
const AUTH_TOKEN_KEY = '@bom_auth_token';
const REFRESH_TOKEN_KEY = '@bom_refresh_token';

const DATA_KEYS = {
  bookmarks: '@bom_bookmarks',
  highlights: '@bom_highlights',
  notes: '@bom_notes',
  readingProgress: '@bom_reading_progress',
  studyPlan: '@bom_study_plan',
};

// API configuration - replace with your actual API URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.bomstudytools.org';

export interface SyncConfig {
  enabled: boolean;
  userId: string | null;
  deviceId: string;
  lastSyncAt: number | null;
  wifiOnly: boolean;
  autoSync: boolean;
  syncInterval: number; // minutes
}

export interface SyncChange {
  id: string;
  type: 'bookmarks' | 'highlights' | 'notes' | 'readingProgress' | 'studyPlan';
  action: 'add' | 'update' | 'delete';
  data: any;
  timestamp: number;
  synced: boolean;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncAt: number | null;
  pendingChanges: number;
  error: string | null;
  isOnline: boolean;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

const DEFAULT_CONFIG: SyncConfig = {
  enabled: false,
  userId: null,
  deviceId: '',
  lastSyncAt: null,
  wifiOnly: true,
  autoSync: true,
  syncInterval: 15,
};

export function useCloudSync() {
  const [config, setConfig] = useState<SyncConfig>(DEFAULT_CONFIG);
  const [status, setStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncAt: null,
    pendingChanges: 0,
    error: null,
    isOnline: true,
  });
  const [loading, setLoading] = useState(true);
  const [authTokens, setAuthTokens] = useState<AuthTokens | null>(null);

  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize on mount
  useEffect(() => {
    initializeSync();
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setStatus((prev) => ({
        ...prev,
        isOnline: state.isConnected ?? false,
      }));
    });

    return () => unsubscribe();
  }, []);

  // Set up auto-sync interval
  useEffect(() => {
    if (config.enabled && config.autoSync) {
      syncIntervalRef.current = setInterval(
        () => performSync(),
        config.syncInterval * 60 * 1000
      );
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [config.enabled, config.autoSync, config.syncInterval]);

  // Load auth tokens from storage
  const loadAuthTokens = async () => {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
        AsyncStorage.getItem(REFRESH_TOKEN_KEY),
      ]);

      if (accessToken && refreshToken) {
        // Parse JWT to get expiration (basic implementation)
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const expiresAt = payload.exp * 1000; // Convert to milliseconds

        setAuthTokens({
          accessToken,
          refreshToken,
          expiresAt,
        });
      }
    } catch (err) {
      log.error('Failed to load auth tokens', err);
    }
  };

  // Save auth tokens to storage
  const saveAuthTokens = async (tokens: AuthTokens) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(AUTH_TOKEN_KEY, tokens.accessToken),
        AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken),
      ]);
      setAuthTokens(tokens);
    } catch (err) {
      log.error('Failed to save auth tokens', err);
    }
  };

  // Get valid access token (refresh if needed)
  const getValidAccessToken = async (): Promise<string | null> => {
    if (!authTokens) {
      log.warn('No auth tokens available');
      return null;
    }

    // Check if token is expired or about to expire (within 5 minutes)
    const now = Date.now();
    const bufferTime = 5 * 60 * 1000; // 5 minutes

    if (now >= authTokens.expiresAt - bufferTime) {
      // Token expired or about to expire, refresh it
      log.info('Access token expired, refreshing...');
      const newToken = await refreshAccessToken();
      return newToken;
    }

    return authTokens.accessToken;
  };

  // Refresh access token using refresh token
  const refreshAccessToken = async (): Promise<string | null> => {
    if (!authTokens?.refreshToken) {
      log.error('No refresh token available');
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: authTokens.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      const payload = JSON.parse(atob(data.accessToken.split('.')[1]));

      const newTokens: AuthTokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || authTokens.refreshToken,
        expiresAt: payload.exp * 1000,
      };

      await saveAuthTokens(newTokens);
      return newTokens.accessToken;
    } catch (err) {
      log.error('Failed to refresh access token', err);
      // Clear invalid tokens
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY]);
      setAuthTokens(null);
      return null;
    }
  };

  // Make authenticated API request
  const authenticatedFetch = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const token = await getValidAccessToken();

    if (!token) {
      throw new Error('Not authenticated. Please log in again.');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle 401 Unauthorized - try to refresh token once
    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        // Retry request with new token
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json',
          },
        });
      }
      throw new Error('Authentication failed. Please log in again.');
    }

    return response;
  };

  const initializeSync = async () => {
    try {
      // Load auth tokens
      await loadAuthTokens();

      // Load config
      const savedConfig = await AsyncStorage.getItem(SYNC_CONFIG_KEY);
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      } else {
        // Generate device ID on first run
        const deviceId = `${Platform.OS}-${Platform.Version}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        const newConfig = { ...DEFAULT_CONFIG, deviceId };
        await saveConfig(newConfig);
      }

      // Load pending changes count
      const queue = await getSyncQueue();
      setStatus((prev) => ({
        ...prev,
        pendingChanges: queue.filter((c) => !c.synced).length,
      }));

      // Load last sync time
      const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
      if (lastSync) {
        setStatus((prev) => ({
          ...prev,
          lastSyncAt: parseInt(lastSync, 10),
        }));
      }
    } catch (err) {
      log.error('Failed to initialize sync', err);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (newConfig: SyncConfig) => {
    await AsyncStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(newConfig));
    setConfig(newConfig);
  };

  const getSyncQueue = async (): Promise<SyncChange[]> => {
    const queue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  };

  const saveSyncQueue = async (queue: SyncChange[]) => {
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    setStatus((prev) => ({
      ...prev,
      pendingChanges: queue.filter((c) => !c.synced).length,
    }));
  };

  // Queue a change for syncing
  const queueChange = useCallback(
    async (
      type: SyncChange['type'],
      action: SyncChange['action'],
      data: any
    ) => {
      if (!config.enabled) return;

      const change: SyncChange = {
        id: `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        type,
        action,
        data,
        timestamp: Date.now(),
        synced: false,
      };

      const queue = await getSyncQueue();
      queue.push(change);
      await saveSyncQueue(queue);

      // Trigger immediate sync if auto-sync is enabled and online
      if (config.autoSync && status.isOnline) {
        performSync();
      }
    },
    [config.enabled, config.autoSync, status.isOnline]
  );

  // Perform sync with cloud
  const performSync = useCallback(async (): Promise<boolean> => {
    if (!config.enabled || !config.userId) {
      return false;
    }

    // Check network conditions
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      setStatus((prev) => ({ ...prev, error: 'No internet connection' }));
      return false;
    }

    if (config.wifiOnly && netInfo.type !== 'wifi') {
      setStatus((prev) => ({ ...prev, error: 'Waiting for Wi-Fi' }));
      return false;
    }

    setStatus((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      // Get pending changes
      const queue = await getSyncQueue();
      const pending = queue.filter((c) => !c.synced);

      if (pending.length > 0) {
        // Upload changes using JWT authentication
        const response = await authenticatedFetch(`${API_BASE_URL}/sync/push`, {
          method: 'POST',
          body: JSON.stringify({
            changes: pending,
            lastSyncAt: config.lastSyncAt,
            deviceId: config.deviceId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to upload changes');
        }

        // Mark changes as synced
        const updatedQueue = queue.map((c) =>
          pending.find((p) => p.id === c.id) ? { ...c, synced: true } : c
        );
        await saveSyncQueue(updatedQueue);
      }

      // Pull changes from cloud using JWT authentication
      const pullResponse = await authenticatedFetch(
        `${API_BASE_URL}/sync/pull?since=${config.lastSyncAt || 0}&deviceId=${config.deviceId}`
      );

      if (pullResponse.ok) {
        const { changes } = await pullResponse.json();
        await applyRemoteChanges(changes);
      }

      // Update last sync time
      const now = Date.now();
      await AsyncStorage.setItem(LAST_SYNC_KEY, now.toString());
      await saveConfig({ ...config, lastSyncAt: now });

      setStatus((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncAt: now,
        error: null,
      }));

      // Clean up old synced changes
      await cleanupQueue();

      return true;
    } catch (err) {
      log.error('Sync failed', err);
      setStatus((prev) => ({
        ...prev,
        isSyncing: false,
        error: err instanceof Error ? err.message : 'Sync failed',
      }));
      return false;
    }
  }, [config]);

  // Apply remote changes to local storage
  const applyRemoteChanges = async (changes: SyncChange[]) => {
    for (const change of changes) {
      const storageKey = DATA_KEYS[change.type];
      if (!storageKey) continue;

      const current = await AsyncStorage.getItem(storageKey);
      let data = current ? JSON.parse(current) : change.type === 'readingProgress' ? {} : [];

      switch (change.action) {
        case 'add':
        case 'update':
          if (Array.isArray(data)) {
            const index = data.findIndex((item: any) => item.id === change.data.id);
            if (index >= 0) {
              data[index] = change.data;
            } else {
              data.push(change.data);
            }
          } else {
            data = { ...data, ...change.data };
          }
          break;

        case 'delete':
          if (Array.isArray(data)) {
            data = data.filter((item: any) => item.id !== change.data.id);
          }
          break;
      }

      await AsyncStorage.setItem(storageKey, JSON.stringify(data));
    }
  };

  // Clean up old synced changes
  const cleanupQueue = async () => {
    const queue = await getSyncQueue();
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const filtered = queue.filter(
      (c) => !c.synced || c.timestamp > oneWeekAgo
    );
    await saveSyncQueue(filtered);
  };

  // Enable sync with user account
  const enableSync = useCallback(
    async (userId: string): Promise<boolean> => {
      try {
        const newConfig = {
          ...config,
          enabled: true,
          userId,
        };
        await saveConfig(newConfig);

        // Perform initial sync
        return await performSync();
      } catch (err) {
        log.error('Failed to enable sync', err);
        return false;
      }
    },
    [config]
  );

  // Disable sync
  const disableSync = useCallback(async () => {
    await saveConfig({
      ...config,
      enabled: false,
      userId: null,
      lastSyncAt: null,
    });
    await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
    setStatus((prev) => ({
      ...prev,
      pendingChanges: 0,
      lastSyncAt: null,
    }));
  }, [config]);

  // Update sync settings
  const updateSettings = useCallback(
    async (updates: Partial<Pick<SyncConfig, 'wifiOnly' | 'autoSync' | 'syncInterval'>>) => {
      await saveConfig({ ...config, ...updates });
    },
    [config]
  );

  // Format last sync time for display
  const formatLastSync = (timestamp: number | null): string => {
    if (!timestamp) return 'Never';

    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60 * 1000) return 'Just now';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)} hours ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Login to enable cloud sync
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const payload = JSON.parse(atob(data.accessToken.split('.')[1]));

      const tokens: AuthTokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: payload.exp * 1000,
      };

      await saveAuthTokens(tokens);

      // Extract user ID from token payload
      const userId = payload.sub || payload.userId;

      // Enable sync with user ID
      await saveConfig({
        ...config,
        enabled: true,
        userId,
      });

      return true;
    } catch (err) {
      log.error('Login failed', err);
      return false;
    }
  }, [config]);

  // Logout and disable cloud sync
  const logout = useCallback(async () => {
    try {
      // Clear auth tokens
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY]);
      setAuthTokens(null);

      // Disable sync
      await disableSync();
    } catch (err) {
      log.error('Logout failed', err);
    }
  }, [disableSync]);

  // Check if user is authenticated
  const isAuthenticated = authTokens !== null;

  return {
    config,
    status,
    loading,
    isAuthenticated,
    enableSync,
    disableSync,
    updateSettings,
    performSync,
    queueChange,
    formatLastSync,
    login,
    logout,
  };
}
