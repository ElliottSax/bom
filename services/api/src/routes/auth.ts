import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../services/auth.service';
import { validateBody } from '../middleware/validation';
import { createRateLimiter, rateLimitPresets } from '../middleware/rateLimit';
import { userRegistrationSchema, userLoginSchema } from '../validation/schemas';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

// Additional schemas for auth routes
const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

const passwordResetSchema = z.object({
  resetToken: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export async function authRoutes(fastify: FastifyInstance) {
  /**
   * POST /auth/register
   * Register a new user
   */
  fastify.post(
    '/auth/register',
    {
      preHandler: [
        createRateLimiter(rateLimitPresets.auth),
        validateBody(userRegistrationSchema),
      ],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { email, password, firstName, lastName } = request.body as any;

        const result = await authService.register({
          email,
          password,
          displayName: `${firstName} ${lastName}`,
        });

        fastify.log.info({ email }, 'User registered successfully');

        return reply.status(201).send({
          success: true,
          data: result,
          message: 'Registration successful',
        });
      } catch (error: any) {
        fastify.log.error({ err: error }, 'Registration failed');

        // Pass ValidationException errors through
        if (error.name === 'ValidationException') {
          return reply.status(400).send({
            error: 'Validation failed',
            errors: error.errors,
            timestamp: new Date().toISOString(),
          });
        }

        return reply.status(500).send({
          error: 'Registration failed',
          message: 'An error occurred during registration',
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  /**
   * POST /auth/login
   * Login with email and password
   */
  fastify.post(
    '/auth/login',
    {
      preHandler: [
        createRateLimiter(rateLimitPresets.auth),
        validateBody(userLoginSchema),
      ],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { email, password, rememberMe } = request.body as any;

        const result = await authService.login({
          email,
          password,
          rememberMe,
        });

        fastify.log.info({ email }, 'User logged in successfully');

        return reply.status(200).send({
          success: true,
          data: result,
          message: 'Login successful',
        });
      } catch (error: any) {
        fastify.log.error({ err: error }, 'Login failed');

        if (error.name === 'ValidationException') {
          return reply.status(401).send({
            error: 'Authentication failed',
            errors: error.errors,
            timestamp: new Date().toISOString(),
          });
        }

        return reply.status(500).send({
          error: 'Login failed',
          message: 'An error occurred during login',
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  /**
   * POST /auth/refresh
   * Refresh access token
   */
  fastify.post(
    '/auth/refresh',
    {
      preHandler: [validateBody(refreshTokenSchema)],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { refreshToken } = request.body as any;

        const result = await authService.refreshAccessToken(refreshToken);

        return reply.status(200).send({
          success: true,
          data: result,
          message: 'Token refreshed successfully',
        });
      } catch (error: any) {
        fastify.log.error({ err: error }, 'Token refresh failed');

        return reply.status(401).send({
          error: 'Invalid refresh token',
          message: 'Token refresh failed',
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  /**
   * POST /auth/logout
   * Logout user
   */
  fastify.post(
    '/auth/logout',
    {
      preHandler: [validateBody(refreshTokenSchema)],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { refreshToken } = request.body as any;

        await authService.logout(refreshToken);

        return reply.status(200).send({
          success: true,
          message: 'Logout successful',
        });
      } catch (error) {
        fastify.log.error({ err: error }, 'Logout failed');

        return reply.status(200).send({
          success: true,
          message: 'Logout successful',
        });
      }
    }
  );

  /**
   * POST /auth/change-password
   * Change user password (requires authentication)
   */
  fastify.post(
    '/auth/change-password',
    {
      preHandler: [
        requireAuth,
        createRateLimiter(rateLimitPresets.auth),
        validateBody(changePasswordSchema),
      ],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { oldPassword, newPassword } = request.body as any;
        const userId = request.user!.userId;

        await authService.changePassword(userId, oldPassword, newPassword);

        return reply.status(200).send({
          success: true,
          message: 'Password changed successfully',
        });
      } catch (error: any) {
        fastify.log.error({ err: error }, 'Password change failed');

        if (error.name === 'ValidationException') {
          return reply.status(400).send({
            error: 'Validation failed',
            errors: error.errors,
            timestamp: new Date().toISOString(),
          });
        }

        return reply.status(500).send({
          error: 'Password change failed',
          message: 'An error occurred',
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  /**
   * POST /auth/forgot-password
   * Request password reset
   */
  fastify.post(
    '/auth/forgot-password',
    {
      preHandler: [
        createRateLimiter(rateLimitPresets.auth),
        validateBody(passwordResetRequestSchema),
      ],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { email } = request.body as any;

        const resetToken = await authService.requestPasswordReset(email);

        // In production, send this via email
        // For now, return it in response (NOT SECURE - for development only)
        const isDevelopment = process.env.NODE_ENV === 'development';

        return reply.status(200).send({
          success: true,
          message: 'Password reset instructions sent to email',
          ...(isDevelopment && { resetToken }), // Only in development
        });
      } catch (error) {
        fastify.log.error({ err: error }, 'Password reset request failed');

        return reply.status(200).send({
          success: true,
          message: 'If email exists, password reset instructions have been sent',
        });
      }
    }
  );

  /**
   * POST /auth/reset-password
   * Reset password with token
   */
  fastify.post(
    '/auth/reset-password',
    {
      preHandler: [
        createRateLimiter(rateLimitPresets.auth),
        validateBody(passwordResetSchema),
      ],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { resetToken, newPassword } = request.body as any;

        await authService.resetPassword(resetToken, newPassword);

        return reply.status(200).send({
          success: true,
          message: 'Password reset successfully',
        });
      } catch (error: any) {
        fastify.log.error({ err: error }, 'Password reset failed');

        return reply.status(400).send({
          error: 'Password reset failed',
          message: 'Invalid or expired reset token',
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  /**
   * GET /auth/me
   * Get current user info (requires authentication)
   */
  fastify.get(
    '/auth/me',
    {
      preHandler: [requireAuth],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user!.userId;

        // Get user from database
        const user = await fastify.prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            displayName: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true,
            preferences: true,
          },
        });

        if (!user) {
          return reply.status(404).send({
            error: 'User not found',
            timestamp: new Date().toISOString(),
          });
        }

        return reply.status(200).send({
          success: true,
          data: { user },
        });
      } catch (error) {
        fastify.log.error({ err: error }, 'Failed to get user info');

        return reply.status(500).send({
          error: 'Failed to get user info',
          timestamp: new Date().toISOString(),
        });
      }
    }
  );
}
