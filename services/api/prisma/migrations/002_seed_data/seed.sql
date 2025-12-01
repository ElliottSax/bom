-- Community of Christ Scripture Study Tools - Seed Data
-- Scripture Works, Editions, and Sample Verses

-- ============================================================================
-- Scripture Works
-- ============================================================================

INSERT INTO scripture_works (id, name, abbreviation, description, "createdAt", "updatedAt") VALUES
('book-of-mormon', 'Book of Mormon', 'BoM', 'An ancient record of God''s dealings with the people in the Americas, translated by Joseph Smith Jr.', NOW(), NOW()),
('doctrine-and-covenants', 'Doctrine and Covenants', 'D&C', 'Modern revelations received by prophets of the Restoration movement, including Joseph Smith and subsequent Community of Christ prophets', NOW(), NOW()),
('bible', 'Holy Scriptures', 'Bible', 'The Bible, including the Inspired Version (Joseph Smith Translation) and modern translations', NOW(), NOW());

-- ============================================================================
-- Editions
-- ============================================================================

INSERT INTO editions (id, "workId", name, "shortName", publisher, year, language, "versificationSystem", description, "isPublicDomain", "copyrightHolder", "licenseNotes", "isDefault", "isPrimary", "displayOrder", "createdAt", "updatedAt") VALUES
('coc-bom-1908', 'book-of-mormon', 'Community of Christ Book of Mormon (1908)', 'CoC BoM', 'Herald Publishing House', 1908, 'en', 'original-chapters-1830', 'Community of Christ edition using original 1830 chapter divisions', true, NULL, 'Public domain - based on 1830 original edition', true, true, 1, NOW(), NOW()),
('lds-bom-2013', 'book-of-mormon', 'LDS Book of Mormon (2013)', 'LDS BoM', 'The Church of Jesus Christ of Latter-day Saints', 2013, 'en', 'pratt-1879', 'LDS edition using Orson Pratt''s 1879 versification system', true, 'The Church of Jesus Christ of Latter-day Saints', 'Public domain text, formatting and footnotes © LDS Church', false, false, 2, NOW(), NOW()),
('coc-dc-2017', 'doctrine-and-covenants', 'Community of Christ Doctrine and Covenants (2017)', 'CoC D&C', 'Herald Publishing House', 2017, 'en', 'coc-section-numbering', 'Community of Christ D&C with 167 sections (sections 114-167 are CoC-specific revelations)', false, 'Community of Christ', 'Sections 1-113 public domain, sections 114-167 © Community of Christ', true, true, 1, NOW(), NOW()),
('lds-dc-2013', 'doctrine-and-covenants', 'LDS Doctrine and Covenants (2013)', 'LDS D&C', 'The Church of Jesus Christ of Latter-day Saints', 2013, 'en', 'lds-section-numbering', 'LDS D&C with 138 sections (numbering diverges from CoC after section 2)', false, 'The Church of Jesus Christ of Latter-day Saints', 'Public domain early sections, modern formatting © LDS Church', false, false, 2, NOW(), NOW()),
('iv-bible-1867', 'bible', 'Inspired Version (Joseph Smith Translation) - 1867 Edition', 'IV / JST', 'Herald Publishing House (originally RLDS Church)', 1867, 'en', 'kjv-with-jst-variants', 'Joseph Smith''s inspired revision of the King James Bible, first published by RLDS Church in 1867', true, NULL, 'Public domain - 1867 edition', true, true, 1, NOW(), NOW()),
('nrsv-1989', 'bible', 'New Revised Standard Version (1989)', 'NRSV', 'National Council of Churches', 1989, 'en', 'standard-protestant', 'Recommended by Community of Christ as a modern scholarly translation', false, 'National Council of Churches of Christ in the USA', '© National Council of Churches - License required for distribution', false, true, 2, NOW(), NOW());

-- ============================================================================
-- Sample CoC Book of Mormon Verses
-- ============================================================================

