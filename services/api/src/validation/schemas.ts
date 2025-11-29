import { z } from 'zod';

// Common validation patterns
const emailSchema = z.string().email().max(255);

// Common weak passwords to reject
const COMMON_PASSWORDS = new Set([
  'password', 'password123', '12345678', 'qwerty', 'abc123',
  'letmein', 'welcome', 'monkey', '1234567890', 'password1',
  'Password1', 'Password123', 'Qwerty123', 'Welcome1',
]);

const passwordSchema = z.string().min(8).max(128)
  .refine((password) => {
    // At least one uppercase, one lowercase, one number, and one special character
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(password);
  }, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  })
  .refine((password) => {
    // Check against common passwords
    return !COMMON_PASSWORDS.has(password.toLowerCase());
  }, {
    message: "This password is too common. Please choose a stronger password"
  });

const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/).max(20).optional();
const urlSchema = z.string().url().max(2048);

// User schemas
export const userRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: phoneSchema,
  acceptsTerms: z.boolean().refine(val => val === true, {
    message: "Must accept terms and conditions"
  }),
  acceptsMarketing: z.boolean().default(false),
});

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
  rememberMe: z.boolean().default(false),
});

export const userUpdateSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: phoneSchema,
  avatar: z.string().url().max(512).optional(),
  bio: z.string().max(500).optional(),
  preferences: z.object({
    notifications: z.boolean().default(true),
    darkMode: z.boolean().default(false),
    fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
    language: z.string().length(2).default('en'),
  }).optional(),
});

// Scripture and study schemas
export const scriptureReferenceSchema = z.object({
  book: z.string().min(1).max(50),
  chapter: z.number().int().min(1).max(150),
  verse: z.number().int().min(1).max(176),
  endVerse: z.number().int().min(1).max(176).optional(),
});

export const highlightSchema = z.object({
  scriptureId: z.string().uuid(),
  startOffset: z.number().int().min(0),
  endOffset: z.number().int().min(0),
  color: z.enum(['yellow', 'blue', 'green', 'red', 'purple', 'orange']).default('yellow'),
  note: z.string().max(1000).optional(),
});

export const noteSchema = z.object({
  scriptureId: z.string().uuid(),
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(5000),
  tags: z.array(z.string().min(1).max(30)).max(10).default([]),
  isPrivate: z.boolean().default(false),
});

export const studyPlanSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  duration: z.number().int().min(1).max(365), // days
  isPublic: z.boolean().default(false),
  scriptures: z.array(scriptureReferenceSchema).min(1).max(100),
});

// Search schemas
export const searchQuerySchema = z.object({
  query: z.string().min(1).max(500),
  type: z.enum(['keyword', 'semantic', 'hybrid']).default('hybrid'),
  filters: z.object({
    books: z.array(z.string()).optional(),
    chapters: z.array(z.number()).optional(),
    hasHighlights: z.boolean().optional(),
    hasNotes: z.boolean().optional(),
    dateRange: z.object({
      start: z.string().datetime(),
      end: z.string().datetime(),
    }).optional(),
  }).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// AI chat schemas
export const chatMessageSchema = z.object({
  message: z.string().min(1).max(1000),
  context: z.object({
    scriptureReferences: z.array(scriptureReferenceSchema).max(5).optional(),
    previousMessages: z.array(z.string()).max(10).optional(),
  }).optional(),
});

// Group study schemas
export const groupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPrivate: z.boolean().default(false),
  maxMembers: z.number().int().min(2).max(100).default(20),
  studyPlanId: z.string().uuid().optional(),
});

export const groupInviteSchema = z.object({
  groupId: z.string().uuid(),
  email: emailSchema,
  role: z.enum(['member', 'moderator']).default('member'),
  message: z.string().max(200).optional(),
});

// File upload schemas
export const fileUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().min(1).max(10 * 1024 * 1024), // 10MB max
  mimeType: z.enum(['image/jpeg', 'image/png', 'application/pdf']),
  purpose: z.enum(['avatar', 'note-attachment', 'group-image']),
});

// Analytics schemas
export const analyticsEventSchema = z.object({
  event: z.string().min(1).max(50),
  properties: z.record(z.any()).optional(),
  userId: z.string().uuid().optional(),
  sessionId: z.string().uuid(),
  timestamp: z.string().datetime().optional(),
});

// Pagination schemas
export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Input sanitization helpers
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
    .slice(0, 5000); // Prevent extremely long strings
}

export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[<>\"'%;]/g, '') // Remove SQL injection characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .slice(0, 500);
}

// Rate limiting schemas
export const rateLimitSchema = z.object({
  windowMs: z.number().int().min(1000).max(3600000).default(3600000), // 1 hour default
  max: z.number().int().min(1).max(10000).default(1000),
  message: z.string().max(200).default('Too many requests'),
});

export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type ScriptureReference = z.infer<typeof scriptureReferenceSchema>;
export type Highlight = z.infer<typeof highlightSchema>;
export type Note = z.infer<typeof noteSchema>;
export type StudyPlan = z.infer<typeof studyPlanSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type Group = z.infer<typeof groupSchema>;
export type GroupInvite = z.infer<typeof groupInviteSchema>;
export type FileUpload = z.infer<typeof fileUploadSchema>;
export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>;
export type Pagination = z.infer<typeof paginationSchema>;