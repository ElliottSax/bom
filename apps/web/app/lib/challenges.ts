// Reading challenge definitions and logic

export interface Challenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  durationDays: number;
  targetChapters: number;
  volume?: 'bom' | 'dc' | 'iv' | 'all';
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  category: 'speed' | 'completion' | 'consistency' | 'comprehensive';
  rewardPoints: number;
  badge?: string;
}

export interface ChallengeProgress {
  challengeId: string;
  startDate: string;
  endDate: string;
  chaptersRead: number;
  daysActive: number;
  currentStreak: number;
  completed: boolean;
  completedDate?: string;
}

export interface UserChallenge extends Challenge {
  progress: ChallengeProgress;
  percentComplete: number;
  daysRemaining: number;
  isActive: boolean;
  canComplete: boolean;
}

export const CHALLENGES: Challenge[] = [
  // Book of Mormon Challenges
  {
    id: 'bom-30-day',
    name: '30-Day Book of Mormon',
    description: 'Read the entire Book of Mormon in 30 days (15 chapters/day average)',
    icon: '📖',
    durationDays: 30,
    targetChapters: 239, // Total BoM chapters
    volume: 'bom',
    difficulty: 'hard',
    category: 'speed',
    rewardPoints: 500,
    badge: '🏆',
  },
  {
    id: 'bom-90-day',
    name: '90-Day Book of Mormon',
    description: 'Read the entire Book of Mormon in 90 days (3 chapters/day)',
    icon: '📚',
    durationDays: 90,
    targetChapters: 239,
    volume: 'bom',
    difficulty: 'medium',
    category: 'completion',
    rewardPoints: 300,
    badge: '⭐',
  },
  {
    id: 'bom-1-year',
    name: 'Book of Mormon in a Year',
    description: 'Read the entire Book of Mormon in 365 days',
    icon: '📅',
    durationDays: 365,
    targetChapters: 239,
    volume: 'bom',
    difficulty: 'easy',
    category: 'completion',
    rewardPoints: 200,
    badge: '🎯',
  },

  // Doctrine & Covenants Challenges
  {
    id: 'dc-30-day',
    name: '30-Day D&C Challenge',
    description: 'Read all 138 sections of D&C in 30 days',
    icon: '📜',
    durationDays: 30,
    targetChapters: 138,
    volume: 'dc',
    difficulty: 'medium',
    category: 'speed',
    rewardPoints: 250,
    badge: '💫',
  },
  {
    id: 'dc-90-day',
    name: '90-Day D&C Challenge',
    description: 'Read all 138 sections of D&C in 90 days',
    icon: '📖',
    durationDays: 90,
    targetChapters: 138,
    volume: 'dc',
    difficulty: 'easy',
    category: 'completion',
    rewardPoints: 150,
    badge: '✨',
  },

  // Consistency Challenges
  {
    id: 'daily-chapter-30',
    name: '30-Day Daily Reader',
    description: 'Read at least 1 chapter every day for 30 days',
    icon: '🔥',
    durationDays: 30,
    targetChapters: 30,
    difficulty: 'medium',
    category: 'consistency',
    rewardPoints: 200,
    badge: '🔥',
  },
  {
    id: 'daily-chapter-100',
    name: '100-Day Consistency',
    description: 'Read at least 1 chapter every day for 100 days',
    icon: '💪',
    durationDays: 100,
    targetChapters: 100,
    difficulty: 'hard',
    category: 'consistency',
    rewardPoints: 500,
    badge: '💪',
  },

  // Speed Challenges
  {
    id: 'weekend-warrior',
    name: 'Weekend Warrior',
    description: 'Read 20 chapters in one weekend (Sat-Sun)',
    icon: '⚡',
    durationDays: 2,
    targetChapters: 20,
    difficulty: 'extreme',
    category: 'speed',
    rewardPoints: 150,
    badge: '⚡',
  },
  {
    id: 'chapter-a-day',
    name: 'Chapter-a-Day (30 Days)',
    description: 'Read exactly 1 chapter each day for 30 days',
    icon: '📆',
    durationDays: 30,
    targetChapters: 30,
    difficulty: 'easy',
    category: 'consistency',
    rewardPoints: 100,
    badge: '📆',
  },

  // Comprehensive Challenges
  {
    id: 'complete-standard-works',
    name: 'Complete Standard Works',
    description: 'Read BoM, D&C, and IV Bible in one year',
    icon: '🌟',
    durationDays: 365,
    targetChapters: 400, // Approximate total
    volume: 'all',
    difficulty: 'extreme',
    category: 'comprehensive',
    rewardPoints: 1000,
    badge: '👑',
  },
];

