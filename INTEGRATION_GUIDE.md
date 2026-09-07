# Integration Guide for Traffic-Driving Features

**Quick guide to integrate the new features into the BOM Study Tools app**

---

## Quick Start

All components are ready to use! Here's how to integrate them:

### 1. Share Buttons (Already Integrated ✅)

**Verse Sharing** - Already added to `VerseDisplay.tsx`

```tsx
import { ShareVerseButton } from './ShareButton';

<ShareVerseButton
  verse={verse.text}
  reference={`${bookName} ${chapter}:${verseNum}`}
  variant="secondary"
  size="sm"
/>;
```

**Progress Sharing** - Already added to `VolumeHomeScreen.tsx`

```tsx
import { ShareButton } from './ShareButton';
import { createProgressShareData } from '../hooks/useShare';

const shareData = createProgressShareData(
  chaptersRead,
  totalChapters,
  currentStreak
);

<ShareButton data={shareData} variant="secondary" size="sm" showMenu={true} />;
```

---

### 2. Achievement System - Integration Required

**Step 1: Add Achievement Hook to page.tsx**

```tsx
// In apps/web/app/page.tsx
import { useAchievements } from './hooks/useAchievements';
import { AchievementNotificationContainer } from './components/AchievementNotificationContainer';

function HomeContent() {
  // Existing code...
  const { readingProgress, notes, highlights, bookmarks } = useUserData();

  // Add achievement tracking
  const achievementUserData = {
    chaptersRead: chaptersReadInVolume,
    booksCompleted: 0, // Calculate from readingProgress
    currentStreak: readingProgress.currentStreak,
    longestStreak: readingProgress.longestStreak || 0,
    notesWritten: notes.length,
    highlightsMade: highlights.length,
    bookmarksCreated: bookmarks.length,
    coursesCompleted: 0, // Calculate from course progress
    quizzesPassed: 0, // Calculate from quiz scores
    totalScore: 0,
    daysActive: 0, // Calculate from readingProgress
    wordStudiesCompleted: 0, // Track from word study modal
    memorizationsCompleted: 0, // Track from memorization modal
    readingGoalsAchieved: 0, // Track from reading goals
  };

  const {
    unlockedAchievements,
    lockedAchievements,
    newAchievements,
    totalPoints,
    completionPercentage,
    markAsViewed,
  } = useAchievements(achievementUserData);

  return (
    <>
      {/* Achievement notifications */}
      <AchievementNotificationContainer
        achievements={newAchievements}
        onDismiss={markAsViewed}
      />

      {/* Rest of your app... */}
    </>
  );
}
```

**Step 2: Add Achievements Modal to Header**

```tsx
// In apps/web/app/components/Header.tsx
// Add a new button:

<button
  onClick={() => setShowAchievements(true)}
  className="p-2 hover:bg-[var(--color-bg-secondary)] rounded-lg relative"
  title="Achievements"
>
  <span className="text-xl">🏆</span>
  {newAchievementsCount > 0 && (
    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
  )}
</button>
```

```tsx
// In apps/web/app/page.tsx, add to modals section:
import { AchievementsModal } from './components/modals/AchievementsModal';

{
  showAchievements && (
    <AchievementsModal
      show={showAchievements}
      onClose={() => setShowAchievements(false)}
      unlockedAchievements={unlockedAchievements}
      lockedAchievements={lockedAchievements}
      totalPoints={totalPoints}
      completionPercentage={completionPercentage}
      userData={achievementUserData}
    />
  );
}
```

---

### 3. Streak Widgets - Integration Required

**Option A: Add to VolumeHomeScreen (Recommended)**

```tsx
// In apps/web/app/components/VolumeHomeScreen.tsx
import { StreakWidget, StreakCalendar } from './StreakWidget';

// Replace existing streak display with:
<StreakWidget
  currentStreak={currentStreak}
  longestStreak={readingProgress.longestStreak || 0}
  variant="detailed"
  showShare={true}
/>

// Add calendar view:
<StreakCalendar
  dates={Object.keys(readingProgress.chaptersRead).map(key => {
    // Convert chapter read keys to ISO dates
    // You'll need to store read dates in readingProgress
    return readingProgress.readDates || [];
  })}
/>
```

**Option B: Add to Sidebar**

```tsx
// In apps/web/app/components/Sidebar.tsx
import { StreakWidget } from './StreakWidget';

<StreakWidget
  currentStreak={readingProgress.currentStreak}
  longestStreak={readingProgress.longestStreak || 0}
  variant="compact"
  showShare={false}
/>;
```

**Step 3: Add Streak Celebrations**

