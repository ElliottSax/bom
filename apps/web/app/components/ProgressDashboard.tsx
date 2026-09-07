'use client';

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  useCourseProgress,
  type CourseProgressData,
  type QuizScore,
} from '../contexts/CourseProgressContext';
import { type Course } from '../hooks/useCoCCourses';
import { fadeInUp, staggerChildren, hoverLift } from '../lib/motion';

interface ProgressDashboardProps {
  courses: Course[];
  className?: string;
}

interface Stats {
  coursesStarted: number;
  coursesCompleted: number;
  lessonsCompleted: number;
  totalLessons: number;
  quizzesPassed: number;
  totalQuizzes: number;
  averageQuizScore: number;
  bookmarksCount: number;
  learningStreak: number;
  estimatedHours: number;
}

export function ProgressDashboard({ courses, className = '' }: ProgressDashboardProps) {
  const { courseProgress, quizScores, bookmarks } = useCourseProgress();

  const stats = useMemo((): Stats => {
    const courseIds = Object.keys(courseProgress);
    const coursesStarted = courseIds.length;
    const coursesCompleted = courseIds.filter((id) => courseProgress[id]?.completed).length;

    // Count total lessons completed across all courses
    let lessonsCompleted = 0;
    courseIds.forEach((id) => {
      lessonsCompleted += courseProgress[id]?.lessonsCompleted?.length || 0;
    });

    // Count total lessons available
    const totalLessons = courses.reduce((sum, course) => sum + course.lessonsCount, 0);

    // Count quiz stats
    const quizEntries = Object.values(quizScores);
    const quizzesPassed = quizEntries.filter((q) => q.passed).length;
    const totalQuizzes = quizEntries.length;
    const averageQuizScore =
      totalQuizzes > 0
        ? Math.round(quizEntries.reduce((sum, q) => sum + q.score, 0) / totalQuizzes)
        : 0;

    // Calculate learning streak (days in a row with activity)
    const learningStreak = calculateStreak(courseProgress, quizScores);

    // Estimate hours spent (rough calculation: 5 min per lesson average)
    const estimatedHours = Math.round(((lessonsCompleted * 5) / 60) * 10) / 10;

    return {
      coursesStarted,
      coursesCompleted,
      lessonsCompleted,
      totalLessons,
      quizzesPassed,
      totalQuizzes,
      averageQuizScore,
      bookmarksCount: bookmarks.length,
      learningStreak,
      estimatedHours,
    };
  }, [courseProgress, quizScores, bookmarks, courses]);

  const completionPercentage =
    stats.totalLessons > 0 ? Math.round((stats.lessonsCompleted / stats.totalLessons) * 100) : 0;

  return (
    <motion.div
      className={`bg-[var(--color-bg-secondary)] rounded-lg p-6 ${className}`}
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        Your Progress
      </h2>

      {/* Overall Progress Ring */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-[var(--color-bg-tertiary)]"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className="text-accent"
              strokeDasharray={`${completionPercentage * 3.52} 352`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-2xl font-bold text-[var(--color-text-primary)]">
              {completionPercentage}%
            </span>
            <span className="text-xs text-[var(--color-text-tertiary)]">Complete</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-2 gap-4"
        variants={staggerChildren}
        initial="hidden"
        animate="visible"
      >
        {/* Courses */}
        <StatCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          }
          label="Courses"
          value={`${stats.coursesCompleted}/${stats.coursesStarted}`}
          subtext="completed"
          color="accent"
        />

        {/* Lessons */}
        <StatCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          label="Lessons"
          value={stats.lessonsCompleted.toString()}
          subtext={`of ${stats.totalLessons}`}
          color="slate"
        />

        {/* Quizzes */}
        <StatCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          }
          label="Quizzes"
          value={stats.quizzesPassed.toString()}
          subtext={stats.totalQuizzes > 0 ? `avg ${stats.averageQuizScore}%` : 'passed'}
          color="steel"
        />

        {/* Streak */}
        <StatCard
          icon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                clipRule="evenodd"
              />
            </svg>
          }
          label="Streak"
          value={stats.learningStreak.toString()}
          subtext="days"
          color="gold"
        />
      </motion.div>

      {/* Additional Stats */}
      <div className="mt-6 pt-4 border-t border-[var(--color-border-light)]">
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
            <svg
              className="w-4 h-4 text-[var(--color-gold)]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span>{stats.bookmarksCount} bookmarks</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
            <svg
              className="w-4 h-4 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>~{stats.estimatedHours} hours</span>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      {stats.coursesStarted === 0 ? (
        <div className="mt-4 p-4 bg-accent-500/10 rounded-lg text-center">
          <p className="text-sm text-accent">
            Start your first course to begin tracking your progress!
          </p>
        </div>
      ) : stats.learningStreak > 0 ? (
        <div className="mt-4 p-4 bg-gold-500/10 rounded-lg text-center">
          <p className="text-sm" style={{ color: 'var(--color-gold)' }}>
            {stats.learningStreak >= 7
              ? `Amazing! ${stats.learningStreak} day streak! Keep it up!`
              : stats.learningStreak >= 3
                ? `Great job! ${stats.learningStreak} days in a row!`
                : `Good start! Keep learning daily!`}
          </p>
        </div>
      ) : null}
    </motion.div>
  );
}

// Helper component for stat cards
// Colors stay within the Community of Christ brand family: blue for the primary
// metric, gold reserved for the streak (a badge-like highlight), and two neutral
// grays from the brand palette for the rest -- no unrelated hues.
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  color: 'accent' | 'slate' | 'steel' | 'gold';
}

function StatCard({ icon, label, value, subtext, color }: StatCardProps) {
  const colorClasses = {
    accent: 'text-accent bg-accent-500/10',
    slate: 'text-[#4A5464] bg-[#4A5464]/10',
    steel: 'text-[#728197] bg-[#728197]/10',
    gold: 'text-[var(--color-gold)] bg-gold-500/10',
  };

  return (
    <motion.div
      className="bg-[var(--color-bg-primary)] rounded-lg p-4 border border-[var(--color-border-light)]"
      variants={fadeInUp}
      whileHover={hoverLift}
    >
      <div
        className={`w-8 h-8 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-2`}
      >
        {icon}
      </div>
      <div className="text-xs text-[var(--color-text-tertiary)] mb-1">{label}</div>
      <div className="text-xl font-bold text-[var(--color-text-primary)]">{value}</div>
      <div className="text-xs text-[var(--color-text-secondary)]">{subtext}</div>
    </motion.div>
  );
}

// Helper function to calculate learning streak
function calculateStreak(
  courseProgress: { [key: string]: CourseProgressData },
  quizScores: { [key: string]: QuizScore }
): number {
  // Collect all activity dates
  const activityDates = new Set<string>();

  // Add course start dates
  Object.values(courseProgress).forEach((progress) => {
    if (progress.started) {
      activityDates.add(new Date(progress.started).toDateString());
    }
    if (progress.completedDate) {
      activityDates.add(new Date(progress.completedDate).toDateString());
    }
  });

  // Add quiz attempt dates
  Object.values(quizScores).forEach((quiz) => {
    if (quiz.lastAttempt) {
      activityDates.add(new Date(quiz.lastAttempt).toDateString());
    }
  });

  if (activityDates.size === 0) return 0;

  // Calculate consecutive days streak ending today
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);

    if (activityDates.has(checkDate.toDateString())) {
      streak++;
    } else if (i === 0) {
      // Allow checking from yesterday if no activity today
      continue;
    } else {
      break;
    }
  }

  return streak;
}

export default ProgressDashboard;
