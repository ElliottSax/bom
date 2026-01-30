import type { FastifyCorsOptions } from '@fastify/cors';

interface CorsConfig {
  development: FastifyCorsOptions;
  production: FastifyCorsOptions;
  test: FastifyCorsOptions;
}

// Default production origins - MUST be overridden via CORS_ORIGIN env var
const DEFAULT_PRODUCTION_ORIGINS = [
  'https://bomstudytools.org',
  'https://www.bomstudytools.org',
  'https://app.bomstudytools.org',
];

// Check if CORS is properly configured for production
export function validateCorsConfig(): { valid: boolean; message: string } {
  const env = process.env.NODE_ENV || 'development';
  if (env === 'production' && !process.env.CORS_ORIGIN) {
    return {
      valid: false,
      message: 'WARNING: CORS_ORIGIN not set in production. Using default origins. Set CORS_ORIGIN environment variable for security.',
    };
  }
  return { valid: true, message: 'CORS configuration valid' };
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
      // Allow requests with no origin for mobile apps (React Native doesn't send Origin)
      // This is safe because we validate via Authorization header for authenticated routes
      if (!origin) {
        callback(null, true);
        return;
      }

      // Use configured origins or fall back to defaults
      const allowedOrigins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
        : DEFAULT_PRODUCTION_ORIGINS;

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