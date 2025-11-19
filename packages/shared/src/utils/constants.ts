/**
 * Shared constants across the application
 */

export const BOOK_OF_MORMON_BOOKS = [
  '1-nephi',
  '2-nephi',
  'jacob',
  'enos',
  'jarom',
  'omni',
  'words-of-mormon',
  'mosiah',
  'alma',
  'helaman',
  '3-nephi',
  '4-nephi',
  'mormon',
  'ether',
  'moroni',
] as const;

export type BookOfMormonBook = (typeof BOOK_OF_MORMON_BOOKS)[number];

export const BOOK_NAMES: Record<BookOfMormonBook, string> = {
  '1-nephi': '1 Nephi',
  '2-nephi': '2 Nephi',
  'jacob': 'Jacob',
  'enos': 'Enos',
  'jarom': 'Jarom',
  'omni': 'Omni',
  'words-of-mormon': 'Words of Mormon',
  'mosiah': 'Mosiah',
  'alma': 'Alma',
  'helaman': 'Helaman',
  '3-nephi': '3 Nephi',
  '4-nephi': '4 Nephi',
  'mormon': 'Mormon',
  'ether': 'Ether',
  'moroni': 'Moroni',
};

export const API_RATE_LIMITS = {
  PUBLIC: 100, // requests per minute
  AUTHENTICATED: 1000, // requests per hour
  AI_CHAT: 50, // requests per hour
  SEMANTIC_SEARCH: 200, // requests per hour
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'bom:auth:token',
  USER_PREFERENCES: 'bom:user:preferences',
  LAST_SYNC: 'bom:sync:last',
  OFFLINE_QUEUE: 'bom:sync:queue',
} as const;

export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
