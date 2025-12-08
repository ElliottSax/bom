/**
 * Book List Component
 *
 * Displays a list of available books for navigation
 */

import React from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useQuery, gql } from '@apollo/client';

const GET_BOOKS_QUERY = gql`
  query GetBooks($editionId: ID!) {
    edition(id: $editionId) {
      id
      name
      shortName
    }
  }
`;

// Book of Mormon structure (CoC 1908 edition)
const BOOK_OF_MORMON_BOOKS = [
  { name: 'I Nephi', chapters: 7 },
  { name: 'II Nephi', chapters: 15 },
  { name: 'Jacob', chapters: 5 },
  { name: 'Enos', chapters: 1 },
  { name: 'Jarom', chapters: 1 },
  { name: 'Omni', chapters: 1 },
  { name: 'Words of Mormon', chapters: 1 },
  { name: 'Mosiah', chapters: 13 },
  { name: 'Alma', chapters: 30 },
  { name: 'Helaman', chapters: 5 },
  { name: 'III Nephi', chapters: 14 },
  { name: 'IV Nephi', chapters: 1 },
  { name: 'Mormon', chapters: 4 },
  { name: 'Ether', chapters: 6 },
  { name: 'Moroni', chapters: 10 },
];

interface BookListProps {
  editionId: string;
  onBookSelect: (bookName: string, totalChapters: number) => void;
}

export function BookList({ editionId, onBookSelect }: BookListProps) {
  // For now, use hardcoded Book of Mormon structure
  // In the future, this could be fetched from the API
  const books = BOOK_OF_MORMON_BOOKS;

  const renderBook = ({ item }: { item: typeof BOOK_OF_MORMON_BOOKS[0] }) => (
    <Pressable
      style={styles.bookItem}
      onPress={() => onBookSelect(item.name, item.chapters)}
      android_ripple={{ color: '#e0e0e0' }}
    >
      <View style={styles.bookContent}>
        <Text style={styles.bookName}>{item.name}</Text>
        <Text style={styles.chapterCount}>
          {item.chapters} {item.chapters === 1 ? 'chapter' : 'chapters'}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Book of Mormon</Text>
        <Text style={styles.headerSubtitle}>Community of Christ Edition (1908)</Text>
      </View>

      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 16,
    backgroundColor: '#0066cc',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e3f2fd',
  },
  listContent: {
    paddingVertical: 8,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
  },
  bookContent: {
    flex: 1,
  },
  bookName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  chapterCount: {
    fontSize: 14,
    color: '#666666',
  },
  chevron: {
    fontSize: 24,
    color: '#999999',
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginLeft: 16,
  },
});