```tsx
// In apps/web/app/page.tsx
import { StreakCelebration } from './components/StreakCelebration';
import { useState, useEffect } from 'react';

function HomeContent() {
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [celebrationStreak, setCelebrationStreak] = useState(0);

  // Check for streak milestones
  useEffect(() => {
    const milestones = [3, 7, 14, 30, 60, 100, 365];
    const currentStreak = readingProgress.currentStreak;

    // Check if just hit a milestone (compare with previous)
    const previousStreak = parseInt(localStorage.getItem('last-streak') || '0');
    localStorage.setItem('last-streak', currentStreak.toString());

    if (milestones.includes(currentStreak) && currentStreak > previousStreak) {
      setCelebrationStreak(currentStreak);
      setShowStreakCelebration(true);
    }
  }, [readingProgress.currentStreak]);

  return (
    <>
      {showStreakCelebration && (
        <StreakCelebration
          streak={celebrationStreak}
          onClose={() => setShowStreakCelebration(false)}
        />
      )}
      {/* Rest of app... */}
    </>
  );
}
```

---

## Data Structure Updates Needed

### 1. Update ReadingProgress Type

```typescript
// In apps/web/app/lib/types.ts
export interface ReadingProgress {
  chaptersRead: Record<string, boolean>;
  currentStreak: number;
  longestStreak: number; // ADD THIS
  lastReadDate: string | null;
  readDates: string[]; // ADD THIS - Array of ISO date strings
}
```

### 2. Update readingProgress Tracking

```typescript
// In apps/web/app/contexts/UserDataContext.tsx

const markChapterRead = (bookId: string, chapter: number) => {
  const key = `${currentVolumeId}:${bookId}:${chapter}`;
  const today = new Date().toISOString().split('T')[0];

  setReadingProgress((prev) => {
    const newChaptersRead = { ...prev.chaptersRead, [key]: true };
    const readDates = [...(prev.readDates || [])];

    // Add today if not already there
    if (!readDates.includes(today)) {
      readDates.push(today);
    }

    // Calculate streak
    const { currentStreak, longestStreak } = calculateStreak(readDates);

    return {
      chaptersRead: newChaptersRead,
      currentStreak,
      longestStreak: Math.max(prev.longestStreak || 0, currentStreak),
      lastReadDate: today,
      readDates,
    };
  });
};

function calculateStreak(dates: string[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  // Sort dates
  const sorted = [...dates].sort().reverse();
  const today = new Date().toISOString().split('T')[0];

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Check if today or yesterday is in the list (current streak)
  let checkDate = new Date();
  if (!sorted.includes(today)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  for (let i = 0; i < sorted.length; i++) {
    const expectedDate = new Date(checkDate);
    expectedDate.setDate(checkDate.getDate() - i);
    const expectedDateStr = expectedDate.toISOString().split('T')[0];

    if (sorted[i] === expectedDateStr) {
      currentStreak++;
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      break;
    }
  }

  return { currentStreak, longestStreak };
}
```

---

## Testing Checklist

- [ ] Share verse button appears when verse is selected
- [ ] Share progress button appears on home screen
- [ ] Achievement notifications appear when unlocking
- [ ] Achievements modal shows all achievements
- [ ] Streak widget displays current streak
- [ ] Streak celebration shows at milestones
- [ ] All share buttons work (native + menu)
- [ ] Achievement progress bars update
- [ ] Streak calendar shows activity
- [ ] Dark mode works for all components

---

## Quick Fixes for Common Issues

### Issue: Share button doesn't work

**Fix**: Check if `ToastProvider` is wrapping the app (needed for copy-to-clipboard feedback)

### Issue: Achievements not unlocking

**Fix**: Verify `achievementUserData` is being passed with correct values

### Issue: Streak not calculating

**Fix**: Ensure `readDates` array is being populated in `markChapterRead`

### Issue: Celebration modal not showing

**Fix**: Check localStorage for `last-streak` value, may need to clear it

---

## Performance Tips

1. **Lazy Load Modals**: Already done for AchievementsModal
2. **Memoize Achievement Calculations**: Use `useMemo` for expensive checks
3. **Debounce Share Events**: Prevent rapid-fire share clicks
4. **LocalStorage Throttling**: Use `useAutoSave` hook for achievement saves

---

## Analytics Integration (Optional)

```typescript
// Add to your analytics service
analytics.track('achievement_unlocked', {
  achievement_id: achievement.id,
  achievement_name: achievement.name,
  points: achievement.points,
  rarity: achievement.rarity,
});

analytics.track('share_initiated', {
  content_type: 'verse' | 'progress' | 'achievement' | 'streak',
  platform: 'twitter' | 'facebook' | 'whatsapp' | 'native' | 'copy',
});

analytics.track('streak_milestone', {
  days: currentStreak,
  milestone: true / false,
});
```

---

## Next Steps

1. **Test Core Features**: Share, Achievements, Streaks
2. **Add Remaining Features**: Daily verse widget, challenges, referrals
3. **Monitor Metrics**: Track engagement, shares, retention
4. **Iterate**: A/B test different share messages, achievement difficulties
5. **Launch**: Announce new features to existing users

---

**Need Help?** Check `TRAFFIC_FEATURES_ADDED.md` for complete feature documentation.
