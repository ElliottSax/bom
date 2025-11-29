import type { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import pino from 'pino';
import sanitizeHtml from 'sanitize-html';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export class ValidationException extends Error {
  public errors: ValidationError[];
  
  constructor(errors: ValidationError[]) {
    super('Validation failed');
    this.name = 'ValidationException';
    this.errors = errors;
  }
}

/**
 * Validates request body against a Zod schema
 */
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = schema.safeParse(request.body);
      
      if (!result.success) {
        const errors: ValidationError[] = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));
        
        return reply.status(400).send({
          error: 'Validation failed',
          message: 'Request body validation failed',
          errors,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Replace request body with validated and sanitized data
      request.body = result.data;
    } catch (error) {
      logger.error({ err: error, path: request.url }, 'Body validation error');
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Validation error occurred',
        timestamp: new Date().toISOString(),
      });
    }
  };
}

/**
 * Validates query parameters against a Zod schema
 */
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = schema.safeParse(request.query);
      
      if (!result.success) {
        const errors: ValidationError[] = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));
        
        return reply.status(400).send({
          error: 'Validation failed',
          message: 'Query parameters validation failed',
          errors,
          timestamp: new Date().toISOString(),
        });
      }

      request.query = result.data;
    } catch (error) {
      logger.error({ err: error, path: request.url }, 'Query validation error');
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Validation error occurred',
        timestamp: new Date().toISOString(),
      });
    }
  };
}

/**
 * Validates route parameters against a Zod schema
 */
export function validateParams<T>(schema: z.ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = schema.safeParse(request.params);
      
      if (!result.success) {
        const errors: ValidationError[] = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));
        
        return reply.status(400).send({
          error: 'Validation failed',
          message: 'Route parameters validation failed',
          errors,
          timestamp: new Date().toISOString(),
        });
      }

      request.params = result.data;
    } catch (error) {
      logger.error({ err: error, path: request.url }, 'Params validation error');
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Validation error occurred',
        timestamp: new Date().toISOString(),
      });
    }
  };
}

/**
 * Generic validation function that can be used programmatically
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors: ValidationError[] = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));
    
    throw new ValidationException(errors);
  }
  
  return result.data;
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Uses sanitize-html library with strict configuration
 */
export function sanitizeHtmlContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
    allowedAttributes: {
      'a': ['href', 'title'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    disallowedTagsMode: 'escape',
    parseStyleAttributes: false,
  });
}

/**
 * Sanitizes plain text by escaping HTML entities
 * Use this for user input that should be displayed as plain text
 */
export function sanitizePlainText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Validates and sanitizes file uploads
 */
export interface FileValidationOptions {
  maxSize: number;
  allowedTypes: string[];
  requireAuth: boolean;
}

export async function validateFileUpload(
  file: any,
  options: FileValidationOptions
): Promise<void> {
  if (!file) {
    throw new ValidationException([{
      field: 'file',
      message: 'File is required',
      code: 'required',
    }]);
  }
  
  if (file.size > options.maxSize) {
    throw new ValidationException([{
      field: 'file',
      message: `File size exceeds maximum allowed size of ${options.maxSize} bytes`,
      code: 'too_big',
    }]);
  }
  
  if (!options.allowedTypes.includes(file.mimetype)) {
    throw new ValidationException([{
      field: 'file',
      message: `File type ${file.mimetype} is not allowed. Allowed types: ${options.allowedTypes.join(', ')}`,
      code: 'invalid_type',
    }]);
  }
}

