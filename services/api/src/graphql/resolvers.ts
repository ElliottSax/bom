import { GraphQLError } from 'graphql';
import { GraphQLDateTime, GraphQLJSON } from 'graphql-scalars';
import type { GraphQLContext } from './context';
import { requireUser } from './context';

/**
 * GraphQL Resolvers
 * Implements the schema queries, mutations, and subscriptions
 */
export const resolvers = {
  // Custom scalar types
  DateTime: GraphQLDateTime,
  JSON: GraphQLJSON,

  // ============================================================================
  // Queries
  // ============================================================================
  Query: {
    /**
     * Get current authenticated user
     */
    me: async (_parent: any, _args: any, context: GraphQLContext) => {
      const { userId } = requireUser(context);

      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        include: {
          preferences: true,
          studyStreak: true,
        },
      });

      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'USER_NOT_FOUND' },
        });
      }

      return user;
    },

    /**
     * Get a single verse by ID
     */
    verse: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      const verse = await context.prisma.verse.findUnique({
        where: { id: args.id },
      });

      if (!verse) {
        throw new GraphQLError('Verse not found', {
          extensions: { code: 'VERSE_NOT_FOUND' },
        });
      }

      return verse;
    },

    /**
     * Get all verses for a chapter
     */
    verses: async (
      _parent: any,
      args: { book: string; chapter: number },
      context: GraphQLContext
    ) => {
      return context.prisma.verse.findMany({
        where: {
          book: args.book,
          chapter: args.chapter,
        },
        orderBy: {
          verse: 'asc',
        },
      });
    },

    /**
     * Get verse by book, chapter, verse reference
     */
    verseByReference: async (
      _parent: any,
      args: { book: string; chapter: number; verse: number },
      context: GraphQLContext
    ) => {
      const verse = await context.prisma.verse.findFirst({
        where: {
          book: args.book,
          chapter: args.chapter,
          verse: args.verse,
        },
      });

      if (!verse) {
        throw new GraphQLError('Verse not found', {
          extensions: { code: 'VERSE_NOT_FOUND' },
        });
      }

      return verse;
    },

    /**
     * Get user's highlights
     */
    myHighlights: async (
      _parent: any,
      args: { verseId?: string },
      context: GraphQLContext
    ) => {
      const { userId } = requireUser(context);

      return context.prisma.highlight.findMany({
        where: {
          userId,
          ...(args.verseId && { verseId: args.verseId }),
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          verse: true,
        },
      });
    },

    /**
     * Get user's notes
     */
    myNotes: async (
      _parent: any,
      args: { verseId?: string },
      context: GraphQLContext
    ) => {
      const { userId } = requireUser(context);

      return context.prisma.note.findMany({
        where: {
          userId,
          ...(args.verseId && { verseId: args.verseId }),
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          verse: true,
        },
      });
    },

    /**
     * Get user's reading progress
     */
    myProgress: async (
      _parent: any,
      args: { book?: string },
      context: GraphQLContext
    ) => {
      const { userId } = requireUser(context);

      return context.prisma.readingProgress.findMany({
        where: {
          userId,
          ...(args.book && { book: args.book }),
        },
        orderBy: {
          lastReadAt: 'desc',
        },
      });
    },

    /**
     * Get user's study streak
     */
    myStreak: async (_parent: any, _args: any, context: GraphQLContext) => {
      const { userId } = requireUser(context);

      const streak = await context.prisma.studyStreak.findUnique({
        where: { userId },
      });

      // Create streak if doesn't exist
      if (!streak) {
        return context.prisma.studyStreak.create({
          data: {
            userId,
            currentStreak: 0,
            longestStreak: 0,
          },
        });
      }

      return streak;
    },

    /**
     * Get due memory cards
     */
    dueCards: async (_parent: any, _args: any, context: GraphQLContext) => {
      const { userId } = requireUser(context);

      return context.prisma.memoryCard.findMany({
        where: {
          userId,
          nextReview: {
            lte: new Date(),
          },
        },
        orderBy: {
          nextReview: 'asc',
        },
        include: {
          verse: true,
        },
        take: 20, // Limit to 20 cards per session
      });
    },

    /**
     * Get memory card statistics
     */
    cardStats: async (_parent: any, _args: any, context: GraphQLContext) => {
      const { userId } = requireUser(context);

      const total = await context.prisma.memoryCard.count({
        where: { userId },
      });

      const due = await context.prisma.memoryCard.count({
        where: {
          userId,
          nextReview: { lte: new Date() },
        },
      });

      const newCards = await context.prisma.memoryCard.count({
        where: {
          userId,
          repetition: 0,
        },
      });

      const learning = await context.prisma.memoryCard.count({
        where: {
          userId,
          repetition: { gte: 1, lte: 3 },
        },
      });

      const mastered = await context.prisma.memoryCard.count({
        where: {
          userId,
          repetition: { gte: 4 },
        },
      });

      return {
        total,
        due,
        new: newCards,
        learning,
        mastered,
      };
    },

    /**
     * Get user's groups
     */
    myGroups: async (_parent: any, _args: any, context: GraphQLContext) => {
      const { userId } = requireUser(context);

      const memberships = await context.prisma.groupMember.findMany({
        where: { userId },
        include: {
          group: {
            include: {
              members: true,
            },
          },
        },
      });

      return memberships.map((m) => m.group);
    },

    /**
     * Get group by ID
     */
    group: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      const { userId } = requireUser(context);

      const group = await context.prisma.group.findUnique({
        where: { id: args.id },
        include: {
          members: true,
          discussions: true,
        },
      });

      if (!group) {
        throw new GraphQLError('Group not found', {
          extensions: { code: 'GROUP_NOT_FOUND' },
        });
      }

      // Check if user is a member
      const isMember = group.members.some((m) => m.userId === userId);
      if (!isMember && group.isPrivate) {
        throw new GraphQLError('Access denied', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return group;
    },
  },

  // ============================================================================
  // Mutations
  // ============================================================================
  Mutation: {
    /**
     * Create a highlight
     */
    createHighlight: async (
      _parent: any,
      args: { input: { verseId: string; color: string } },
      context: GraphQLContext
    ) => {
      const { userId } = requireUser(context);

      // Check if highlight already exists
      const existing = await context.prisma.highlight.findUnique({
        where: {
          userId_verseId: {
            userId,
            verseId: args.input.verseId,
          },
        },
      });

      if (existing) {
        // Update color if exists
        return context.prisma.highlight.update({
          where: { id: existing.id },
          data: { color: args.input.color },
          include: { verse: true },
        });
      }

      // Create new highlight
      return context.prisma.highlight.create({
        data: {
          userId,
          verseId: args.input.verseId,
          color: args.input.color,
        },
        include: { verse: true },
      });
    },

    /**
     * Delete a highlight
     */
    deleteHighlight: async (
      _parent: any,
      args: { id: string },
      context: GraphQLContext
    ) => {
      const { userId } = requireUser(context);

      const highlight = await context.prisma.highlight.findUnique({
        where: { id: args.id },
      });

      if (!highlight || highlight.userId !== userId) {
        throw new GraphQLError('Highlight not found or access denied', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      await context.prisma.highlight.delete({
        where: { id: args.id },
      });

      return true;
    },

    /**
     * Create a note
     */
    createNote: async (
      _parent: any,
      args: { input: { verseId: string; content: string; tags?: string[] } },
      context: GraphQLContext
    ) => {
      const { userId } = requireUser(context);

      return context.prisma.note.create({
        data: {
          userId,
          verseId: args.input.verseId,
          content: args.input.content,
          tags: args.input.tags || [],
        },
        include: { verse: true },
      });
    },

    /**
     * Update a note
     */
    updateNote: async (
      _parent: any,
      args: { id: string; input: { content?: string; tags?: string[] } },
      context: GraphQLContext
    ) => {
      const { userId } = requireUser(context);

      const note = await context.prisma.note.findUnique({
        where: { id: args.id },
      });

      if (!note || note.userId !== userId) {
        throw new GraphQLError('Note not found or access denied', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return context.prisma.note.update({
        where: { id: args.id },
        data: {
          ...(args.input.content && { content: args.input.content }),
          ...(args.input.tags && { tags: args.input.tags }),
        },
        include: { verse: true },
      });
    },

    /**
     * Delete a note
     */
    deleteNote: async (
      _parent: any,
      args: { id: string },
      context: GraphQLContext
    ) => {
      const { userId } = requireUser(context);

      const note = await context.prisma.note.findUnique({
        where: { id: args.id },
      });

      if (!note || note.userId !== userId) {
        throw new GraphQLError('Note not found or access denied', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      await context.prisma.note.delete({
        where: { id: args.id },
      });

      return true;
    },

    /**
     * Update reading progress
     */
    updateProgress: async (
      _parent: any,
      args: { verseId: string },
      context: GraphQLContext
    ) => {
      const { userId } = requireUser(context);

      // Get verse details
      const verse = await context.prisma.verse.findUnique({
        where: { id: args.verseId },
      });

      if (!verse) {
        throw new GraphQLError('Verse not found', {
          extensions: { code: 'VERSE_NOT_FOUND' },
        });
      }

      // Update or create progress
      return context.prisma.readingProgress.upsert({
        where: {
          userId_book_chapter: {
            userId,
            book: verse.book,
            chapter: verse.chapter,
          },
        },
        update: {
          verse: verse.verse,
          percentage: 100, // TODO: Calculate actual percentage
          lastReadAt: new Date(),
        },
        create: {
          userId,
          book: verse.book,
          chapter: verse.chapter,
          verse: verse.verse,
          percentage: 100,
        },
      });
    },
  },

  // ============================================================================
  // Field Resolvers
  // ============================================================================
  User: {
    highlights: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.highlight.findMany({
        where: { userId: parent.id },
        include: { verse: true },
      });
    },

    notes: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.note.findMany({
        where: { userId: parent.id },
        include: { verse: true },
      });
    },
  },

  Verse: {
    highlights: async (parent: any, _args: any, context: GraphQLContext) => {
      if (!context.user) return [];

      return context.prisma.highlight.findMany({
        where: {
          verseId: parent.id,
          userId: context.user.userId,
        },
      });
    },

    notes: async (parent: any, _args: any, context: GraphQLContext) => {
      if (!context.user) return [];

      return context.prisma.note.findMany({
        where: {
          verseId: parent.id,
          userId: context.user.userId,
        },
      });
    },

    crossReferences: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.crossReference.findMany({
        where: { fromVerseId: parent.id },
        include: {
          toVerse: true,
        },
      });
    },
  },
};
