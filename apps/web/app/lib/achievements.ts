// Achievement definitions and logic

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  category: 'reading' | 'streak' | 'study' | 'course' | 'milestone';
  condition: (userData: AchievementUserData) => boolean;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementUserData {
  chaptersRead: number;
  booksCompleted: number;
  currentStreak: number;
  longestStreak: number;
  notesWritten: number;
  highlightsMade: number;
  bookmarksCreated: number;
  coursesCompleted: number;
  quizzesPassed: number;
  totalScore: number;
  daysActive: number;
  wordStudiesCompleted: number;
  memorizationsCompleted: number;
  readingGoalsAchieved: number;
  hasEarlyMorningReading: boolean;
  hasLateNightReading: boolean;
  hasWeekendWarriorPattern: boolean;
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: string; // ISO date string
  viewed: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Reading achievements
  {
    id: 'first_chapter',
    name: 'First Steps',
    description: 'Read your first chapter',
    icon: '📖',
    category: 'reading',
    condition: (data) => data.chaptersRead >= 1,
    points: 10,
    rarity: 'common',
  },
  {
    id: 'ten_chapters',
    name: 'Getting Started',
    description: 'Read 10 chapters',
    icon: '📚',
    category: 'reading',
    condition: (data) => data.chaptersRead >= 10,
    points: 25,
    rarity: 'common',
  },
  {
    id: 'fifty_chapters',
    name: 'Dedicated Reader',
    description: 'Read 50 chapters',
    icon: '🎓',
    category: 'reading',
    condition: (data) => data.chaptersRead >= 50,
    points: 50,
    rarity: 'rare',
  },
  {
    id: 'hundred_chapters',
    name: 'Century Club',
    description: 'Read 100 chapters',
    icon: '💯',
    category: 'reading',
    condition: (data) => data.chaptersRead >= 100,
    points: 100,
    rarity: 'rare',
  },
  {
    id: 'first_book',
    name: 'Book Completed',
    description: 'Complete your first book',
    icon: '✅',
    category: 'reading',
    condition: (data) => data.booksCompleted >= 1,
    points: 50,
    rarity: 'rare',
  },
  {
    id: 'complete_bom',
    name: 'Book of Mormon Scholar',
    description: 'Complete the entire Book of Mormon',
    icon: '🏆',
    category: 'milestone',
    condition: (data) => data.booksCompleted >= 15, // BoM has 15 books
    points: 500,
    rarity: 'legendary',
  },

  // Streak achievements
  {
    id: 'week_streak',
    name: 'Week Warrior',
    description: 'Maintain a 7-day study streak',
    icon: '🔥',
    category: 'streak',
    condition: (data) => data.currentStreak >= 7,
    points: 35,
    rarity: 'common',
  },
  {
    id: 'month_streak',
    name: 'Monthly Master',
    description: 'Maintain a 30-day study streak',
    icon: '🔥🔥',
    category: 'streak',
    condition: (data) => data.currentStreak >= 30,
    points: 100,
    rarity: 'rare',
  },
  {
    id: 'hundred_day_streak',
    name: 'Centurion',
    description: 'Maintain a 100-day study streak',
    icon: '🔥🔥🔥',
    category: 'streak',
    condition: (data) => data.currentStreak >= 100,
    points: 250,
    rarity: 'epic',
  },
  {
    id: 'year_streak',
    name: 'Year of Scripture',
    description: 'Maintain a 365-day study streak',
    icon: '👑',
    category: 'streak',
    condition: (data) => data.currentStreak >= 365,
    points: 1000,
    rarity: 'legendary',
  },

  // Study achievements
  {
    id: 'first_note',
    name: 'Note Taker',
    description: 'Write your first note',
    icon: '✍️',
    category: 'study',
    condition: (data) => data.notesWritten >= 1,
    points: 10,
    rarity: 'common',
  },
  {
    id: 'ten_notes',
    name: 'Thoughtful Student',
    description: 'Write 10 notes',
    icon: '📝',
    category: 'study',
    condition: (data) => data.notesWritten >= 10,
    points: 25,
    rarity: 'common',
  },
  {
    id: 'first_highlight',
    name: 'Highlighter',
    description: 'Highlight your first verse',
    icon: '🖍️',
    category: 'study',
    condition: (data) => data.highlightsMade >= 1,
    points: 5,
    rarity: 'common',
  },
  {
    id: 'fifty_highlights',
    name: 'Colorful Collection',
    description: 'Highlight 50 verses',
    icon: '🌈',
    category: 'study',
    condition: (data) => data.highlightsMade >= 50,
    points: 40,
    rarity: 'rare',
  },
  {
    id: 'first_bookmark',
    name: 'Bookmark Keeper',
    description: 'Bookmark your first verse',
    icon: '🔖',
    category: 'study',
    condition: (data) => data.bookmarksCreated >= 1,
    points: 5,
    rarity: 'common',
  },
  {
    id: 'word_study_master',
    name: 'Word Scholar',
    description: 'Complete 10 word studies',
    icon: '📖',
    category: 'study',
    condition: (data) => data.wordStudiesCompleted >= 10,
    points: 50,
    rarity: 'rare',
  },
  {
    id: 'memorization_expert',
    name: 'Memory Master',
    description: 'Memorize 5 verses',
    icon: '🧠',
    category: 'study',
    condition: (data) => data.memorizationsCompleted >= 5,
    points: 75,
    rarity: 'epic',
  },

  // Course achievements
  {
    id: 'first_course',
    name: 'Course Beginner',
    description: 'Complete your first course',
    icon: '🎯',
    category: 'course',
    condition: (data) => data.coursesCompleted >= 1,
    points: 50,
    rarity: 'rare',
  },
  {
    id: 'all_courses',
    name: 'Course Master',
    description: 'Complete all available courses',
    icon: '🎓',
    category: 'course',
    condition: (data) => data.coursesCompleted >= 6, // Currently 6 CoC courses
    points: 300,
    rarity: 'epic',
  },
  {
    id: 'perfect_quiz',
    name: 'Perfect Score',
    description: 'Score 100% on a quiz',
    icon: '💯',
    category: 'course',
    condition: (data) => data.totalScore >= 100, // This would need special handling
    points: 40,
    rarity: 'rare',
  },

  // Milestone achievements
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Study before 6 AM',
    icon: '🌅',
    category: 'milestone',
    condition: (data) => data.hasEarlyMorningReading,
    points: 20,
    rarity: 'common',
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Study after 10 PM',
    icon: '🦉',
    category: 'milestone',
    condition: (data) => data.hasLateNightReading,
    points: 20,
    rarity: 'common',
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Study on both Saturday and Sunday',
    icon: '⚔️',
    category: 'milestone',
    condition: (data) => data.hasWeekendWarriorPattern,
    points: 15,
    rarity: 'common',
  },
];

