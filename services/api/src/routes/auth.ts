import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../services/auth.service';
import { validateBody } from '../middleware/validation';
import { createRateLimiter, rateLimitPresets } from '../middleware/rateLimit';
import { userRegistrationSchema, userLoginSchema } from '../validation/schemas';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

/**
 * Type guard to check if an error has a name property (like ValidationException)
 */
function isNamedError(error: unknown): error is Error & { name: string; errors?: unknown } {
  return error instanceof Error && 'name' in error;
}

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

// Type inference from schemas
type UserRegistrationBody = z.infer<typeof userRegistrationSchema>;
type UserLoginBody = z.infer<typeof userLoginSchema>;
type RefreshTokenBody = z.infer<typeof refreshTokenSchema>;
type ChangePasswordBody = z.infer<typeof changePasswordSchema>;
type PasswordResetRequestBody = z.infer<typeof passwordResetRequestSchema>;
type PasswordResetBody = z.infer<typeof passwordResetSchema>;

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
        const { email, password, firstName, lastName } = request.body as UserRegistrationBody;

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
      } catch (error: unknown) {
        fastify.log.error({ err: error }, 'Registration failed');

        // Pass ValidationException errors through
        if (isNamedError(error) && error.name === 'ValidationException') {
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
        const { email, password, rememberMe } = request.body as UserLoginBody;

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
      } catch (error: unknown) {
        fastify.log.error({ err: error }, 'Login failed');

        if (isNamedError(error) && error.name === 'ValidationException') {
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
    async (request: FastifyRequest<{ Body: RefreshTokenBody }>, reply: FastifyReply) => {
      try {
        const { refreshToken } = request.body;

        const result = await authService.refreshAccessToken(refreshToken);

        return reply.status(200).send({
          success: true,
          data: result,
          message: 'Token refreshed successfully',
        });
      } catch (error: unknown) {
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
    async (request: FastifyRequest<{ Body: RefreshTokenBody }>, reply: FastifyReply) => {
      try {
        const { refreshToken } = request.body;

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
    async (request: FastifyRequest<{ Body: ChangePasswordBody }>, reply: FastifyReply) => {
      try {
        const { oldPassword, newPassword } = request.body;
        const userId = request.user!.userId;

        await authService.changePassword(userId, oldPassword, newPassword);

        return reply.status(200).send({
          success: true,
          message: 'Password changed successfully',
        });
      } catch (error: unknown) {
        fastify.log.error({ err: error }, 'Password change failed');

        if (isNamedError(error) && error.name === 'ValidationException') {
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
        const { email } = request.body as PasswordResetRequestBody;

        // Request password reset (sends email in production)
        await authService.requestPasswordReset(email);

        // Never return the reset token in the response - it should only be sent via email
        // Log token to console in development for testing purposes only
        if (process.env.NODE_ENV === 'development') {
          fastify.log.info({ email }, 'Password reset requested - check server logs for token in dev mode');
        }

        return reply.status(200).send({
          success: true,
          message: 'If an account exists with this email, password reset instructions have been sent',
        });
      } catch (error: unknown) {
        fastify.log.error({ err: error }, 'Password reset request failed');

        // Always return success to prevent email enumeration attacks
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
        const { resetToken, newPassword } = request.body as PasswordResetBody;

        await authService.resetPassword(resetToken, newPassword);

        return reply.status(200).send({
          success: true,
          message: 'Password reset successfully',
        });
      } catch (error: unknown) {
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
