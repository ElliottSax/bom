/**
 * Notebooks Component
 *
 * Organize notes into themed collections like Pinterest boards
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, gql } from '@apollo/client';
import { logger } from '../utils/logger';

const log = logger.scope('Notebooks');

const NOTEBOOKS_KEY = '@bom_notebooks';

interface Notebook {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  noteIds: string[];
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
}

interface Note {
  id: string;
  verseId: string;
  content: string;
  tags: string[];
  notebookId?: string;
}

const NOTEBOOK_COLORS = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
  '#dfe6e9', '#a29bfe', '#fd79a8', '#fdcb6e', '#6c5ce7',
];

const NOTEBOOK_ICONS = [
  '📚', '📖', '📝', '💡', '🌟', '❤️', '🙏', '✨', '🌈', '🎯',
  '🔥', '💭', '📌', '🎨', '🌱', '💎', '🔑', '🌺', '🕊️', '⚡',
];

export function NotebooksManager({ userId = 'demo-user' }: { userId?: string }) {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadNotebooks();
  }, []);

  const loadNotebooks = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTEBOOKS_KEY);
      if (stored) {
        setNotebooks(JSON.parse(stored));
      } else {
        // Create default notebooks
        const defaultNotebooks: Notebook[] = [
          {
            id: 'general',
            name: 'General',
            description: 'General study notes',
            color: '#4ecdc4',
            icon: '📚',
            noteIds: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isDefault: true,
          },
          {
            id: 'insights',
            name: 'Insights',
            description: 'Personal revelations and insights',
            color: '#ffeaa7',
            icon: '💡',
            noteIds: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'questions',
            name: 'Questions',
            description: 'Questions to ponder and research',
            color: '#a29bfe',
            icon: '❓',
            noteIds: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        await saveNotebooks(defaultNotebooks);
      }
    } catch (error) {
      log.error('Error loading notebooks:', error);
    }
  };

  const saveNotebooks = async (newNotebooks: Notebook[]) => {
    try {
      await AsyncStorage.setItem(NOTEBOOKS_KEY, JSON.stringify(newNotebooks));
      setNotebooks(newNotebooks);
    } catch (error) {
      log.error('Error saving notebooks:', error);
    }
  };

  const createNotebook = async (name: string, description: string, color: string, icon: string) => {
    const newNotebook: Notebook = {
      id: `notebook_${Date.now()}`,
      name,
      description,
      color,
      icon,
      noteIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...notebooks, newNotebook];
    await saveNotebooks(updated);
    setShowCreateModal(false);
  };

  const updateNotebook = async (notebook: Notebook) => {
    const updated = notebooks.map(n =>
      n.id === notebook.id ? { ...notebook, updatedAt: new Date().toISOString() } : n
    );
    await saveNotebooks(updated);
    setShowEditModal(false);
  };

  const deleteNotebook = async (notebookId: string) => {
    const notebook = notebooks.find(n => n.id === notebookId);
    if (notebook?.isDefault) {
      Alert.alert('Cannot Delete', 'Default notebooks cannot be deleted');
      return;
    }

    Alert.alert(
      'Delete Notebook',
      'Are you sure? Notes will be moved to General notebook.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Move notes to general notebook
            const generalNotebook = notebooks.find(n => n.id === 'general');
            if (generalNotebook && notebook) {
              generalNotebook.noteIds.push(...notebook.noteIds);
            }

            const updated = notebooks.filter(n => n.id !== notebookId);
            await saveNotebooks(updated);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Notebooks</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.addButtonText}>+ New</Text>
        </Pressable>
      </View>

      {/* Notebooks Grid */}
      <FlatList
        data={notebooks}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <NotebookCard
            notebook={item}
            onPress={() => setSelectedNotebook(item)}
            onLongPress={() => {
              setSelectedNotebook(item);
              setShowEditModal(true);
            }}
          />
        )}
      />

      {/* Create Notebook Modal */}
      <CreateNotebookModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createNotebook}
      />

      {/* Edit Notebook Modal */}
      {selectedNotebook && (
        <EditNotebookModal
          visible={showEditModal}
          notebook={selectedNotebook}
          onClose={() => setShowEditModal(false)}
          onUpdate={updateNotebook}
          onDelete={deleteNotebook}
        />
      )}

      {/* Notebook Details Modal */}
      {selectedNotebook && !showEditModal && (
        <NotebookDetailsModal
          notebook={selectedNotebook}
          onClose={() => setSelectedNotebook(null)}
          userId={userId}
        />
      )}
    </View>
  );
}

function NotebookCard({
  notebook,
  onPress,
  onLongPress,
}: {
  notebook: Notebook;
  onPress: () => void;
  onLongPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.notebookCard, { backgroundColor: notebook.color + '20' }]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <Text style={styles.notebookIcon}>{notebook.icon}</Text>
      <Text style={styles.notebookName}>{notebook.name}</Text>
      <Text style={styles.notebookCount}>{notebook.noteIds.length} notes</Text>
      {notebook.isDefault && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultBadgeText}>DEFAULT</Text>
        </View>
      )}
    </Pressable>
  );
}

