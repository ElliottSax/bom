import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
    memory: {
      usage: number;
      limit: number;
      percentage: number;
    };
  };
  version?: string;
}

export async function healthRoutes(fastify: FastifyInstance) {
  // Basic health check endpoint (fast, for load balancers)
  fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

  // Detailed health check with service dependencies
  fastify.get('/health/detailed', async (request: FastifyRequest, reply: FastifyReply) => {
    const memoryUsage = process.memoryUsage();
    const memoryLimit = 1024 * 1024 * 1024; // 1GB default

    const healthCheck: HealthCheckResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: 'down',
        redis: 'down',
        memory: {
          usage: memoryUsage.heapUsed,
          limit: memoryLimit,
          percentage: Math.round((memoryUsage.heapUsed / memoryLimit) * 100),
        },
      },
      version: process.env.npm_package_version || '0.1.0',
    };

    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      healthCheck.services.database = 'up';
    } catch (error) {
      fastify.log.error({ err: error }, 'Database health check failed');
      healthCheck.status = 'unhealthy';
    }

    // Check Redis connection
    try {
      await redis.ping();
      healthCheck.services.redis = 'up';
    } catch (error) {
      fastify.log.error({ err: error }, 'Redis health check failed');
      healthCheck.status = 'unhealthy';
    }

    // Return appropriate status code
    const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
    return reply.status(statusCode).send(healthCheck);
  });

  // Readiness check (for Kubernetes)
  fastify.get('/health/ready', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Check if application is ready to accept traffic
      await prisma.$queryRaw`SELECT 1`;

      return reply.status(200).send({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      fastify.log.error({ err: error }, 'Readiness check failed');
      return reply.status(503).send({
        status: 'not ready',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Liveness check (for Kubernetes)
  fastify.get('/health/live', async (request: FastifyRequest, reply: FastifyReply) => {
    // Simple liveness check - process is running
    return reply.status(200).send({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });
}
