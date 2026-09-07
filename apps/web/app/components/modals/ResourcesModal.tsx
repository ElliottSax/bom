import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpenIcon, CloseIcon, ExternalLinkIcon } from '../Icons';
import { COC_RESOURCES } from '../../lib/scriptures';
import { modalOverlay, modalContent, tapPress } from '../../lib/motion';

interface ResourcesModalProps {
  show: boolean;
  onClose: () => void;
}

export const ResourcesModal: React.FC<ResourcesModalProps> = ({ show, onClose }) => {
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
          aria-labelledby="resources-title"
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
              <h3 id="resources-title" className="text-lg font-semibold flex items-center gap-2">
                <BookOpenIcon /> CoC Resources
              </h3>
              <motion.button
                onClick={onClose}
                whileTap={tapPress}
                className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors"
                aria-label="Close CoC resources"
              >
                <CloseIcon />
              </motion.button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {COC_RESOURCES.map((category, i) => (
                <div key={i} className="mb-6">
                  <h4 className="text-sm font-semibold text-[var(--color-accent)] uppercase tracking-wider mb-3">
                    {category.category}
                  </h4>
                  <div className="space-y-2">
                    {category.items.map((item, j) =>
                      'url' in item && item.url ? (
                        <a
                          key={j}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 bg-[var(--color-bg-tertiary)] rounded-lg hover:bg-[var(--color-border)] transition"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{item.name}</span>
                            <ExternalLinkIcon />
                          </div>
                          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                            {item.description}
                          </p>
                        </a>
                      ) : (
                        <div key={j} className="p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
                          <span className="font-medium text-sm">{item.name}</span>
                          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                            {item.description}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
