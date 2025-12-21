/**
 * Verse Action Menu
 *
 * Bottom sheet menu for verse actions (bookmark, highlight, copy, share)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Share,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../contexts/ThemeContext';

export interface VerseData {
  verseId: string;
  verseNumber: number;
  text: string;
  book: string;
  chapter: number;
  editionId: string;
}

interface VerseActionMenuProps {
  visible: boolean;
  verse: VerseData | null;
  isBookmarked: boolean;
  onClose: () => void;
  onBookmark: () => void;
  onHighlight: (color: string) => void;
  onAddNote: () => void;
}

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', color: '#ffeb3b' },
  { name: 'Blue', color: '#2196f3' },
  { name: 'Green', color: '#4caf50' },
  { name: 'Pink', color: '#e91e63' },
  { name: 'Orange', color: '#ff9800' },
];

export function VerseActionMenu({
  visible,
  verse,
  isBookmarked,
  onClose,
  onBookmark,
  onHighlight,
  onAddNote,
}: VerseActionMenuProps) {
  const { colors, isDark } = useTheme();

  if (!verse) return null;

  const reference = `${verse.book} ${verse.chapter}:${verse.verseNumber}`;

  const handleCopy = async () => {
    const textToCopy = `${verse.text}\n— ${reference}`;
    await Clipboard.setStringAsync(textToCopy);
    onClose();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `"${verse.text}"\n— ${reference}`,
        title: reference,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.overlayBackground} />
      </Pressable>

      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        {/* Handle */}
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        {/* Verse Reference */}
        <View style={styles.header}>
          <Text style={[styles.reference, { color: colors.primary }]}>
            {reference}
          </Text>
          <Text
            style={[styles.versePreview, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {verse.text}
          </Text>
        </View>

        {/* Main Actions */}
        <View style={styles.actionsGrid}>
          <ActionButton
            icon={isBookmarked ? '🔖' : '📑'}
            label={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
            onPress={() => {
              onBookmark();
              onClose();
            }}
            colors={colors}
            active={isBookmarked}
          />
          <ActionButton
            icon="📝"
            label="Add Note"
            onPress={() => {
              onAddNote();
              onClose();
            }}
            colors={colors}
          />
          <ActionButton
            icon="📋"
            label="Copy"
            onPress={handleCopy}
            colors={colors}
          />
          <ActionButton
            icon="📤"
            label="Share"
            onPress={handleShare}
            colors={colors}
          />
        </View>

        {/* Highlight Colors */}
        <View style={styles.highlightSection}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            Highlight
          </Text>
          <View style={styles.colorRow}>
            {HIGHLIGHT_COLORS.map((item) => (
              <Pressable
                key={item.name}
                style={[
                  styles.colorButton,
                  { backgroundColor: item.color },
                  isDark && styles.colorButtonDark,
                ]}
                onPress={() => {
                  onHighlight(item.color);
                  onClose();
                }}
              >
                <Text style={styles.colorButtonText} />
              </Pressable>
            ))}
            <Pressable
              style={[
                styles.colorButton,
                styles.clearButton,
                { borderColor: colors.border },
              ]}
              onPress={() => {
                onHighlight('');
                onClose();
              }}
            >
              <Text style={[styles.clearButtonText, { color: colors.textSecondary }]}>
                ✕
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Cancel Button */}
        <Pressable
          style={[styles.cancelButton, { backgroundColor: colors.background }]}
          onPress={onClose}
        >
          <Text style={[styles.cancelButtonText, { color: colors.text }]}>
            Cancel
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

interface ActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  colors: any;
  active?: boolean;
}

function ActionButton({ icon, label, onPress, colors, active }: ActionButtonProps) {
  return (
    <Pressable
      style={[
        styles.actionButton,
        { backgroundColor: colors.background },
        active && { backgroundColor: colors.primary + '20' },
      ]}
      onPress={onPress}
    >
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text
        style={[
          styles.actionLabel,
          { color: colors.text },
          active && { color: colors.primary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  overlayBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  reference: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  versePreview: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  highlightSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  colorButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorButtonDark: {
    opacity: 0.8,
  },
  colorButtonText: {
    fontSize: 20,
  },
  clearButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
