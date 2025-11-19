import { z } from 'zod';

/**
 * Shared validation schemas using Zod
 */

export const verseReferenceSchema = z.string().regex(
  /^[1-4]?-?[a-z]+-\d+-\d+$/i,
  'Invalid verse reference format (e.g., 1-nephi-3-7)'
);

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const noteContentSchema = z
  .string()
  .min(1, 'Note content cannot be empty')
  .max(10000, 'Note content exceeds maximum length');

export const tagSchema = z
  .string()
  .min(1)
  .max(50)
  .regex(/^[a-zA-Z0-9-_]+$/, 'Tags can only contain letters, numbers, hyphens, and underscores');

/**
 * Validates a verse reference
 */
export function validateVerseReference(reference: string): boolean {
  return verseReferenceSchema.safeParse(reference).success;
}

/**
 * Validates an email address
 */
export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}
