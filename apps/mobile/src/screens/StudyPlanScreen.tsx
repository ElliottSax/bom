/**
 * Study Plan Screen
 *
 * View and manage reading plans
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  Modal,
  Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import {
  useStudyPlan,
  formatReadingAssignment,
  getPlanDurationLabel,
  StudyPlan,
  StudyPlanDay,
} from '../hooks/useStudyPlan';

export function StudyPlanScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const {
    availablePlans,
    activePlan,
    currentPlan,
    todaysReading,
    loading,
    startPlan,
    completeTodaysReading,
    abandonPlan,
    getDayProgress,
  } = useStudyPlan();

  const [showPlanPicker, setShowPlanPicker] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);

  const dayProgress = getDayProgress();

  const handleStartPlan = async (plan: StudyPlan) => {
    if (activePlan) {
      Alert.alert(
        'Switch Plans?',
        'Starting a new plan will abandon your current progress. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Switch',
            style: 'destructive',
            onPress: async () => {
              await startPlan(plan.id);
              setShowPlanPicker(false);
            },
          },
        ]
      );
    } else {
      await startPlan(plan.id);
      setShowPlanPicker(false);
    }
  };

  const handleAbandonPlan = () => {
    Alert.alert(
      'Abandon Plan?',
      'Are you sure you want to abandon this reading plan? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Abandon',
          style: 'destructive',
          onPress: abandonPlan,
        },
      ]
    );
  };

  const handleReadingPress = () => {
    if (!todaysReading || !currentPlan) return;

    // Navigate to the first chapter of today's reading
    const firstBook = todaysReading.book.includes(' - ')
      ? todaysReading.book.split(' - ')[0]
      : todaysReading.book;

    navigation.navigate('Read', {
      screen: 'Reader',
      params: {
        editionId: 'coc-bom-1908',
        book: firstBook,
        chapter: todaysReading.startChapter,
      },
    });
  };

  const handleCompleteReading = async () => {
    await completeTodaysReading();
    Alert.alert('Well Done!', 'You completed today\'s reading!');
  };

  const handleShareProgress = async () => {
    if (!currentPlan || !activePlan) return;

    const daysCompleted = dayProgress.completed;
    const totalDays = dayProgress.total;
    const percent = dayProgress.percent;

    const message = `I'm reading the Book of Mormon with the "${currentPlan.name}" plan!\n\n` +
      `Progress: ${percent}% complete (Day ${daysCompleted} of ${totalDays})\n\n` +
      `Join me in studying the scriptures!`;

    try {
      await Share.share({
        message,
        title: 'My Book of Mormon Reading Progress',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSharePlanInvite = async (plan: StudyPlan) => {
    const message = `Join me in reading the Book of Mormon!\n\n` +
      `I'm starting the "${plan.name}" - ${plan.description}\n\n` +
      `It's ${getPlanDurationLabel(plan.totalDays)} of reading, about ${Math.round(plan.chaptersPerDay)} chapters per day.\n\n` +
      `Download the BOM Study Tools app to get started!`;

    try {
      await Share.share({
        message,
        title: `Join the ${plan.name}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Active Plan Section */}
      {activePlan && currentPlan ? (
        <>
          {/* Current Plan Header */}
          <View style={[styles.planHeader, { backgroundColor: colors.primary }]}>
            <View style={styles.planHeaderTop}>
              <Text style={styles.planName}>{currentPlan.name}</Text>
              <Pressable
                style={styles.shareButton}
                onPress={handleShareProgress}
              >
                <Text style={styles.shareButtonText}>Share</Text>
              </Pressable>
            </View>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Day {dayProgress.completed} of {dayProgress.total}
              </Text>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${dayProgress.percent}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressPercent}>{dayProgress.percent}%</Text>
            </View>
          </View>

          {/* Today's Reading Card */}
          {todaysReading && (
            <View style={[styles.todayCard, { backgroundColor: colors.surface }]}>
              <View style={styles.todayHeader}>
                <Text style={[styles.todayLabel, { color: colors.textSecondary }]}>
                  TODAY'S READING
                </Text>
                {todaysReading.completed && (
                  <View style={[styles.completedBadge, { backgroundColor: colors.success + '20' }]}>
                    <Text style={[styles.completedBadgeText, { color: colors.success }]}>
                      Completed
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.todayReading, { color: colors.text }]}>
                {formatReadingAssignment(todaysReading)}
              </Text>
              <Text style={[styles.todayChapters, { color: colors.textSecondary }]}>
                {todaysReading.endChapter - todaysReading.startChapter + 1} chapter
                {todaysReading.endChapter !== todaysReading.startChapter ? 's' : ''}
              </Text>

              <View style={styles.todayActions}>
                <Pressable
                  style={[styles.readButton, { backgroundColor: colors.primary }]}
                  onPress={handleReadingPress}
                >
                  <Text style={styles.readButtonText}>Start Reading</Text>
                </Pressable>
                {!todaysReading.completed && (
                  <Pressable
                    style={[styles.completeButton, { borderColor: colors.success }]}
                    onPress={handleCompleteReading}
                  >
                    <Text style={[styles.completeButtonText, { color: colors.success }]}>
                      Mark Complete
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}

          {/* Plan Schedule Preview */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Reading Schedule
            </Text>
            {currentPlan.days.slice(0, 7).map((day, index) => {
              const isToday = day.dayNumber === todaysReading?.dayNumber;
              const isCompleted = todaysReading?.completed && day.dayNumber <= todaysReading.dayNumber;

              return (
                <View
                  key={day.dayNumber}
                  style={[
                    styles.scheduleItem,
                    { backgroundColor: colors.surface },
                    isToday && { borderLeftColor: colors.primary, borderLeftWidth: 3 },
                  ]}
                >
                  <View style={styles.scheduleDayNum}>
                    <Text
                      style={[
                        styles.scheduleDayNumber,
                        { color: isToday ? colors.primary : colors.textSecondary },
                      ]}
                    >
                      {day.dayNumber}
                    </Text>
                  </View>
                  <View style={styles.scheduleContent}>
                    <Text style={[styles.scheduleReading, { color: colors.text }]}>
                      {formatReadingAssignment(day)}
                    </Text>
                  </View>
                  {day.completed && (
                    <Text style={[styles.checkmark, { color: colors.success }]}>✓</Text>
                  )}
                </View>
              );
            })}
            {currentPlan.days.length > 7 && (
              <Text style={[styles.moreText, { color: colors.textSecondary }]}>
                +{currentPlan.days.length - 7} more days
              </Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.section}>
            <Pressable
              style={[styles.changePlanButton, { backgroundColor: colors.surface }]}
              onPress={() => setShowPlanPicker(true)}
            >
              <Text style={[styles.changePlanText, { color: colors.primary }]}>
                Change Plan
              </Text>
            </Pressable>
            <Pressable
              style={[styles.abandonButton, { backgroundColor: colors.error + '10' }]}
              onPress={handleAbandonPlan}
            >
              <Text style={[styles.abandonText, { color: colors.error }]}>
                Abandon Plan
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          {/* No Active Plan - Show Plan Selection */}
          <View style={[styles.heroSection, { backgroundColor: colors.primary }]}>
            <Text style={styles.heroTitle}>Start a Reading Plan</Text>
            <Text style={styles.heroSubtitle}>
              Choose a plan to guide your study of the Book of Mormon
            </Text>
          </View>

          <View style={styles.planList}>
            {availablePlans.map((plan) => (
              <Pressable
                key={plan.id}
                style={[styles.planCard, { backgroundColor: colors.surface }]}
                onPress={() => {
                  setSelectedPlan(plan);
                  setShowPlanPicker(true);
                }}
              >
                <View style={styles.planCardHeader}>
                  <Text style={[styles.planCardName, { color: colors.text }]}>
                    {plan.name}
                  </Text>
                  <Text style={[styles.planDuration, { color: colors.primary }]}>
                    {getPlanDurationLabel(plan.totalDays)}
                  </Text>
                </View>
                <Text style={[styles.planCardDesc, { color: colors.textSecondary }]}>
                  {plan.description}
                </Text>
                <View style={[styles.planCardFooter, { borderTopColor: colors.border }]}>
                  <Text style={[styles.planCardStat, { color: colors.textSecondary }]}>
                    {Math.round(plan.chaptersPerDay)} chapters/day
                  </Text>
                  <View style={styles.planCardActions}>
                    <Pressable
                      style={styles.inviteButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleSharePlanInvite(plan);
                      }}
                    >
                      <Text style={[styles.inviteText, { color: colors.textSecondary }]}>
                        Invite
                      </Text>
                    </Pressable>
                    <Text style={[styles.startText, { color: colors.primary }]}>
                      Start →
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* Plan Picker Modal */}
      <Modal
        visible={showPlanPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPlanPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedPlan ? 'Start This Plan?' : 'Choose a Plan'}
              </Text>
              <Pressable onPress={() => setShowPlanPicker(false)}>
                <Text style={[styles.modalClose, { color: colors.textSecondary }]}>✕</Text>
              </Pressable>
            </View>

            {selectedPlan ? (
              <>
                <Text style={[styles.selectedPlanName, { color: colors.primary }]}>
                  {selectedPlan.name}
                </Text>
                <Text style={[styles.selectedPlanDesc, { color: colors.textSecondary }]}>
                  {selectedPlan.description}
                </Text>
                <View style={styles.selectedPlanStats}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      {selectedPlan.totalDays}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Days
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      ~{Math.round(selectedPlan.chaptersPerDay)}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                      Chapters/Day
                    </Text>
                  </View>
                </View>
                <Pressable
                  style={[styles.confirmButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleStartPlan(selectedPlan)}
                >
                  <Text style={styles.confirmButtonText}>Start Plan</Text>
                </Pressable>
              </>
            ) : (
              <ScrollView style={styles.modalPlanList}>
                {availablePlans.map((plan) => (
                  <Pressable
                    key={plan.id}
                    style={[styles.modalPlanItem, { borderBottomColor: colors.border }]}
                    onPress={() => setSelectedPlan(plan)}
                  >
                    <Text style={[styles.modalPlanName, { color: colors.text }]}>
                      {plan.name}
                    </Text>
                    <Text style={[styles.modalPlanDuration, { color: colors.textSecondary }]}>
                      {getPlanDurationLabel(plan.totalDays)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planHeader: {
    padding: 24,
  },
  planHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  shareButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    color: '#ffffff',
    fontSize: 14,
    marginRight: 12,
    opacity: 0.9,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  progressPercent: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  todayCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  todayLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  completedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  todayReading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  todayChapters: {
    fontSize: 14,
    marginBottom: 16,
  },
  todayActions: {
    flexDirection: 'row',
    gap: 12,
  },
  readButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  readButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  scheduleDayNum: {
    width: 32,
    alignItems: 'center',
  },
  scheduleDayNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  scheduleContent: {
    flex: 1,
    marginLeft: 12,
  },
  scheduleReading: {
    fontSize: 14,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  moreText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
  },
  changePlanButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  changePlanText: {
    fontSize: 16,
    fontWeight: '600',
  },
  abandonButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  abandonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  heroSection: {
    padding: 32,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  planList: {
    padding: 16,
  },
  planCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planCardName: {
    fontSize: 18,
    fontWeight: '600',
  },
  planDuration: {
    fontSize: 14,
    fontWeight: '500',
  },
  planCardDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  planCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  planCardStat: {
    fontSize: 12,
  },
  startText: {
    fontSize: 14,
    fontWeight: '600',
  },
  planCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  inviteButton: {
    paddingVertical: 4,
  },
  inviteText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalClose: {
    fontSize: 24,
    padding: 4,
  },
  selectedPlanName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  selectedPlanDesc: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  selectedPlanStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  confirmButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalPlanList: {
    maxHeight: 300,
  },
  modalPlanItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalPlanName: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalPlanDuration: {
    fontSize: 14,
  },
  bottomPadding: {
    height: 40,
  },
});
