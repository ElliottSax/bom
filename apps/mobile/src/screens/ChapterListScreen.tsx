/**
 * Chapter List Screen
 *
 * Displays list of chapters for the selected book
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChapterList } from '../components/ChapterList';
import type { ReadStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<ReadStackParamList, 'ChapterList'>;

export function ChapterListScreen({ route, navigation }: Props) {
  const { editionId, bookName, totalChapters } = route.params;

  const handleChapterSelect = (chapter: number) => {
    navigation.navigate('Reader', {
      editionId,
      book: bookName,
      chapter,
    });
  };

  return (
    <View style={styles.container}>
      <ChapterList
        bookName={bookName}
        totalChapters={totalChapters}
        onChapterSelect={handleChapterSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
