/**
 * Performance-optimized components using React.memo
 */

import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type {
  SearchResult,
  Verse,
  Notebook,
  StudyPlan,
  CrossReference
} from '../../types';

/**
 * Optimized Search Result Item
 */
export const SearchResultItem = memo(({
  item,
  onPress,
}: {
  item: SearchResult;
  onPress: (item: SearchResult) => void;
}) => {
  return (
    <Pressable
      style={styles.resultItem}
      onPress={() => onPress(item)}
    >
      <Text style={styles.reference}>
        {item.book} {item.chapter}:{item.verse}
      </Text>
      <Text style={styles.verseText} numberOfLines={3}>
        {item.text}
      </Text>
    </Pressable>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.text === nextProps.item.text
  );
});

SearchResultItem.displayName = 'SearchResultItem';

/**
 * Optimized Verse Display
 */
export const VerseDisplay = memo(({
  verse,
  highlightColor,
  onPress,
  onLongPress,
}: {
  verse: Verse;
  highlightColor?: string;
  onPress?: () => void;
  onLongPress?: () => void;
}) => {
  return (
    <Pressable
      style={[
        styles.verseContainer,
        highlightColor && { backgroundColor: highlightColor }
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <Text style={styles.verseNumber}>{verse.verse}</Text>
      <Text style={styles.verseText}>{verse.text}</Text>
    </Pressable>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.verse.id === nextProps.verse.id &&
    prevProps.highlightColor === nextProps.highlightColor
  );
});

VerseDisplay.displayName = 'VerseDisplay';

/**
 * Optimized Notebook Card
 */
export const NotebookCard = memo(({
  notebook,
  noteCount,
  onPress,
  onLongPress,
}: {
  notebook: Notebook;
  noteCount: number;
  onPress: () => void;
  onLongPress?: () => void;
}) => {
  return (
    <Pressable
      style={[styles.notebookCard, { borderLeftColor: notebook.color }]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.notebookIcon}>
        <Text style={styles.notebookEmoji}>{notebook.icon}</Text>
      </View>
      <View style={styles.notebookContent}>
        <Text style={styles.notebookName}>{notebook.name}</Text>
        <Text style={styles.notebookNotes}>
          {noteCount} {noteCount === 1 ? 'note' : 'notes'}
        </Text>
      </View>
    </Pressable>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.notebook.id === nextProps.notebook.id &&
    prevProps.notebook.name === nextProps.notebook.name &&
    prevProps.notebook.color === nextProps.notebook.color &&
    prevProps.noteCount === nextProps.noteCount
  );
});

NotebookCard.displayName = 'NotebookCard';

/**
 * Optimized Study Plan Card
 */
export const StudyPlanCard = memo(({
  plan,
  isActive,
  progress,
  onPress,
}: {
  plan: StudyPlan;
  isActive: boolean;
  progress: number;
  onPress: () => void;
}) => {
  return (
    <Pressable
      style={[styles.planCard, isActive && styles.planCardActive]}
      onPress={onPress}
    >
      <View style={styles.planHeader}>
        <Text style={styles.planName}>{plan.name}</Text>
        {isActive && <View style={styles.activeBadge} />}
      </View>
      <Text style={styles.planDescription}>
        {plan.description || `${plan.frequency} study plan`}
      </Text>
      <View style={styles.progressBar}>
        <View
          style={[styles.progressFill, { width: `${progress}%` }]}
        />
      </View>
      <Text style={styles.progressText}>{progress}% Complete</Text>
    </Pressable>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.plan.id === nextProps.plan.id &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.progress === nextProps.progress
  );
});

StudyPlanCard.displayName = 'StudyPlanCard';

/**
 * Optimized Cross Reference Item
 */
export const CrossReferenceItem = memo(({
  reference,
  onPress,
  onLongPress,
}: {
  reference: CrossReference;
  onPress: () => void;
  onLongPress?: () => void;
}) => {
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      parallel: '#4ecdc4',
      similar: '#45b7d1',
      contrast: '#ff6b6b',
      fulfillment: '#96ceb4',
      quotation: '#ffd93d',
      custom: '#b19cd9',
    };
    return colors[type] || '#999';
  };

  return (
    <Pressable
      style={[
        styles.referenceItem,
        { borderLeftColor: getTypeColor(reference.type) }
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.referenceHeader}>
        <Text style={[styles.referenceType, { color: getTypeColor(reference.type) }]}>
          {reference.type.toUpperCase()}
        </Text>
      </View>
      {reference.targetVerse && (
        <Text style={styles.referenceTarget}>
          {reference.targetVerse.book} {reference.targetVerse.chapter}:{reference.targetVerse.verse}
        </Text>
      )}
      {reference.notes && (
        <Text style={styles.referenceNotes} numberOfLines={2}>
          {reference.notes}
        </Text>
      )}
    </Pressable>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.reference.id === nextProps.reference.id &&
    prevProps.reference.notes === nextProps.reference.notes
  );
});

CrossReferenceItem.displayName = 'CrossReferenceItem';

/**
 * Optimized Tab Item for TabNavigator
 */
export const TabItem = memo(({
  id,
  title,
  icon,
  isActive,
  onPress,
  onClose,
}: {
  id: string;
  title: string;
  icon: string;
  isActive: boolean;
  onPress: () => void;
  onClose?: () => void;
}) => {
  return (
    <Pressable
      style={[styles.tabItem, isActive && styles.tabItemActive]}
      onPress={onPress}
    >
      <Text style={styles.tabIcon}>{icon}</Text>
      <Text style={[styles.tabTitle, isActive && styles.tabTitleActive]} numberOfLines={1}>
        {title}
      </Text>
      {onClose && (
        <Pressable style={styles.tabClose} onPress={onClose}>
          <Text style={styles.tabCloseText}>×</Text>
        </Pressable>
      )}
    </Pressable>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.title === nextProps.title &&
    prevProps.isActive === nextProps.isActive
  );
});

TabItem.displayName = 'TabItem';

const styles = StyleSheet.create({
  // Search Result Styles
  resultItem: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  reference: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066cc',
    marginBottom: 5,
  },
  verseText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },

  // Verse Display Styles
  verseContainer: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  verseNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginRight: 10,
    minWidth: 25,
  },

  // Notebook Card Styles
  notebookCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notebookIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notebookEmoji: {
    fontSize: 20,
  },
  notebookContent: {
    flex: 1,
  },
  notebookName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  notebookNotes: {
    fontSize: 14,
    color: '#666',
  },

  // Study Plan Card Styles
  planCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planCardActive: {
    borderWidth: 2,
    borderColor: '#0066cc',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  activeBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4caf50',
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
  },
  progressText: {
    fontSize: 12,
    color: '#999',
  },

  // Cross Reference Styles
  referenceItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  referenceHeader: {
    marginBottom: 4,
  },
  referenceType: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  referenceTarget: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  referenceNotes: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },

  // Tab Item Styles
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 2,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    minWidth: 120,
    maxWidth: 180,
  },
  tabItemActive: {
    backgroundColor: '#0066cc',
  },
  tabIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  tabTitle: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  tabTitleActive: {
    color: 'white',
    fontWeight: '600',
  },
  tabClose: {
    padding: 4,
    marginLeft: 4,
  },
  tabCloseText: {
    fontSize: 18,
    color: '#999',
    fontWeight: 'bold',
  },
});