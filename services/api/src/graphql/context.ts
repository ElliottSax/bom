import type { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { authService } from '../services/auth.service';
import type Redis from 'ioredis';

export interface GraphQLContext {
  prisma: PrismaClient;
  redis: Redis;
  request: FastifyRequest;
  reply: FastifyReply;
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
  const context: GraphQLContext = {
    prisma,
    redis,
    request,
    reply,
  };

  // Extract user from Authorization header if present
  const authHeader = request.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const payload = await authService.verifyToken(token);

      context.user = {
        userId: payload.userId,
        email: payload.email,
      };
    } catch (error) {
      // Invalid token - user remains undefined
      // GraphQL resolvers can check context.user and throw auth errors
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
