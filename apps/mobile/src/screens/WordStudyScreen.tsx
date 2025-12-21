/**
 * Word Study Screen
 *
 * Concordance view - find all occurrences of a word
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useWordStudy, WordOccurrence } from '../hooks/useWordStudy';

export function WordStudyScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const {
    loading,
    error,
    result,
    studyWord,
    highlightWord,
    clearResult,
  } = useWordStudy();

  const [searchWord, setSearchWord] = useState('');
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  const handleSearch = useCallback(() => {
    if (searchWord.length >= 2) {
      Keyboard.dismiss();
      studyWord(searchWord);
      setSelectedBook(null);
    }
  }, [searchWord, studyWord]);

  const handleVersePress = useCallback(
    (occurrence: WordOccurrence) => {
      navigation.navigate('Read', {
        screen: 'Reader',
        params: {
          editionId: occurrence.editionId,
          book: occurrence.book,
          chapter: occurrence.chapter,
        },
      });
    },
    [navigation]
  );

  const filteredOccurrences = result?.occurrences.filter(
    (occ) => !selectedBook || occ.book === selectedBook
  );

  const renderOccurrence = ({ item }: { item: WordOccurrence }) => {
    const parts = result ? highlightWord(item.text, result.word) : [];

    return (
      <Pressable
        style={[styles.occurrenceCard, { backgroundColor: colors.surface }]}
        onPress={() => handleVersePress(item)}
      >
        <Text style={[styles.reference, { color: colors.primary }]}>
          {item.book} {item.chapter}:{item.verse}
        </Text>
        <Text style={[styles.verseText, { color: colors.text }]} numberOfLines={3}>
          {parts.map((part, index) => (
            <Text
              key={index}
              style={
                part.isHighlighted
                  ? [styles.highlightedWord, { backgroundColor: colors.warning + '40' }]
                  : undefined
              }
            >
              {part.text}
            </Text>
          ))}
        </Text>
        <Text style={[styles.edition, { color: colors.textSecondary }]}>
          {item.editionId === 'coc-bom-1908' ? 'Book of Mormon' : 'D&C'}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Header */}
      <View style={[styles.searchHeader, { backgroundColor: colors.surface }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.background }]}>
          <Text style={styles.searchIcon}>📖</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Enter a word to study..."
            placeholderTextColor={colors.textSecondary}
            value={searchWord}
            onChangeText={setSearchWord}
            onSubmitEditing={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchWord.length > 0 && (
            <Pressable
              onPress={() => {
                setSearchWord('');
                clearResult();
              }}
              style={styles.clearButton}
            >
              <Text style={[styles.clearButtonText, { color: colors.textSecondary }]}>
                ✕
              </Text>
            </Pressable>
          )}
        </View>
        <Pressable
          style={[styles.searchButton, { backgroundColor: colors.primary }]}
          onPress={handleSearch}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Searching scriptures...
          </Text>
        </View>
      )}

      {/* Error */}
      {error && (
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      )}

      {/* Results */}
      {!loading && result && (
        <>
          {/* Summary */}
          <View style={[styles.summaryCard, { backgroundColor: colors.primary + '15' }]}>
            <Text style={[styles.summaryWord, { color: colors.primary }]}>
              "{result.word}"
            </Text>
            <Text style={[styles.summaryCount, { color: colors.text }]}>
              Found in {result.totalOccurrences} verse{result.totalOccurrences !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Book Filter */}
          {result.byBook.length > 1 && (
            <View style={styles.bookFilter}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={[{ book: 'All', count: result.totalOccurrences }, ...result.byBook]}
                keyExtractor={(item) => item.book}
                contentContainerStyle={styles.bookFilterContent}
                renderItem={({ item }) => (
                  <Pressable
                    style={[
                      styles.bookChip,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      (selectedBook === item.book || (item.book === 'All' && !selectedBook)) && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => setSelectedBook(item.book === 'All' ? null : item.book)}
                  >
                    <Text
                      style={[
                        styles.bookChipText,
                        { color: colors.text },
                        (selectedBook === item.book || (item.book === 'All' && !selectedBook)) && {
                          color: '#ffffff',
                        },
                      ]}
                    >
                      {item.book} ({item.count})
                    </Text>
                  </Pressable>
                )}
              />
            </View>
          )}

          {/* Occurrences List */}
          <FlatList
            data={filteredOccurrences}
            keyExtractor={(item) => item.id}
            renderItem={renderOccurrence}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {/* Empty State */}
      {!loading && !result && !error && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Word Study</Text>
          <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            Enter a word to find all its occurrences in the scriptures
          </Text>

          {/* Suggested Words */}
          <View style={styles.suggestionsContainer}>
            <Text style={[styles.suggestionsTitle, { color: colors.textSecondary }]}>
              Try these words:
            </Text>
            <View style={styles.suggestions}>
              {['faith', 'repent', 'baptism', 'prophet', 'covenant', 'atonement'].map((word) => (
                <Pressable
                  key={word}
                  style={[styles.suggestionChip, { backgroundColor: colors.primary + '20' }]}
                  onPress={() => {
                    setSearchWord(word);
                    studyWord(word);
                  }}
                >
                  <Text style={[styles.suggestionText, { color: colors.primary }]}>{word}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
  },
  searchButton: {
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  summaryCard: {
    margin: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryWord: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 16,
  },
  bookFilter: {
    marginBottom: 8,
  },
  bookFilterContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  bookChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  bookChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    padding: 12,
    paddingTop: 0,
  },
  occurrenceCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  reference: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  verseText: {
    fontSize: 14,
    lineHeight: 20,
  },
  highlightedWord: {
    fontWeight: '700',
  },
  edition: {
    fontSize: 12,
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
  },
  suggestionsContainer: {
    alignItems: 'center',
  },
  suggestionsTitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
