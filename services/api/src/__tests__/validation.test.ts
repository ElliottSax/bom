import { describe, it, expect } from '@jest/globals';
import { validate, ValidationException } from '../middleware/validation';
import { 
  userRegistrationSchema, 
  userLoginSchema,
  scriptureReferenceSchema,
  searchQuerySchema 
} from '../validation/schemas';

describe('Input Validation', () => {
  describe('User Registration Validation', () => {
    it('should validate correct user registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        acceptsTerms: true,
        acceptsMarketing: false,
      };

      expect(() => validate(userRegistrationSchema, validData)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        acceptsTerms: true,
      };

      expect(() => validate(userRegistrationSchema, invalidData))
        .toThrow(ValidationException);
    });

    it('should reject weak password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'weak',
        firstName: 'John',
        lastName: 'Doe',
        acceptsTerms: true,
      };

      expect(() => validate(userRegistrationSchema, invalidData))
        .toThrow(ValidationException);
    });

    it('should require terms acceptance', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        acceptsTerms: false,
      };

      expect(() => validate(userRegistrationSchema, invalidData))
        .toThrow(ValidationException);
    });
  });

  describe('User Login Validation', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'anypassword',
        rememberMe: true,
      };

      expect(() => validate(userLoginSchema, validData)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'anypassword',
      };

      expect(() => validate(userLoginSchema, invalidData))
        .toThrow(ValidationException);
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };

      expect(() => validate(userLoginSchema, invalidData))
        .toThrow(ValidationException);
    });
  });

  describe('Scripture Reference Validation', () => {
    it('should validate correct scripture reference', () => {
      const validData = {
        book: '1 Nephi',
        chapter: 1,
        verse: 1,
        endVerse: 5,
      };

      expect(() => validate(scriptureReferenceSchema, validData)).not.toThrow();
    });

    it('should reject invalid chapter number', () => {
      const invalidData = {
        book: '1 Nephi',
        chapter: 0,
        verse: 1,
      };

      expect(() => validate(scriptureReferenceSchema, invalidData))
        .toThrow(ValidationException);
    });

    it('should reject invalid verse number', () => {
      const invalidData = {
        book: '1 Nephi',
        chapter: 1,
        verse: 0,
      };

      expect(() => validate(scriptureReferenceSchema, invalidData))
        .toThrow(ValidationException);
    });
  });

  describe('Search Query Validation', () => {
    it('should validate basic search query', () => {
      const validData = {
        query: 'faith',
        type: 'keyword' as const,
        limit: 10,
        offset: 0,
      };

      expect(() => validate(searchQuerySchema, validData)).not.toThrow();
    });

    it('should validate semantic search with filters', () => {
      const validData = {
        query: 'teachings about faith',
        type: 'semantic' as const,
        filters: {
          books: ['1 Nephi', '2 Nephi'],
          hasHighlights: true,
          dateRange: {
            start: '2023-01-01T00:00:00Z',
            end: '2023-12-31T23:59:59Z',
          },
        },
        limit: 20,
      };

      expect(() => validate(searchQuerySchema, validData)).not.toThrow();
    });

    it('should reject empty query', () => {
      const invalidData = {
        query: '',
        type: 'keyword' as const,
      };

      expect(() => validate(searchQuerySchema, invalidData))
        .toThrow(ValidationException);
    });

    it('should reject invalid search type', () => {
      const invalidData = {
        query: 'faith',
        type: 'invalid',
      };

      expect(() => validate(searchQuerySchema, invalidData))
        .toThrow(ValidationException);
    });

    it('should limit query length', () => {
      const invalidData = {
        query: 'a'.repeat(1001), // Too long
        type: 'keyword' as const,
      };

      expect(() => validate(searchQuerySchema, invalidData))
        .toThrow(ValidationException);
    });

    it('should limit results count', () => {
      const invalidData = {
        query: 'faith',
        type: 'keyword' as const,
        limit: 1000, // Too many
      };

      expect(() => validate(searchQuerySchema, invalidData))
        .toThrow(ValidationException);
    });
  });

  describe('Validation Error Structure', () => {
    it('should provide detailed error information', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'weak',
        firstName: '',
        lastName: 'Doe',
        acceptsTerms: false,
      };

      try {
        validate(userRegistrationSchema, invalidData);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationException);
        const validationError = error as ValidationException;
        expect(validationError.errors).toBeDefined();
        expect(validationError.errors.length).toBeGreaterThan(0);
        expect(validationError.errors[0]).toHaveProperty('field');
        expect(validationError.errors[0]).toHaveProperty('message');
        expect(validationError.errors[0]).toHaveProperty('code');
      }
    });
  });
});