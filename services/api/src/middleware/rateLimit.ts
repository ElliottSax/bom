import type { FastifyRequest, FastifyReply } from 'fastify';
import { redis } from '../lib/redis';
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  keyGenerator?: (request: FastifyRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

/**
 * Redis-based distributed rate limiting middleware
 * Suitable for multi-instance production deployments
 */
export function redisRateLimit(config: RateLimitConfig) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Generate unique key for this client
      const key = config.keyGenerator
        ? config.keyGenerator(request)
        : `ratelimit:${request.ip}`;

      const now = Date.now();
      const windowKey = `${key}:${Math.floor(now / config.windowMs)}`;

      // Use Redis pipeline for atomic operations
      const pipeline = redis.pipeline();
      pipeline.incr(windowKey);
      pipeline.pexpire(windowKey, config.windowMs);

      const results = await pipeline.exec();

      if (!results || results.length === 0) {
        throw new Error('Redis pipeline failed');
      }

      const count = results[0]?.[1] as number;

      // Set rate limit headers
      reply.header('X-RateLimit-Limit', config.max);
      reply.header('X-RateLimit-Remaining', Math.max(0, config.max - count));
      reply.header('X-RateLimit-Reset', Math.ceil((now + config.windowMs) / 1000));

      if (count > config.max) {
        const retryAfter = Math.ceil(config.windowMs / 1000);
        reply.header('Retry-After', retryAfter);

        logger.warn({
          ip: request.ip,
          path: request.url,
          count,
          limit: config.max,
        }, 'Rate limit exceeded');

        return reply.status(429).send({
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again in ${retryAfter} seconds`,
          retryAfter,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      logger.error({ err: error }, 'Rate limit middleware error - falling back to in-memory');
      // Fall back to in-memory rate limiting instead of failing open
      // This maintains rate limiting protection even if Redis is down
      return memoryRateLimit(config)(request, reply);
    }
  };
}

/**
 * In-memory rate limiting middleware (for development/testing)
 * Not suitable for multi-instance production deployments
 */
const inMemoryStore = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries every minute
let cleanupInterval: NodeJS.Timeout | null = null;
let cleanupRegistered = false;

/**
 * Stop the cleanup interval (call during shutdown)
 */
export function stopRateLimitCleanup(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    logger.info('Rate limit cleanup interval stopped');
  }
}

export function memoryRateLimit(config: RateLimitConfig) {
  // Initialize cleanup interval if not already running
  if (!cleanupInterval) {
    cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of inMemoryStore.entries()) {
        if (value.resetTime < now) {
          inMemoryStore.delete(key);
        }
      }
    }, 60000);

    // Prevent interval from keeping process alive
    cleanupInterval.unref();

    // Register cleanup handlers only once
    if (!cleanupRegistered) {
      cleanupRegistered = true;

      const cleanup = () => {
        stopRateLimitCleanup();
      };

      // Handle various shutdown signals
      process.on('SIGTERM', cleanup);
      process.on('SIGINT', cleanup);
      process.on('exit', cleanup);
    }
  }

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const key = config.keyGenerator
      ? config.keyGenerator(request)
      : request.ip;

    const now = Date.now();
    let entry = inMemoryStore.get(key);

    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
      };
      inMemoryStore.set(key, entry);
    }

    entry.count++;

    // Set rate limit headers
    reply.header('X-RateLimit-Limit', config.max);
    reply.header('X-RateLimit-Remaining', Math.max(0, config.max - entry.count));
    reply.header('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));

    if (entry.count > config.max) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      reply.header('Retry-After', retryAfter);

      logger.warn({
        ip: request.ip,
        path: request.url,
        count: entry.count,
        limit: config.max,
      }, 'Rate limit exceeded');

      return reply.status(429).send({
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again in ${retryAfter} seconds`,
        retryAfter,
        timestamp: new Date().toISOString(),
      });
    }
  };
}

/**
 * Factory function that selects appropriate rate limiter based on environment
 */
export function createRateLimiter(config: RateLimitConfig) {
  const useRedis = process.env.NODE_ENV === 'production' && process.env.REDIS_URL;

  if (useRedis) {
    logger.info('Using Redis-based rate limiting for production');
    return redisRateLimit(config);
  } else {
    logger.info('Using in-memory rate limiting for development');
    return memoryRateLimit(config);
  }
}

// Preset configurations for common use cases
export const rateLimitPresets = {
  // Strict limits for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    keyGenerator: (req: FastifyRequest) => `auth:${req.ip}`,
  },

  // Standard API rate limit
  api: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: Number(process.env.RATE_LIMIT_MAX) || 500,
    keyGenerator: (req: FastifyRequest) => `api:${req.ip}`,
  },

  // Generous limits for GraphQL queries
  graphql: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000,
    keyGenerator: (req: FastifyRequest) => `graphql:${req.ip}`,
  },

  // AI/ML endpoints with higher costs
  ai: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50,
    keyGenerator: (req: FastifyRequest) => `ai:${req.ip}`,
  },
};
