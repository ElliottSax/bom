import type { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../services/auth.service';
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

// Extend Fastify request to include user
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
      email: string;
    };
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header',
        timestamp: new Date().toISOString(),
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = await authService.verifyToken(token);

    // Attach user to request
    request.user = {
      userId: payload.userId,
      email: payload.email,
    };

    logger.debug({ userId: payload.userId, path: request.url }, 'Authenticated request');
  } catch (error) {
    logger.warn({ err: error, path: request.url }, 'Authentication failed');

    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't reject if missing
 */
export async function optionalAuth(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = await authService.verifyToken(token);

      request.user = {
        userId: payload.userId,
        email: payload.email,
      };
    }
  } catch (error) {
    // Silently fail for optional auth
    logger.debug({ err: error }, 'Optional auth failed');
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(request: FastifyRequest): boolean {
  return !!request.user;
}

/**
 * Get current user ID or throw error
 */
export function requireUserId(request: FastifyRequest): string {
  if (!request.user) {
    throw new Error('User not authenticated');
  }
  return request.user.userId;
}
