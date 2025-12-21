/**
 * Verse Notes Component
 *
 * Allows users to add, view, and edit notes on verses
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { useMutation, useQuery, gql } from '@apollo/client';

const GET_NOTES = gql`
  query GetNotes($userId: String!, $verseId: String!) {
    notes(userId: $userId) {
      id
      verseId
      content
      tags
      createdAt
      updatedAt
    }
  }
`;

const ADD_NOTE = gql`
  mutation AddNote(
    $userId: String!
    $verseId: String!
    $content: String!
    $tags: [String!]
  ) {
    addNote(userId: $userId, verseId: $verseId, content: $content, tags: $tags) {
      id
      content
      tags
      createdAt
    }
  }
`;

const UPDATE_NOTE = gql`
  mutation UpdateNote($id: String!, $content: String!, $tags: [String!]) {
    updateNote(id: $id, content: $content, tags: $tags) {
      id
      content
      tags
      updatedAt
    }
  }
`;

const DELETE_NOTE = gql`
  mutation DeleteNote($id: String!) {
    deleteNote(id: $id) {
      success
    }
  }
`;

interface VerseNotesProps {
  verseId: string;
  verseRef: string;
  userId?: string;
  visible: boolean;
  onClose: () => void;
}

interface Note {
  id: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export function VerseNotes({
  verseId,
  verseRef,
  userId = 'demo-user',
  visible,
  onClose,
}: VerseNotesProps) {
  const [noteContent, setNoteContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Query for existing notes
  const { data: notesData, refetch } = useQuery(GET_NOTES, {
    variables: { userId, verseId },
    skip: !visible || !userId,
  });

  // Mutations
  const [addNote] = useMutation(ADD_NOTE, {
    onCompleted: () => {
      refetch();
      resetForm();
    },
  });

  const [updateNote] = useMutation(UPDATE_NOTE, {
    onCompleted: () => {
      refetch();
      resetForm();
    },
  });

  const [deleteNote] = useMutation(DELETE_NOTE, {
    onCompleted: () => {
      refetch();
    },
  });

  useEffect(() => {
    if (editingNote) {
      setNoteContent(editingNote.content);
      setTags(editingNote.tags || []);
    }
  }, [editingNote]);

  const resetForm = () => {
    setNoteContent('');
    setTags([]);
    setTagInput('');
    setEditingNote(null);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim()) return;

    try {
      if (editingNote) {
        await updateNote({
          variables: {
            id: editingNote.id,
            content: noteContent,
            tags,
          },
        });
      } else {
        await addNote({
          variables: {
            userId,
            verseId,
            content: noteContent,
            tags,
          },
        });
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote({
        variables: { id: noteId },
      });
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const verseNotes = notesData?.notes?.filter(
    (note: Note) => note.verseId === verseId
  ) || [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Notes for {verseRef}</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Existing Notes */}
          {verseNotes.length > 0 && (
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>Your Notes</Text>
              {verseNotes.map((note: Note) => (
                <View key={note.id} style={styles.noteCard}>
                  <Text style={styles.noteContent}>{note.content}</Text>
                  {note.tags && note.tags.length > 0 && (
                    <View style={styles.tagContainer}>
                      {note.tags.map((tag) => (
                        <View key={tag} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  <View style={styles.noteActions}>
                    <Pressable
                      onPress={() => setEditingNote(note)}
                      style={styles.editButton}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeleteNote(note.id)}
                      style={styles.deleteButton}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.noteDate}>
                    {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Add/Edit Note Form */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>
              {editingNote ? 'Edit Note' : 'Add New Note'}
            </Text>

            <TextInput
              style={styles.noteInput}
              placeholder="Enter your note..."
              value={noteContent}
              onChangeText={setNoteContent}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Tags Input */}
            <View style={styles.tagSection}>
              <Text style={styles.tagLabel}>Tags:</Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={styles.tagInput}
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={handleAddTag}
                  returnKeyType="done"
                />
                <Pressable onPress={handleAddTag} style={styles.addTagButton}>
                  <Text style={styles.addTagButtonText}>+</Text>
                </Pressable>
              </View>
            </View>

            {/* Selected Tags */}
            {tags.length > 0 && (
              <View style={styles.selectedTags}>
                {tags.map((tag) => (
                  <Pressable
                    key={tag}
                    onPress={() => handleRemoveTag(tag)}
                    style={styles.selectedTag}
                  >
                    <Text style={styles.selectedTagText}>{tag}</Text>
                    <Text style={styles.removeTagText}>×</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {editingNote && (
                <Pressable onPress={resetForm} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              )}
              <Pressable
                onPress={handleSaveNote}
                style={[
                  styles.saveButton,
                  !noteContent.trim() && styles.saveButtonDisabled,
                ]}
                disabled={!noteContent.trim()}
              >
                <Text style={styles.saveButtonText}>
                  {editingNote ? 'Update' : 'Save'} Note
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  notesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  noteCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  noteContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 10,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 5,
    marginBottom: 5,
  },
  tagText: {
    fontSize: 12,
    color: '#1976d2',
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 5,
  },
  editButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginRight: 10,
  },
  editButtonText: {
    color: '#1976d2',
    fontSize: 14,
  },
  deleteButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  deleteButtonText: {
    color: '#f44336',
    fontSize: 14,
  },
  noteDate: {
    fontSize: 12,
    color: '#999',
  },
  formSection: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    minHeight: 100,
    marginBottom: 15,
  },
  tagSection: {
    marginBottom: 15,
  },
  tagLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
  },
  addTagButton: {
    marginLeft: 10,
    width: 36,
    height: 36,
    backgroundColor: '#1976d2',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagButtonText: {
    color: 'white',
    fontSize: 24,
    lineHeight: 24,
  },
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976d2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTagText: {
    color: 'white',
    fontSize: 14,
    marginRight: 5,
  },
  removeTagText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});