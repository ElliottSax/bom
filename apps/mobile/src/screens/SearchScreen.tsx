/**
 * Search Screen
 *
 * Full-featured scripture search with filtering and highlighting
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSearch, highlightSearchTerm, SearchResult } from '../hooks/useSearch';

const EDITIONS = [
  { id: 'all', name: 'All Editions' },
  { id: 'coc-bom-1908', name: 'Book of Mormon' },
  { id: 'coc-dc-2017', name: 'Doctrine & Covenants' },
];

export function SearchScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEdition, setSelectedEdition] = useState('all');
  const { results, loading, error, search, clearResults, hasSearched, totalResults } = useSearch(100);

  const handleSearch = useCallback(
    (text: string) => {
      setSearchQuery(text);
      if (text.length >= 2) {
        search(text, selectedEdition === 'all' ? undefined : selectedEdition);
      } else if (text.length === 0) {
        clearResults();
      }
    },
    [search, clearResults, selectedEdition]
  );

  const handleEditionChange = useCallback(
    (editionId: string) => {
      setSelectedEdition(editionId);
      if (searchQuery.length >= 2) {
        search(searchQuery, editionId === 'all' ? undefined : editionId);
      }
    },
    [search, searchQuery]
  );

  const handleResultPress = useCallback(
    (result: SearchResult) => {
      Keyboard.dismiss();
      navigation.navigate('Read', {
        screen: 'Reader',
        params: {
          editionId: result.editionId,
          book: result.book,
          chapter: result.chapter,
        },
      });
    },
    [navigation]
  );

  const renderSearchResult = useCallback(
    ({ item }: { item: SearchResult }) => (
      <SearchResultItem
        result={item}
        searchTerm={searchQuery}
        onPress={() => handleResultPress(item)}
      />
    ),
    [searchQuery, handleResultPress]
  );

  const keyExtractor = useCallback((item: SearchResult) => item.id, []);

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search scriptures..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => {
                setSearchQuery('');
                clearResults();
              }}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Edition Filter */}
        <View style={styles.editionFilter}>
          {EDITIONS.map((edition) => (
            <Pressable
              key={edition.id}
              style={[
                styles.editionChip,
                selectedEdition === edition.id && styles.editionChipSelected,
              ]}
              onPress={() => handleEditionChange(edition.id)}
            >
              <Text
                style={[
                  styles.editionChipText,
                  selectedEdition === edition.id && styles.editionChipTextSelected,
                ]}
              >
                {edition.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Search Results */}
      <View style={styles.resultsContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Search failed</Text>
            <Text style={styles.errorDetail}>{error.message}</Text>
          </View>
        )}

        {!loading && !error && hasSearched && results.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📖</Text>
            <Text style={styles.emptyText}>No results found</Text>
            <Text style={styles.emptyDetail}>
              Try different keywords or check your spelling
            </Text>
          </View>
        )}

        {!loading && !error && results.length > 0 && (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {totalResults} {totalResults === 1 ? 'result' : 'results'}
              </Text>
            </View>
            <FlatList
              data={results}
              renderItem={renderSearchResult}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.resultsList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          </>
        )}

        {!hasSearched && !loading && (
          <View style={styles.promptContainer}>
            <Text style={styles.promptIcon}>🔍</Text>
            <Text style={styles.promptTitle}>Search Scriptures</Text>
            <Text style={styles.promptText}>
              Enter at least 2 characters to search through all verses
            </Text>
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Try searching for:</Text>
              <View style={styles.suggestions}>
                {['faith', 'hope', 'charity', 'repent', 'Jesus'].map((term) => (
                  <Pressable
                    key={term}
                    style={styles.suggestionChip}
                    onPress={() => handleSearch(term)}
                  >
                    <Text style={styles.suggestionText}>{term}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

// Search Result Item Component
interface SearchResultItemProps {
  result: SearchResult;
  searchTerm: string;
  onPress: () => void;
}

function SearchResultItem({ result, searchTerm, onPress }: SearchResultItemProps) {
  const highlightedParts = highlightSearchTerm(result.text, searchTerm);

  return (
    <Pressable style={styles.resultItem} onPress={onPress} android_ripple={{ color: '#e0e0e0' }}>
      <View style={styles.resultHeader}>
        <Text style={styles.resultReference}>
          {result.book} {result.chapter}:{result.verse}
        </Text>
        <Text style={styles.resultEdition}>
          {result.editionId === 'coc-bom-1908' ? 'BoM' : 'D&C'}
        </Text>
      </View>
      <Text style={styles.resultText} numberOfLines={3}>
        {highlightedParts.map((part, index) => (
          <Text
            key={index}
            style={part.isHighlighted ? styles.highlightedText : undefined}
          >
            {part.text}
          </Text>
        ))}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchHeader: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
    color: '#333333',
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#999999',
  },
  editionFilter: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  editionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  editionChipSelected: {
    backgroundColor: '#0066cc',
    borderColor: '#0066cc',
  },
  editionChipText: {
    fontSize: 13,
    color: '#666666',
  },
  editionChipTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666666',
  },
  resultsList: {
    paddingBottom: 20,
  },
  resultItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultReference: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066cc',
  },
  resultEdition: {
    fontSize: 12,
    color: '#999999',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  resultText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  highlightedText: {
    backgroundColor: '#fff3cd',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 8,
  },
  emptyDetail: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  promptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  promptIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  promptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  promptText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  suggestionsContainer: {
    alignItems: 'center',
  },
  suggestionsTitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  suggestionText: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '500',
  },
});