INSERT INTO verses (id, "editionId", book, chapter, verse, text, "verseType") VALUES
('coc-bom-1908:1-nephi-1-1', 'coc-bom-1908', 'I Nephi', 1, 1, 'I, Nephi, having been born of goodly parents, therefore I was taught somewhat in all the learning of my father; and having seen many afflictions in the course of my days—nevertheless, having been highly favored of the Lord in all my days; yea, having had a great knowledge of the goodness and the mysteries of God, therefore I make a record of my proceedings in my days;', 'standard'),
('coc-bom-1908:1-nephi-1-2', 'coc-bom-1908', 'I Nephi', 1, 2, 'Yea, I make a record in the language of my father, which consists of the learning of the Jews and the language of the Egyptians.', 'standard'),
('coc-bom-1908:1-nephi-1-3', 'coc-bom-1908', 'I Nephi', 1, 3, 'And I know that the record which I make is true; and I make it with mine own hand; and I make it according to my knowledge.', 'standard'),
('coc-bom-1908:iii-nephi-5-8', 'coc-bom-1908', 'III Nephi', 5, 8, 'And it came to pass that when they heard this voice, and beheld that it was not a voice of thunder, neither was it a voice of a great tumultuous noise, but behold, it was a still voice of perfect mildness, as if it had been a whisper, and it did pierce even to the very soul—', 'standard'),
('coc-bom-1908:iii-nephi-5-9', 'coc-bom-1908', 'III Nephi', 5, 9, 'And notwithstanding the mildness of the voice, behold the earth shook exceedingly, and the walls of the temple trembled again, as if it were about to tumble to the earth; and again the third time they did hear the voice, and did open their ears to hear it;', 'standard'),
('coc-bom-1908:moroni-10-4', 'coc-bom-1908', 'Moroni', 10, 4, 'And when ye shall receive these things, I would exhort you that ye would ask God, the Eternal Father, in the name of Christ, if these things are not true; and if ye shall ask with a sincere heart, with real intent, having faith in Christ, he will manifest the truth of it unto you, by the power of the Holy Ghost;', 'standard'),
('coc-bom-1908:moroni-10-5', 'coc-bom-1908', 'Moroni', 10, 5, 'And by the power of the Holy Ghost ye may know the truth of all things.', 'standard');

-- ============================================================================
-- Sample LDS Book of Mormon Verses (for cross-reference testing)
-- ============================================================================

INSERT INTO verses (id, "editionId", book, chapter, verse, text, "verseType") VALUES
('lds-bom-2013:1-nephi-3-7', 'lds-bom-2013', '1 Nephi', 3, 7, 'And it came to pass that I, Nephi, said unto my father: I will go and do the things which the Lord hath commanded, for I know that the Lord giveth no commandments unto the children of men, save he shall prepare a way for them that they may accomplish the thing which he commandeth them.', 'standard'),
('lds-bom-2013:3-nephi-11-7', 'lds-bom-2013', '3 Nephi', 11, 7, 'Behold my Beloved Son, in whom I am well pleased, in whom I have glorified my name—hear ye him.', 'standard');

-- ============================================================================
-- Verse Mappings (CoC ↔ LDS)
-- ============================================================================

INSERT INTO verse_mappings (id, "fromVerseId", "toVerseId", "mappingType", confidence, verified, notes, "createdAt", "updatedAt") VALUES
('vm-1', 'coc-bom-1908:1-nephi-1-1', 'lds-bom-2013:1-nephi-3-7', 'exact', 1.0, true, '1 Nephi 3:7 is the same in both editions - chapters align', NOW(), NOW()),
('vm-2', 'coc-bom-1908:iii-nephi-5-8', 'lds-bom-2013:3-nephi-11-7', 'exact', 1.0, true, 'CoC III Nephi 5:8 corresponds to LDS 3 Nephi 11:7 - different chapter divisions', NOW(), NOW());
