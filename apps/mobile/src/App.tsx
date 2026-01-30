/**
 * Main App Component
 *
 * Entry point for the Book of Mormon Study Tools mobile app
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { ApolloClient, ApolloProvider, NormalizedCacheObject } from '@apollo/client';
import { initializeApolloClient } from './config/apollo';
import { initDatabase } from './services/offlineStorage';
import { RootNavigator } from './navigation/RootNavigator';
import { logger } from './utils/logger';

const log = logger.scope('App');

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<Error | null>(null);
  const [apolloClient, setApolloClient] = useState<ApolloClient<NormalizedCacheObject> | null>(null);

  useEffect(() => {
    async function initialize() {
      try {
        log.info('Initializing app...');

        // Initialize Apollo Client
        log.info('Initializing Apollo Client...');
        const client = await initializeApolloClient();
        setApolloClient(client);

        // Initialize SQLite database
        log.info('Initializing SQLite database...');
        await initDatabase();

        log.info('App initialized successfully');
        setIsInitializing(false);
      } catch (error) {
        log.error('Initialization error:', error);
        setInitError(error as Error);
        setIsInitializing(false);
      }
    }

    initialize();
  }, []);

  // Loading screen
  if (isInitializing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Error screen
  if (initError || !apolloClient) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to initialize app</Text>
        <Text style={styles.errorDetail}>
          {initError?.message || 'Unknown error'}
        </Text>
      </View>
    );
  }

  // Main app
  return (
    <ApolloProvider client={apolloClient}>
      <RootNavigator />
    </ApolloProvider>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});
