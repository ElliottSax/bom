'use client';

import React from 'react';
import { CoursesContainer } from '../CoursesContainer';
import { CloseIcon } from '../Icons';

interface CoursesModalProps {
  show: boolean;
  onClose: () => void;
}

export function CoursesModal({ show, onClose }: CoursesModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-light)]">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Community of Christ Courses
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
            aria-label="Close courses"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <CoursesContainer />
        </div>
      </div>
    </div>
  );
}

export default CoursesModal;