// Calculate challenge progress
export function calculateChallengeProgress(
  challenge: Challenge,
  progress: ChallengeProgress
): {
  percentComplete: number;
  daysRemaining: number;
  isActive: boolean;
  canComplete: boolean;
  daysElapsed: number;
  onPace: boolean;
  requiredPace: number;
} {
  const now = new Date();
  const startDate = new Date(progress.startDate);
  const endDate = new Date(progress.endDate);

  const daysElapsed = Math.floor(
    (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysRemaining = Math.floor(
    (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const isActive = now <= endDate && !progress.completed;
  const percentComplete = Math.round(
    (progress.chaptersRead / challenge.targetChapters) * 100
  );

  // Calculate if user is on pace
  const expectedProgress =
    (daysElapsed / challenge.durationDays) * challenge.targetChapters;
  const onPace = progress.chaptersRead >= expectedProgress;

  // Calculate required daily pace to complete
  const chaptersRemaining = challenge.targetChapters - progress.chaptersRead;
  const requiredPace =
    daysRemaining > 0 ? Math.ceil(chaptersRemaining / daysRemaining) : chaptersRemaining;

  const canComplete = progress.chaptersRead >= challenge.targetChapters;

  return {
    percentComplete,
    daysRemaining: Math.max(0, daysRemaining),
    isActive,
    canComplete,
    daysElapsed,
    onPace,
    requiredPace,
  };
}

// Get recommended challenges for user
export function getRecommendedChallenges(
  currentStreak: number,
  chaptersReadThisMonth: number,
  currentChallenges: string[]
): Challenge[] {
  const activeChallengeIds = new Set(currentChallenges);

  // Filter out already active challenges
  const available = CHALLENGES.filter((c) => !activeChallengeIds.has(c.id));

  // Recommend based on user's current engagement
  if (currentStreak >= 30) {
    // Active user - suggest harder challenges
    return available
      .filter((c) => c.difficulty === 'hard' || c.difficulty === 'extreme')
      .slice(0, 3);
  } else if (currentStreak >= 7) {
    // Regular user - suggest medium challenges
    return available.filter((c) => c.difficulty === 'medium').slice(0, 3);
  } else {
    // New/casual user - suggest easy challenges
    return available.filter((c) => c.difficulty === 'easy').slice(0, 3);
  }
}

// Get difficulty color
export function getDifficultyColor(difficulty: Challenge['difficulty']): string {
  switch (difficulty) {
    case 'easy':
      return 'text-green-500';
    case 'medium':
      return 'text-yellow-500';
    case 'hard':
      return 'text-orange-500';
    case 'extreme':
      return 'text-red-500';
  }
}

// Get difficulty badge color
export function getDifficultyBgColor(difficulty: Challenge['difficulty']): string {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-500/10';
    case 'medium':
      return 'bg-yellow-500/10';
    case 'hard':
      return 'bg-orange-500/10';
    case 'extreme':
      return 'bg-red-500/10';
  }
}

// Start a new challenge
export function startChallenge(challenge: Challenge): ChallengeProgress {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + challenge.durationDays);

  return {
    challengeId: challenge.id,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    chaptersRead: 0,
    daysActive: 0,
    currentStreak: 0,
    completed: false,
  };
}

// Update challenge progress
export function updateChallengeProgress(
  progress: ChallengeProgress,
  chaptersReadToday: number,
  didReadToday: boolean
): ChallengeProgress {
  const updatedProgress = { ...progress };
  updatedProgress.chaptersRead += chaptersReadToday;

  if (didReadToday) {
    updatedProgress.daysActive += 1;
    updatedProgress.currentStreak += 1;
  } else {
    updatedProgress.currentStreak = 0;
  }

  return updatedProgress;
}

// Complete a challenge
export function completeChallenge(progress: ChallengeProgress): ChallengeProgress {
  return {
    ...progress,
    completed: true,
    completedDate: new Date().toISOString(),
  };
}

// Get leaderboard data (for future use)
export interface ChallengeLeaderboardEntry {
  userId: string;
  userName: string;
  chaptersRead: number;
  daysActive: number;
  percentComplete: number;
  rank: number;
}
