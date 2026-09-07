/**
 * React Hook for Supabase Queries
 *
 * Provides a simple interface for querying Supabase with React Query
 * for automatic caching, refetching, and state management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

/**
 * Hook for fetching verses by book and chapter
 *
 * @example
 * const { data, loading, error } = useVerses('1 Nephi', 1)
 */
export function useVerses(book: string, chapter: number) {
  return useQuery({
    queryKey: ['verses', book, chapter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('verses')
        .select('*')
        .eq('book', book)
        .eq('chapter', chapter)
        .order('verse', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook for fetching a single verse by ID
 *
 * @example
 * const { data, loading, error } = useVerse('coc-bom-1908:1-nephi-3-7')
 */
export function useVerse(verseId: string) {
  return useQuery({
    queryKey: ['verse', verseId],
    queryFn: async () => {
      const { data, error } = await supabase.from('verses').select('*').eq('id', verseId).single();

      if (error) throw error;
      return data;
    },
    enabled: !!verseId,
  });
}

/**
 * Hook for searching verses by text
 *
 * @example
 * const { data, loading, error } = useSearchVerses('faith hope charity')
 */
export function useSearchVerses(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('verses')
        .select('*')
        .textSearch('text', query)
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: query.length > 2,
  });
}

/**
 * Hook for fetching user highlights
 *
 * @example
 * const { data, loading, error } = useHighlights()
 */
export function useHighlights() {
  return useQuery({
    queryKey: ['highlights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('highlights')
        .select(
          `
          *,
          verse:verses(*)
        `
        )
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook for creating a highlight
 *
 * @example
 * const createHighlight = useCreateHighlight()
 * createHighlight.mutate({ verseId: '...', color: 'yellow' })
 */
export function useCreateHighlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ verseId, color }: { verseId: string; color: string }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('highlights')
        .insert({
          user_id: user.id,
          verse_id: verseId,
          color,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['highlights'] });
    },
  });
}

/**
 * Hook for deleting a highlight
 *
 * @example
 * const deleteHighlight = useDeleteHighlight()
 * deleteHighlight.mutate('highlight-id')
 */
export function useDeleteHighlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (highlightId: string) => {
      const { error } = await supabase.from('highlights').delete().eq('id', highlightId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['highlights'] });
    },
  });
}

/**
 * Hook for fetching user notes
 *
 * @example
 * const { data, loading, error } = useNotes()
 */
export function useNotes() {
  return useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select(
          `
          *,
          verse:verses(*)
        `
        )
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook for creating a note
 *
 * @example
 * const createNote = useCreateNote()
 * createNote.mutate({ verseId: '...', content: '...', tags: ['faith'] })
 */
export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      verseId,
      content,
      tags = [],
    }: {
      verseId: string;
      content: string;
      tags?: string[];
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          verse_id: verseId,
          content,
          tags,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

/**
 * Hook for fetching reading progress
 *
 * @example
 * const { data, loading, error } = useReadingProgress()
 */
export function useReadingProgress() {
  return useQuery({
    queryKey: ['reading-progress'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reading_progress')
        .select('*')
        .order('last_read_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook for updating reading progress
 *
 * @example
 * const updateProgress = useUpdateProgress()
 * updateProgress.mutate({ book: '1 Nephi', chapter: 1, verse: 5, percentage: 25 })
 */
export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      book,
      chapter,
      verse,
      percentage,
    }: {
      book: string;
      chapter: number;
      verse: number;
      percentage: number;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('reading_progress')
        .upsert(
          {
            user_id: user.id,
            book,
            chapter,
            verse,
            percentage,
            last_read_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,book,chapter',
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-progress'] });
    },
  });
}

/**
 * Hook for fetching cross-references
 *
 * @example
 * const { data, loading, error } = useCrossReferences('verse-id')
 */
export function useCrossReferences(verseId: string) {
  return useQuery({
    queryKey: ['cross-references', verseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cross_references')
        .select(
          `
          *,
          to_verse:verses!to_verse_id(*)
        `
        )
        .eq('from_verse_id', verseId);

      if (error) throw error;
      return data;
    },
    enabled: !!verseId,
  });
}

/**
 * Hook for fetching scripture works
 *
 * @example
 * const { data, loading, error } = useScriptureWorks()
 */
export function useScriptureWorks() {
  return useQuery({
    queryKey: ['scripture-works'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scripture_works')
        .select(
          `
          *,
          editions(*)
        `
        )
        .order('name');

      if (error) throw error;
      return data;
    },
  });
}
