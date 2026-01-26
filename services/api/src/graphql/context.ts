import type { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { authService } from '../services/auth.service';
import { createLoaders, Loaders } from './loaders';
import type Redis from 'ioredis';

export interface GraphQLContext {
  prisma: PrismaClient;
  redis: Redis;
  request: FastifyRequest;
  reply: FastifyReply;
  loaders: Loaders;
  user?: {
    userId: string;
    email: string;
  };
}

/**
 * Create GraphQL context for each request
 * Extracts user from JWT token if present
 */
export async function createContext(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<GraphQLContext> {
  let userId: string | undefined;

  // Extract user from Authorization header if present
  const authHeader = request.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const payload = await authService.verifyToken(token);
      userId = payload.userId;
    } catch (error) {
      // Invalid token - user remains undefined
      // GraphQL resolvers can check context.user and throw auth errors
    }
  }

  // Create fresh loaders for each request (important for caching correctness)
  const loaders = createLoaders(prisma, userId);

  const context: GraphQLContext = {
    prisma,
    redis,
    request,
    reply,
    loaders,
  };

  if (userId) {
    // Re-fetch the payload to get email (we already verified the token above)
    const authHeader = request.headers.authorization;
    if (authHeader) {
      const token = authHeader.substring(7);
      const payload = await authService.verifyToken(token);
      context.user = {
        userId: payload.userId,
        email: payload.email,
      };
    }
  }

  return context;
}

/**
 * Require authenticated user in resolver
 * Throws error if user not authenticated
 */
export function requireUser(context: GraphQLContext): {
  userId: string;
  email: string;
} {
  if (!context.user) {
    throw new Error('Authentication required');
  }
  return context.user;
}
