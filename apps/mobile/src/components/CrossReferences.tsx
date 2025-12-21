/**
 * Cross References Component
 *
 * Create and manage verse-to-verse connections
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
import { useTheme } from '../contexts/ThemeContext';
import type { ThemeColors } from '../types';

const CROSS_REFS_KEY = '@bom_cross_references';

interface CrossReference {
  id: string;
  sourceVerseId: string;
  targetVerseId: string;
  sourceVerse: VerseInfo;
  targetVerse: VerseInfo;
  note?: string;
  type: 'parallel' | 'similar' | 'contrast' | 'fulfillment' | 'quotation' | 'custom';
  createdAt: string;
  userId: string;
}

interface VerseInfo {
  id: string;
  editionId: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

const REFERENCE_TYPES = [
  { value: 'parallel', label: '═ Parallel', color: '#4ecdc4', description: 'Same event or teaching' },
  { value: 'similar', label: '≈ Similar', color: '#45b7d1', description: 'Related concept' },
  { value: 'contrast', label: '≠ Contrast', color: '#ff6b6b', description: 'Opposing ideas' },
  { value: 'fulfillment', label: '✓ Fulfillment', color: '#96ceb4', description: 'Prophecy fulfilled' },
  { value: 'quotation', label: '" Quotation', color: '#ffeaa7', description: 'Direct quote' },
  { value: 'custom', label: '+ Custom', color: '#a29bfe', description: 'Other connection' },
];

interface CrossReferencesProps {
  verseId: string;
  verseInfo: VerseInfo;
  userId?: string;
  onNavigate?: (verseId: string) => void;
}

export function CrossReferences({
  verseId,
  verseInfo,
  userId = 'demo-user',
  onNavigate,
}: CrossReferencesProps) {
  const { colors, isDark } = useTheme();
  const [references, setReferences] = useState<CrossReference[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRef, setSelectedRef] = useState<CrossReference | null>(null);

  useEffect(() => {
    loadReferences();
  }, [verseId]);

  const loadReferences = async () => {
    try {
      const stored = await AsyncStorage.getItem(CROSS_REFS_KEY);
      if (stored) {
        const allRefs = JSON.parse(stored);
        const verseRefs = allRefs.filter(
          (ref: CrossReference) =>
            ref.sourceVerseId === verseId || ref.targetVerseId === verseId
        );
        setReferences(verseRefs);
      }
    } catch (error) {
      console.error('Error loading cross references:', error);
    }
  };

  const saveReference = async (newRef: Omit<CrossReference, 'id' | 'createdAt'>) => {
    try {
      const stored = await AsyncStorage.getItem(CROSS_REFS_KEY);
      const allRefs = stored ? JSON.parse(stored) : [];

      const reference: CrossReference = {
        ...newRef,
        id: `ref_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      allRefs.push(reference);
      await AsyncStorage.setItem(CROSS_REFS_KEY, JSON.stringify(allRefs));

      setReferences([...references, reference]);
      return reference;
    } catch (error) {
      console.error('Error saving cross reference:', error);
      throw error;
    }
  };

  const deleteReference = async (refId: string) => {
    Alert.alert(
      'Delete Reference',
      'Are you sure you want to delete this cross-reference?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const stored = await AsyncStorage.getItem(CROSS_REFS_KEY);
              const allRefs = stored ? JSON.parse(stored) : [];
              const filtered = allRefs.filter((ref: CrossReference) => ref.id !== refId);

              await AsyncStorage.setItem(CROSS_REFS_KEY, JSON.stringify(filtered));
              setReferences(references.filter(ref => ref.id !== refId));
            } catch (error) {
              console.error('Error deleting reference:', error);
            }
          },
        },
      ]
    );
  };

  const getReferenceTypeInfo = (type: string) => {
    return REFERENCE_TYPES.find(t => t.value === type) || REFERENCE_TYPES[5];
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    addButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
    referencesList: {
      marginTop: 8,
    },
    referenceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.background,
      borderRadius: 8,
      marginBottom: 8,
    },
    referenceIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    referenceIconText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: 'white',
    },
    referenceContent: {
      flex: 1,
    },
    referenceVerse: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    referenceType: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    referenceNote: {
      fontSize: 13,
      color: colors.text,
      marginTop: 4,
      fontStyle: 'italic',
    },
    emptyState: {
      padding: 20,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>Cross References</Text>
        <Pressable
          style={dynamicStyles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={dynamicStyles.addButtonText}>+ Add</Text>
        </Pressable>
      </View>

      {references.length > 0 ? (
        <View style={dynamicStyles.referencesList}>
          {references.map((ref) => {
            const typeInfo = getReferenceTypeInfo(ref.type);
            const isSource = ref.sourceVerseId === verseId;
            const displayVerse = isSource ? ref.targetVerse : ref.sourceVerse;

            return (
              <Pressable
                key={ref.id}
                style={dynamicStyles.referenceItem}
                onPress={() => {
                  setSelectedRef(ref);
                  setShowViewModal(true);
                }}
                onLongPress={() => deleteReference(ref.id)}
              >
                <View
                  style={[
                    dynamicStyles.referenceIcon,
                    { backgroundColor: typeInfo.color },
                  ]}
                >
                  <Text style={dynamicStyles.referenceIconText}>
                    {typeInfo.label[0]}
                  </Text>
                </View>
                <View style={dynamicStyles.referenceContent}>
                  <Text style={dynamicStyles.referenceVerse}>
                    {displayVerse.book} {displayVerse.chapter}:{displayVerse.verse}
                  </Text>
                  <Text style={dynamicStyles.referenceType}>
                    {typeInfo.label} - {typeInfo.description}
                  </Text>
                  {ref.note && (
                    <Text style={dynamicStyles.referenceNote} numberOfLines={1}>
                      {ref.note}
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={dynamicStyles.emptyState}>
          <Text style={dynamicStyles.emptyText}>
            No cross-references yet.{'\n'}
            Add connections to related verses.
          </Text>
        </View>
      )}

      {/* Add Reference Modal */}
      <AddReferenceModal
        visible={showAddModal}
        sourceVerse={verseInfo}
        onClose={() => setShowAddModal(false)}
        onSave={saveReference}
        colors={colors}
      />

      {/* View Reference Modal */}
      {selectedRef && (
        <ViewReferenceModal
          visible={showViewModal}
          reference={selectedRef}
          currentVerseId={verseId}
          onClose={() => setShowViewModal(false)}
          onNavigate={onNavigate}
          onDelete={() => deleteReference(selectedRef.id)}
          colors={colors}
        />
      )}
    </View>
  );
}

function AddReferenceModal({
  visible,
  sourceVerse,
  onClose,
  onSave,
  colors,
}: {
  visible: boolean;
  sourceVerse: VerseInfo;
  onClose: () => void;
  onSave: (ref: Omit<CrossReference, 'id' | 'createdAt'>) => void;
  colors: ThemeColors;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('similar');
  const [note, setNote] = useState('');
  const [targetVerse, setTargetVerse] = useState<VerseInfo | null>(null);

  // Search for verses
  const SEARCH_VERSES = gql`
    query SearchForReference($query: String!) {
      search(query: $query, limit: 10) {
        results {
          id
          editionId
          book
          chapter
          verse
          text
        }
      }
    }
  `;

  const handleSave = () => {
    if (!targetVerse) {
      Alert.alert('Error', 'Please select a target verse');
      return;
    }

    onSave({
      sourceVerseId: sourceVerse.id,
      targetVerseId: targetVerse.id,
      sourceVerse,
      targetVerse,
      type: selectedType as any,
      note,
      userId: 'demo-user',
    });

    onClose();
    setSearchQuery('');
    setTargetVerse(null);
    setNote('');
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{
          padding: 20,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text }}>
              Add Cross Reference
            </Text>
            <Pressable onPress={onClose}>
              <Text style={{ fontSize: 24, color: colors.textSecondary }}>×</Text>
            </Pressable>
          </View>
          <Text style={{ color: colors.textSecondary, marginTop: 8 }}>
            From: {sourceVerse.book} {sourceVerse.chapter}:{sourceVerse.verse}
          </Text>
        </View>

        <ScrollView style={{ padding: 20 }}>
          {/* Reference Type */}
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
            Connection Type
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
            {REFERENCE_TYPES.map((type) => (
              <Pressable
                key={type.value}
                style={{
                  padding: 10,
                  margin: 4,
                  borderRadius: 8,
                  backgroundColor: selectedType === type.value ? type.color : colors.surface,
                  borderWidth: 1,
                  borderColor: selectedType === type.value ? type.color : colors.border,
                }}
                onPress={() => setSelectedType(type.value)}
              >
                <Text style={{
                  color: selectedType === type.value ? 'white' : colors.text,
                  fontWeight: selectedType === type.value ? '600' : '400',
                }}>
                  {type.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Search Target Verse */}
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
            Target Verse
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              color: colors.text,
              marginBottom: 12,
            }}
            placeholder="Search for a verse or reference..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {targetVerse && (
            <View style={{
              padding: 12,
              backgroundColor: colors.primary + '20',
              borderRadius: 8,
              marginBottom: 20,
            }}>
              <Text style={{ fontWeight: '600', color: colors.primary }}>
                Selected: {targetVerse.book} {targetVerse.chapter}:{targetVerse.verse}
              </Text>
              <Text style={{ color: colors.text, marginTop: 4 }} numberOfLines={2}>
                {targetVerse.text}
              </Text>
            </View>
          )}

          {/* Note */}
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
            Note (Optional)
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              color: colors.text,
              minHeight: 80,
              textAlignVertical: 'top',
              marginBottom: 20,
            }}
            placeholder="Add a note about this connection..."
            placeholderTextColor={colors.textSecondary}
            value={note}
            onChangeText={setNote}
            multiline
          />

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
            <Pressable
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
              }}
              onPress={onClose}
            >
              <Text style={{ fontSize: 16, color: colors.textSecondary }}>Cancel</Text>
            </Pressable>
            <Pressable
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8,
              }}
              onPress={handleSave}
            >
              <Text style={{ fontSize: 16, color: 'white', fontWeight: '600' }}>Save</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function ViewReferenceModal({
  visible,
  reference,
  currentVerseId,
  onClose,
  onNavigate,
  onDelete,
  colors,
}: {
  visible: boolean;
  reference: CrossReference;
  currentVerseId: string;
  onClose: () => void;
  onNavigate?: (verseId: string) => void;
  onDelete: () => void;
  colors: ThemeColors;
}) {
  const typeInfo = REFERENCE_TYPES.find(t => t.value === reference.type) || REFERENCE_TYPES[5];
  const isSource = reference.sourceVerseId === currentVerseId;
  const otherVerse = isSource ? reference.targetVerse : reference.sourceVerse;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={onClose}
      >
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          width: '90%',
          maxWidth: 400,
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: typeInfo.color,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                {typeInfo.label[0]}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
                {typeInfo.label}
              </Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                {typeInfo.description}
              </Text>
            </View>
          </View>

          {/* Verses */}
          <View style={{
            padding: 12,
            backgroundColor: colors.background,
            borderRadius: 8,
            marginBottom: 12,
          }}>
            <Text style={{ fontWeight: '600', color: colors.primary, marginBottom: 4 }}>
              {reference.sourceVerse.book} {reference.sourceVerse.chapter}:{reference.sourceVerse.verse}
            </Text>
            <Text style={{ color: colors.text, fontSize: 14 }} numberOfLines={3}>
              {reference.sourceVerse.text}
            </Text>
          </View>

          <Text style={{ textAlign: 'center', color: colors.textSecondary, marginVertical: 8 }}>
            ↕
          </Text>

          <View style={{
            padding: 12,
            backgroundColor: colors.background,
            borderRadius: 8,
            marginBottom: 12,
          }}>
            <Text style={{ fontWeight: '600', color: colors.primary, marginBottom: 4 }}>
              {reference.targetVerse.book} {reference.targetVerse.chapter}:{reference.targetVerse.verse}
            </Text>
            <Text style={{ color: colors.text, fontSize: 14 }} numberOfLines={3}>
              {reference.targetVerse.text}
            </Text>
          </View>

          {/* Note */}
          {reference.note && (
            <View style={{
              padding: 12,
              backgroundColor: colors.background,
              borderRadius: 8,
              marginBottom: 16,
            }}>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>Note:</Text>
              <Text style={{ color: colors.text, fontStyle: 'italic' }}>
                {reference.note}
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Pressable
              style={{ padding: 10 }}
              onPress={() => {
                onDelete();
                onClose();
              }}
            >
              <Text style={{ color: colors.error }}>Delete</Text>
            </Pressable>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 6,
                }}
                onPress={() => {
                  if (onNavigate) {
                    onNavigate(otherVerse.id);
                  }
                  onClose();
                }}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>
                  Go to Verse
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}