'use client';

import { useState, useEffect } from 'react';
import { FireIcon } from './Icons';

// Social proof widget showing community activity
export function CommunityStatsWidget() {
  // In production, these would come from an API
  const [stats, setStats] = useState({
    activeToday: 1247,
    chaptersReadToday: 3891,
    totalUsers: 15420,
    streaksActive: 892,
  });

  // Simulate real-time updates (in production, use WebSocket or polling)
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeToday: prev.activeToday + Math.floor(Math.random() * 3),
        chaptersReadToday: prev.chaptersReadToday + Math.floor(Math.random() * 5),
      }));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🌍</span>
        <h3 className="font-bold text-lg">Community Today</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-[var(--color-bg-secondary)] rounded-lg">
          <p className="text-2xl font-bold text-green-500">{stats.activeToday.toLocaleString()}</p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Studying Now</p>
        </div>

        <div className="text-center p-3 bg-[var(--color-bg-secondary)] rounded-lg">
          <p className="text-2xl font-bold text-blue-500">{stats.chaptersReadToday.toLocaleString()}</p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Chapters Read</p>
        </div>

        <div className="text-center p-3 bg-[var(--color-bg-secondary)] rounded-lg">
          <p className="text-2xl font-bold text-purple-500">{stats.totalUsers.toLocaleString()}</p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Total Members</p>
        </div>

        <div className="text-center p-3 bg-[var(--color-bg-secondary)] rounded-lg">
          <p className="text-2xl font-bold text-orange-500 flex items-center justify-center gap-1">
            <FireIcon /> {stats.streaksActive}
          </p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Active Streaks</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--color-border)] text-center">
        <p className="text-xs text-[var(--color-text-secondary)]">
          Join thousands studying the scriptures daily
        </p>
      </div>
    </div>
  );
}

// Trending verses component
interface TrendingVerse {
  reference: string;
  text: string;
  highlightCount: number;
  bookmarkCount: number;
  noteCount: number;
}

export function TrendingVerses() {
  // In production, fetch from API
  const [trendingVerses] = useState<TrendingVerse[]>([
    {
      reference: '2 Nephi 2:25',
      text: 'Adam fell that men might be; and men are, that they might have joy.',
      highlightCount: 234,
      bookmarkCount: 189,
      noteCount: 156,
    },
    {
      reference: 'Moroni 10:4-5',
      text: 'And when ye shall receive these things, I would exhort you that ye would ask God...',
      highlightCount: 198,
      bookmarkCount: 167,
      noteCount: 143,
    },
    {
      reference: '1 Nephi 3:7',
      text: 'I will go and do the things which the Lord hath commanded...',
      highlightCount: 176,
      bookmarkCount: 154,
      noteCount: 128,
    },
  ]);

  return (
    <div className="bg-[var(--color-bg-secondary)] rounded-xl p-6 border border-[var(--color-border)]">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🔥</span>
        <h3 className="font-bold text-lg">Trending Verses</h3>
      </div>

      <div className="space-y-4">
        {trendingVerses.map((verse, index) => (
          <div
            key={verse.reference}
            className="p-4 bg-[var(--color-bg-tertiary)] rounded-lg hover:bg-[var(--color-bg-secondary)] transition cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-blue-500 mb-1">
                  {verse.reference}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 italic mb-2">
                  "{verse.text}"
                </p>
                <div className="flex items-center gap-4 text-xs text-[var(--color-text-tertiary)]">
                  <span className="flex items-center gap-1">
                    🎨 {verse.highlightCount} highlights
                  </span>
                  <span className="flex items-center gap-1">
                    🔖 {verse.bookmarkCount} bookmarks
                  </span>
                  <span className="flex items-center gap-1">
                    📝 {verse.noteCount} notes
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--color-border)] text-center">
        <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">
          View All Trending →
        </button>
      </div>
    </div>
  );
}

// Popular study notes
interface PopularNote {
  userName: string;
  userAvatar: string;
  reference: string;
  note: string;
  likes: number;
  timestamp: string;
}

export function PopularStudyNotes() {
  // In production, fetch from API
  const [popularNotes] = useState<PopularNote[]>([
    {
      userName: 'Sarah M.',
      userAvatar: '👩',
      reference: '2 Nephi 2:25',
      note: 'This verse reminds us that our purpose is joy! Even through trials, we can find happiness in the gospel.',
      likes: 47,
      timestamp: '2 hours ago',
    },
    {
      userName: 'James R.',
      userAvatar: '👨',
      reference: 'Alma 32:21',
      note: 'Faith is not perfect knowledge, but hope for things not seen that are true. Love this definition!',
      likes: 38,
      timestamp: '5 hours ago',
    },
  ]);

  return (
    <div className="bg-[var(--color-bg-secondary)] rounded-xl p-6 border border-[var(--color-border)]">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">💡</span>
        <h3 className="font-bold text-lg">Popular Insights</h3>
      </div>

      <div className="space-y-4">
        {popularNotes.map((note, index) => (
          <div
            key={index}
            className="p-4 bg-[var(--color-bg-tertiary)] rounded-lg"
          >
            <div className="flex items-start gap-3 mb-2">
              <div className="text-2xl">{note.userAvatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{note.userName}</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">
                    • {note.timestamp}
                  </span>
                </div>
                <p className="text-xs text-blue-500 font-medium mb-2">
                  {note.reference}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {note.note}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2 border-t border-[var(--color-border)]">
              <button className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)] hover:text-red-500 transition">
                ❤️ {note.likes}
              </button>
              <button className="text-xs text-[var(--color-text-tertiary)] hover:text-blue-500 transition">
                Reply
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Live activity feed
export function LiveActivityFeed() {
  const [activities, setActivities] = useState([
    { user: 'Emma', action: 'completed', item: '1 Nephi 1', time: 'just now' },
    { user: 'Michael', action: 'achieved', item: '7-day streak', time: '1 min ago' },
    { user: 'Olivia', action: 'highlighted', item: 'Alma 32:21', time: '2 min ago' },
    { user: 'Daniel', action: 'completed', item: '30-Day BoM Challenge', time: '5 min ago' },
  ]);

  return (
    <div className="bg-[var(--color-bg-secondary)] rounded-lg p-4 border border-[var(--color-border)]">
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <h4 className="font-semibold text-sm">Live Activity</h4>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="text-xs text-[var(--color-text-secondary)] p-2 bg-[var(--color-bg-tertiary)] rounded"
          >
            <span className="font-semibold">{activity.user}</span> {activity.action}{' '}
            <span className="text-blue-500">{activity.item}</span>
            <span className="text-[var(--color-text-tertiary)] ml-2">• {activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Social proof banner (for top of page)
export function SocialProofBanner() {
  return (
    <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-b border-green-500/20 px-4 py-2">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 text-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="text-[var(--color-text-secondary)]">
          <span className="font-semibold text-green-600 dark:text-green-400">1,247 people</span> are studying right now
        </span>
      </div>
    </div>
  );
}
