'use client';

import { useState, useEffect } from 'react';

export interface DailyVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
}

const CURATED_VERSES: Omit<DailyVerse, 'reference'>[] = [
  {
    book: 'I Nephi',
    chapter: 3,
    verse: 7,
    text: 'And it came to pass that I, Nephi, said unto my father, I will go and do the things which the Lord hath commanded, for I know that the Lord giveth no commandments unto the children of men, save he shall prepare a way for them that they may accomplish the thing which he commandeth them.',
  },
  {
    book: 'II Nephi',
    chapter: 2,
    verse: 25,
    text: 'Adam fell that men might be; and men are, that they might have joy.',
  },
  {
    book: 'II Nephi',
    chapter: 4,
    verse: 34,
    text: 'O Lord, I have trusted in thee, and I will trust in thee forever. I will not put my trust in the arm of flesh; for I know that cursed is he that putteth his trust in the arm of flesh.',
  },
  {
    book: 'II Nephi',
    chapter: 28,
    verse: 30,
    text: 'For behold, thus saith the Lord God: I will give unto the children of men line upon line, precept upon precept, here a little and there a little.',
  },
  {
    book: 'II Nephi',
    chapter: 31,
    verse: 20,
    text: 'Wherefore, ye must press forward with a steadfastness in Christ, having a perfect brightness of hope, and a love of God and of all men.',
  },
  {
    book: 'II Nephi',
    chapter: 32,
    verse: 3,
    text: 'Angels speak by the power of the Holy Ghost; wherefore, they speak the words of Christ. Wherefore, I said unto you, Feast upon the words of Christ; for behold, the words of Christ will tell you all things what ye should do.',
  },
  {
    book: 'Jacob',
    chapter: 2,
    verse: 17,
    text: 'Think of your brethren like unto yourselves, and be familiar with all and free with your substance, that they may be rich like unto you.',
  },
  {
    book: 'Mosiah',
    chapter: 2,
    verse: 17,
    text: 'And behold, I tell you these things that ye may learn wisdom; that ye may learn that when ye are in the service of your fellow beings ye are only in the service of your God.',
  },
  {
    book: 'Mosiah',
    chapter: 3,
    verse: 19,
    text: 'For the natural man is an enemy to God, and has been from the fall of Adam, and will be, forever and ever, unless he yields to the enticings of the Holy Spirit, and putteth off the natural man.',
  },
  {
    book: 'Mosiah',
    chapter: 4,
    verse: 27,
    text: 'And see that all these things are done in wisdom and order; for it is not requisite that a man should run faster than he has strength.',
  },
  {
    book: 'Mosiah',
    chapter: 18,
    verse: 8,
    text: "And now, as ye are desirous to come into the fold of God, and to be called his people, and are willing to bear one another's burdens, that they may be light.",
  },
  {
    book: 'Mosiah',
    chapter: 18,
    verse: 9,
    text: 'Yea, and are willing to mourn with those that mourn; yea, and comfort those that stand in need of comfort, and to stand as witnesses of God at all times and in all things.',
  },
  {
    book: 'Alma',
    chapter: 5,
    verse: 26,
    text: 'And now behold, I say unto you, my brethren, if ye have experienced a change of heart, and if ye have felt to sing the song of redeeming love, I would ask, can ye feel so now?',
  },
  {
    book: 'Alma',
    chapter: 7,
    verse: 11,
    text: 'And he shall go forth, suffering pains and afflictions and temptations of every kind; and this that the word might be fulfilled which saith he will take upon him the pains and the sicknesses of his people.',
  },
  {
    book: 'Alma',
    chapter: 26,
    verse: 12,
    text: 'Yea, I know that I am nothing; as to my strength I am weak; therefore I will not boast of myself, but I will boast of my God, for in his strength I can do all things.',
  },
  {
    book: 'Helaman',
    chapter: 5,
    verse: 12,
    text: 'And now, my sons, remember, remember that it is upon the rock of our Redeemer, who is Christ, the Son of God, that ye must build your foundation.',
  },
  {
    book: 'III Nephi',
    chapter: 11,
    verse: 29,
    text: 'For verily, verily I say unto you, he that hath the spirit of contention is not of me, but is of the devil, who is the father of contention.',
  },
  {
    book: 'III Nephi',
    chapter: 12,
    verse: 48,
    text: 'Therefore I would that ye should be perfect even as I, or your Father who is in heaven is perfect.',
  },
  {
    book: 'III Nephi',
    chapter: 13,
    verse: 33,
    text: 'But seek ye first the kingdom of God and his righteousness, and all these things shall be added unto you.',
  },
  {
    book: 'III Nephi',
    chapter: 18,
    verse: 20,
    text: 'And whatsoever ye shall ask the Father in my name, which is right, believing that ye shall receive, behold it shall be given unto you.',
  },
  {
    book: 'Ether',
    chapter: 12,
    verse: 4,
    text: 'Wherefore, whoso believeth in God might with surety hope for a better world, yea, even a place at the right hand of God, which hope cometh of faith, maketh an anchor to the souls of men.',
  },
  {
    book: 'Ether',
    chapter: 12,
    verse: 27,
    text: 'And if men come unto me I will show unto them their weakness. I give unto men weakness that they may be humble; and my grace is sufficient for all men that humble themselves before me.',
  },
  {
    book: 'Moroni',
    chapter: 7,
    verse: 45,
    text: 'And charity suffereth long, and is kind, and envieth not, and is not puffed up, seeketh not her own, is not easily provoked, thinketh no evil, and rejoiceth not in iniquity but rejoiceth in the truth.',
  },
  {
    book: 'Moroni',
    chapter: 7,
    verse: 47,
    text: 'But charity is the pure love of Christ, and it endureth forever; and whoso is found possessed of it at the last day, it shall be well with him.',
  },
  {
    book: 'Moroni',
    chapter: 7,
    verse: 48,
    text: 'Wherefore, my beloved brethren, pray unto the Father with all the energy of heart, that ye may be filled with this love, which he hath bestowed upon all who are true followers of his Son, Jesus Christ.',
  },
  {
    book: 'Moroni',
    chapter: 10,
    verse: 4,
    text: 'And when ye shall receive these things, I would exhort you that ye would ask God, the Eternal Father, in the name of Christ, if these things are not true.',
  },
  {
    book: 'Moroni',
    chapter: 10,
    verse: 5,
    text: 'And by the power of the Holy Ghost ye may know the truth of all things.',
  },
];

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

function getVerseForDay(dayOfYear: number): DailyVerse {
  const index = dayOfYear % CURATED_VERSES.length;
  const v = CURATED_VERSES[index];
  return { ...v, reference: `${v.book} ${v.chapter}:${v.verse}` };
}

export function useDailyVerse() {
  const [verse, setVerse] = useState<DailyVerse>(() => getVerseForDay(getDayOfYear()));

  useEffect(() => {
    setVerse(getVerseForDay(getDayOfYear()));
  }, []);

  const refresh = () => setVerse(getVerseForDay(getDayOfYear()));

  return { verse, refresh };
}
