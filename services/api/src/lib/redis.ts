import Redis from 'ioredis';
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

/**
 * Redis singleton to prevent connection exhaustion
 *
 * Creating multiple Redis instances can lead to connection leaks and memory issues.
 * This singleton ensures only one instance exists throughout the application lifecycle.
 */

declare global {
  // eslint-disable-next-line no-var
  var redis: Redis | undefined;
}

export const redis =
  global.redis ||
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    lazyConnect: false,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      logger.warn(`Redis connection attempt ${times}, retrying in ${delay}ms`);
      return delay;
    },
  });

if (process.env.NODE_ENV !== 'production') {
  global.redis = redis;
}

// Event handlers
redis.on('error', (err) => {
  logger.error({ err }, 'Redis connection error');
});

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('ready', () => {
  logger.info('Redis ready to accept commands');
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

// Graceful shutdown
process.on('beforeExit', async () => {
  logger.info('Disconnecting Redis...');
  await redis.quit();
});

export default redis;
