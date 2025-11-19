// Mock scripture data for demonstrations

export interface Verse {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
  scripture: 'book-of-mormon' | 'doctrine-and-covenants' | 'inspired-version';
  themes?: string[];
  mood?: 'hopeful' | 'solemn' | 'commanding' | 'prophetic' | 'peaceful';
}

export interface CrossReference {
  sourceId: string;
  targetId: string;
  type: 'prophecy' | 'fulfillment' | 'thematic' | 'parallel' | 'quotation';
  strength: number; // 0-1
}

export const mockVerses: Verse[] = [
  {
    id: 'v1',
    book: '1 Nephi',
    chapter: 3,
    verse: 7,
    reference: '1 Nephi 3:7',
    scripture: 'book-of-mormon',
    text: 'And it came to pass that I, Nephi, said unto my father: I will go and do the things which the Lord hath commanded, for I know that the Lord giveth no commandments unto the children of men, save he shall prepare a way for them that they may accomplish the thing which he commandeth them.',
    themes: ['faith', 'obedience', 'divine-preparation', 'courage'],
    mood: 'commanding'
  },
  {
    id: 'v2',
    book: '2 Nephi',
    chapter: 2,
    verse: 25,
    reference: '2 Nephi 2:25',
    scripture: 'book-of-mormon',
    text: 'Adam fell that men might be; and men are, that they might have joy.',
    themes: ['purpose', 'joy', 'fall', 'existence'],
    mood: 'hopeful'
  },
  {
    id: 'v3',
    book: 'Mosiah',
    chapter: 2,
    verse: 17,
    reference: 'Mosiah 2:17',
    scripture: 'book-of-mormon',
    text: 'And behold, I tell you these things that ye may learn wisdom; that ye may learn that when ye are in the service of your fellow beings ye are only in the service of your God.',
    themes: ['service', 'wisdom', 'love', 'community'],
    mood: 'peaceful'
  },
  {
    id: 'v4',
    book: 'Alma',
    chapter: 32,
    verse: 21,
    reference: 'Alma 32:21',
    scripture: 'book-of-mormon',
    text: 'And now as I said concerning faith—faith is not to have a perfect knowledge of things; therefore if ye have faith ye hope for things which are not seen, which are true.',
    themes: ['faith', 'hope', 'knowledge', 'truth'],
    mood: 'hopeful'
  },
  {
    id: 'v5',
    book: 'Moroni',
    chapter: 10,
    verse: 32,
    reference: 'Moroni 10:32',
    scripture: 'book-of-mormon',
    text: 'Yea, come unto Christ, and be perfected in him, and deny yourselves of all ungodliness; and if ye shall deny yourselves of all ungodliness, and love God with all your might, mind and strength, then is his grace sufficient for you, that by his grace ye may be perfect in Christ.',
    themes: ['grace', 'perfection', 'christ', 'love'],
    mood: 'hopeful'
  },
  {
    id: 'v6',
    book: 'D&C',
    chapter: 164,
    verse: 9,
    reference: 'D&C 164:9',
    scripture: 'doctrine-and-covenants',
    text: 'The earth, lovingly created as an environment for life to flourish, shudders in distress because creation\'s natural and living systems are becoming exhausted from carrying the burden of human greed and conflict.',
    themes: ['environment', 'stewardship', 'creation', 'peace'],
    mood: 'solemn'
  },
  {
    id: 'v7',
    book: 'D&C',
    chapter: 163,
    verse: 2,
    reference: 'D&C 163:2',
    scripture: 'doctrine-and-covenants',
    text: 'The passionate longing of God\'s heart is that all people might experience peace and joy in diverse and sustainable communities.',
    themes: ['peace', 'joy', 'diversity', 'community', 'inclusion'],
    mood: 'hopeful'
  },
  {
    id: 'v8',
    book: 'D&C',
    chapter: 161,
    verse: 2,
    reference: 'D&C 161:2',
    scripture: 'doctrine-and-covenants',
    text: 'Community of Christ, you are called to be a prophetic people. Courageously challenge exploitation, injustice, and oppression. Seek peace, justice, and reconciliation and be ministers of healing and hope.',
    themes: ['justice', 'peace', 'prophecy', 'healing', 'hope'],
    mood: 'prophetic'
  },
  {
    id: 'v9',
    book: 'John',
    chapter: 3,
    verse: 16,
    reference: 'John 3:16',
    scripture: 'inspired-version',
    text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
    themes: ['love', 'salvation', 'eternal-life', 'faith'],
    mood: 'hopeful'
  },
  {
    id: 'v10',
    book: 'Psalms',
    chapter: 23,
    verse: 1,
    reference: 'Psalms 23:1',
    scripture: 'inspired-version',
    text: 'The Lord is my shepherd; I shall not want.',
    themes: ['trust', 'provision', 'peace', 'god-as-shepherd'],
    mood: 'peaceful'
  },
  {
    id: 'v11',
    book: 'Isaiah',
    chapter: 40,
    verse: 31,
    reference: 'Isaiah 40:31',
    scripture: 'inspired-version',
    text: 'But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.',
    themes: ['strength', 'renewal', 'patience', 'hope'],
    mood: 'hopeful'
  },
  {
    id: 'v12',
    book: 'Matthew',
    chapter: 5,
    verse: 9,
    reference: 'Matthew 5:9',
    scripture: 'inspired-version',
    text: 'Blessed are the peacemakers: for they shall be called the children of God.',
    themes: ['peace', 'blessing', 'peacemaking'],
    mood: 'peaceful'
  }
];

