/**
 * Reading Goals Screen
 *
 * Set and track daily/weekly reading goals
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useReadingGoals, GoalType, GoalPeriod, ReadingGoal } from '../hooks/useReadingGoals';

export function ReadingGoalsScreen() {
  const { colors } = useTheme();
  const {
    goals,
    activeGoals,
    loading,
    createGoal,
    deleteGoal,
    toggleGoal,
    getGoalStats,
    getTypeLabel,
    suggestedGoals,
  } = useReadingGoals();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGoalType, setNewGoalType] = useState<GoalType>('chapters');
  const [newGoalPeriod, setNewGoalPeriod] = useState<GoalPeriod>('daily');
  const [newGoalTarget, setNewGoalTarget] = useState('1');

  const handleCreateGoal = async () => {
    const target = parseInt(newGoalTarget, 10);
    if (isNaN(target) || target <= 0) {
      Alert.alert('Invalid Goal', 'Please enter a valid number');
      return;
    }

    await createGoal(newGoalType, newGoalPeriod, target);
    setShowCreateModal(false);
    setNewGoalTarget('1');
  };

  const handleDeleteGoal = (goal: ReadingGoal) => {
    Alert.alert(
      'Delete Goal',
      `Delete goal: ${goal.target} ${getTypeLabel(goal.type)} ${goal.period}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteGoal(goal.id),
        },
      ]
    );
  };

  const handleSuggestedGoal = async (suggestion: typeof suggestedGoals[0]) => {
    await createGoal(suggestion.type, suggestion.period, suggestion.target);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Active Goals
          </Text>
          {activeGoals.map((goal) => {
            const stats = getGoalStats(goal.id);
            if (!stats) return null;

            return (
              <Pressable
                key={goal.id}
                style={[styles.goalCard, { backgroundColor: colors.surface }]}
                onLongPress={() => handleDeleteGoal(goal)}
              >
                <View style={styles.goalHeader}>
                  <Text style={[styles.goalTitle, { color: colors.text }]}>
                    {goal.target} {getTypeLabel(goal.type)}
                  </Text>
                  <Text style={[styles.goalPeriod, { color: colors.primary }]}>
                    {goal.period === 'daily' ? 'Daily' : 'Weekly'}
                  </Text>
                </View>

                {/* Progress bar */}
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${stats.percentComplete}%`,
                          backgroundColor:
                            stats.percentComplete >= 100 ? colors.success : colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressText, { color: colors.text }]}>
                    {stats.currentProgress} / {stats.target}
                  </Text>
                </View>

                {/* Stats row */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                      {stats.currentStreak}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Current Streak
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      {stats.longestStreak}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Best Streak
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.success }]}>
                      {stats.daysCompleted}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Completed
                    </Text>
                  </View>
                </View>

                {/* Status badge */}
                {stats.percentComplete >= 100 && (
                  <View style={[styles.completedBadge, { backgroundColor: colors.success + '20' }]}>
                    <Text style={[styles.completedText, { color: colors.success }]}>
                      Goal Completed for {stats.periodLabel}!
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Quick Start - Show when no goals */}
      {goals.length === 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Get Started
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Choose a reading goal to begin tracking your progress
          </Text>

          <View style={styles.suggestionsGrid}>
            {suggestedGoals.map((suggestion, index) => (
              <Pressable
                key={index}
                style={[styles.suggestionCard, { backgroundColor: colors.surface }]}
                onPress={() => handleSuggestedGoal(suggestion)}
              >
                <Text style={[styles.suggestionLabel, { color: colors.text }]}>
                  {suggestion.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* All Goals */}
      {goals.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            All Goals
          </Text>
          {goals.map((goal) => (
            <Pressable
              key={goal.id}
              style={[
                styles.goalListItem,
                { backgroundColor: colors.surface },
                !goal.active && styles.inactiveGoal,
              ]}
              onPress={() => toggleGoal(goal.id)}
              onLongPress={() => handleDeleteGoal(goal)}
            >
              <View style={styles.goalListContent}>
                <Text
                  style={[
                    styles.goalListTitle,
                    { color: goal.active ? colors.text : colors.textSecondary },
                  ]}
                >
                  {goal.target} {getTypeLabel(goal.type)} per {goal.period === 'daily' ? 'day' : 'week'}
                </Text>
                <Text style={[styles.goalListSubtitle, { color: colors.textSecondary }]}>
                  {goal.active ? 'Active' : 'Inactive'}
                </Text>
              </View>
              <View
                style={[
                  styles.activeIndicator,
                  { backgroundColor: goal.active ? colors.success : colors.border },
                ]}
              />
            </Pressable>
          ))}
        </View>
      )}

      {/* Add Goal Button */}
      <Pressable
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={styles.addButtonText}>+ Create Custom Goal</Text>
      </Pressable>

      {/* Suggested Goals */}
      {goals.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Suggested Goals
          </Text>
          <View style={styles.suggestionsGrid}>
            {suggestedGoals.slice(0, 4).map((suggestion, index) => (
              <Pressable
                key={index}
                style={[styles.suggestionCard, { backgroundColor: colors.surface }]}
                onPress={() => handleSuggestedGoal(suggestion)}
              >
                <Text style={[styles.suggestionLabel, { color: colors.text }]}>
                  {suggestion.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Long-press a goal to delete it
        </Text>
      </View>

      {/* Create Goal Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Create Reading Goal
            </Text>

            {/* Goal Type */}
            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
              What to track
            </Text>
            <View style={styles.optionsRow}>
              {(['chapters', 'minutes', 'verses'] as GoalType[]).map((type) => (
                <Pressable
                  key={type}
                  style={[
                    styles.optionButton,
                    { backgroundColor: colors.background },
                    newGoalType === type && { backgroundColor: colors.primary + '20' },
                  ]}
                  onPress={() => setNewGoalType(type)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: newGoalType === type ? colors.primary : colors.text },
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Goal Period */}
            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
              Frequency
            </Text>
            <View style={styles.optionsRow}>
              {(['daily', 'weekly'] as GoalPeriod[]).map((period) => (
                <Pressable
                  key={period}
                  style={[
                    styles.optionButton,
                    { backgroundColor: colors.background, flex: 1 },
                    newGoalPeriod === period && { backgroundColor: colors.primary + '20' },
                  ]}
                  onPress={() => setNewGoalPeriod(period)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: newGoalPeriod === period ? colors.primary : colors.text },
                    ]}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Target */}
            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
              Target
            </Text>
            <View style={styles.targetRow}>
              <TextInput
                style={[
                  styles.targetInput,
                  { backgroundColor: colors.background, color: colors.text },
                ]}
                value={newGoalTarget}
                onChangeText={setNewGoalTarget}
                keyboardType="numeric"
                placeholder="1"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={[styles.targetLabel, { color: colors.text }]}>
                {getTypeLabel(newGoalType)} per {newGoalPeriod === 'daily' ? 'day' : 'week'}
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.background }]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleCreateGoal}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                  Create Goal
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  goalCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  goalPeriod: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  completedBadge: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  suggestionCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  suggestionLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  goalListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  inactiveGoal: {
    opacity: 0.6,
  },
  goalListContent: {
    flex: 1,
  },
  goalListTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  goalListSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  activeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  addButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  targetInput: {
    width: 80,
    padding: 12,
    borderRadius: 8,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  targetLabel: {
    fontSize: 16,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
