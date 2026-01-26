import React from 'react';
import { type CocResourceCategory } from '../lib/types';
import { BookOpenIcon, ExternalLinkIcon } from './Icons';

interface ResourcesModalProps {
  showResourcesModal: boolean;
  setShowResourcesModal: React.Dispatch<React.SetStateAction<boolean>>;
  COC_RESOURCES: CocResourceCategory[];
}

const ResourcesModal: React.FC<ResourcesModalProps> = ({
  showResourcesModal,
  setShowResourcesModal,
  COC_RESOURCES,
}) => {
  if (!showResourcesModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setShowResourcesModal(false)}>
      <div className="bg-[var(--color-bg-primary)] rounded-2xl w-full max-w-lg shadow-2xl border border-[var(--color-border)] max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-[var(--color-border-light)]">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpenIcon /> CoC Resources
          </h3>
        </div>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {COC_RESOURCES.map((cat, i) => (
            <div key={i} className="mb-6">
              <h4 className="text-sm font-semibold text-[var(--color-accent)] uppercase tracking-wider mb-3">{cat.category}</h4>
              <div className="space-y-2">
                {cat.items.map((item, j) =>
                  'url' in item && item.url ? (
                    <a key={j} href={item.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-[var(--color-bg-tertiary)] rounded-lg text-left hover:bg-[var(--color-border)] transition">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{item.name}</span>
                        <ExternalLinkIcon />
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-1">{item.description}</p>
                    </a>
                  ) : (
                    <div key={j} className="p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
                      <span className="font-medium text-sm">{item.name}</span>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-1">{item.description}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourcesModal;