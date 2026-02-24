'use client';

import { useReferrals } from '../hooks/useReferrals';
import { ShareButton } from './ShareButton';

export function ReferralWidget() {
  const { referralCode, referralUrl, stats, copiedRecently, copyReferralLink, getShareMessages } = useReferrals();
  const messages = getShareMessages();

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🎁</span>
        <h3 className="font-bold text-lg">Invite Friends</h3>
      </div>

      <p className="text-sm text-[var(--color-text-secondary)] mb-4">
        Share the joy of scripture study! Invite friends and earn rewards.
      </p>

      {/* Referral Code */}
      <div className="bg-[var(--color-bg-secondary)] rounded-lg p-4 mb-4">
        <p className="text-xs text-[var(--color-text-tertiary)] mb-2">Your Referral Code</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-2xl font-bold tracking-wider text-purple-500">
            {referralCode}
          </code>
          <button
            onClick={copyReferralLink}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition
              ${copiedRecently
                ? 'bg-green-500 text-white'
                : 'bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-secondary)]'
              }
            `}
          >
            {copiedRecently ? '✓ Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-500">{stats.totalReferrals}</p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Invited</p>
        </div>
        <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-500">{stats.joinedReferrals}</p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Joined</p>
        </div>
        <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-purple-500">{stats.pointsEarned}</p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Points</p>
        </div>
      </div>

      {/* Share Actions */}
      <div className="space-y-2">
        <ShareButton
          data={{
            title: 'Join Me in Scripture Study',
            text: messages.default,
            url: referralUrl,
          }}
          variant="primary"
          size="md"
          showMenu={true}
          className="w-full justify-center"
        />

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              const mailtoUrl = `mailto:?subject=${encodeURIComponent(messages.email.subject)}&body=${encodeURIComponent(messages.email.body)}`;
              window.location.href = mailtoUrl;
            }}
            className="px-3 py-2 bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-secondary)] rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
          >
            <span>📧</span>
            <span>Email</span>
          </button>

          <button
            onClick={() => {
              const smsUrl = `sms:?&body=${encodeURIComponent(messages.sms)}`;
              window.location.href = smsUrl;
            }}
            className="px-3 py-2 bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-secondary)] rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
          >
            <span>💬</span>
            <span>SMS</span>
          </button>
        </div>
      </div>

      {/* Rewards Info */}
      <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-text-tertiary)] text-center">
          Earn <span className="font-semibold text-purple-500">10 points</span> when friends join,
          <span className="font-semibold text-purple-500"> +25 points</span> when they stay active!
        </p>
      </div>
    </div>
  );
}

// Compact referral button for header
export function ReferralButton({ onClick }: { onClick: () => void }) {
  const { stats } = useReferrals();

  return (
    <button
      onClick={onClick}
      className="relative p-2 hover:bg-[var(--color-bg-secondary)] rounded-lg transition"
      title="Invite Friends"
    >
      <span className="text-xl">🎁</span>
      {stats.totalReferrals > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
          {stats.totalReferrals}
        </span>
      )}
    </button>
  );
}

// Referral success modal
export function ReferralSuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-bg-primary)] rounded-2xl max-w-md w-full p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">Friend Joined!</h2>
        <p className="text-[var(--color-text-secondary)] mb-6">
          Your friend has joined using your referral link!
        </p>

        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4 mb-6">
          <p className="text-3xl font-bold text-purple-500 mb-1">+10 Points</p>
          <p className="text-sm text-[var(--color-text-tertiary)]">
            Earn +25 more when they stay active for 7 days
          </p>
        </div>

        <button
          onClick={onClose}
          className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition w-full"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}
