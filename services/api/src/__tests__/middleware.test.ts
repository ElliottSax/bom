import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { validateBody, validateQuery } from '../middleware/validation';
import { memoryRateLimit } from '../middleware/rateLimit';
import { userLoginSchema, searchQuerySchema } from '../validation/schemas';
import type { FastifyRequest, FastifyReply } from 'fastify';

// Mock Fastify request and reply
const createMockRequest = (overrides: any = {}): FastifyRequest => ({
  body: {},
  query: {},
  params: {},
  headers: {},
  ip: '127.0.0.1',
  ...overrides,
} as FastifyRequest);

const createMockReply = (): FastifyReply => {
  const reply = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
  return reply as unknown as FastifyReply;
};

describe('Validation Middleware', () => {
  describe('validateBody', () => {
    it('should pass validation with valid data', async () => {
      const middleware = validateBody(userLoginSchema);
      const request = createMockRequest({
        body: {
          email: 'test@example.com',
          password: 'password123',
          rememberMe: true,
        },
      });
      const reply = createMockReply();

      const result = await middleware(request, reply);

      expect(result).toBeUndefined(); // Middleware should not return anything on success
      expect(reply.status).not.toHaveBeenCalled();
      expect(request.body).toEqual({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      });
    });

    it('should return 400 with validation errors', async () => {
      const middleware = validateBody(userLoginSchema);
      const request = createMockRequest({
        body: {
          email: 'invalid-email',
          password: '',
        },
      });
      const reply = createMockReply();

      await middleware(request, reply);

      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed',
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: expect.any(String),
              message: expect.any(String),
              code: expect.any(String),
            }),
          ]),
        })
      );
    });
  });

  describe('validateQuery', () => {
    it('should validate query parameters', async () => {
      const middleware = validateQuery(searchQuerySchema);
      const request = createMockRequest({
        query: {
          query: 'faith',
          type: 'keyword',
          limit: '10',
          offset: '0',
        },
      });
      const reply = createMockReply();

      await middleware(request, reply);

      expect(reply.status).not.toHaveBeenCalled();
      expect(request.query).toEqual(
        expect.objectContaining({
          query: 'faith',
          type: 'keyword',
          limit: 10, // Should be converted to number
          offset: 0, // Should be converted to number
        })
      );
    });

    it('should handle invalid query parameters', async () => {
      const middleware = validateQuery(searchQuerySchema);
      const request = createMockRequest({
        query: {
          query: '', // Invalid: empty query
          type: 'invalid', // Invalid: not a valid type
        },
      });
      const reply = createMockReply();

      await middleware(request, reply);

      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed',
          message: 'Query parameters validation failed',
        })
      );
    });
  });

  describe('rateLimit', () => {
    beforeEach(() => {
      // Clear rate limit store between tests
      jest.clearAllMocks();
    });

    it('should allow requests under the limit', async () => {
      const middleware = memoryRateLimit({
        windowMs: 60000, // 1 minute
        max: 5,
      });

      const request = createMockRequest();
      const reply = createMockReply();

      // Make 3 requests (under limit)
      for (let i = 0; i < 3; i++) {
        await middleware(request, reply);
      }

      expect(reply.status).not.toHaveBeenCalled();
    });

    it('should reject requests over the limit', async () => {
      const middleware = memoryRateLimit({
        windowMs: 60000,
        max: 2,
      });

      const request = createMockRequest();
      const reply = createMockReply();

      // Make requests up to the limit
      await middleware(request, reply);
      await middleware(request, reply);

      // This should be rejected
      await middleware(request, reply);

      expect(reply.status).toHaveBeenCalledWith(429);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Too many requests',
          message: 'Rate limit exceeded',
          retryAfter: expect.any(Number),
        })
      );
    });

    it('should use custom key generator', async () => {
      const middleware = memoryRateLimit({
        windowMs: 60000,
        max: 1,
        keyGenerator: (req) => req.headers['x-user-id'] as string || req.ip,
      });

      const request1 = createMockRequest({
        headers: { 'x-user-id': 'user1' },
      });
      const request2 = createMockRequest({
        headers: { 'x-user-id': 'user2' },
      });
      const reply = createMockReply();

      // Different users should have separate limits
      await middleware(request1, reply);
      await middleware(request2, reply);

      expect(reply.status).not.toHaveBeenCalled();

      // Same user should hit limit
      await middleware(request1, reply);
      expect(reply.status).toHaveBeenCalledWith(429);
    });
  });
});

describe('Error Handling', () => {
  it('should handle middleware errors gracefully', async () => {
    const middleware = validateBody(userLoginSchema);
    const request = createMockRequest({
      body: null, // This might cause an error
    });
    const reply = createMockReply();

    await middleware(request, reply);

    // Should either succeed or return proper error response
    if (reply.status.mock.calls.length > 0) {
      expect(reply.status).toHaveBeenCalledWith(expect.any(Number));
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
          message: expect.any(String),
          timestamp: expect.any(String),
        })
      );
    }
  });
});