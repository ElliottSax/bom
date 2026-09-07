/**
 * Comprehensive Cross-Reference Database
 * Book of Mormon to Bible and internal references
 *
 * Categories:
 * - Isaiah Chapters (2 Nephi 12-24 = Isaiah 2-14)
 * - Sermon on the Mount (3 Nephi 12-14 = Matthew 5-7)
 * - Old Testament Quotes and Parallels
 * - New Testament Parallels
 * - Internal Book of Mormon References
 * - Doctrine & Covenants Connections
 */

export interface CrossReference {
  fromVerseId: string;
  toBook: string;
  toChapter: number;
  toVerse: number;
  type: 'parallel' | 'quote' | 'allusion' | 'related';
  note?: string;
}

export const CROSS_REFERENCES: CrossReference[] = [
  // ============================================================================
  // ISAIAH CHAPTERS - 2 Nephi 12-24 quotes Isaiah 2-14 (~180 verses)
  // ============================================================================

  // 2 Nephi 12 = Isaiah 2
  {
    fromVerseId: 'coc-bom-1908:II Nephi:12:1',
    toBook: 'Isaiah',
    toChapter: 2,
    toVerse: 1,
    type: 'quote',
    note: 'Vision concerning Judah and Jerusalem',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:12:2',
    toBook: 'Isaiah',
    toChapter: 2,
    toVerse: 2,
    type: 'quote',
    note: 'Mountain of the Lord established',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:12:3',
    toBook: 'Isaiah',
    toChapter: 2,
    toVerse: 3,
    type: 'quote',
    note: 'Many people shall come',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:12:4',
    toBook: 'Isaiah',
    toChapter: 2,
    toVerse: 4,
    type: 'quote',
    note: 'Swords into plowshares',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:12:5',
    toBook: 'Isaiah',
    toChapter: 2,
    toVerse: 5,
    type: 'quote',
    note: 'Walk in the light',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:12:6',
    toBook: 'Isaiah',
    toChapter: 2,
    toVerse: 6,
    type: 'quote',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:12:7',
    toBook: 'Isaiah',
    toChapter: 2,
    toVerse: 7,
    type: 'quote',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:12:8',
    toBook: 'Isaiah',
    toChapter: 2,
    toVerse: 8,
    type: 'quote',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:12:9',
    toBook: 'Isaiah',
    toChapter: 2,
    toVerse: 9,
    type: 'quote',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:12:10',
    toBook: 'Isaiah',
    toChapter: 2,
    toVerse: 10,
    type: 'quote',
    note: 'Enter into the rock',
  },

  // 2 Nephi 13 = Isaiah 3
  {
    fromVerseId: 'coc-bom-1908:II Nephi:13:1',
    toBook: 'Isaiah',
    toChapter: 3,
    toVerse: 1,
    type: 'quote',
    note: 'Taking away of stay and staff',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:13:2',
    toBook: 'Isaiah',
    toChapter: 3,
    toVerse: 2,
    type: 'quote',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:13:3',
    toBook: 'Isaiah',
    toChapter: 3,
    toVerse: 3,
    type: 'quote',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:13:12',
    toBook: 'Isaiah',
    toChapter: 3,
    toVerse: 12,
    type: 'quote',
    note: 'Leaders cause thee to err',
  },

  // 2 Nephi 14 = Isaiah 4
  {
    fromVerseId: 'coc-bom-1908:II Nephi:14:2',
    toBook: 'Isaiah',
    toChapter: 4,
    toVerse: 2,
    type: 'quote',
    note: 'Branch of the Lord beautiful',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:14:3',
    toBook: 'Isaiah',
    toChapter: 4,
    toVerse: 3,
    type: 'quote',
    note: 'Called holy',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:14:5',
    toBook: 'Isaiah',
    toChapter: 4,
    toVerse: 5,
    type: 'quote',
    note: 'Cloud and fire upon Zion',
  },

  // 2 Nephi 15 = Isaiah 5
  {
    fromVerseId: 'coc-bom-1908:II Nephi:15:1',
    toBook: 'Isaiah',
    toChapter: 5,
    toVerse: 1,
    type: 'quote',
    note: 'Song of the vineyard',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:15:2',
    toBook: 'Isaiah',
    toChapter: 5,
    toVerse: 2,
    type: 'quote',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:15:7',
    toBook: 'Isaiah',
    toChapter: 5,
    toVerse: 7,
    type: 'quote',
    note: 'Vineyard is house of Israel',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:15:20',
    toBook: 'Isaiah',
    toChapter: 5,
    toVerse: 20,
    type: 'quote',
    note: 'Woe unto them that call evil good',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:15:26',
    toBook: 'Isaiah',
    toChapter: 5,
    toVerse: 26,
    type: 'quote',
    note: 'Ensign to the nations',
  },

  // 2 Nephi 16 = Isaiah 6
  {
    fromVerseId: 'coc-bom-1908:II Nephi:16:1',
    toBook: 'Isaiah',
    toChapter: 6,
    toVerse: 1,
    type: 'quote',
    note: 'I saw the Lord',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:16:3',
    toBook: 'Isaiah',
    toChapter: 6,
    toVerse: 3,
    type: 'quote',
    note: 'Holy, holy, holy',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:16:5',
    toBook: 'Isaiah',
    toChapter: 6,
    toVerse: 5,
    type: 'quote',
    note: 'I am a man of unclean lips',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:16:8',
    toBook: 'Isaiah',
    toChapter: 6,
    toVerse: 8,
    type: 'quote',
    note: 'Here am I; send me',
  },

  // ============================================================================
  // SERMON ON THE MOUNT - 3 Nephi 12-14 parallels Matthew 5-7
  // ============================================================================

  // 3 Nephi 12 = Matthew 5 (Beatitudes and Salt/Light)
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:3',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 3,
    type: 'parallel',
    note: 'Blessed are poor in spirit',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:4',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 4,
    type: 'parallel',
    note: 'Blessed are they that mourn',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:5',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 5,
    type: 'parallel',
    note: 'Blessed are the meek',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:6',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 6,
    type: 'parallel',
    note: 'Hunger after righteousness',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:7',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 7,
    type: 'parallel',
    note: 'Blessed are the merciful',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:8',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 8,
    type: 'parallel',
    note: 'Blessed are pure in heart',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:9',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 9,
    type: 'parallel',
    note: 'Blessed are the peacemakers',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:10',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 10,
    type: 'parallel',
    note: 'Persecuted for righteousness',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:11',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 11,
    type: 'parallel',
    note: 'Reviled for my name',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:13',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 13,
    type: 'parallel',
    note: 'Ye are the salt of earth',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:14',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 14,
    type: 'parallel',
    note: 'Ye are the light of world',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:15',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 15,
    type: 'parallel',
    note: 'City on a hill',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:16',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 16,
    type: 'parallel',
    note: 'Let your light shine',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:21',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 21,
    type: 'parallel',
    note: 'Thou shalt not kill',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:22',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 22,
    type: 'parallel',
    note: 'Angry with brother',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:27',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 27,
    type: 'parallel',
    note: 'Not commit adultery',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:28',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 28,
    type: 'parallel',
    note: 'Looketh to lust',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:38',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 38,
    type: 'parallel',
    note: 'Eye for an eye',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:39',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 39,
    type: 'parallel',
    note: 'Turn the other cheek',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:44',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 44,
    type: 'parallel',
    note: 'Love your enemies',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:12:48',
    toBook: 'Matthew',
    toChapter: 5,
    toVerse: 48,
    type: 'parallel',
    note: 'Be ye therefore perfect',
  },

  // 3 Nephi 13 = Matthew 6 (Alms, Prayer, Fasting, Treasures)
  {
    fromVerseId: 'coc-bom-1908:III Nephi:13:1',
    toBook: 'Matthew',
    toChapter: 6,
    toVerse: 1,
    type: 'parallel',
    note: 'Do not alms before men',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:13:5',
    toBook: 'Matthew',
    toChapter: 6,
    toVerse: 5,
    type: 'parallel',
    note: 'When thou prayest',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:13:6',
    toBook: 'Matthew',
    toChapter: 6,
    toVerse: 6,
    type: 'parallel',
    note: 'Pray to thy Father in secret',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:13:9',
    toBook: 'Matthew',
    toChapter: 6,
    toVerse: 9,
    type: 'parallel',
    note: "The Lord's Prayer - Our Father",
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:13:10',
    toBook: 'Matthew',
    toChapter: 6,
    toVerse: 10,
    type: 'parallel',
    note: 'Thy kingdom come',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:13:11',
    toBook: 'Matthew',
    toChapter: 6,
    toVerse: 11,
    type: 'parallel',
    note: 'Daily bread',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:13:12',
    toBook: 'Matthew',
    toChapter: 6,
    toVerse: 12,
    type: 'parallel',
    note: 'Forgive us our debts',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:13:13',
    toBook: 'Matthew',
    toChapter: 6,
    toVerse: 13,
    type: 'parallel',
    note: 'Lead us not into temptation',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:13:14',
    toBook: 'Matthew',
    toChapter: 6,
    toVerse: 14,
    type: 'parallel',
    note: 'If ye forgive men',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:13:16',
    toBook: 'Matthew',
    toChapter: 6,
    toVerse: 16,
    type: 'parallel',
    note: 'When ye fast',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:13:19',
    toBook: 'Matthew',
    toChapter: 6,
    toVerse: 19,
    type: 'parallel',
    note: 'Lay not up treasures on earth',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:13:20',
    toBook: 'Matthew',
    toChapter: 6,
    toVerse: 20,
    type: 'parallel',
    note: 'Lay up treasures in heaven',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:13:21',
    toBook: 'Matthew',
    toChapter: 6,
    toVerse: 21,
    type: 'parallel',
    note: 'Where your treasure is',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:13:24',
    toBook: 'Matthew',
    toChapter: 6,
    toVerse: 24,
    type: 'parallel',
    note: 'Cannot serve God and mammon',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:13:25',
    toBook: 'Matthew',
    toChapter: 6,
    toVerse: 25,
    type: 'parallel',
    note: 'Take no thought for your life',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:13:26',
    toBook: 'Matthew',
    toChapter: 6,
    toVerse: 26,
    type: 'parallel',
    note: 'Behold the fowls of air',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:13:28',
    toBook: 'Matthew',
    toChapter: 6,
    toVerse: 28,
    type: 'parallel',
    note: 'Consider the lilies',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:13:33',
    toBook: 'Matthew',
    toChapter: 6,
    toVerse: 33,
    type: 'parallel',
    note: 'Seek ye first the kingdom',
  },

  // 3 Nephi 14 = Matthew 7 (Judge not, Ask/Seek/Knock, Golden Rule)
  {
    fromVerseId: 'coc-bom-1908:III Nephi:14:1',
    toBook: 'Matthew',
    toChapter: 7,
    toVerse: 1,
    type: 'parallel',
    note: 'Judge not',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:14:3',
    toBook: 'Matthew',
    toChapter: 7,
    toVerse: 3,
    type: 'parallel',
    note: 'Mote and beam',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:14:6',
    toBook: 'Matthew',
    toChapter: 7,
    toVerse: 6,
    type: 'parallel',
    note: 'Pearls before swine',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:14:7',
    toBook: 'Matthew',
    toChapter: 7,
    toVerse: 7,
    type: 'parallel',
    note: 'Ask, and it shall be given',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:14:8',
    toBook: 'Matthew',
    toChapter: 7,
    toVerse: 8,
    type: 'parallel',
    note: 'He that asketh receiveth',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:14:12',
    toBook: 'Matthew',
    toChapter: 7,
    toVerse: 12,
    type: 'parallel',
    note: 'Golden Rule',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:14:13',
    toBook: 'Matthew',
    toChapter: 7,
    toVerse: 13,
    type: 'parallel',
    note: 'Strait is the gate',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:14:14',
    toBook: 'Matthew',
    toChapter: 7,
    toVerse: 14,
    type: 'parallel',
    note: 'Narrow is the way',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:14:15',
    toBook: 'Matthew',
    toChapter: 7,
    toVerse: 15,
    type: 'parallel',
    note: 'Beware of false prophets',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:14:16',
    toBook: 'Matthew',
    toChapter: 7,
    toVerse: 16,
    type: 'parallel',
    note: 'By their fruits ye shall know',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:14:21',
    toBook: 'Matthew',
    toChapter: 7,
    toVerse: 21,
    type: 'parallel',
    note: 'Not everyone that saith Lord',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:14:24',
    toBook: 'Matthew',
    toChapter: 7,
    toVerse: 24,
    type: 'parallel',
    note: 'Wise man built on rock',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:14:25',
    toBook: 'Matthew',
    toChapter: 7,
    toVerse: 25,
    type: 'parallel',
    note: 'House founded on rock',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:14:26',
    toBook: 'Matthew',
    toChapter: 7,
    toVerse: 26,
    type: 'parallel',
    note: 'Foolish man built on sand',
  },

  // ============================================================================
  // KEY DOCTRINAL PASSAGES - Most Referenced Verses
  // ============================================================================

  // Faith and Prayer
  {
    fromVerseId: 'coc-bom-1908:Alma:32:21',
    toBook: 'Hebrews',
    toChapter: 11,
    toVerse: 1,
    type: 'parallel',
    note: 'Definition of faith',
  },
  {
    fromVerseId: 'coc-bom-1908:Moroni:10:4',
    toBook: 'James',
    toChapter: 1,
    toVerse: 5,
    type: 'related',
    note: 'Ask God in faith',
  },
  {
    fromVerseId: 'coc-bom-1908:Moroni:10:5',
    toBook: 'James',
    toChapter: 1,
    toVerse: 6,
    type: 'related',
    note: 'Ask in faith, nothing wavering',
  },
  {
    fromVerseId: 'coc-bom-1908:Enos:1:4',
    toBook: 'James',
    toChapter: 5,
    toVerse: 16,
    type: 'related',
    note: 'Prayer of a righteous man',
  },

  // Charity and Love
  {
    fromVerseId: 'coc-bom-1908:Moroni:7:45',
    toBook: '1 Corinthians',
    toChapter: 13,
    toVerse: 4,
    type: 'parallel',
    note: 'Charity suffereth long',
  },
  {
    fromVerseId: 'coc-bom-1908:Moroni:7:46',
    toBook: '1 Corinthians',
    toChapter: 13,
    toVerse: 7,
    type: 'parallel',
    note: 'Charity never faileth',
  },
  {
    fromVerseId: 'coc-bom-1908:Moroni:7:47',
    toBook: '1 Corinthians',
    toChapter: 13,
    toVerse: 13,
    type: 'parallel',
    note: 'The pure love of Christ',
  },
  {
    fromVerseId: 'coc-bom-1908:Moroni:7:48',
    toBook: '1 John',
    toChapter: 4,
    toVerse: 18,
    type: 'related',
    note: 'Perfect love casteth out fear',
  },

  // Strength and Weakness
  {
    fromVerseId: 'coc-bom-1908:Ether:12:27',
    toBook: '2 Corinthians',
    toChapter: 12,
    toVerse: 9,
    type: 'related',
    note: 'Weakness made strength',
  },
  {
    fromVerseId: 'coc-bom-1908:Ether:12:27',
    toBook: 'Philippians',
    toChapter: 4,
    toVerse: 13,
    type: 'related',
    note: 'I can do all things through Christ',
  },

  // Foundation on Christ
  {
    fromVerseId: 'coc-bom-1908:Helaman:5:12',
    toBook: 'Matthew',
    toChapter: 7,
    toVerse: 24,
    type: 'related',
    note: 'Building on the rock',
  },
  {
    fromVerseId: 'coc-bom-1908:Helaman:5:12',
    toBook: '1 Corinthians',
    toChapter: 3,
    toVerse: 11,
    type: 'related',
    note: 'Foundation is Christ',
  },
  {
    fromVerseId: 'coc-bom-1908:Helaman:5:12',
    toBook: 'Ephesians',
    toChapter: 2,
    toVerse: 20,
    type: 'related',
    note: 'Christ the chief cornerstone',
  },

  // Obedience and Commandments
  {
    fromVerseId: 'coc-bom-1908:I Nephi:3:7',
    toBook: 'I Nephi',
    toChapter: 17,
    toVerse: 3,
    type: 'related',
    note: 'God prepares a way',
  },
  {
    fromVerseId: 'coc-bom-1908:I Nephi:3:7',
    toBook: 'Philippians',
    toChapter: 4,
    toVerse: 13,
    type: 'related',
    note: 'God enables obedience',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:2:27',
    toBook: 'Deuteronomy',
    toChapter: 30,
    toVerse: 19,
    type: 'related',
    note: 'Choose ye this day',
  },

  // The Fall and Atonement
  {
    fromVerseId: 'coc-bom-1908:II Nephi:2:25',
    toBook: 'Romans',
    toChapter: 5,
    toVerse: 12,
    type: 'related',
    note: 'The Fall of Adam',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:2:25',
    toBook: '1 Corinthians',
    toChapter: 15,
    toVerse: 22,
    type: 'related',
    note: 'In Adam all die, in Christ all live',
  },
  {
    fromVerseId: 'coc-bom-1908:Mosiah:3:7',
    toBook: 'Isaiah',
    toChapter: 53,
    toVerse: 5,
    type: 'quote',
    note: 'Bruised for our iniquities',
  },
  {
    fromVerseId: 'coc-bom-1908:Mosiah:14:4',
    toBook: 'Isaiah',
    toChapter: 53,
    toVerse: 4,
    type: 'quote',
    note: 'He hath borne our griefs',
  },
  {
    fromVerseId: 'coc-bom-1908:Mosiah:14:5',
    toBook: 'Isaiah',
    toChapter: 53,
    toVerse: 5,
    type: 'quote',
    note: 'Wounded for transgressions',
  },

  // Born Again and Conversion
  {
    fromVerseId: 'coc-bom-1908:Mosiah:27:25',
    toBook: 'John',
    toChapter: 3,
    toVerse: 3,
    type: 'related',
    note: 'Born again',
  },
  {
    fromVerseId: 'coc-bom-1908:Mosiah:27:26',
    toBook: 'John',
    toChapter: 3,
    toVerse: 5,
    type: 'related',
    note: 'Born of water and Spirit',
  },
  {
    fromVerseId: 'coc-bom-1908:Alma:5:14',
    toBook: '2 Corinthians',
    toChapter: 5,
    toVerse: 17,
    type: 'related',
    note: 'New creature in Christ',
  },
  {
    fromVerseId: 'coc-bom-1908:Mosiah:5:2',
    toBook: 'Ezekiel',
    toChapter: 36,
    toVerse: 26,
    type: 'related',
    note: 'New heart',
  },

  // Service and Compassion
  {
    fromVerseId: 'coc-bom-1908:Mosiah:18:8',
    toBook: 'Galatians',
    toChapter: 6,
    toVerse: 2,
    type: 'related',
    note: 'Bear one another burdens',
  },
  {
    fromVerseId: 'coc-bom-1908:Mosiah:18:9',
    toBook: 'Romans',
    toChapter: 12,
    toVerse: 15,
    type: 'related',
    note: 'Mourn with those that mourn',
  },
  {
    fromVerseId: 'coc-bom-1908:Mosiah:2:17',
    toBook: 'Matthew',
    toChapter: 25,
    toVerse: 40,
    type: 'related',
    note: 'Service to others is service to God',
  },
  {
    fromVerseId: 'coc-bom-1908:Mosiah:4:26',
    toBook: '2 Corinthians',
    toChapter: 9,
    toVerse: 7,
    type: 'related',
    note: 'Cheerful giver',
  },

  // Pride and Humility
  {
    fromVerseId: 'coc-bom-1908:Mosiah:3:19',
    toBook: 'Matthew',
    toChapter: 18,
    toVerse: 3,
    type: 'related',
    note: 'Become as a child',
  },
  {
    fromVerseId: 'coc-bom-1908:Mosiah:3:19',
    toBook: 'James',
    toChapter: 4,
    toVerse: 6,
    type: 'related',
    note: 'God resisteth the proud',
  },
  {
    fromVerseId: 'coc-bom-1908:Alma:26:12',
    toBook: 'Jeremiah',
    toChapter: 9,
    toVerse: 24,
    type: 'related',
    note: 'Boast in the Lord',
  },

  // Judgment and Justice
  {
    fromVerseId: 'coc-bom-1908:Alma:41:10',
    toBook: 'Galatians',
    toChapter: 6,
    toVerse: 7,
    type: 'related',
    note: 'Whatsoever a man soweth',
  },
  {
    fromVerseId: 'coc-bom-1908:Mosiah:2:38',
    toBook: 'Romans',
    toChapter: 6,
    toVerse: 23,
    type: 'related',
    note: 'Wages of sin is death',
  },

  // Grace and Works
  {
    fromVerseId: 'coc-bom-1908:II Nephi:25:23',
    toBook: 'Ephesians',
    toChapter: 2,
    toVerse: 8,
    type: 'related',
    note: 'By grace ye are saved',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:25:23',
    toBook: 'James',
    toChapter: 2,
    toVerse: 17,
    type: 'related',
    note: 'Faith without works is dead',
  },

  // The Holy Ghost
  {
    fromVerseId: 'coc-bom-1908:II Nephi:32:5',
    toBook: 'John',
    toChapter: 14,
    toVerse: 26,
    type: 'related',
    note: 'Holy Ghost teaches all things',
  },
  {
    fromVerseId: 'coc-bom-1908:Moroni:10:5',
    toBook: 'John',
    toChapter: 16,
    toVerse: 13,
    type: 'related',
    note: 'Spirit guides into truth',
  },

  // Endure to the End
  {
    fromVerseId: 'coc-bom-1908:II Nephi:31:20',
    toBook: 'Matthew',
    toChapter: 10,
    toVerse: 22,
    type: 'related',
    note: 'Endure to the end',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:31:20',
    toBook: 'Revelation',
    toChapter: 2,
    toVerse: 10,
    type: 'related',
    note: 'Faithful unto death',
  },

  // Scriptures and Word of God
  {
    fromVerseId: 'coc-bom-1908:II Nephi:32:3',
    toBook: 'John',
    toChapter: 6,
    toVerse: 63,
    type: 'related',
    note: 'Words are spirit and life',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:32:3',
    toBook: '2 Timothy',
    toChapter: 3,
    toVerse: 16,
    type: 'related',
    note: 'Scripture is profitable',
  },
  {
    fromVerseId: 'coc-bom-1908:Alma:37:44',
    toBook: 'Psalm',
    toChapter: 119,
    toVerse: 105,
    type: 'related',
    note: 'Word is a light',
  },

  // Prophecy and Testimony
  {
    fromVerseId: 'coc-bom-1908:Alma:37:6',
    toBook: '1 Corinthians',
    toChapter: 1,
    toVerse: 27,
    type: 'related',
    note: 'Small means bring great things',
  },
  {
    fromVerseId: 'coc-bom-1908:I Nephi:19:23',
    toBook: '2 Peter',
    toChapter: 1,
    toVerse: 20,
    type: 'related',
    note: 'No private interpretation',
  },

  // Gathering of Israel
  {
    fromVerseId: 'coc-bom-1908:I Nephi:22:10',
    toBook: 'Isaiah',
    toChapter: 11,
    toVerse: 12,
    type: 'related',
    note: 'Ensign to gather Israel',
  },
  {
    fromVerseId: 'coc-bom-1908:I Nephi:15:20',
    toBook: 'Romans',
    toChapter: 11,
    toVerse: 17,
    type: 'related',
    note: 'Grafted into olive tree',
  },

  // Last Days and Second Coming
  {
    fromVerseId: 'coc-bom-1908:Mormon:8:35',
    toBook: '2 Timothy',
    toChapter: 3,
    toVerse: 2,
    type: 'related',
    note: 'Perilous times in last days',
  },
  {
    fromVerseId: 'coc-bom-1908:III Nephi:21:23',
    toBook: 'Isaiah',
    toChapter: 52,
    toVerse: 7,
    type: 'quote',
    note: 'How beautiful upon mountains',
  },

  // ============================================================================
  // INTERNAL BOOK OF MORMON REFERENCES
  // ============================================================================

  // Key promises and themes
  {
    fromVerseId: 'coc-bom-1908:I Nephi:3:7',
    toBook: 'I Nephi',
    toChapter: 17,
    toVerse: 3,
    type: 'related',
    note: 'God prepares a way - repeated promise',
  },
  {
    fromVerseId: 'coc-bom-1908:Alma:37:35',
    toBook: 'Alma',
    toChapter: 38,
    toVerse: 12,
    type: 'related',
    note: 'Bridle your passions',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:28:30',
    toBook: 'Alma',
    toChapter: 12,
    toVerse: 9,
    type: 'related',
    note: 'Line upon line',
  },
  {
    fromVerseId: 'coc-bom-1908:Alma:32:28',
    toBook: 'Alma',
    toChapter: 33,
    toVerse: 1,
    type: 'related',
    note: 'Plant the seed',
  },

  // Christ's appearance prophecies
  {
    fromVerseId: 'coc-bom-1908:I Nephi:11:13',
    toBook: 'III Nephi',
    toChapter: 11,
    toVerse: 8,
    type: 'related',
    note: 'Christ appears to Nephites',
  },
  {
    fromVerseId: 'coc-bom-1908:II Nephi:26:1',
    toBook: 'III Nephi',
    toChapter: 8,
    toVerse: 5,
    type: 'related',
    note: 'Signs of Christ death',
  },

  // Tree of Life vision connections
  {
    fromVerseId: 'coc-bom-1908:I Nephi:8:10',
    toBook: 'I Nephi',
    toChapter: 11,
    toVerse: 21,
    type: 'related',
    note: 'Tree of Life represents God love',
  },
  {
    fromVerseId: 'coc-bom-1908:I Nephi:8:20',
    toBook: 'I Nephi',
    toChapter: 15,
    toVerse: 23,
    type: 'related',
    note: 'Rod of Iron is word of God',
  },

  // Brother of Jared faith
  {
    fromVerseId: 'coc-bom-1908:Ether:3:9',
    toBook: 'Ether',
    toChapter: 12,
    toVerse: 19,
    type: 'related',
    note: 'Brother of Jared saw Christ',
  },

  // ============================================================================
  // ADDITIONAL OLD TESTAMENT PARALLELS
  // ============================================================================

  {
    fromVerseId: 'coc-bom-1908:Jacob:5:3',
    toBook: 'Isaiah',
    toChapter: 5,
    toVerse: 1,
    type: 'quote',
    note: 'Allegory of olive tree from Zenos',
  },
  {
    fromVerseId: 'coc-bom-1908:I Nephi:20:1',
    toBook: 'Isaiah',
    toChapter: 48,
    toVerse: 1,
    type: 'quote',
    note: 'Isaiah 48 quoted',
  },
  {
    fromVerseId: 'coc-bom-1908:I Nephi:21:1',
    toBook: 'Isaiah',
    toChapter: 49,
    toVerse: 1,
    type: 'quote',
    note: 'Isaiah 49 quoted',
  },
];

// Build index for fast lookup
export const crossRefsByFrom = new Map<string, CrossReference[]>();
CROSS_REFERENCES.forEach((ref) => {
  const existing = crossRefsByFrom.get(ref.fromVerseId) || [];
  existing.push(ref);
  crossRefsByFrom.set(ref.fromVerseId, existing);
});

export function formatCrossReference(ref: CrossReference): string {
  return `${ref.toBook} ${ref.toChapter}:${ref.toVerse}`;
}

export function getCrossRefTypeLabel(type: CrossReference['type']): string {
  switch (type) {
    case 'quote':
      return 'Quote';
    case 'parallel':
      return 'Parallel';
    case 'allusion':
      return 'Allusion';
    case 'related':
      return 'Related';
    default:
      return 'Reference';
  }
}

export function getCrossRefTypeColor(type: CrossReference['type']): string {
  switch (type) {
    case 'quote':
      return '#2196f3';
    case 'parallel':
      return '#4caf50';
    case 'allusion':
      return '#ff9800';
    case 'related':
      return '#9c27b0';
    default:
      return '#666666';
  }
}
