import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarIcon, CheckIcon, CloseIcon } from '../Icons';
import { StudyPlanProgress } from '../../lib/types';
import { STUDY_PLANS, VOLUMES, getReadingPlanDay } from '../../lib/scriptures';
import { modalOverlay, modalContent, tapPress } from '../../lib/motion';

interface StudyPlanModalProps {
  show: boolean;
  onClose: () => void;
  studyPlan: StudyPlanProgress | null;
  onStartPlan: (planId: string) => void;
  onCompleteDayComplete: () => void;
  onEndPlan: () => void;
  onGoToReading: (volumeId: string, bookId: string, chapter: number) => void;
}

export const StudyPlanModal: React.FC<StudyPlanModalProps> = ({
  show,
  onClose,
  studyPlan,
  onStartPlan,
  onCompleteDayComplete,
  onEndPlan,
  onGoToReading,
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

  const currentPlan = studyPlan ? STUDY_PLANS.find((p) => p.id === studyPlan.planId) : null;
  const todaysReading =
    studyPlan && currentPlan ? getReadingPlanDay(currentPlan.id, studyPlan.currentDay) : null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
          variants={modalOverlay}
          initial="hidden"
          animate="visible"
          exit="hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="study-plan-title"
        >
          <motion.div
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-[var(--color-bg-primary)] rounded-2xl w-full max-w-lg shadow-2xl border border-[var(--color-border)] max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-[var(--color-border-light)] flex items-center justify-between">
              <h3 id="study-plan-title" className="text-lg font-semibold flex items-center gap-2">
                <CalendarIcon /> Study Plans
              </h3>
              <motion.button
                onClick={onClose}
                whileTap={tapPress}
                className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors"
                aria-label="Close study plans"
              >
                <CloseIcon />
              </motion.button>
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

                  {todaysReading && todaysReading.entries.length > 0 && (
                    <div className="bg-[var(--color-bg-primary)] rounded-lg p-3 mb-4 border border-[var(--color-border)]">
                      <p className="text-xs text-[var(--color-text-tertiary)] mb-1">
                        Today&apos;s reading
                      </p>
                      <p className="font-semibold text-[var(--color-text-primary)] mb-2">
                        {todaysReading.label}
                      </p>
                      <button
                        onClick={() =>
                          onGoToReading(
                            todaysReading.entries[0].book.volumeId,
                            todaysReading.entries[0].book.id,
                            todaysReading.entries[0].chapter
                          )
                        }
                        className="w-full py-2 bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-border)] rounded-lg text-sm font-medium transition"
                      >
                        Start Reading
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={onCompleteDayComplete}
                      disabled={studyPlan.currentDay >= currentPlan.days}
                      className="flex-1 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckIcon />
                      {studyPlan.currentDay >= currentPlan.days ? 'Plan Complete' : 'Complete Day'}
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
                  {STUDY_PLANS.map((plan) => {
                    const planVolume = VOLUMES.find((v) => v.id === plan.volumeId);
                    const day1 = getReadingPlanDay(plan.id, 1);
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
                        {day1 && day1.entries.length > 0 && (
                          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                            ~{day1.entries.length} chapter{day1.entries.length === 1 ? '' : 's'}/day
                            &mdash; starts at {day1.label}
                          </p>
                        )}
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
