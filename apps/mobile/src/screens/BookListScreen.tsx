/**
 * Book List Screen
 *
 * Displays list of books in the selected edition
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookList } from '../components/BookList';
import type { ReadStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<ReadStackParamList, 'BookList'>;

export function BookListScreen({ route, navigation }: Props) {
  const { editionId } = route.params;

  const handleBookSelect = (bookName: string, totalChapters: number) => {
    navigation.navigate('ChapterList', {
      editionId,
      bookName,
      totalChapters,
    });
  };

  return (
    <View style={styles.container}>
      <BookList editionId={editionId} onBookSelect={handleBookSelect} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
