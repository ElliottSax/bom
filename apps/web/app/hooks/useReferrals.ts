import { useState, useCallback, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

export interface Referral {
  id: string;
  referredUserName?: string;
  status: 'pending' | 'joined' | 'active';
  joinedDate?: string;
  lastActiveDate?: string;
}

export interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  joinedReferrals: number;
  activeReferrals: number;
  pointsEarned: number;
}

export function useReferrals() {
  const [referralCode, setReferralCode] = useLocalStorage<string>(
    'coc-referral-code',
    generateReferralCode()
  );

  const [referrals, setReferrals] = useLocalStorage<Referral[]>(
    'coc-referrals',
    []
  );

  const [copiedRecently, setCopiedRecently] = useState(false);

  // Generate unique referral code
  function generateReferralCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Get referral URL
  const getReferralUrl = useCallback(() => {
    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : 'https://bom.study';
    return `${baseUrl}?ref=${referralCode}`;
  }, [referralCode]);

  // Copy referral link to clipboard
  const copyReferralLink = useCallback(async () => {
    const url = getReferralUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopiedRecently(true);
      setTimeout(() => setCopiedRecently(false), 2000);
      return true;
    } catch (error) {
      return false;
    }
  }, [getReferralUrl]);

  // Get referral stats
  const getStats = useCallback((): ReferralStats => {
    const stats = {
      totalReferrals: referrals.length,
      pendingReferrals: referrals.filter(r => r.status === 'pending').length,
      joinedReferrals: referrals.filter(r => r.status === 'joined').length,
      activeReferrals: referrals.filter(r => r.status === 'active').length,
      pointsEarned: 0,
    };

    // Award points: 10 for join, 25 for active (7+ days)
    stats.pointsEarned =
      stats.joinedReferrals * 10 +
      stats.activeReferrals * 25;

    return stats;
  }, [referrals]);

  // Track referral (when someone joins via your link)
  const trackReferral = useCallback((userName?: string) => {
    const newReferral: Referral = {
      id: Date.now().toString(),
      referredUserName: userName,
      status: 'joined',
      joinedDate: new Date().toISOString(),
    };

    setReferrals([...referrals, newReferral]);
  }, [referrals, setReferrals]);

  // Update referral status (when they become active)
  const updateReferralStatus = useCallback((referralId: string, status: Referral['status']) => {
    setReferrals(referrals.map(r =>
      r.id === referralId
        ? {
            ...r,
            status,
            lastActiveDate: status === 'active' ? new Date().toISOString() : r.lastActiveDate,
          }
        : r
    ));
  }, [referrals, setReferrals]);

  // Get pre-filled share messages
  const getShareMessages = useCallback(() => {
    const url = getReferralUrl();

    return {
      default: `Join me in studying the Book of Mormon! 📖\n\nI've been using this amazing scripture study app and thought you might enjoy it too.\n\n${url}`,

      personal: `Hey! I've been using this scripture study app and it's been great for my daily reading. Thought you might like it too!\n\n${url}`,

      group: `📖 Scripture Study Invitation 📖\n\nI'd love for you to join our study community! This app has helped me build a consistent daily reading habit.\n\n${url}`,

      sms: `Check out this scripture study app I've been using: ${url}`,

      email: {
        subject: 'Join Me in Scripture Study',
        body: `Hi!\n\nI wanted to share this scripture study app that's been helping me with my daily reading. It has some great features like:\n\n• Daily verse reminders\n• Reading streak tracking\n• Study notes and highlights\n• Reading challenges\n\nI think you'd enjoy it! Here's my referral link:\n${url}\n\nLooking forward to studying together!`,
      },
    };
  }, [getReferralUrl]);

  // Check if user came from a referral
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const refCode = params.get('ref');

      if (refCode && refCode !== referralCode) {
        // Store the referrer's code
        localStorage.setItem('coc-referred-by', refCode);
      }
    }
  }, [referralCode]);

  const stats = getStats();

  return {
    referralCode,
    referralUrl: getReferralUrl(),
    referrals,
    stats,
    copiedRecently,
    copyReferralLink,
    trackReferral,
    updateReferralStatus,
    getShareMessages,
  };
}
