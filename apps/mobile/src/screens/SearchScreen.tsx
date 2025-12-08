/**
 * Search Screen
 *
 * Scripture search functionality (placeholder)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scripture Search</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
      <Text style={styles.description}>
        Search through 8,701 verses of the Book of Mormon
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#0066cc',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});
