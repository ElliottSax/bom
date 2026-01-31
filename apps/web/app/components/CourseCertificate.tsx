'use client';

import React, { useCallback } from 'react';
import { type Course } from '../hooks/useCoCCourses';
import { CloseIcon } from './Icons';

interface CourseCertificateProps {
  course: Course;
  completionDate: string;
  onClose: () => void;
}

// Generate printable certificate HTML
const generateCertificateHTML = (course: Course, completionDate: string): string => {
  const formattedDate = new Date(completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Certificate of Completion - ${course.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:wght@400;500;600&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Cormorant Garamond', Georgia, serif;
      background: #f5f5f0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .certificate {
      width: 800px;
      height: 600px;
      background: linear-gradient(135deg, #fefefe 0%, #f8f6f0 100%);
      border: 3px solid #c9a227;
      box-shadow: 0 0 0 8px #fff, 0 0 0 11px #c9a227, 0 4px 20px rgba(0,0,0,0.15);
      padding: 40px 50px;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
    }

    .corner-ornament {
      position: absolute;
      width: 80px;
      height: 80px;
      border: 2px solid #c9a227;
    }

    .corner-ornament.top-left {
      top: 15px;
      left: 15px;
      border-right: none;
      border-bottom: none;
    }

    .corner-ornament.top-right {
      top: 15px;
      right: 15px;
      border-left: none;
      border-bottom: none;
    }

    .corner-ornament.bottom-left {
      bottom: 15px;
      left: 15px;
      border-right: none;
      border-top: none;
    }

    .corner-ornament.bottom-right {
      bottom: 15px;
      right: 15px;
      border-left: none;
      border-top: none;
    }

    .header {
      text-align: center;
    }

    .icon {
      font-size: 48px;
      margin-bottom: 10px;
    }

    .title {
      font-family: 'Cinzel', serif;
      font-size: 36px;
      font-weight: 600;
      color: #2c3e50;
      letter-spacing: 4px;
      text-transform: uppercase;
      margin-bottom: 5px;
    }

    .subtitle {
      font-size: 16px;
      color: #7f8c8d;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .divider {
      width: 200px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #c9a227, transparent);
      margin: 15px 0;
    }

    .main-content {
      text-align: center;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .presented-to {
      font-size: 14px;
      color: #7f8c8d;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    .recipient-line {
      width: 300px;
      height: 1px;
      background: #c9a227;
      margin: 0 auto 5px auto;
    }

    .recipient-note {
      font-size: 12px;
      color: #95a5a6;
      font-style: italic;
    }

    .completion-text {
      font-size: 16px;
      color: #555;
      margin: 20px 0 10px 0;
    }

    .course-title {
      font-family: 'Cinzel', serif;
      font-size: 28px;
      font-weight: 600;
      color: #2c3e50;
      margin: 10px 0;
    }

    .course-details {
      font-size: 14px;
      color: #7f8c8d;
      margin-top: 10px;
    }

    .footer {
      text-align: center;
      width: 100%;
    }

    .date {
      font-size: 14px;
      color: #555;
      margin-bottom: 15px;
    }

    .seal {
      width: 80px;
      height: 80px;
      border: 2px solid #c9a227;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      background: linear-gradient(135deg, #fefefe 0%, #f0e6c8 100%);
    }

    .seal-text {
      font-family: 'Cinzel', serif;
      font-size: 10px;
      text-transform: uppercase;
      color: #c9a227;
      font-weight: 600;
      letter-spacing: 1px;
      text-align: center;
    }

    .organization {
      font-size: 12px;
      color: #95a5a6;
      margin-top: 15px;
      letter-spacing: 1px;
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }
      .certificate {
        box-shadow: none;
        border: 3px solid #c9a227;
      }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="corner-ornament top-left"></div>
    <div class="corner-ornament top-right"></div>
    <div class="corner-ornament bottom-left"></div>
    <div class="corner-ornament bottom-right"></div>

    <div class="header">
      <div class="icon">${course.icon}</div>
      <div class="title">Certificate</div>
      <div class="subtitle">of Completion</div>
      <div class="divider"></div>
    </div>

    <div class="main-content">
      <div class="presented-to">This is to certify that</div>
      <div class="recipient-line"></div>
      <div class="recipient-note">(Write your name here)</div>

      <div class="completion-text">has successfully completed the course</div>

      <div class="course-title">${course.title}</div>

      <div class="course-details">
        ${course.lessonsCount} lessons • ${course.duration} • ${course.level.charAt(0).toUpperCase() + course.level.slice(1)} Level
      </div>
    </div>

    <div class="footer">
      <div class="date">Completed on ${formattedDate}</div>
      <div class="seal">
        <div class="seal-text">Course<br/>Complete</div>
      </div>
      <div class="organization">Church of Christ Courses</div>
    </div>
  </div>
</body>
</html>
  `;
};

export function CourseCertificate({ course, completionDate, onClose }: CourseCertificateProps) {
  const formattedDate = new Date(completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePrint = useCallback(() => {
    const printHTML = generateCertificateHTML(course, completionDate);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printHTML);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }, [course, completionDate]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-light)]">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            Course Completed!
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Certificate Preview */}
        <div className="p-6">
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-2 border-amber-300 dark:border-amber-600 rounded-lg p-8 text-center">
            {/* Decorative Border */}
            <div className="relative">
              {/* Icon */}
              <div className="text-5xl mb-4">{course.icon}</div>

              {/* Title */}
              <h3 className="text-2xl font-serif font-bold text-amber-800 dark:text-amber-300 tracking-wide mb-1">
                CERTIFICATE
              </h3>
              <p className="text-sm text-amber-600 dark:text-amber-400 tracking-widest uppercase mb-6">
                of Completion
              </p>

              {/* Divider */}
              <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6" />

              {/* Course Name */}
              <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                You have successfully completed
              </p>
              <h4 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
                {course.title}
              </h4>
              <p className="text-sm text-[var(--color-text-tertiary)] mb-6">
                {course.lessonsCount} lessons • {course.duration}
              </p>

              {/* Completion Date */}
              <div className="flex items-center justify-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Completed on {formattedDate}</span>
              </div>

              {/* Seal */}
              <div className="mt-6 inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-amber-400 bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-800/30 dark:to-yellow-800/30">
                <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Certificate
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] font-semibold rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseCertificate;