export const mockCrossReferences: CrossReference[] = [
  { sourceId: 'v1', targetId: 'v4', type: 'thematic', strength: 0.8 },
  { sourceId: 'v1', targetId: 'v8', type: 'thematic', strength: 0.7 },
  { sourceId: 'v2', targetId: 'v7', type: 'thematic', strength: 0.9 },
  { sourceId: 'v3', targetId: 'v7', type: 'thematic', strength: 0.85 },
  { sourceId: 'v3', targetId: 'v12', type: 'thematic', strength: 0.9 },
  { sourceId: 'v4', targetId: 'v5', type: 'thematic', strength: 0.8 },
  { sourceId: 'v6', targetId: 'v8', type: 'thematic', strength: 0.75 },
  { sourceId: 'v7', targetId: 'v12', type: 'thematic', strength: 0.85 },
  { sourceId: 'v8', targetId: 'v12', type: 'thematic', strength: 0.9 },
  { sourceId: 'v9', targetId: 'v5', type: 'thematic', strength: 0.8 },
  { sourceId: 'v10', targetId: 'v11', type: 'thematic', strength: 0.7 },
];

// Helper function to get verse by reference
export function getVerseByReference(reference: string): Verse | undefined {
  return mockVerses.find(v => v.reference === reference);
}

// Helper function to get verses by theme
export function getVersesByTheme(theme: string): Verse[] {
  return mockVerses.filter(v => v.themes?.includes(theme));
}

// Helper function to get cross-references for a verse
export function getCrossReferences(verseId: string): CrossReference[] {
  return mockCrossReferences.filter(
    cr => cr.sourceId === verseId || cr.targetId === verseId
  );
}

// Color palettes based on mood
export const moodColors = {
  hopeful: {
    primary: '#3B82F6',
    secondary: '#60A5FA',
    gradient: 'from-blue-400 to-cyan-300',
    bg: 'bg-gradient-to-br from-blue-50 to-cyan-50'
  },
  solemn: {
    primary: '#6366F1',
    secondary: '#818CF8',
    gradient: 'from-indigo-500 to-purple-500',
    bg: 'bg-gradient-to-br from-indigo-50 to-purple-50'
  },
  commanding: {
    primary: '#EF4444',
    secondary: '#F87171',
    gradient: 'from-red-500 to-orange-500',
    bg: 'bg-gradient-to-br from-red-50 to-orange-50'
  },
  prophetic: {
    primary: '#8B5CF6',
    secondary: '#A78BFA',
    gradient: 'from-violet-500 to-purple-500',
    bg: 'bg-gradient-to-br from-violet-50 to-purple-50'
  },
  peaceful: {
    primary: '#10B981',
    secondary: '#34D399',
    gradient: 'from-emerald-400 to-teal-400',
    bg: 'bg-gradient-to-br from-emerald-50 to-teal-50'
  }
};
