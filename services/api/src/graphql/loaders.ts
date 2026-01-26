/**
 * DataLoader instances for batching and caching database queries
 * Prevents N+1 query problems in GraphQL resolvers
 */

import DataLoader from 'dataloader';
import { PrismaClient, Edition, ScriptureWork, Highlight, Note } from '@prisma/client';

/**
 * Create all data loaders for a request
 * Each request gets fresh loader instances to avoid cache issues between users
 */
export function createLoaders(prisma: PrismaClient, userId?: string) {
  return {
    /**
     * Batch load editions by work ID
     */
    editionsByWorkId: new DataLoader<string, Edition[]>(async (workIds) => {
      const editions = await prisma.edition.findMany({
        where: { workId: { in: [...workIds] } },
        orderBy: { displayOrder: 'asc' },
      });

      // Group editions by workId
      const editionsByWorkId = new Map<string, Edition[]>();
      for (const workId of workIds) {
        editionsByWorkId.set(workId, []);
      }
      for (const edition of editions) {
        const existing = editionsByWorkId.get(edition.workId) || [];
        existing.push(edition);
        editionsByWorkId.set(edition.workId, existing);
      }

      return workIds.map((id) => editionsByWorkId.get(id) || []);
    }),

    /**
     * Batch load scripture works by ID
     */
    scriptureWorkById: new DataLoader<string, ScriptureWork | null>(async (ids) => {
      const works = await prisma.scriptureWork.findMany({
        where: { id: { in: [...ids] } },
      });

      const worksById = new Map(works.map((w) => [w.id, w]));
      return ids.map((id) => worksById.get(id) || null);
    }),

    /**
     * Batch load editions by ID
     */
    editionById: new DataLoader<string, Edition | null>(async (ids) => {
      const editions = await prisma.edition.findMany({
        where: { id: { in: [...ids] } },
      });

      const editionsById = new Map(editions.map((e) => [e.id, e]));
      return ids.map((id) => editionsById.get(id) || null);
    }),

    /**
     * Batch load highlights by verse ID (for current user only)
     */
    highlightsByVerseId: new DataLoader<string, Highlight[]>(async (verseIds) => {
      if (!userId) {
        // Return empty arrays if no user
        return verseIds.map(() => []);
      }

      const highlights = await prisma.highlight.findMany({
        where: {
          verseId: { in: [...verseIds] },
          userId,
        },
      });

      // Group highlights by verseId
      const highlightsByVerseId = new Map<string, Highlight[]>();
      for (const verseId of verseIds) {
        highlightsByVerseId.set(verseId, []);
      }
      for (const highlight of highlights) {
        const existing = highlightsByVerseId.get(highlight.verseId) || [];
        existing.push(highlight);
        highlightsByVerseId.set(highlight.verseId, existing);
      }

      return verseIds.map((id) => highlightsByVerseId.get(id) || []);
    }),

    /**
     * Batch load notes by verse ID (for current user only)
     */
    notesByVerseId: new DataLoader<string, Note[]>(async (verseIds) => {
      if (!userId) {
        // Return empty arrays if no user
        return verseIds.map(() => []);
      }

      const notes = await prisma.note.findMany({
        where: {
          verseId: { in: [...verseIds] },
          userId,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Group notes by verseId
      const notesByVerseId = new Map<string, Note[]>();
      for (const verseId of verseIds) {
        notesByVerseId.set(verseId, []);
      }
      for (const note of notes) {
        const existing = notesByVerseId.get(note.verseId) || [];
        existing.push(note);
        notesByVerseId.set(note.verseId, existing);
      }

      return verseIds.map((id) => notesByVerseId.get(id) || []);
    }),

    /**
     * Batch load cross references by fromVerseId
     */
    crossReferencesByVerseId: new DataLoader<string, any[]>(async (verseIds) => {
      const crossRefs = await prisma.crossReference.findMany({
        where: { fromVerseId: { in: [...verseIds] } },
        include: { toVerse: true },
      });

      // Group by fromVerseId
      const refsByVerseId = new Map<string, any[]>();
      for (const verseId of verseIds) {
        refsByVerseId.set(verseId, []);
      }
      for (const ref of crossRefs) {
        const existing = refsByVerseId.get(ref.fromVerseId) || [];
        existing.push(ref);
        refsByVerseId.set(ref.fromVerseId, existing);
      }

      return verseIds.map((id) => refsByVerseId.get(id) || []);
    }),
  };
}

export type Loaders = ReturnType<typeof createLoaders>;
