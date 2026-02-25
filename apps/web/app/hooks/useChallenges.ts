import { useState, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import {
  CHALLENGES,
  calculateChallengeProgress,
  getRecommendedChallenges,
  startChallenge,
  updateChallengeProgress,
  completeChallenge,
  type Challenge,
  type ChallengeProgress,
  type UserChallenge,
} from '../lib/challenges';

export function useChallenges(currentStreak: number, chaptersReadThisMonth: number) {
  const [activeChallenges, setActiveChallenges] = useLocalStorage<ChallengeProgress[]>(
    'coc-challenges',
    []
  );
  const [newCompletions, setNewCompletions] = useState<Challenge[]>([]);

  // Get user challenges with calculated progress
  const getUserChallenges = useCallback((): UserChallenge[] => {
    return activeChallenges
      .map((progress) => {
        const challenge = CHALLENGES.find((c) => c.id === progress.challengeId);
        if (!challenge) return null as any;

        const calc = calculateChallengeProgress(challenge, progress);

        return {
          ...challenge,
          progress,
          ...calc,
        };
      })
      .filter((c): c is UserChallenge => c !== null);
  }, [activeChallenges]);

  // Get active challenges
  const getActiveChallenges = useCallback(() => {
    return getUserChallenges().filter((c) => c.isActive && !c.progress.completed);
  }, [getUserChallenges]);

  // Get completed challenges
  const getCompletedChallenges = useCallback(() => {
    return getUserChallenges().filter((c) => c.progress.completed);
  }, [getUserChallenges]);

  // Get available challenges (not started)
  const getAvailableChallenges = useCallback(() => {
    const activeIds = new Set(activeChallenges.map((c) => c.challengeId));
    return CHALLENGES.filter((c) => !activeIds.has(c.id));
  }, [activeChallenges]);

  // Get recommended challenges
  const recommended = getRecommendedChallenges(
    currentStreak,
    chaptersReadThisMonth,
    activeChallenges.map((c) => c.challengeId)
  );

  // Start a new challenge
  const joinChallenge = useCallback(
    (challengeId: string) => {
      const challenge = CHALLENGES.find((c) => c.id === challengeId);
      if (!challenge) return;

      // Check if already active
      const exists = activeChallenges.find((c) => c.challengeId === challengeId);
      if (exists) return;

      const newProgress = startChallenge(challenge);
      setActiveChallenges([...activeChallenges, newProgress]);
    },
    [activeChallenges, setActiveChallenges]
  );

  // Update challenge progress (call when user reads chapters)
  const recordReading = useCallback(
    (chaptersReadToday: number, didReadToday: boolean) => {
      const updated = activeChallenges.map((progress) => {
        if (progress.completed) return progress;

        const updatedProgress = updateChallengeProgress(
          progress,
          chaptersReadToday,
          didReadToday
        );

        // Check if challenge is now complete
        const challenge = CHALLENGES.find((c) => c.id === progress.challengeId);
        if (challenge && updatedProgress.chaptersRead >= challenge.targetChapters) {
          const completed = completeChallenge(updatedProgress);

          // Track newly completed challenge for notification
          const challengeData = CHALLENGES.find((c) => c.id === progress.challengeId);
          if (challengeData && !newCompletions.find((c) => c.id === challengeData.id)) {
            setNewCompletions([...newCompletions, challengeData]);
          }

          return completed;
        }

        return updatedProgress;
      });

      setActiveChallenges(updated);
    },
    [activeChallenges, setActiveChallenges, newCompletions]
  );

  // Dismiss challenge (quit/abandon)
  const dismissChallenge = useCallback(
    (challengeId: string) => {
      setActiveChallenges(activeChallenges.filter((c) => c.challengeId !== challengeId));
    },
    [activeChallenges, setActiveChallenges]
  );

  // Mark completions as viewed
  const markCompletionsViewed = useCallback((challengeIds: string[]) => {
    setNewCompletions((prev) => prev.filter((c) => !challengeIds.includes(c.id)));
  }, []);

  // Get total points from completed challenges
  const totalPoints = getCompletedChallenges().reduce(
    (sum, c) => sum + c.rewardPoints,
    0
  );

  // Get completion rate
  const completionRate =
    activeChallenges.length > 0
      ? Math.round(
          (getCompletedChallenges().length / activeChallenges.length) * 100
        )
      : 0;

  return {
    activeChallenges: getActiveChallenges(),
    completedChallenges: getCompletedChallenges(),
    availableChallenges: getAvailableChallenges(),
    recommendedChallenges: recommended,
    newCompletions,
    totalPoints,
    completionRate,
    joinChallenge,
    recordReading,
    dismissChallenge,
    markCompletionsViewed,
  };
}
