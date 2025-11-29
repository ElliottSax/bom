import type { FastifyCorsOptions } from '@fastify/cors';

interface CorsConfig {
  development: FastifyCorsOptions;
  production: FastifyCorsOptions;
  test: FastifyCorsOptions;
}

const corsConfig: CorsConfig = {
  development: {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Parse allowed origins from environment
      const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || [
        'http://localhost:3000',
        'http://localhost:19006', // Expo dev server
        'exp://localhost:19000',  // Expo mobile
      ];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
      'X-Client-Version',
    ],
  },

  production: {
    origin: (origin, callback) => {
      // Strict origin checking for production
      if (!origin) {
        // Reject requests with no origin in production for security
        callback(new Error('Origin required in production'), false);
        return;
      }

      const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || [];
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
      'X-Client-Version',
    ],
    maxAge: 86400, // 24 hours
  },

  test: {
    origin: true, // Allow all origins in test environment
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['*'],
  },
};

export function getCorsConfig(): FastifyCorsOptions {
  const env = process.env.NODE_ENV || 'development';
  return corsConfig[env as keyof CorsConfig] || corsConfig.development;
}

export default corsConfig;