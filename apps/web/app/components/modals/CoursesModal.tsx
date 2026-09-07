'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CoursesContainer } from '../CoursesContainer';
import { CloseIcon } from '../Icons';
import { modalOverlay, modalContent, tapPress } from '../../lib/motion';

interface CoursesModalProps {
  show: boolean;
  onClose: () => void;
}

export function CoursesModal({ show, onClose }: CoursesModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          variants={modalOverlay}
          initial="hidden"
          animate="visible"
          exit="hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="courses-title"
        >
          <motion.div
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-[var(--color-bg-primary)] rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-light)]">
              <h2
                id="courses-title"
                className="text-2xl font-bold text-[var(--color-text-primary)]"
              >
                Community of Christ Courses
              </h2>
              <motion.button
                onClick={onClose}
                whileTap={tapPress}
                className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
                aria-label="Close courses"
              >
                <CloseIcon />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <CoursesContainer />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CoursesModal;
