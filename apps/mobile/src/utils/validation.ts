/**
 * Input Validation and Sanitization Utilities
 */

// HTML/Script injection prevention
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*"[^"]*"/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*'[^']*'/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');

  // Escape HTML entities
  const htmlEntities: { [key: string]: string } = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&#39;',
  };

  // Only escape HTML if it's not markdown formatting
  if (!isMarkdownContent(sanitized)) {
    sanitized = sanitized.replace(/[<>&"']/g, char => htmlEntities[char] || char);
  }

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length
  const MAX_LENGTH = 50000; // 50k characters max
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH);
  }

  return sanitized;
}

// Check if content appears to be markdown
function isMarkdownContent(text: string): boolean {
  const markdownPatterns = [
    /^#{1,6}\s/m,  // Headers
    /\*\*.*?\*\*/,  // Bold
    /\*.*?\*/,      // Italic
    /\[.*?\]\(.*?\)/, // Links
    /^>\s/m,        // Quotes
    /^[\*\-]\s/m,   // Lists
  ];

  return markdownPatterns.some(pattern => pattern.test(text));
}

// Validate email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate verse reference format
export function validateVerseReference(ref: string): boolean {
  // Matches patterns like "1 Nephi 3:7" or "Alma 5:14"
  const verseRegex = /^[A-Za-z0-9\s]+\s+\d+:\d+$/;
  return verseRegex.test(ref);
}

// Validate notebook name
export function validateNotebookName(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return 'Notebook name is required';
  }

  if (name.length > 50) {
    return 'Notebook name must be 50 characters or less';
  }

  if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
    return 'Notebook name can only contain letters, numbers, spaces, hyphens, and underscores';
  }

  return null; // Valid
}

// Validate study plan
export function validateStudyPlan(plan: {
  name?: string;
  startDate?: string;
  endDate?: string;
  content?: Array<{ editionId: string; book: string; startChapter: number; endChapter: number }>;
}): string[] {
  const errors: string[] = [];

  if (!plan.name || plan.name.trim().length === 0) {
    errors.push('Study plan name is required');
  }

  if (!plan.startDate) {
    errors.push('Start date is required');
  }

  if (!plan.endDate) {
    errors.push('End date is required');
  }

  if (plan.startDate && plan.endDate) {
    const start = new Date(plan.startDate);
    const end = new Date(plan.endDate);
    if (end < start) {
      errors.push('End date must be after start date');
    }
    if (end > new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)) {
      errors.push('End date cannot be more than 1 year in the future');
    }
  }

  if (!plan.content || plan.content.length === 0) {
    errors.push('Please select at least one book or chapter to study');
  }

  return errors;
}

// Validate password strength
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Sanitize search query
export function sanitizeSearchQuery(query: string): string {
  if (!query) return '';

  // Remove special regex characters that could break search
  let sanitized = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Limit length
  sanitized = sanitized.substring(0, 100);

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

// Validate note tags
export function validateTags(tags: string[]): string | null {
  if (tags.length > 20) {
    return 'Maximum 20 tags allowed';
  }

  for (const tag of tags) {
    if (tag.length > 30) {
      return 'Each tag must be 30 characters or less';
    }
    if (!/^[a-zA-Z0-9\-_]+$/.test(tag)) {
      return 'Tags can only contain letters, numbers, hyphens, and underscores';
    }
  }

  return null;
}

// Validate file upload
export function validateFileUpload(file: {
  size?: number;
  type?: string;
  name?: string;
}): string | null {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

  if (!file.size || file.size > MAX_SIZE) {
    return 'File size must be less than 10MB';
  }

  if (!file.type || !ALLOWED_TYPES.includes(file.type)) {
    return 'Only JPEG, PNG, GIF, and PDF files are allowed';
  }

  return null;
}

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60000 // 1 minute
  ) {}

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(
      time => now - time < this.windowMs
    );

    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);

    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// XSS prevention for displaying user content
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Validate JSON structure
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

// Sanitize filename
export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  let sanitized = filename.replace(/\.\./g, '');

  // Remove special characters
  sanitized = sanitized.replace(/[^a-zA-Z0-9\-_.]/g, '_');

  // Limit length
  if (sanitized.length > 255) {
    const extension = sanitized.split('.').pop() || '';
    sanitized = sanitized.substring(0, 250 - extension.length) + '.' + extension;
  }

  return sanitized;
}