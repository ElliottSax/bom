'use client';

import React, { useState } from 'react';
import { X, Send, CheckCircle } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedback.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData = {
        feedback,
        email: email || undefined,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      };

      // Send to API endpoint
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit feedback');
      }

      // Store locally as backup
      if (typeof window !== 'undefined') {
        const feedbackHistory = JSON.parse(localStorage.getItem('coc-feedback-history') || '[]');
        feedbackHistory.push({
          feedback,
          email: email || 'anonymous',
          timestamp: new Date().toISOString(),
          sent: true,
        });
        localStorage.setItem(
          'coc-feedback-history',
          JSON.stringify(feedbackHistory.slice(-10)) // Keep last 10
        );
      }

      setSubmitted(true);

      // Auto-close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to send feedback. Please try again or contact support directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFeedback('');
    setEmail('');
    setSubmitted(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2
            id="feedback-modal-title"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            Send Feedback
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label="Close feedback modal"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-8 text-center" role="status" aria-live="polite">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Thank You!</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Your feedback helps us improve the app for the Community of Christ community.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4" aria-label="Feedback form">
            <div>
              <label
                htmlFor="feedback"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                What would you like to share?
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts, report a bug, or suggest a feature..."
                rows={5}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email (optional)
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                We&apos;ll only use this to follow up on your feedback
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Cancel and close feedback form"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !feedback.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                aria-label={isSubmitting ? 'Sending feedback' : 'Send feedback'}
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                <span>{isSubmitting ? 'Sending...' : 'Send Feedback'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