function CreateNotebookModal({
  visible,
  onClose,
  onCreate,
}: {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, color: string, icon: string) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(NOTEBOOK_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(NOTEBOOK_ICONS[0]);

  const handleCreate = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a notebook name');
      return;
    }
    onCreate(name, description, selectedColor, selectedIcon);
    setName('');
    setDescription('');
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>New Notebook</Text>
          <Pressable onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.modalContent}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter notebook name"
          />

          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Optional description"
            multiline
            numberOfLines={3}
          />

          <Text style={styles.inputLabel}>Color</Text>
          <View style={styles.colorGrid}>
            {NOTEBOOK_COLORS.map((color) => (
              <Pressable
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedOption,
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>

          <Text style={styles.inputLabel}>Icon</Text>
          <View style={styles.iconGrid}>
            {NOTEBOOK_ICONS.map((icon) => (
              <Pressable
                key={icon}
                style={[
                  styles.iconOption,
                  selectedIcon === icon && styles.selectedOption,
                ]}
                onPress={() => setSelectedIcon(icon)}
              >
                <Text style={styles.iconText}>{icon}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable style={styles.createButton} onPress={handleCreate}>
            <Text style={styles.createButtonText}>Create</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function EditNotebookModal({
  visible,
  notebook,
  onClose,
  onUpdate,
  onDelete,
}: {
  visible: boolean;
  notebook: Notebook;
  onClose: () => void;
  onUpdate: (notebook: Notebook) => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState(notebook.name);
  const [description, setDescription] = useState(notebook.description || '');
  const [selectedColor, setSelectedColor] = useState(notebook.color);
  const [selectedIcon, setSelectedIcon] = useState(notebook.icon);

  const handleUpdate = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a notebook name');
      return;
    }
    onUpdate({
      ...notebook,
      name,
      description,
      color: selectedColor,
      icon: selectedIcon,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Edit Notebook</Text>
          <Pressable onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.modalContent}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter notebook name"
            editable={!notebook.isDefault}
          />

          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Optional description"
            multiline
            numberOfLines={3}
          />

          <Text style={styles.inputLabel}>Color</Text>
          <View style={styles.colorGrid}>
            {NOTEBOOK_COLORS.map((color) => (
              <Pressable
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedOption,
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>

          <Text style={styles.inputLabel}>Icon</Text>
          <View style={styles.iconGrid}>
            {NOTEBOOK_ICONS.map((icon) => (
              <Pressable
                key={icon}
                style={[
                  styles.iconOption,
                  selectedIcon === icon && styles.selectedOption,
                ]}
                onPress={() => setSelectedIcon(icon)}
              >
                <Text style={styles.iconText}>{icon}</Text>
              </Pressable>
            ))}
          </View>

          {!notebook.isDefault && (
            <Pressable
              style={styles.deleteButton}
              onPress={() => onDelete(notebook.id)}
            >
              <Text style={styles.deleteButtonText}>Delete Notebook</Text>
            </Pressable>
          )}
        </ScrollView>

        <View style={styles.modalFooter}>
          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable style={styles.createButton} onPress={handleUpdate}>
            <Text style={styles.createButtonText}>Save</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function NotebookDetailsModal({
  notebook,
  onClose,
  userId,
}: {
  notebook: Notebook;
  onClose: () => void;
  userId: string;
}) {
  // Query notes for this notebook
  const GET_NOTEBOOK_NOTES = gql`
    query GetNotebookNotes($userId: String!) {
      notes(userId: $userId) {
        id
        verseId
        content
        tags
        book
        chapter
        verse
      }
    }
  `;

  const { data, loading } = useQuery(GET_NOTEBOOK_NOTES, {
    variables: { userId },
  });

  const notebookNotes = data?.notes?.filter((note: Note) =>
    notebook.noteIds.includes(note.id)
  ) || [];

  return (
    <Modal visible={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={[styles.modalHeader, { backgroundColor: notebook.color + '20' }]}>
          <View style={styles.notebookDetailHeader}>
            <Text style={styles.notebookDetailIcon}>{notebook.icon}</Text>
            <View>
              <Text style={styles.modalTitle}>{notebook.name}</Text>
              {notebook.description && (
                <Text style={styles.notebookDescription}>{notebook.description}</Text>
              )}
            </View>
          </View>
          <Pressable onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </Pressable>
        </View>

        <FlatList
          data={notebookNotes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.notesList}
          renderItem={({ item }) => (
            <View style={styles.noteCard}>
              <Text style={styles.noteReference}>
                {item.book} {item.chapter}:{item.verse}
              </Text>
              <Text style={styles.noteContent} numberOfLines={3}>
                {item.content}
              </Text>
              {item.tags && item.tags.length > 0 && (
                <View style={styles.noteTags}>
                  {item.tags.map((tag: string) => (
                    <View key={tag} style={styles.noteTag}>
                      <Text style={styles.noteTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No notes in this notebook yet</Text>
            </View>
          }
        />
      </View>
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
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  grid: {
    padding: 10,
  },
  notebookCard: {
    flex: 1,
    margin: 10,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 150,
    justifyContent: 'center',
  },
  notebookIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  notebookName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  notebookCount: {
    fontSize: 14,
    color: '#666',
  },
  defaultBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#666',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 5,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 8,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  iconText: {
    fontSize: 24,
  },
  selectedOption: {
    borderWidth: 3,
    borderColor: '#0066cc',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 10,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  createButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  notebookDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  notebookDetailIcon: {
    fontSize: 36,
  },
  notebookDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  notesList: {
    padding: 15,
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
  noteReference: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066cc',
    marginBottom: 5,
  },
  noteContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  noteTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 5,
  },
  noteTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  noteTagText: {
    fontSize: 12,
    color: '#1976d2',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});