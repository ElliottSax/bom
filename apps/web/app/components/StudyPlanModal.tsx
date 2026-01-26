import React from 'react';
import { type StudyPlan } from '../lib/types';
import { CalendarIcon, CheckIcon } from './Icons';
import { VOLUMES, STUDY_PLANS } from '../lib/scriptures'; // Assuming these are exported from scriptures.ts
import { useUserData } from '../contexts/UserDataContext';

interface StudyPlanModalProps {
  showStudyPlanModal: boolean;
  setShowStudyPlanModal: React.Dispatch<React.SetStateAction<boolean>>;
  currentPlan: StudyPlan | undefined;
}

const StudyPlanModal: React.FC<StudyPlanModalProps> = ({
  showStudyPlanModal,
  setShowStudyPlanModal,
  currentPlan,
}) => {
  const { studyPlan, setStudyPlan, completeStudyPlanDay, startStudyPlan } = useUserData();
  if (!showStudyPlanModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setShowStudyPlanModal(false)}>
      <div className="bg-[var(--color-bg-primary)] rounded-2xl w-full max-w-lg shadow-2xl border border-[var(--color-border)] max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-[var(--color-border-light)]">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CalendarIcon /> Study Plans
          </h3>
        </div>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {studyPlan && currentPlan ? (
            <div className="bg-[var(--color-accent)]/10 rounded-xl p-4 border border-[var(--color-accent)]/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-[var(--color-accent)]">{currentPlan.name}</h4>
                <span className="text-sm text-[var(--color-text-secondary)]">Day {studyPlan.currentDay}/{currentPlan.days}</span>
              </div>
              <div className="w-full bg-[var(--color-bg-tertiary)] rounded-full h-2 mb-4">
                <div className="bg-[var(--color-accent)] h-2 rounded-full" style={{ width: `${(studyPlan.currentDay / currentPlan.days) * 100}%` }} />
              </div>
              <div className="flex gap-2">
                <button onClick={completeStudyPlanDay} className="flex-1 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                  <CheckIcon /> Complete Day
                </button>
                <button
                  onClick={() => {
                    setStudyPlan(null); // Direct localStorage access might be refactored later with a hook/context
                  }}
                  className="px-4 py-2 bg-[var(--color-bg-tertiary)] rounded-lg text-sm"
                >
                  End
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {STUDY_PLANS.map(plan => {
                const pv = VOLUMES.find(v => v.id === plan.volumeId);
                return (
                  <button key={plan.id} onClick={() => startStudyPlan(plan.id)} className="w-full p-4 bg-[var(--color-bg-tertiary)] rounded-xl text-left hover:bg-[var(--color-border)] transition">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{plan.name}</h4>
                      <span className="text-sm text-[var(--color-text-tertiary)]">{plan.days} days</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">{plan.description}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: pv?.color + '20', color: pv?.color }}>
                      {pv?.shortName}
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

export default StudyPlanModal;