import { useState, useEffect, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import {
  ACHIEVEMENTS,
  checkAchievements,
  getTotalPoints,
  type Achievement,
  type UnlockedAchievement,
  type AchievementUserData,
} from '../lib/achievements';

export function useAchievements(userData: AchievementUserData) {
  const [unlockedAchievements, setUnlockedAchievements] = useLocalStorage<UnlockedAchievement[]>(
    'coc-achievements',
    []
  );
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  // Check for newly unlocked achievements
  useEffect(() => {
    const newly = checkAchievements(userData, unlockedAchievements);

    if (newly.length > 0) {
      const newUnlocked: UnlockedAchievement[] = newly.map(achievement => ({
        achievementId: achievement.id,
        unlockedAt: new Date().toISOString(),
        viewed: false,
      }));

      setUnlockedAchievements([...unlockedAchievements, ...newUnlocked]);
      setNewAchievements(newly);
    }
  }, [userData, unlockedAchievements, setUnlockedAchievements]);

  // Mark achievements as viewed
  const markAsViewed = useCallback((achievementIds: string[]) => {
    setUnlockedAchievements(prev =>
      prev.map(a =>
        achievementIds.includes(a.achievementId)
          ? { ...a, viewed: true }
          : a
      )
    );
    setNewAchievements([]);
  }, [setUnlockedAchievements]);

  // Get unviewed achievements
  const getUnviewedAchievements = useCallback(() => {
    return unlockedAchievements
      .filter(a => !a.viewed)
      .map(a => ACHIEVEMENTS.find(ach => ach.id === a.achievementId))
      .filter((a): a is Achievement => a !== undefined);
  }, [unlockedAchievements]);

  // Get all unlocked achievement details
  const getAllUnlockedAchievements = useCallback(() => {
    return unlockedAchievements
      .map(a => ({
        ...ACHIEVEMENTS.find(ach => ach.id === a.achievementId),
        ...a,
      }))
      .filter((a): a is Achievement & UnlockedAchievement => a !== undefined);
  }, [unlockedAchievements]);

  // Get locked achievements
  const getLockedAchievements = useCallback(() => {
    const unlockedIds = new Set(unlockedAchievements.map(a => a.achievementId));
    return ACHIEVEMENTS.filter(a => !unlockedIds.has(a.id));
  }, [unlockedAchievements]);

  // Get total points
  const totalPoints = getTotalPoints(unlockedAchievements);

  // Get completion percentage
  const completionPercentage = Math.round(
    (unlockedAchievements.length / ACHIEVEMENTS.length) * 100
  );

  return {
    unlockedAchievements: getAllUnlockedAchievements(),
    lockedAchievements: getLockedAchievements(),
    newAchievements,
    unviewedAchievements: getUnviewedAchievements(),
    totalPoints,
    completionPercentage,
    markAsViewed,
  };
}
