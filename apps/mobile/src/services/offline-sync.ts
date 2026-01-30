/**
 * Offline Sync Service
 *
 * Manages offline data synchronization and caching
 */

import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { getApolloClient } from '../config/apollo';
import { gql } from '@apollo/client';
import type { OfflineOperationVariables } from '../types';
import { logger } from '../utils/logger';

const log = logger.scope('OfflineSync');

const SYNC_STATUS_KEY = '@bom_sync_status';
const OFFLINE_QUEUE_KEY = '@bom_offline_queue';
const LAST_SYNC_KEY = '@bom_last_sync';

interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  syncing: boolean;
}

interface OfflineOperation {
  id: string;
  type: 'mutation';
  operation: string;
  variables: OfflineOperationVariables;
  timestamp: Date;
  retries: number;
}

class OfflineSyncService {
  private syncStatus: SyncStatus = {
    isOnline: true,
    lastSync: null,
    pendingChanges: 0,
    syncing: false,
  };

  private offlineQueue: OfflineOperation[] = [];
  private listeners: Set<(status: SyncStatus) => void> = new Set();
  private netInfoUnsubscribe: (() => void) | null = null;

  async initialize() {
    // Load offline queue
    await this.loadOfflineQueue();

    // Load last sync time
    const lastSyncStr = await AsyncStorage.getItem(LAST_SYNC_KEY);
    if (lastSyncStr) {
      this.syncStatus.lastSync = new Date(lastSyncStr);
    }

    // Monitor network status
    this.netInfoUnsubscribe = NetInfo.addEventListener((state) => {
      this.handleNetworkChange(state.isConnected ?? false);
    });

    // Check initial network status
    const netState = await NetInfo.fetch();
    this.syncStatus.isOnline = netState.isConnected ?? false;

    // Start sync if online and has pending changes
    if (this.syncStatus.isOnline && this.offlineQueue.length > 0) {
      this.processPendingOperations();
    }
  }

  private async handleNetworkChange(isConnected: boolean) {
    const wasOffline = !this.syncStatus.isOnline;
    this.syncStatus.isOnline = isConnected;

    this.notifyListeners();

    // Process queue when coming online
    if (wasOffline && isConnected && this.offlineQueue.length > 0) {
      await this.processPendingOperations();
    }
  }

  /**
   * Add operation to offline queue
   */
  async queueOperation(operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'retries'>) {
    const op: OfflineOperation = {
      ...operation,
      id: `op_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date(),
      retries: 0,
    };

    this.offlineQueue.push(op);
    this.syncStatus.pendingChanges = this.offlineQueue.length;
    await this.saveOfflineQueue();

    this.notifyListeners();

    // Try to process immediately if online
    if (this.syncStatus.isOnline) {
      await this.processPendingOperations();
    }
  }

  /**
   * Process all pending offline operations
   */
  private async processPendingOperations() {
    if (this.syncStatus.syncing || !this.syncStatus.isOnline) {
      return;
    }

    this.syncStatus.syncing = true;
    this.notifyListeners();

    const client = getApolloClient();
    const processedOps: string[] = [];

    for (const op of this.offlineQueue) {
      try {
        // Execute the mutation
        await client.mutate({
          mutation: gql(op.operation),
          variables: op.variables,
        });

        processedOps.push(op.id);
        log.debug(`Processed offline operation: ${op.id}`);
      } catch (error) {
        log.error(`Failed to process offline operation ${op.id}`, error);
        op.retries++;

        // Remove if too many retries
        if (op.retries > 3) {
          processedOps.push(op.id);
          log.error(`Removing failed operation after 3 retries: ${op.id}`);
        }
      }
    }

    // Remove processed operations
    this.offlineQueue = this.offlineQueue.filter(
      (op) => !processedOps.includes(op.id)
    );

    this.syncStatus.pendingChanges = this.offlineQueue.length;
    this.syncStatus.syncing = false;
    this.syncStatus.lastSync = new Date();

    await this.saveOfflineQueue();
    await AsyncStorage.setItem(LAST_SYNC_KEY, this.syncStatus.lastSync.toISOString());

    this.notifyListeners();
  }

  /**
   * Download verses for offline access
   */
  async downloadVersesForOffline(editionId: string, book?: string) {
    const client = getApolloClient();

    try {
      const query = gql`
        query DownloadVerses($editionId: String!, $book: String) {
          verses(editionId: $editionId, book: $book, limit: 1000) {
            id
            editionId
            book
            chapter
            verse
            text
            verseType
          }
        }
      `;

      const result = await client.query({
        query,
        variables: { editionId, book },
        fetchPolicy: 'network-only',
      });

      // The data is automatically cached by Apollo
      log.info(`Downloaded ${result.data.verses.length} verses for offline access`);

      return result.data.verses;
    } catch (error) {
      log.error('Error downloading verses', error);
      throw error;
    }
  }

  /**
   * Clear all offline data
   */
  async clearOfflineData() {
    this.offlineQueue = [];
    this.syncStatus.pendingChanges = 0;
    this.syncStatus.lastSync = null;

    await AsyncStorage.multiRemove([
      OFFLINE_QUEUE_KEY,
      LAST_SYNC_KEY,
      SYNC_STATUS_KEY,
    ]);

    // Clear Apollo cache
    const client = getApolloClient();
    await client.clearStore();

    this.notifyListeners();
  }

  /**
   * Get sync status
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Subscribe to sync status changes
   */
  subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Load offline queue from storage
   */
  private async loadOfflineQueue() {
    try {
      const queueStr = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (queueStr) {
        this.offlineQueue = JSON.parse(queueStr).map((op: OfflineOperation) => ({
          ...op,
          timestamp: new Date(op.timestamp),
        }));
        this.syncStatus.pendingChanges = this.offlineQueue.length;
      }
    } catch (error) {
      log.error('Error loading offline queue', error);
    }
  }

  /**
   * Save offline queue to storage
   */
  private async saveOfflineQueue() {
    try {
      await AsyncStorage.setItem(
        OFFLINE_QUEUE_KEY,
        JSON.stringify(this.offlineQueue)
      );
    } catch (error) {
      log.error('Error saving offline queue', error);
    }
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners() {
    const status = this.getSyncStatus();
    this.listeners.forEach((listener) => listener(status));
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
      this.netInfoUnsubscribe = null;
    }
    this.listeners.clear();
  }
}

// Singleton instance
export const offlineSync = new OfflineSyncService();

/**
 * Hook to use offline sync status
 */
export function useOfflineSync() {
  const [syncStatus, setSyncStatus] = React.useState(offlineSync.getSyncStatus());

  React.useEffect(() => {
    const unsubscribe = offlineSync.subscribe(setSyncStatus);
    return unsubscribe;
  }, []);

  return {
    ...syncStatus,
    downloadForOffline: offlineSync.downloadVersesForOffline.bind(offlineSync),
    clearOfflineData: offlineSync.clearOfflineData.bind(offlineSync),
    queueOperation: offlineSync.queueOperation.bind(offlineSync),
  };
}