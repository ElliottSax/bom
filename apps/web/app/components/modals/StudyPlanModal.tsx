import React, { useEffect } from 'react';
import { CalendarIcon, CheckIcon } from '../Icons';
import { StudyPlanProgress } from '../../lib/types';
import { STUDY_PLANS, VOLUMES } from '../../lib/scriptures';

interface StudyPlanModalProps {
  show: boolean;
  onClose: () => void;
  studyPlan: StudyPlanProgress | null;
  onStartPlan: (planId: string) => void;
  onCompleteDayComplete: () => void;
  onEndPlan: () => void;
}

export const StudyPlanModal: React.FC<StudyPlanModalProps> = ({
  show,
  onClose,
  studyPlan,
  onStartPlan,
  onCompleteDayComplete,
  onEndPlan,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [show, onClose]);

  if (!show) return null;

  const currentPlan = studyPlan ? STUDY_PLANS.find(p => p.id === studyPlan.planId) : null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="study-plan-title"
    >
      <div
        className="bg-[var(--color-bg-primary)] rounded-2xl w-full max-w-lg shadow-2xl border border-[var(--color-border)] max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-[var(--color-border-light)]">
          <h3 id="study-plan-title" className="text-lg font-semibold flex items-center gap-2">
            <CalendarIcon /> Study Plans
          </h3>
        </div>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {studyPlan && currentPlan ? (
            <div className="bg-[var(--color-accent)]/10 rounded-xl p-4 border border-[var(--color-accent)]/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-[var(--color-accent)]">{currentPlan.name}</h4>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Day {studyPlan.currentDay}/{currentPlan.days}
                </span>
              </div>
              <div className="w-full bg-[var(--color-bg-tertiary)] rounded-full h-2 mb-4">
                <div
                  className="bg-[var(--color-accent)] h-2 rounded-full"
                  style={{ width: `${(studyPlan.currentDay / currentPlan.days) * 100}%` }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onCompleteDayComplete}
                  className="flex-1 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                >
                  <CheckIcon /> Complete Day
                </button>
                <button
                  onClick={onEndPlan}
                  className="px-4 py-2 bg-[var(--color-bg-tertiary)] rounded-lg text-sm"
                >
                  End
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {STUDY_PLANS.map(plan => {
                const planVolume = VOLUMES.find(v => v.id === plan.volumeId);
                return (
                  <button
                    key={plan.id}
                    onClick={() => onStartPlan(plan.id)}
                    className="w-full p-4 bg-[var(--color-bg-tertiary)] rounded-xl text-left hover:bg-[var(--color-border)] transition"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{plan.name}</h4>
                      <span className="text-sm text-[var(--color-text-tertiary)]">
                        {plan.days} days
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                      {plan.description}
                    </p>
                    <span
                      className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: planVolume?.color + '20',
                        color: planVolume?.color,
                      }}
                    >
                      {planVolume?.shortName}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
