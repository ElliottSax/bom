'use client';

import { useState, useEffect } from 'react';
import { AchievementToast } from './AchievementBadge';
import { createAchievementShareData } from '../hooks/useShare';
import { useShare } from '../hooks/useShare';
import type { Achievement } from '../lib/achievements';

interface AchievementNotificationContainerProps {
  achievements: Achievement[];
  onDismiss: (achievementIds: string[]) => void;
}

export function AchievementNotificationContainer({
  achievements,
  onDismiss,
}: AchievementNotificationContainerProps) {
  const [visibleAchievements, setVisibleAchievements] = useState<Achievement[]>([]);
  const { share } = useShare();

  // Show achievements one at a time with delay
  useEffect(() => {
    if (achievements.length > 0 && visibleAchievements.length === 0) {
      // Show first achievement
      setVisibleAchievements([achievements[0]]);

      // Show remaining achievements with delay
      achievements.slice(1).forEach((achievement, index) => {
        setTimeout(() => {
          setVisibleAchievements(prev => [...prev, achievement]);
        }, (index + 1) * 2000); // 2 second delay between each
      });
    }
  }, [achievements]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = (achievementId: string) => {
    setVisibleAchievements(prev => prev.filter(a => a.id !== achievementId));
    onDismiss([achievementId]);
  };

  const handleShare = async (achievement: Achievement) => {
    const shareData = createAchievementShareData(
      achievement.name,
      achievement.description
    );
    await share(shareData, { platform: 'native' });
  };

  if (visibleAchievements.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm">
      {visibleAchievements.map((achievement, index) => (
        <div
          key={achievement.id}
          style={{
            animationDelay: `${index * 0.1}s`,
          }}
        >
          <AchievementToast
            achievement={achievement}
            onClose={() => handleClose(achievement.id)}
            onShare={() => handleShare(achievement)}
          />
        </div>
      ))}
    </div>
  );
}
