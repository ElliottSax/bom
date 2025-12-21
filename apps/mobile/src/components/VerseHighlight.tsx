/**
 * Verse Highlight Component
 *
 * Handles highlighting and unhighlighting verses
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useMutation, useQuery, gql } from '@apollo/client';
import type { Highlight } from '../types';

const GET_HIGHLIGHT = gql`
  query GetHighlight($userId: String!, $verseId: String!) {
    highlights(userId: $userId) {
      id
      verseId
      color
    }
  }
`;

const ADD_HIGHLIGHT = gql`
  mutation AddHighlight($userId: String!, $verseId: String!, $color: String!) {
    addHighlight(userId: $userId, verseId: $verseId, color: $color) {
      id
      verseId
      color
    }
  }
`;

const REMOVE_HIGHLIGHT = gql`
  mutation RemoveHighlight($userId: String!, $verseId: String!) {
    removeHighlight(userId: $userId, verseId: $verseId) {
      success
    }
  }
`;

interface VerseHighlightProps {
  verseId: string;
  text: string;
  verseNumber: number;
  userId?: string;
  onLongPress?: () => void;
}

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: 'yellow', hex: '#ffeb3b' },
  { name: 'Blue', value: 'blue', hex: '#2196f3' },
  { name: 'Green', value: 'green', hex: '#4caf50' },
  { name: 'Pink', value: 'pink', hex: '#e91e63' },
  { name: 'Orange', value: 'orange', hex: '#ff9800' },
];

export function VerseHighlight({
  verseId,
  text,
  verseNumber,
  userId = 'demo-user',
  onLongPress,
}: VerseHighlightProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentHighlight, setCurrentHighlight] = useState<string | null>(null);

  // Query for existing highlight
  const { data: highlightData } = useQuery(GET_HIGHLIGHT, {
    variables: { userId, verseId },
    skip: !userId,
  });

  // Add highlight mutation
  const [addHighlight, { loading: addingHighlight }] = useMutation(ADD_HIGHLIGHT, {
    refetchQueries: [{ query: GET_HIGHLIGHT, variables: { userId, verseId } }],
  });

  // Remove highlight mutation
  const [removeHighlight, { loading: removingHighlight }] = useMutation(
    REMOVE_HIGHLIGHT,
    {
      refetchQueries: [{ query: GET_HIGHLIGHT, variables: { userId, verseId } }],
    }
  );

  useEffect(() => {
    // Check if this verse is highlighted
    if (highlightData?.highlights) {
      const highlight = highlightData.highlights.find(
        (h: Highlight) => h.verseId === verseId
      );
      setCurrentHighlight(highlight?.color || null);
    }
  }, [highlightData, verseId]);

  const handleLongPress = () => {
    setShowColorPicker(true);
    if (onLongPress) {
      onLongPress();
    }
  };

  const handleColorSelect = async (color: string) => {
    try {
      if (currentHighlight === color) {
        // Remove highlight if same color selected
        await removeHighlight({
          variables: { userId, verseId },
        });
        setCurrentHighlight(null);
      } else {
        // Add or update highlight
        await addHighlight({
          variables: { userId, verseId, color },
        });
        setCurrentHighlight(color);
      }
    } catch (error) {
      console.error('Error updating highlight:', error);
    } finally {
      setShowColorPicker(false);
    }
  };

  const handleRemoveHighlight = async () => {
    try {
      await removeHighlight({
        variables: { userId, verseId },
      });
      setCurrentHighlight(null);
    } catch (error) {
      console.error('Error removing highlight:', error);
    } finally {
      setShowColorPicker(false);
    }
  };

  const getHighlightStyle = () => {
    if (!currentHighlight) return {};

    const color = HIGHLIGHT_COLORS.find(c => c.value === currentHighlight);
    if (color) {
      return { backgroundColor: color.hex + '40' }; // 40 = 25% opacity
    }
    return {};
  };

  const isLoading = addingHighlight || removingHighlight;

  return (
    <>
      <Pressable
        onLongPress={handleLongPress}
        delayLongPress={500}
        style={[styles.verseContainer, getHighlightStyle()]}
      >
        <Text style={styles.verseNumber}>{verseNumber}</Text>
        <Text style={styles.verseText}>{text}</Text>
      </Pressable>

      <Modal
        visible={showColorPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowColorPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowColorPicker(false)}
        >
          <View style={styles.colorPickerContainer}>
            <Text style={styles.colorPickerTitle}>Highlight Verse</Text>

            {isLoading ? (
              <ActivityIndicator size="large" color="#0066cc" />
            ) : (
              <>
                <View style={styles.colorOptions}>
                  {HIGHLIGHT_COLORS.map((color) => (
                    <Pressable
                      key={color.value}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color.hex },
                        currentHighlight === color.value && styles.selectedColor,
                      ]}
                      onPress={() => handleColorSelect(color.value)}
                    >
                      {currentHighlight === color.value && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </Pressable>
                  ))}
                </View>

                {currentHighlight && (
                  <Pressable
                    style={styles.removeButton}
                    onPress={handleRemoveHighlight}
                  >
                    <Text style={styles.removeButtonText}>Remove Highlight</Text>
                  </Pressable>
                )}

                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setShowColorPicker(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  verseContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  verseNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginRight: 10,
    minWidth: 25,
  },
  verseText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPickerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 320,
  },
  colorPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  colorOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  colorOption: {
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#333',
  },
  checkmark: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  removeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    textAlign: 'center',
    color: '#666',
  },
});