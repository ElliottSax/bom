/**
 * Reader Screen
 *
 * Main scripture reading screen
 */

import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScriptureReader } from '../components/ScriptureReader';
import type { ReadStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<ReadStackParamList, 'Reader'>;

export function ReaderScreen({ route, navigation }: Props) {
  const { editionId, book, chapter } = route.params;
  const [fontSize, setFontSize] = useState(16);

  const handleVersePress = (verseId: string, verseNumber: number) => {
    // Future: Show verse actions (highlight, note, bookmark, share)
    Alert.alert(
      `Verse ${verseNumber}`,
      'Verse actions coming soon:\n• Add note\n• Highlight\n• Bookmark\n• Share\n• Cross-references'
    );
  };

  return (
    <View style={styles.container}>
      <ScriptureReader
        editionId={editionId}
        book={book}
        chapter={chapter}
        onVersePress={handleVersePress}
        fontSize={fontSize}
        lineHeight={1.6}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});
