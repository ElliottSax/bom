'use client';

import React, { useState } from 'react';
import { CloseIcon, FireIcon } from '../Icons';
import { useReadingGoals, type GoalType, type GoalPeriod } from '../../hooks/useReadingGoals';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface ReadingGoalsModalProps {
  show: boolean;
  onClose: () => void;
}

export const ReadingGoalsModal: React.FC<ReadingGoalsModalProps> = ({ show, onClose }) => {
  const focusTrapRef = useFocusTrap(show);
  const {
    activeGoals,
    goals,
    createGoal,
    deleteGoal,
    toggleGoal,
    getGoalStats,
    getTypeLabel,
    suggestedGoals,
  } = useReadingGoals();
  const [showCreate, setShowCreate] = useState(false);
  const [newType, setNewType] = useState<GoalType>('chapters');
  const [newPeriod, setNewPeriod] = useState<GoalPeriod>('daily');
  const [newTarget, setNewTarget] = useState(1);

  if (!show) return null;

  const handleCreate = () => {
    createGoal(newType, newPeriod, newTarget);
    setShowCreate(false);
    setNewTarget(1);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reading-goals-modal-title"
    >
      <div
        ref={focusTrapRef}
        className="bg-[var(--color-bg-primary)] rounded-2xl w-full max-w-lg mx-4 shadow-2xl border border-[var(--color-border)] overflow-hidden max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--color-border-light)] flex items-center justify-between">
          <h2 id="reading-goals-modal-title" className="text-lg font-semibold">
            Reading Goals
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)]"
            aria-label="Close reading goals modal"
          >
            <CloseIcon aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Active Goals */}
          {activeGoals.length > 0 ? (
            <div className="space-y-4 mb-6" role="list" aria-label="Active reading goals">
              {activeGoals.map((goal) => {
                const stats = getGoalStats(goal.id);
                if (!stats) return null;
                return (
                  <div
                    key={goal.id}
                    className="bg-[var(--color-bg-secondary)] rounded-xl p-4 border border-[var(--color-border-light)]"
                    role="listitem"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">
                        {goal.target} {getTypeLabel(goal.type)} /{' '}
                        {goal.period === 'daily' ? 'day' : 'week'}
                      </h3>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="text-xs text-red-500 hover:text-red-600"
                        aria-label={`Remove goal: ${goal.target} ${getTypeLabel(goal.type)} per ${goal.period === 'daily' ? 'day' : 'week'}`}
                      >
                        Remove
                      </button>
                    </div>

                    {/* Progress bar */}
                    <div
                      className="w-full bg-[var(--color-bg-tertiary)] rounded-full h-3 mb-2"
                      role="progressbar"
                      aria-valuenow={stats.percentComplete}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Goal progress: ${stats.percentComplete}% complete`}
                    >
                      <div
                        className="h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${stats.percentComplete}%`,
                          backgroundColor:
                            stats.percentComplete >= 100 ? '#4caf50' : 'var(--color-accent)',
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                      <span>
                        {stats.currentProgress} / {stats.target} {stats.periodLabel}
                      </span>
                      <span>{stats.percentComplete}%</span>
                    </div>

                    {/* Streak */}
                    <div className="flex items-center gap-4 mt-3 text-xs">
                      {stats.currentStreak > 0 && (
                        <span className="flex items-center gap-1 text-orange-500">
                          <FireIcon /> {stats.currentStreak} streak
                        </span>
                      )}
                      <span className="text-[var(--color-text-tertiary)]">
                        {stats.daysCompleted} {goal.period === 'daily' ? 'days' : 'weeks'} completed
                      </span>
                      {stats.longestStreak > 0 && (
                        <span className="text-[var(--color-text-tertiary)]">
                          Best: {stats.longestStreak}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 mb-4" role="status">
              <div className="text-4xl mb-2" aria-hidden="true">
                &#127919;
              </div>
              <p className="text-[var(--color-text-secondary)] text-sm">No reading goals set yet</p>
              <p className="text-[var(--color-text-tertiary)] text-xs mt-1">
                Set a goal to track your progress
              </p>
            </div>
          )}

          {/* Quick Start Suggestions */}
          {!showCreate && (
            <div>
              <h3 className="text-sm font-medium mb-3 text-[var(--color-text-secondary)]">
                Quick Start
              </h3>
              <div
                className="grid grid-cols-2 gap-2 mb-4"
                role="group"
                aria-label="Suggested reading goals"
              >
                {suggestedGoals.map((sg, i) => (
                  <button
                    key={i}
                    onClick={() => createGoal(sg.type, sg.period, sg.target)}
                    className="p-3 text-left bg-[var(--color-bg-tertiary)] rounded-xl hover:bg-[var(--color-border)] transition-colors text-sm"
                    aria-label={`Create goal: ${sg.label}`}
                  >
                    {sg.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Goal */}
          {showCreate ? (
            <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4 border border-[var(--color-border-light)]">
              <h3 className="font-medium mb-3">Create Custom Goal</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreate();
                }}
                className="space-y-3"
              >
                <div>
                  <label
                    id="goal-type-label"
                    className="text-xs text-[var(--color-text-secondary)] mb-1 block"
                  >
                    Type
                  </label>
                  <div className="flex gap-2" role="group" aria-labelledby="goal-type-label">
                    {(['chapters', 'minutes', 'verses'] as GoalType[]).map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setNewType(t)}
                        className={`px-3 py-1.5 rounded-lg text-sm ${newType === t ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-tertiary)]'}`}
                        aria-pressed={newType === t}
                        aria-label={`Goal type: ${t}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label
                    id="goal-period-label"
                    className="text-xs text-[var(--color-text-secondary)] mb-1 block"
                  >
                    Period
                  </label>
                  <div className="flex gap-2" role="group" aria-labelledby="goal-period-label">
                    {(['daily', 'weekly'] as GoalPeriod[]).map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setNewPeriod(p)}
                        className={`px-3 py-1.5 rounded-lg text-sm ${newPeriod === p ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-tertiary)]'}`}
                        aria-pressed={newPeriod === p}
                        aria-label={`Goal period: ${p}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="goal-target"
                    className="text-xs text-[var(--color-text-secondary)] mb-1 block"
                  >
                    Target
                  </label>
                  <input
                    id="goal-target"
                    type="number"
                    min={1}
                    max={100}
                    value={newTarget}
                    onChange={(e) => setNewTarget(parseInt(e.target.value) || 1)}
                    className="w-24 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-sm"
                    aria-label="Target amount"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="px-4 py-2 bg-[var(--color-bg-tertiary)] rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="w-full p-3 border-2 border-dashed border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
              aria-label="Create custom reading goal"
            >
              + Create Custom Goal
            </button>
          )}

          {/* Inactive Goals */}
          {goals.filter((g) => !g.active).length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2 text-[var(--color-text-tertiary)]">
                Inactive Goals
              </h3>
              <div className="space-y-2">
                {goals
                  .filter((g) => !g.active)
                  .map((goal) => (
                    <div
                      key={goal.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-bg-tertiary)] text-sm opacity-60"
                    >
                      <span>
                        {goal.target} {getTypeLabel(goal.type)} /{' '}
                        {goal.period === 'daily' ? 'day' : 'week'}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleGoal(goal.id)}
                          className="text-xs text-[var(--color-accent)]"
                        >
                          Activate
                        </button>
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="text-xs text-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
