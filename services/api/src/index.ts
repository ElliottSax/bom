import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import { config } from 'dotenv';
import pino from 'pino';
import { healthRoutes } from './routes/health';
import { authRoutes } from './routes/auth';
import { getCorsConfig, validateCorsConfig } from './config/cors';
import { createRateLimiter, rateLimitPresets } from './middleware/rateLimit';
import { setupGraphQL } from './graphql/server';
import { prisma } from './lib/prisma';

// Load environment variables
config();

// Environment variable validation
interface EnvValidation {
  name: string;
  required: boolean;
  defaultValue?: string;
}

const requiredEnvVars: EnvValidation[] = [
  { name: 'JWT_SECRET', required: true },
  { name: 'DATABASE_URL', required: true },
  { name: 'NODE_ENV', required: false, defaultValue: 'development' },
  { name: 'PORT', required: false, defaultValue: '4000' },
  { name: 'REDIS_URL', required: false },
  { name: 'CORS_ORIGIN', required: false },
  { name: 'EMAIL_PROVIDER', required: false, defaultValue: 'console' },
];

function validateEnvironment(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar.name]) {
      if (envVar.required) {
        missing.push(envVar.name);
      } else if (envVar.defaultValue) {
        process.env[envVar.name] = envVar.defaultValue;
      }
    }
  }

  // Check CORS configuration
  const corsValidation = validateCorsConfig();
  if (!corsValidation.valid) {
    warnings.push(corsValidation.message);
  }

  // Check for production-specific requirements
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.REDIS_URL) {
      warnings.push('REDIS_URL not set - rate limiting will use in-memory storage');
    }
    if (process.env.EMAIL_PROVIDER === 'console') {
      warnings.push('EMAIL_PROVIDER is "console" - emails will only be logged, not sent');
    }
  }

  // Report missing required variables
  if (missing.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', `ERROR: Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please set these variables before starting the server.');
    process.exit(1);
  }

  // Report warnings
  for (const warning of warnings) {
    console.warn('\x1b[33m%s\x1b[0m', `WARNING: ${warning}`);
  }
}

// Validate environment before proceeding
validateEnvironment();

// Initialize logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  } : undefined,
});

// Create Fastify instance
const fastify = Fastify({
  logger,
  trustProxy: true,
  requestIdLogLabel: 'reqId',
  disableRequestLogging: false,
  bodyLimit: 10485760, // 10MB
});

// Global error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error({
    err: error,
    reqId: request.id,
    path: request.url,
    method: request.method,
  }, 'Request error');

  // Don't expose internal errors in production
  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = error.statusCode || 500;

  reply.status(statusCode).send({
    error: isProduction ? 'Internal server error' : error.name,
    message: isProduction && statusCode === 500 ? 'An error occurred' : error.message,
    statusCode,
    timestamp: new Date().toISOString(),
    ...(isProduction ? {} : { stack: error.stack }),
  });
});

// Not found handler
fastify.setNotFoundHandler((request, reply) => {
  reply.status(404).send({
    error: 'Not found',
    message: `Route ${request.method}:${request.url} not found`,
    statusCode: 404,
    timestamp: new Date().toISOString(),
  });
});

async function start() {
  try {
    // Register security plugins
    await fastify.register(fastifyHelmet, {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false, // Allow embedding for mobile apps
    });

    // Register CORS
    await fastify.register(fastifyCors, getCorsConfig());

    // Attach Prisma to Fastify instance (for use in routes)
    fastify.decorate('prisma', prisma);

    // Register routes (health checks don't need rate limiting)
    await fastify.register(healthRoutes);

    // Register auth routes (with built-in rate limiting)
    await fastify.register(authRoutes);

    // Set up GraphQL server
    await setupGraphQL(fastify);

    // Apply global rate limiter to remaining routes
    // (after health and auth which have their own)
    fastify.addHook('preHandler', async (request, reply) => {
      // Skip rate limiting for health and auth routes
      if (
        request.url.startsWith('/health') ||
        request.url.startsWith('/auth')
      ) {
        return;
      }
      // Apply rate limiting to other routes
      await createRateLimiter(rateLimitPresets.api)(request, reply);
    });

    // Get port from environment or use default
    const port = parseInt(process.env.PORT || '4000', 10);
    const host = process.env.HOST || '0.0.0.0';

    // Start server
    await fastify.listen({ port, host });

    logger.info({
      port,
      host,
      env: process.env.NODE_ENV || 'development',
    }, 'Server started successfully');

  } catch (err) {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info({ signal }, 'Received shutdown signal');

  try {
    await fastify.close();
    logger.info('Server closed gracefully');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Error during shutdown');
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.fatal({ reason, promise }, 'Unhandled promise rejection');
  process.exit(1);
});

// Start the server
start();

export { fastify };
