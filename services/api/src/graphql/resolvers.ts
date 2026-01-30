import { GraphQLError } from 'graphql';
import { GraphQLDateTime, GraphQLJSON } from 'graphql-scalars';
import type { GraphQLContext } from './context';
import { requireUser } from './context';
import { validateBookName, validateChapter, validateVerse } from '../validation/schemas';

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
     * Get all scripture works
     */
    scriptureWorks: async (_parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.scriptureWork.findMany({
        orderBy: { name: 'asc' },
      });
    },

    /**
     * Get a single scripture work by ID
     */
    scriptureWork: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      const work = await context.prisma.scriptureWork.findUnique({
        where: { id: args.id },
      });

      if (!work) {
        throw new GraphQLError('Scripture work not found', {
          extensions: { code: 'WORK_NOT_FOUND' },
        });
      }

      return work;
    },

    /**
     * Get editions (optionally filtered by work)
     */
    editions: async (_parent: any, args: { workId?: string }, context: GraphQLContext) => {
      return context.prisma.edition.findMany({
        where: args.workId ? { workId: args.workId } : undefined,
        orderBy: { displayOrder: 'asc' },
      });
    },

    /**
     * Get a single edition by ID
     */
    edition: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      const edition = await context.prisma.edition.findUnique({
        where: { id: args.id },
      });

      if (!edition) {
        throw new GraphQLError('Edition not found', {
          extensions: { code: 'EDITION_NOT_FOUND' },
        });
      }

      return edition;
    },

    /**
     * Get a single verse by ID
     */
    verse: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      const verse = await context.prisma.verse.findUnique({
        where: { id: args.id },
        include: {
          edition: true,
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
     * Get all verses for a chapter in a specific edition
     */
    verses: async (
      _parent: any,
      args: { book: string; chapter: number; editionId: string },
      context: GraphQLContext
    ) => {
      // Validate inputs
      let validatedBook: string;
      let validatedChapter: number;
      try {
        validatedBook = validateBookName(args.book);
        validatedChapter = validateChapter(args.chapter);
      } catch (error: any) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      return context.prisma.verse.findMany({
        where: {
          editionId: args.editionId,
          book: validatedBook,
          chapter: validatedChapter,
        },
        orderBy: {
          verse: 'asc',
        },
        include: {
          edition: true,
        },
      });
    },

    /**
     * Get verse by book, chapter, verse reference in a specific edition
     */
    verseByReference: async (
      _parent: any,
      args: { book: string; chapter: number; verse: number; editionId: string },
      context: GraphQLContext
    ) => {
      // Validate inputs
      let validatedBook: string;
      let validatedChapter: number;
      let validatedVerse: number;
      try {
        validatedBook = validateBookName(args.book);
        validatedChapter = validateChapter(args.chapter);
        validatedVerse = validateVerse(args.verse);
      } catch (error: any) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const verse = await context.prisma.verse.findFirst({
        where: {
          editionId: args.editionId,
          book: validatedBook,
          chapter: validatedChapter,
          verse: validatedVerse,
        },
        include: {
          edition: true,
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
     * Get verse equivalents (cross-edition mappings)
     */
    verseEquivalents: async (
      _parent: any,
      args: { verseId: string },
      context: GraphQLContext
    ) => {
      const mappings = await context.prisma.verseMapping.findMany({
        where: {
          OR: [
            { fromVerseId: args.verseId },
            { toVerseId: args.verseId },
          ],
        },
        include: {
          fromVerse: {
            include: { edition: true },
          },
          toVerse: {
            include: { edition: true },
          },
        },
      });

      return mappings;
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

    /**
     * Search verses (stub - requires search infrastructure)
     */
    searchVerses: async (_parent: any, _args: any, _context: GraphQLContext) => {
      throw new GraphQLError('Search functionality not yet implemented', {
        extensions: { code: 'NOT_IMPLEMENTED' },
      });
    },

    /**
     * Get group discussions
     */
    groupDiscussions: async (
      _parent: any,
      args: { groupId: string },
      context: GraphQLContext
    ) => {
      const { userId } = requireUser(context);

      // Verify user is member of group
      const membership = await context.prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: args.groupId,
            userId,
          },
        },
      });

      if (!membership) {
        throw new GraphQLError('Not a member of this group', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return context.prisma.discussion.findMany({
        where: { groupId: args.groupId },
        orderBy: { createdAt: 'desc' },
        include: { comments: true },
      });
    },

    /**
     * AI question (stub - requires AI infrastructure)
     */
    askQuestion: async (_parent: any, _args: any, _context: GraphQLContext) => {
      throw new GraphQLError('AI functionality not yet implemented', {
        extensions: { code: 'NOT_IMPLEMENTED' },
      });
    },

    /**
     * Get AI interaction history (stub)
     */
    myAIHistory: async (_parent: any, _args: any, _context: GraphQLContext) => {
      throw new GraphQLError('AI functionality not yet implemented', {
        extensions: { code: 'NOT_IMPLEMENTED' },
      });
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

      // Calculate percentage based on verse position in chapter
      // Get the total verses in this chapter
      const totalVerses = await context.prisma.verse.count({
        where: {
          editionId: verse.editionId,
          book: verse.book,
          chapter: verse.chapter,
          verseType: 'standard', // Only count standard verses, not headings/footnotes
        },
      });

      // Calculate percentage (verse number / total verses * 100)
      // Use verse.verse as position indicator, capped at 100%
      const percentage = totalVerses > 0
        ? Math.min(100, Math.round((verse.verse / totalVerses) * 100))
        : 100;

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
          percentage,
          lastReadAt: new Date(),
        },
        create: {
          userId,
          book: verse.book,
          chapter: verse.chapter,
          verse: verse.verse,
          percentage,
        },
      });
    },

    /**
     * Create a memory card for verse memorization
     */
    createCard: async (
      _parent: any,
      args: { verseId: string },
      context: GraphQLContext
    ) => {
      const { userId } = requireUser(context);

      // Check if card already exists
      const existing = await context.prisma.memoryCard.findUnique({
        where: {
          userId_verseId: {
            userId,
            verseId: args.verseId,
          },
        },
      });

      if (existing) {
        throw new GraphQLError('Memory card already exists for this verse', {
          extensions: { code: 'ALREADY_EXISTS' },
        });
      }

      return context.prisma.memoryCard.create({
        data: {
          userId,
          verseId: args.verseId,
        },
        include: { verse: true },
      });
    },

    /**
     * Review a memory card (SM-2 algorithm)
     */
    reviewCard: async (
      _parent: any,
      args: { input: { cardId: string; quality: number } },
      context: GraphQLContext
    ) => {
      const { userId } = requireUser(context);

      const card = await context.prisma.memoryCard.findUnique({
        where: { id: args.input.cardId },
      });

      if (!card || card.userId !== userId) {
        throw new GraphQLError('Card not found or access denied', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Validate quality (0-5 for SM-2)
      const quality = Math.max(0, Math.min(5, args.input.quality));

      // SM-2 algorithm implementation
      let { easeFactor, interval, repetition } = card;

      if (quality < 3) {
        // Failed review - reset
        repetition = 0;
        interval = 1;
      } else {
        // Successful review
        if (repetition === 0) {
          interval = 1;
        } else if (repetition === 1) {
          interval = 6;
        } else {
          interval = Math.round(interval * easeFactor);
        }
        repetition++;
      }

      // Update ease factor
      easeFactor = Math.max(
        1.3,
        easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
      );

      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + interval);

      const updatedCard = await context.prisma.memoryCard.update({
        where: { id: args.input.cardId },
        data: {
          easeFactor,
          interval,
          repetition,
          nextReview,
          lastReviewed: new Date(),
          totalReviews: { increment: 1 },
          correctReviews: quality >= 3 ? { increment: 1 } : undefined,
        },
        include: { verse: true },
      });

      return {
        card: updatedCard,
        quality,
        nextReview,
      };
    },

    /**
     * Delete a memory card
     */
    deleteCard: async (
      _parent: any,
      args: { id: string },
      context: GraphQLContext
    ) => {
      const { userId } = requireUser(context);

      const card = await context.prisma.memoryCard.findUnique({
        where: { id: args.id },
      });

      if (!card || card.userId !== userId) {
        throw new GraphQLError('Card not found or access denied', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      await context.prisma.memoryCard.delete({
        where: { id: args.id },
      });

      return true;
    },

    /**
     * Create a study group
     */
    createGroup: async (
      _parent: any,
      args: { input: { name: string; description?: string; isPrivate?: boolean } },
      context: GraphQLContext
    ) => {
      const { userId } = requireUser(context);

      // Generate invite code for private groups
      const inviteCode = args.input.isPrivate
        ? Math.random().toString(36).substring(2, 10).toUpperCase()
        : null;

      const group = await context.prisma.group.create({
        data: {
          name: args.input.name,
          description: args.input.description,
          isPrivate: args.input.isPrivate || false,
          inviteCode,
          members: {
            create: {
              userId,
              role: 'admin',
            },
          },
        },
        include: { members: true },
      });

      return group;
    },

    /**
     * Join a group using invite code
     */
    joinGroup: async (
      _parent: any,
      args: { inviteCode: string },
      context: GraphQLContext
    ) => {
      const { userId } = requireUser(context);

      const group = await context.prisma.group.findUnique({
        where: { inviteCode: args.inviteCode },
      });

      if (!group) {
        throw new GraphQLError('Invalid invite code', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check if already a member
      const existing = await context.prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: group.id,
            userId,
          },
        },
      });

      if (existing) {
        throw new GraphQLError('Already a member of this group', {
          extensions: { code: 'ALREADY_EXISTS' },
        });
      }

      await context.prisma.groupMember.create({
        data: {
          groupId: group.id,
          userId,
          role: 'member',
        },
      });

      return context.prisma.group.findUnique({
        where: { id: group.id },
        include: { members: true },
      });
    },

    /**
     * Leave a group
     */
    leaveGroup: async (
      _parent: any,
      args: { groupId: string },
      context: GraphQLContext
    ) => {
      const { userId } = requireUser(context);

      const membership = await context.prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: args.groupId,
            userId,
          },
        },
      });

      if (!membership) {
        throw new GraphQLError('Not a member of this group', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      await context.prisma.groupMember.delete({
        where: { id: membership.id },
      });

      return true;
    },

    /**
     * Create a discussion in a group
     */
    createDiscussion: async (
      _parent: any,
      args: { input: { groupId: string; title: string; content: string; verseId: string } },
      context: GraphQLContext
    ) => {
      const { userId } = requireUser(context);

      // Verify membership
      const membership = await context.prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: args.input.groupId,
            userId,
          },
        },
      });

      if (!membership) {
        throw new GraphQLError('Not a member of this group', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return context.prisma.discussion.create({
        data: {
          groupId: args.input.groupId,
          title: args.input.title,
          content: args.input.content,
          verseId: args.input.verseId,
          authorId: userId,
        },
        include: { comments: true },
      });
    },

    /**
     * Add a comment to a discussion
     */
    addComment: async (
      _parent: any,
      args: { discussionId: string; content: string },
      context: GraphQLContext
    ) => {
      const { userId } = requireUser(context);

      // Get discussion and verify membership
      const discussion = await context.prisma.discussion.findUnique({
        where: { id: args.discussionId },
        include: { group: true },
      });

      if (!discussion) {
        throw new GraphQLError('Discussion not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const membership = await context.prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: discussion.groupId,
            userId,
          },
        },
      });

      if (!membership) {
        throw new GraphQLError('Not a member of this group', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return context.prisma.comment.create({
        data: {
          discussionId: args.discussionId,
          authorId: userId,
          content: args.content,
        },
      });
    },

    /**
     * Provide feedback on AI interaction (stub)
     */
    provideFeedback: async (_parent: any, _args: any, _context: GraphQLContext) => {
      throw new GraphQLError('AI functionality not yet implemented', {
        extensions: { code: 'NOT_IMPLEMENTED' },
      });
    },
  },

  // ============================================================================
  // Field Resolvers
  // ============================================================================

  ScriptureWork: {
    editions: async (parent: any, _args: any, context: GraphQLContext) => {
      // Use DataLoader to batch edition queries
      return context.loaders.editionsByWorkId.load(parent.id);
    },
  },

  Edition: {
    work: async (parent: any, _args: any, context: GraphQLContext) => {
      // Use DataLoader to batch scripture work queries
      return context.loaders.scriptureWorkById.load(parent.workId);
    },
  },

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
    edition: async (parent: any, _args: any, context: GraphQLContext) => {
      // Return if already loaded
      if (parent.edition) return parent.edition;

      // Use DataLoader to batch edition queries
      return context.loaders.editionById.load(parent.editionId);
    },

    highlights: async (parent: any, _args: any, context: GraphQLContext) => {
      if (!context.user) return [];

      // Use DataLoader to batch highlight queries
      return context.loaders.highlightsByVerseId.load(parent.id);
    },

    notes: async (parent: any, _args: any, context: GraphQLContext) => {
      if (!context.user) return [];

      // Use DataLoader to batch note queries
      return context.loaders.notesByVerseId.load(parent.id);
    },

    crossReferences: async (parent: any, _args: any, context: GraphQLContext) => {
      // Use DataLoader to batch cross reference queries
      return context.loaders.crossReferencesByVerseId.load(parent.id);
    },

    equivalentVerses: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.verseMapping.findMany({
        where: {
          OR: [
            { fromVerseId: parent.id },
            { toVerseId: parent.id },
          ],
        },
        include: {
          fromVerse: { include: { edition: true } },
          toVerse: { include: { edition: true } },
        },
      });
    },
  },
};
