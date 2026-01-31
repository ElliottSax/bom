import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { resolvers } from '../graphql/resolvers';
import type { GraphQLContext } from '../graphql/context';

// Mock Prisma client
const mockPrisma = {
  verse: {
    count: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
  },
  aIInteraction: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  highlight: {
    findMany: jest.fn(),
  },
  note: {
    findMany: jest.fn(),
  },
  verseMapping: {
    findMany: jest.fn(),
  },
  scriptureWork: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  edition: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};

// Create test context
const createContext = (userId?: string): GraphQLContext => ({
  prisma: mockPrisma as unknown as GraphQLContext['prisma'],
  user: userId ? { userId } : undefined,
});

describe('GraphQL Resolvers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Query.searchVerses', () => {
    it('should return search results for valid query', async () => {
      const mockVerses = [
        {
          id: 'coc-bom-1908:1-nephi-3-7',
          editionId: 'coc-bom-1908',
          book: '1 Nephi',
          chapter: 3,
          verse: 7,
          text: 'And it came to pass that I, Nephi, said unto my father: I will go and do the things which the Lord hath commanded',
          verseType: 'standard',
          edition: { id: 'coc-bom-1908', shortName: 'CoC 1908' },
        },
        {
          id: 'coc-bom-1908:1-nephi-1-1',
          editionId: 'coc-bom-1908',
          book: '1 Nephi',
          chapter: 1,
          verse: 1,
          text: 'I, Nephi, having been born of goodly parents',
          verseType: 'standard',
          edition: { id: 'coc-bom-1908', shortName: 'CoC 1908' },
        },
      ];

      mockPrisma.verse.count.mockResolvedValue(2);
      mockPrisma.verse.findMany.mockResolvedValue(mockVerses);

      const context = createContext();
      const result = await resolvers.Query.searchVerses(
        null,
        { input: { query: 'Nephi commanded', limit: 20, offset: 0 } },
        context
      );

      expect(result.total).toBe(2);
      expect(result.results).toHaveLength(2);
      expect(result.query).toBe('Nephi commanded');
      expect(result.results[0].verse).toBeDefined();
      expect(result.results[0].score).toBeGreaterThan(0);
      expect(result.results[0].highlights).toBeDefined();
    });

    it('should reject queries that are too short', async () => {
      const context = createContext();

      await expect(
        resolvers.Query.searchVerses(null, { input: { query: 'a' } }, context)
      ).rejects.toThrow('Search query must be at least 2 characters');
    });

    it('should filter by books when specified', async () => {
      mockPrisma.verse.count.mockResolvedValue(0);
      mockPrisma.verse.findMany.mockResolvedValue([]);

      const context = createContext();
      await resolvers.Query.searchVerses(
        null,
        { input: { query: 'faith', books: ['1 Nephi', '2 Nephi'] } },
        context
      );

      expect(mockPrisma.verse.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            book: { in: ['1 Nephi', '2 Nephi'] },
          }),
        })
      );
    });

    it('should return empty results for no matches', async () => {
      mockPrisma.verse.count.mockResolvedValue(0);
      mockPrisma.verse.findMany.mockResolvedValue([]);

      const context = createContext();
      const result = await resolvers.Query.searchVerses(
        null,
        { input: { query: 'xyznonexistent' } },
        context
      );

      expect(result.total).toBe(0);
      expect(result.results).toHaveLength(0);
    });
  });

  describe('Query.askQuestion', () => {
    it('should answer questions with relevant verses', async () => {
      const mockVerses = [
        {
          id: 'coc-bom-1908:alma-32-21',
          editionId: 'coc-bom-1908',
          book: 'Alma',
          chapter: 32,
          verse: 21,
          text: 'Faith is not to have a perfect knowledge of things',
          verseType: 'standard',
          edition: { id: 'coc-bom-1908', shortName: 'CoC 1908' },
        },
      ];

      mockPrisma.verse.findMany.mockResolvedValue(mockVerses);
      mockPrisma.aIInteraction.create.mockResolvedValue({
        id: 'test-interaction-id',
        userId: 'test-user-id',
        question: 'What is faith?',
        answer: 'Based on your question...',
        sources: ['coc-bom-1908:alma-32-21'],
        confidence: 0.6,
      });

      const context = createContext('test-user-id');
      const result = await resolvers.Query.askQuestion(
        null,
        { input: { message: 'What is faith?' } },
        context
      );

      expect(result.answer).toContain('faith');
      expect(result.sources).toHaveLength(1);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should require authentication', async () => {
      const context = createContext(); // No user

      await expect(
        resolvers.Query.askQuestion(
          null,
          { input: { message: 'What is faith?' } },
          context
        )
      ).rejects.toThrow();
    });

    it('should reject questions that are too short', async () => {
      const context = createContext('test-user-id');

      await expect(
        resolvers.Query.askQuestion(null, { input: { message: 'hi' } }, context)
      ).rejects.toThrow('Question must be at least 3 characters');
    });
  });

  describe('Query.myAIHistory', () => {
    it('should return user AI interaction history', async () => {
      const mockInteractions = [
        {
          id: 'interaction-1',
          userId: 'test-user-id',
          question: 'What is faith?',
          answer: 'Faith is...',
          sources: ['verse-1'],
          confidence: 0.8,
          feedback: null,
          createdAt: new Date(),
        },
      ];

      mockPrisma.aIInteraction.findMany.mockResolvedValue(mockInteractions);

      const context = createContext('test-user-id');
      const result = await resolvers.Query.myAIHistory(
        null,
        { limit: 20 },
        context
      );

      expect(result).toHaveLength(1);
      expect(result[0].question).toBe('What is faith?');
    });

    it('should require authentication', async () => {
      const context = createContext(); // No user

      await expect(
        resolvers.Query.myAIHistory(null, {}, context)
      ).rejects.toThrow();
    });
  });

  describe('Mutation.provideFeedback', () => {
    it('should save feedback on AI interaction', async () => {
      mockPrisma.aIInteraction.findUnique.mockResolvedValue({
        id: 'interaction-1',
        userId: 'test-user-id',
        question: 'What is faith?',
        answer: 'Faith is...',
        sources: [],
        confidence: 0.8,
        feedback: null,
      });

      mockPrisma.aIInteraction.update.mockResolvedValue({
        id: 'interaction-1',
        feedback: 'helpful',
      });

      const context = createContext('test-user-id');
      const result = await resolvers.Mutation.provideFeedback(
        null,
        { interactionId: 'interaction-1', feedback: 'helpful' },
        context
      );

      expect(result).toBe(true);
      expect(mockPrisma.aIInteraction.update).toHaveBeenCalledWith({
        where: { id: 'interaction-1' },
        data: { feedback: 'helpful' },
      });
    });

    it('should reject invalid feedback values', async () => {
      const context = createContext('test-user-id');

      await expect(
        resolvers.Mutation.provideFeedback(
          null,
          { interactionId: 'interaction-1', feedback: 'invalid' },
          context
        )
      ).rejects.toThrow('Feedback must be "helpful" or "not_helpful"');
    });

    it('should prevent feedback on other users interactions', async () => {
      mockPrisma.aIInteraction.findUnique.mockResolvedValue({
        id: 'interaction-1',
        userId: 'other-user-id', // Different user
        question: 'What is faith?',
        answer: 'Faith is...',
        sources: [],
        confidence: 0.8,
        feedback: null,
      });

      const context = createContext('test-user-id');

      await expect(
        resolvers.Mutation.provideFeedback(
          null,
          { interactionId: 'interaction-1', feedback: 'helpful' },
          context
        )
      ).rejects.toThrow("Cannot provide feedback on another user's interaction");
    });
  });

  describe('Query.scriptureWorks', () => {
    it('should return all scripture works', async () => {
      const mockWorks = [
        { id: 'book-of-mormon', name: 'Book of Mormon', abbreviation: 'BoM' },
        { id: 'doctrine-covenants', name: 'Doctrine and Covenants', abbreviation: 'D&C' },
      ];

      mockPrisma.scriptureWork.findMany.mockResolvedValue(mockWorks);

      const context = createContext();
      const result = await resolvers.Query.scriptureWorks(null, {}, context);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Book of Mormon');
    });
  });

  describe('Query.editions', () => {
    it('should return editions filtered by work', async () => {
      const mockEditions = [
        { id: 'coc-bom-1908', name: 'CoC 1908 Edition', year: 1908 },
      ];

      mockPrisma.edition.findMany.mockResolvedValue(mockEditions);

      const context = createContext();
      const result = await resolvers.Query.editions(
        null,
        { workId: 'book-of-mormon' },
        context
      );

      expect(result).toHaveLength(1);
      expect(mockPrisma.edition.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { workId: 'book-of-mormon' },
        })
      );
    });
  });
});
