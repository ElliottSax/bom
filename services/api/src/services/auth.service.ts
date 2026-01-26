import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { ValidationException } from '../middleware/validation';
import type { User } from '@prisma/client';
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

const SALT_ROUNDS = 12;

// Token expiration constants
const ACCESS_TOKEN_EXPIRY_DAYS = 7;
const REFRESH_TOKEN_EXPIRY_DAYS = 30;
const REMEMBER_ME_EXPIRY_DAYS = 90;

// Validate required environment variables
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
// Type assertion: we've validated JWT_SECRET is defined above
const JWT_SECRET_VALIDATED: string = JWT_SECRET;

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || `${ACCESS_TOKEN_EXPIRY_DAYS}d`;
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || `${REFRESH_TOKEN_EXPIRY_DAYS}d`;

export interface RegisterInput {
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'password'>;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Authentication Service
 * Handles user registration, login, token generation, and verification
 */
export class AuthService {
  /**
   * Register a new user
   */
  async register(input: RegisterInput): Promise<AuthTokens> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email.toLowerCase() },
      });

      if (existingUser) {
        throw new ValidationException([
          {
            field: 'email',
            message: 'Email already registered',
            code: 'unique_violation',
          },
        ]);
      }

      // Hash password
      const hashedPassword = await this.hashPassword(input.password);

      // Create user with preferences
      const user = await prisma.user.create({
        data: {
          email: input.email.toLowerCase(),
          password: hashedPassword,
          displayName: input.displayName || input.email.split('@')[0],
          preferences: {
            create: {
              // Use default values from schema
            },
          },
        },
        include: {
          preferences: true,
        },
      });

      logger.info({ userId: user.id }, 'New user registered');

      // Generate tokens
      return this.generateTokens(user);
    } catch (error) {
      logger.error({ err: error, email: input.email }, 'Registration failed');
      throw error;
    }
  }

  /**
   * Login user with email and password
   */
  async login(input: LoginInput): Promise<AuthTokens> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: input.email.toLowerCase() },
        include: {
          preferences: true,
        },
      });

      if (!user) {
        throw new ValidationException([
          {
            field: 'email',
            message: 'Invalid email or password',
            code: 'invalid_credentials',
          },
        ]);
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(
        input.password,
        user.password
      );

      if (!isValidPassword) {
        logger.warn({ email: input.email }, 'Failed login attempt');
        throw new ValidationException([
          {
            field: 'password',
            message: 'Invalid email or password',
            code: 'invalid_credentials',
          },
        ]);
      }

      logger.info({ userId: user.id }, 'User logged in');

      // Generate tokens
      return this.generateTokens(user, input.rememberMe);
    } catch (error) {
      logger.error({ err: error, email: input.email }, 'Login failed');
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token signature
      const payload = await this.verifyToken(refreshToken);

      // Check if refresh token exists in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new ValidationException([
          {
            field: 'refreshToken',
            message: 'Invalid or expired refresh token',
            code: 'invalid_token',
          },
        ]);
      }

      // Verify the token's userId matches the stored token's userId
      // This prevents token confusion attacks
      if (storedToken.userId !== payload.userId) {
        logger.warn(
          { tokenUserId: storedToken.userId, payloadUserId: payload.userId },
          'Refresh token userId mismatch - possible attack'
        );
        throw new ValidationException([
          {
            field: 'refreshToken',
            message: 'Invalid refresh token',
            code: 'invalid_token',
          },
        ]);
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
          preferences: true,
        },
      });

      if (!user) {
        throw new ValidationException([
          {
            field: 'refreshToken',
            message: 'User not found',
            code: 'user_not_found',
          },
        ]);
      }

      // Delete the old refresh token (token rotation for security)
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });

      // Generate new tokens
      return this.generateTokens(user);
    } catch (error) {
      logger.error({ err: error }, 'Token refresh failed');
      throw error;
    }
  }

  /**
   * Logout user by invalidating refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      await prisma.refreshToken.delete({
        where: { token: refreshToken },
      });

      logger.info('User logged out');
    } catch (error) {
      logger.error({ err: error }, 'Logout failed');
      // Don't throw - logout should be idempotent
    }
  }

  /**
   * Verify JWT token and return payload
   */
  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const payload = jwt.verify(token, JWT_SECRET_VALIDATED) as JWTPayload;
      return payload;
    } catch (error) {
      throw new ValidationException([
        {
          field: 'token',
          message: 'Invalid or expired token',
          code: 'invalid_token',
        },
      ]);
    }
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(
    user: User,
    rememberMe = false
  ): Promise<AuthTokens> {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
    };

    // Generate access token
    const accessToken = jwt.sign(payload, JWT_SECRET_VALIDATED, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Generate refresh token
    const refreshTokenExpiry = rememberMe ? '90d' : REFRESH_TOKEN_EXPIRES_IN;
    const refreshToken = jwt.sign(payload, JWT_SECRET_VALIDATED, {
      expiresIn: refreshTokenExpiry,
    });

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + (rememberMe ? REMEMBER_ME_EXPIRY_DAYS : REFRESH_TOKEN_EXPIRY_DAYS)
    );

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Remove password from user object
    const { password, ...userWithoutPassword } = user;

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    };
  }

  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Verify password against hash
   */
  private async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new ValidationException([
          {
            field: 'userId',
            message: 'User not found',
            code: 'user_not_found',
          },
        ]);
      }

      // Verify old password
      const isValid = await this.verifyPassword(oldPassword, user.password);
      if (!isValid) {
        throw new ValidationException([
          {
            field: 'oldPassword',
            message: 'Invalid password',
            code: 'invalid_password',
          },
        ]);
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      // Invalidate all refresh tokens
      await prisma.refreshToken.deleteMany({
        where: { userId },
      });

      logger.info({ userId }, 'Password changed successfully');
    } catch (error) {
      logger.error({ err: error, userId }, 'Password change failed');
      throw error;
    }
  }

  /**
   * Request password reset (generates token)
   */
  async requestPasswordReset(email: string): Promise<string> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        // Don't reveal if email exists
        logger.warn({ email }, 'Password reset requested for non-existent email');
        return 'reset_token_fake'; // Return fake token
      }

      // Generate reset token (valid for 1 hour)
      const resetToken = jwt.sign(
        { userId: user.id, purpose: 'password_reset' },
        JWT_SECRET_VALIDATED,
        { expiresIn: '1h' }
      );

      logger.info({ userId: user.id }, 'Password reset requested');

      // In development, log the token for testing (NEVER log in production)
      if (process.env.NODE_ENV === 'development') {
        logger.info({ resetToken }, 'DEV ONLY - Password reset token (send via email in production)');
      }

      // TODO: In production, send resetToken via email service
      // await emailService.sendPasswordResetEmail(user.email, resetToken);

      return resetToken;
    } catch (error) {
      logger.error({ err: error, email }, 'Password reset request failed');
      throw error;
    }
  }

  /**
   * Reset password using reset token
   */
  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    try {
      const payload = jwt.verify(resetToken, JWT_SECRET_VALIDATED) as JWTPayload & {
        purpose: string;
      };

      if (payload.purpose !== 'password_reset') {
        throw new ValidationException([
          {
            field: 'resetToken',
            message: 'Invalid reset token',
            code: 'invalid_token',
          },
        ]);
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: payload.userId },
        data: { password: hashedPassword },
      });

      // Invalidate all refresh tokens
      await prisma.refreshToken.deleteMany({
        where: { userId: payload.userId },
      });

      logger.info({ userId: payload.userId }, 'Password reset successfully');
    } catch (error) {
      logger.error({ err: error }, 'Password reset failed');
      throw error;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
