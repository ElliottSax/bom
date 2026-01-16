/**
 * Apollo Client Configuration
 *
 * Configures GraphQL client with offline caching support
 */

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  from,
  NormalizedCacheObject,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistCache, AsyncStorageWrapper } from 'apollo3-cache-persist';

// API endpoint - should be configurable via environment
const API_URL = __DEV__
  ? 'http://localhost:4000/graphql'
  : 'https://api.bomstudytools.org/graphql';

// Verse type for cache
interface CachedVerse {
  __ref: string;
}

// Initialize cache with proper merge strategy
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        verses: {
          // Merge strategy for verse queries - replace instead of append to avoid duplicates
          keyArgs: ['editionId', 'book', 'chapter'],
          merge(existing: CachedVerse[] | undefined, incoming: CachedVerse[], { args }) {
            // For pagination, we'd merge; for chapter loads, we replace
            // Since verses are loaded by chapter, replace is the correct behavior
            return incoming;
          },
        },
        searchVerses: {
          // Search results should always replace
          keyArgs: ['query', 'editionId'],
          merge(_existing: CachedVerse[] | undefined, incoming: CachedVerse[]) {
            return incoming;
          },
        },
      },
    },
    Verse: {
      keyFields: ['id'],
    },
    Edition: {
      keyFields: ['id'],
    },
    ScriptureWork: {
      keyFields: ['id'],
    },
  },
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(locations)}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    // Could trigger offline mode here
  }
});

// Retry logic for failed requests
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: (error, _operation) => {
      // Retry on network errors but not on GraphQL errors
      return !!error && !error.result;
    },
  },
});

// HTTP link
const httpLink = new HttpLink({
  uri: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Combine links
const link = from([errorLink, retryLink, httpLink]);

// Create Apollo Client instance
let client: ApolloClient<NormalizedCacheObject>;

/**
 * Initialize Apollo Client with persistent cache
 */
export async function initializeApolloClient(): Promise<ApolloClient<NormalizedCacheObject>> {
  if (client) {
    return client;
  }

  try {
    // Set up cache persistence
    await persistCache({
      cache,
      storage: new AsyncStorageWrapper(AsyncStorage),
      maxSize: 10485760, // 10 MB
      debug: __DEV__,
    });

    console.log('Apollo cache restored from AsyncStorage');
  } catch (error) {
    console.error('Error restoring Apollo cache:', error);
  }

  client = new ApolloClient({
    link,
    cache,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  });

  return client;
}

/**
 * Get the initialized Apollo Client instance
 */
export function getApolloClient(): ApolloClient<NormalizedCacheObject> {
  if (!client) {
    throw new Error(
      'Apollo Client not initialized. Call initializeApolloClient() first.'
    );
  }
  return client;
}

/**
 * Clear Apollo cache (useful for logout or reset)
 */
export async function clearApolloCache(): Promise<void> {
  if (client) {
    await client.clearStore();
    await AsyncStorage.removeItem('apollo-cache-persist');
    console.log('Apollo cache cleared');
  }
}
