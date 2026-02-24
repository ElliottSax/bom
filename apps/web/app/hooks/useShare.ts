import { useState, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';

export interface ShareData {
  title: string;
  text: string;
  url?: string;
}

export interface ShareOptions {
  platform?: 'native' | 'twitter' | 'facebook' | 'whatsapp' | 'copy' | 'email';
}

export function useShare() {
  const { showToast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const canUseNativeShare = useCallback(() => {
    return typeof navigator !== 'undefined' && 'share' in navigator;
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('success', 'Copied to clipboard!');
      return true;
    } catch (error) {
      showToast('error', 'Failed to copy to clipboard');
      return false;
    }
  }, [showToast]);

  const shareToTwitter = useCallback((data: ShareData) => {
    const twitterUrl = new URL('https://twitter.com/intent/tweet');
    twitterUrl.searchParams.set('text', data.text);
    if (data.url) {
      twitterUrl.searchParams.set('url', data.url);
    }
    window.open(twitterUrl.toString(), '_blank', 'width=550,height=420');
  }, []);

  const shareToFacebook = useCallback((data: ShareData) => {
    const url = data.url || window.location.href;
    const facebookUrl = new URL('https://www.facebook.com/sharer/sharer.php');
    facebookUrl.searchParams.set('u', url);
    facebookUrl.searchParams.set('quote', data.text);
    window.open(facebookUrl.toString(), '_blank', 'width=550,height=420');
  }, []);

  const shareToWhatsApp = useCallback((data: ShareData) => {
    const whatsappUrl = new URL('https://wa.me/');
    const text = data.url ? `${data.text}\n${data.url}` : data.text;
    whatsappUrl.searchParams.set('text', text);
    window.open(whatsappUrl.toString(), '_blank');
  }, []);

  const shareToEmail = useCallback((data: ShareData) => {
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(data.title)}&body=${encodeURIComponent(data.text + (data.url ? `\n\n${data.url}` : ''))}`;
    window.location.href = mailtoUrl;
  }, []);

  const shareNative = useCallback(async (data: ShareData) => {
    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url,
      });
      return true;
    } catch (error) {
      // User cancelled or error occurred
      if (error instanceof Error && error.name !== 'AbortError') {
        showToast('error', 'Failed to share');
      }
      return false;
    }
  }, [showToast]);

  const share = useCallback(async (data: ShareData, options: ShareOptions = {}) => {
    setIsSharing(true);

    try {
      const platform = options.platform || 'native';

      switch (platform) {
        case 'native':
          if (canUseNativeShare()) {
            await shareNative(data);
          } else {
            // Fallback to copy
            const fullText = data.url ? `${data.text}\n${data.url}` : data.text;
            await copyToClipboard(fullText);
          }
          break;
        case 'twitter':
          shareToTwitter(data);
          break;
        case 'facebook':
          shareToFacebook(data);
          break;
        case 'whatsapp':
          shareToWhatsApp(data);
          break;
        case 'email':
          shareToEmail(data);
          break;
        case 'copy':
          const fullText = data.url ? `${data.text}\n${data.url}` : data.text;
          await copyToClipboard(fullText);
          break;
      }
    } finally {
      setIsSharing(false);
    }
  }, [canUseNativeShare, shareNative, shareToTwitter, shareToFacebook, shareToWhatsApp, shareToEmail, copyToClipboard]);

  return {
    share,
    isSharing,
    canUseNativeShare: canUseNativeShare(),
  };
}

// Helper functions to create share data for common scenarios

export function createVerseShareData(
  verse: string,
  reference: string,
  url?: string
): ShareData {
  return {
    title: `${reference} - Book of Mormon Study Tools`,
    text: `"${verse}"\n\n— ${reference}`,
    url: url || 'https://bom.study',
  };
}

export function createProgressShareData(
  chaptersRead: number,
  totalChapters: number,
  streak: number
): ShareData {
  const percentage = Math.round((chaptersRead / totalChapters) * 100);
  return {
    title: 'My Scripture Study Progress',
    text: `I've read ${chaptersRead}/${totalChapters} chapters (${percentage}%) and have a ${streak}-day study streak! 🔥\n\nJoin me in studying the scriptures!`,
    url: 'https://bom.study',
  };
}

export function createAchievementShareData(
  achievementName: string,
  achievementDescription: string
): ShareData {
  return {
    title: `Achievement Unlocked: ${achievementName}`,
    text: `🏆 I just unlocked "${achievementName}" in Book of Mormon Study Tools!\n\n${achievementDescription}\n\nStart your scripture study journey:`,
    url: 'https://bom.study',
  };
}

export function createCourseCompletionShareData(
  courseName: string,
  score?: number
): ShareData {
  const scoreText = score !== undefined ? ` with a score of ${score}%` : '';
  return {
    title: `Course Completed: ${courseName}`,
    text: `🎓 I just completed the "${courseName}" course${scoreText} on Book of Mormon Study Tools!\n\nEnhance your scripture study:`,
    url: 'https://bom.study',
  };
}

export function createStreakShareData(streak: number): ShareData {
  const milestones = [7, 30, 100, 365];
  const isMilestone = milestones.includes(streak);
  const emoji = isMilestone ? '🎉🔥' : '🔥';

  return {
    title: `${streak}-Day Study Streak!`,
    text: `${emoji} I've maintained a ${streak}-day scripture study streak on Book of Mormon Study Tools!\n\nBuild your daily study habit:`,
    url: 'https://bom.study',
  };
}
