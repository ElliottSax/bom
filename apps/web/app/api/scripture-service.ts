import { Verse, SearchResult, VolumeId } from '../lib/types';

export class ScriptureService {
  private static async fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  static async getVerses(
    volumeId: VolumeId,
    book: string,
    chapter: number
  ): Promise<Verse[]> {
    try {
      const data = await this.fetchJson<{ verses?: Verse[] }>(
        `/api/verses?volume=${volumeId}&book=${encodeURIComponent(book)}&chapter=${chapter}`
      );

      return data.verses || [];
    } catch (error) {
      console.error('Error fetching verses:', error);
      return [];
    }
  }

  static async searchVerses(
    query: string,
    volumeId: VolumeId,
    limit: number = 30
  ): Promise<SearchResult[]> {
    if (query.length < 2) {
      return [];
    }

    try {
      const data = await this.fetchJson<{ results?: SearchResult[] }>(
        `/api/search?q=${encodeURIComponent(query)}&volume=${volumeId}&limit=${limit}`
      );

      return data.results || [];
    } catch (error) {
      console.error('Error searching verses:', error);
      return [];
    }
  }
}
