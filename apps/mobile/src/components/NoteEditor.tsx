/**
 * Note Editor Modal
 *
 * Modal for adding/editing verse notes
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { formatNoteDate } from '../hooks/useNotes';

interface NoteEditorProps {
  visible: boolean;
  verseReference: string;
  verseText: string;
  initialContent?: string;
  lastUpdated?: number;
  onSave: (content: string) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export function NoteEditor({
  visible,
  verseReference,
  verseText,
  initialContent = '',
  lastUpdated,
  onSave,
  onDelete,
  onClose,
}: NoteEditorProps) {
  const { colors } = useTheme();
  const [content, setContent] = useState(initialContent);
  const [hasChanges, setHasChanges] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Reset content when modal opens
  useEffect(() => {
    if (visible) {
      setContent(initialContent);
      setHasChanges(false);
      // Focus input after modal animation
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [visible, initialContent]);

  const handleContentChange = (text: string) => {
    setContent(text);
    setHasChanges(text !== initialContent);
  };

  const handleSave = () => {
    if (content.trim()) {
      onSave(content.trim());
    }
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    onClose();
  };

  const handleClose = () => {
    if (hasChanges) {
      // Could show confirmation dialog here
      // For now, just close without saving
    }
    Keyboard.dismiss();
    onClose();
  };

  const isEditing = !!initialContent;
  const canSave = content.trim().length > 0;
  const canDelete = isEditing && onDelete;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Pressable onPress={handleClose} style={styles.headerButton}>
              <Text style={[styles.headerButtonText, { color: colors.textSecondary }]}>
                Cancel
              </Text>
            </Pressable>

            <View style={styles.headerCenter}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {isEditing ? 'Edit Note' : 'Add Note'}
              </Text>
              {lastUpdated && (
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                  {formatNoteDate(lastUpdated)}
                </Text>
              )}
            </View>

            <Pressable
              onPress={handleSave}
              style={styles.headerButton}
              disabled={!canSave}
            >
              <Text
                style={[
                  styles.headerButtonText,
                  { color: canSave ? colors.primary : colors.textSecondary },
                  canSave && styles.headerButtonTextBold,
                ]}
              >
                Save
              </Text>
            </Pressable>
          </View>

          {/* Verse Reference */}
          <View style={[styles.verseSection, { backgroundColor: colors.background }]}>
            <Text style={[styles.verseReference, { color: colors.primary }]}>
              {verseReference}
            </Text>
            <Text
              style={[styles.verseText, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {verseText}
            </Text>
          </View>

          {/* Note Input */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Write your note here..."
              placeholderTextColor={colors.textSecondary}
              value={content}
              onChangeText={handleContentChange}
              multiline
              textAlignVertical="top"
              autoCapitalize="sentences"
              autoCorrect
            />
          </View>

          {/* Character Count */}
          <View style={styles.footer}>
            <Text style={[styles.charCount, { color: colors.textSecondary }]}>
              {content.length} characters
            </Text>

            {canDelete && (
              <Pressable onPress={handleDelete} style={styles.deleteButton}>
                <Text style={[styles.deleteButtonText, { color: colors.error }]}>
                  Delete Note
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: 400,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    minWidth: 60,
  },
  headerButtonText: {
    fontSize: 16,
  },
  headerButtonTextBold: {
    fontWeight: '600',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  verseSection: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  verseReference: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  verseText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  inputContainer: {
    flex: 1,
    padding: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 150,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  charCount: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
