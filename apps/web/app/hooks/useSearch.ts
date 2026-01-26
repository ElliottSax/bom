import { useQuery } from '@tanstack/react-query';
import { type VolumeId, type SearchResult } from '../lib/types';

async function searchScriptures(query: string, volumeId: VolumeId, limit: number): Promise<SearchResult[]> {
  if (query.length < 2) return [];
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&volume=${volumeId}&limit=${limit}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch search results: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data.results || [];
}

export function useSearch(searchQuery: string, volumeId: VolumeId, limit: number = 30) {
  return useQuery<SearchResult[], Error>({
    queryKey: ['search', searchQuery, volumeId, limit],
    queryFn: () => searchScriptures(searchQuery, volumeId, limit),
    enabled: searchQuery.length >= 2,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData,
  });
}