// Get rarity color
export function getRarityColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common':
      return 'text-gray-500';
    case 'rare':
      return 'text-blue-500';
    case 'epic':
      return 'text-purple-500';
    case 'legendary':
      return 'text-yellow-500';
  }
}

// Get rarity background color
export function getRarityBgColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common':
      return 'bg-gray-500/10';
    case 'rare':
      return 'bg-blue-500/10';
    case 'epic':
      return 'bg-purple-500/10';
    case 'legendary':
      return 'bg-yellow-500/10';
  }
}

// Check which achievements should be unlocked
export function checkAchievements(
  userData: AchievementUserData,
  currentlyUnlocked: UnlockedAchievement[]
): Achievement[] {
  const unlockedIds = new Set(currentlyUnlocked.map((a) => a.achievementId));
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (!unlockedIds.has(achievement.id) && achievement.condition(userData)) {
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}

// Get total points for user
export function getTotalPoints(unlockedAchievements: UnlockedAchievement[]): number {
  const unlockedIds = new Set(unlockedAchievements.map((a) => a.achievementId));
  return ACHIEVEMENTS.filter((a) => unlockedIds.has(a.id)).reduce((sum, a) => sum + a.points, 0);
}

// Get achievement progress
export function getAchievementProgress(
  achievement: Achievement,
  userData: AchievementUserData
): number {
  // This is a simplified version - you'd need more complex logic for each achievement
  switch (achievement.id) {
    case 'first_chapter':
      return Math.min(userData.chaptersRead, 1);
    case 'ten_chapters':
      return Math.min(userData.chaptersRead / 10, 1);
    case 'fifty_chapters':
      return Math.min(userData.chaptersRead / 50, 1);
    case 'hundred_chapters':
      return Math.min(userData.chaptersRead / 100, 1);
    case 'week_streak':
      return Math.min(userData.currentStreak / 7, 1);
    case 'month_streak':
      return Math.min(userData.currentStreak / 30, 1);
    case 'hundred_day_streak':
      return Math.min(userData.currentStreak / 100, 1);
    case 'year_streak':
      return Math.min(userData.currentStreak / 365, 1);
    default:
      return achievement.condition(userData) ? 1 : 0;
  }
}
