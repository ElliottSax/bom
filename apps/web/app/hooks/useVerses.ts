import { useQuery } from '@tanstack/react-query';
import { type VolumeId, type Verse } from '../lib/types';

async function fetchVerses(volumeId: VolumeId, bookId: string, chapter: number): Promise<Verse[]> {
  const res = await fetch(`/api/verses?volume=${volumeId}&book=${encodeURIComponent(bookId)}&chapter=${chapter}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch verses: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data.verses || [];
}

export function useVerses(volumeId: VolumeId, bookId: string | null, chapter: number | null) {
  return useQuery<Verse[], Error>({
    queryKey: ['verses', volumeId, bookId, chapter],
    queryFn: () => fetchVerses(volumeId, bookId as string, chapter as number),
    enabled: !!bookId && !!chapter,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}