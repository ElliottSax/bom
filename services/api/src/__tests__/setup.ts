import { jest } from '@jest/globals';

// Extend global type for test utilities
declare global {
  // eslint-disable-next-line no-var
  var testUser: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
    updatedAt: Date;
  };
  // eslint-disable-next-line no-var
  var testScripture: {
    id: string;
    book: string;
    chapter: number;
    verse: number;
    text: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only-not-production';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/bom_test';
process.env.REDIS_URL = 'redis://localhost:6379/1';
process.env.LOG_LEVEL = 'silent';

// Mock external services
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn<() => Promise<string | null>>().mockResolvedValue(null),
    set: jest.fn<() => Promise<string>>().mockResolvedValue('OK'),
    del: jest.fn<() => Promise<number>>().mockResolvedValue(1),
    quit: jest.fn<() => Promise<string>>().mockResolvedValue('OK'),
    on: jest.fn(), // Event handler method
    connect: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  }));
});

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    scripture: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    highlight: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    note: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

// Global test utilities
global.testUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  createdAt: new Date(),
  updatedAt: new Date(),
};

global.testScripture = {
  id: 'test-scripture-id',
  book: '1 Nephi',
  chapter: 1,
  verse: 1,
  text: 'I, Nephi, having been born of goodly parents...',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Cleanup function
afterEach(() => {
  jest.clearAllMocks();
});

beforeAll(() => {
  // Setup test database or mock connections
  console.log('Setting up test environment...');
});

afterAll(() => {
  // Cleanup test resources
  console.log('Cleaning up test environment...');
});