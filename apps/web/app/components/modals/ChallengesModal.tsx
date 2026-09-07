'use client';

import { useState } from 'react';
import { ChallengeCard } from '../ChallengeCard';
import type { Challenge, UserChallenge } from '../../lib/challenges';

interface ChallengesModalProps {
  show: boolean;
  onClose: () => void;
  activeChallenges: UserChallenge[];
  availableChallenges: Challenge[];
  completedChallenges: UserChallenge[];
  recommendedChallenges: Challenge[];
  onJoinChallenge: (challengeId: string) => void;
}

export function ChallengesModal({
  show,
  onClose,
  activeChallenges,
  availableChallenges,
  completedChallenges,
  recommendedChallenges,
  onJoinChallenge,
}: ChallengesModalProps) {
  const [selectedTab, setSelectedTab] = useState<
    'recommended' | 'active' | 'available' | 'completed'
  >('recommended');

  if (!show) return null;

  const tabs = [
    {
      id: 'recommended' as const,
      name: 'Recommended',
      count: recommendedChallenges.length,
      icon: '⭐',
    },
    { id: 'active' as const, name: 'Active', count: activeChallenges.length, icon: '🔥' },
    { id: 'available' as const, name: 'Available', count: availableChallenges.length, icon: '📋' },
    { id: 'completed' as const, name: 'Completed', count: completedChallenges.length, icon: '✅' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-bg-primary)] rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <div>
            <h2 className="text-2xl font-bold">Reading Challenges</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Set goals and track your progress
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-bg-secondary)] rounded-lg transition"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 p-6 bg-[var(--color-bg-secondary)]">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-500">{activeChallenges.length}</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">Active</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-500">{completedChallenges.length}</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-500">
              {completedChallenges.reduce((sum, c) => sum + (c.rewardPoints || 0), 0)}
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)]">Points Earned</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 border-b border-[var(--color-border)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`
                px-4 py-2 font-medium text-sm rounded-t-lg transition-colors
                ${
                  selectedTab === tab.id
                    ? 'bg-[var(--color-bg-primary)] text-[var(--color-accent)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-[var(--color-accent)]/20 text-[var(--color-accent)] rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedTab === 'recommended' && (
            <div className="space-y-4">
              {recommendedChallenges.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">⭐</p>
                  <p className="text-[var(--color-text-secondary)]">
                    No recommendations right now. Check back later!
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                    Challenges picked just for you based on your reading habits
                  </p>
                  {recommendedChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      variant="available"
                      onJoin={() => onJoinChallenge(challenge.id)}
                    />
                  ))}
                </>
              )}
            </div>
          )}

          {selectedTab === 'active' && (
            <div className="space-y-4">
              {activeChallenges.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">🎯</p>
                  <p className="text-[var(--color-text-secondary)]">
                    No active challenges. Join one to get started!
                  </p>
                </div>
              ) : (
                activeChallenges.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} variant="active" />
                ))
              )}
            </div>
          )}

          {selectedTab === 'available' && (
            <div className="space-y-4">
              {availableChallenges.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">🎉</p>
                  <p className="text-[var(--color-text-secondary)]">
                    You&apos;ve joined all available challenges!
                  </p>
                </div>
              ) : (
                availableChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    variant="available"
                    onJoin={() => onJoinChallenge(challenge.id)}
                  />
                ))
              )}
            </div>
          )}

          {selectedTab === 'completed' && (
            <div className="space-y-4">
              {completedChallenges.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">📖</p>
                  <p className="text-[var(--color-text-secondary)]">
                    Complete your first challenge to see it here!
                  </p>
                </div>
              ) : (
                completedChallenges.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} variant="completed" />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
