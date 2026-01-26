-- Migration: Add Community of Christ Support
-- Created: 2026-01-26
-- Description: Add CoC-specific fields and tables for D&C sections 114-167, courses, and historical materials

BEGIN;

-- ============================================================================
-- D&C Enhancements for CoC Sections
-- ============================================================================

-- Add tradition field to distinguish shared vs. CoC-specific vs. LDS-specific sections
ALTER TABLE doctrine_covenants_verses
ADD COLUMN IF NOT EXISTS tradition VARCHAR(10) DEFAULT 'shared',
ADD COLUMN IF NOT EXISTS prophet_received VARCHAR(100),
ADD COLUMN IF NOT EXISTS date_received DATE,
ADD COLUMN IF NOT EXISTS conference_date DATE,
ADD COLUMN IF NOT EXISTS controversy_notes TEXT;

-- Index for filtering by tradition
CREATE INDEX IF NOT EXISTS idx_dc_tradition ON doctrine_covenants_verses(tradition);

-- ============================================================================
-- CoC Study Materials Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS coc_study_materials (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  publication_year INT,
  source_url TEXT,
  material_type VARCHAR(50), -- 'saints_herald', 'sermon', 'history', 'modern_curriculum', 'conference_minutes'
  copyright_status VARCHAR(50), -- 'public_domain', 'copyrighted', 'fair_use'
  full_text TEXT,
  summary TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coc_materials_type ON coc_study_materials(material_type);
CREATE INDEX IF NOT EXISTS idx_coc_materials_tags ON coc_study_materials USING GIN(tags);

-- ============================================================================
-- Inspired Version (JST) Changes Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS inspired_version_changes (
  id SERIAL PRIMARY KEY,
  book VARCHAR(100) NOT NULL,
  chapter INT NOT NULL,
  verse INT NOT NULL,
  kjv_text TEXT,
  iv_text TEXT NOT NULL,
  change_type VARCHAR(50), -- 'addition', 'deletion', 'modification', 'clarification'
  significance VARCHAR(20), -- 'minor', 'moderate', 'major'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_iv_changes_book_chapter ON inspired_version_changes(book, chapter);

-- ============================================================================
-- CoC Courses Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS coc_courses (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  level VARCHAR(20), -- 'beginner', 'intermediate', 'advanced'
  duration VARCHAR(50), -- e.g., '2 weeks', '4 weeks'
  lessons_count INT NOT NULL,
  icon VARCHAR(10),
  color VARCHAR(7), -- hex color
  prerequisites TEXT[],
  outcomes TEXT[],
  source_materials TEXT[], -- Array of URLs/references to archive.org, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coc_lessons (
  id VARCHAR(50) PRIMARY KEY,
  course_id VARCHAR(50) NOT NULL REFERENCES coc_courses(id) ON DELETE CASCADE,
  lesson_number INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  lesson_type VARCHAR(20), -- 'reading', 'study', 'quiz', 'reflection'
  description TEXT,
  duration INT, -- minutes
  objectives TEXT[],
  scripture_references JSONB, -- [{book, chapter, verseStart, verseEnd}]
  content TEXT, -- Markdown
  key_terms JSONB, -- [{term, definition}]
  discussion_questions TEXT[],
  historical_context TEXT,
  coc_perspective TEXT,
  historical_materials JSONB, -- [{title, url, type}]
  quiz_questions JSONB, -- [{id, type, question, options, correctAnswer, explanation}]
  application_challenge TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(course_id, lesson_number)
);

CREATE INDEX IF NOT EXISTS idx_coc_lessons_course ON coc_lessons(course_id);

-- ============================================================================
-- User Progress for CoC Courses
-- ============================================================================

CREATE TABLE IF NOT EXISTS coc_course_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL, -- Will link to auth system
  course_id VARCHAR(50) NOT NULL REFERENCES coc_courses(id) ON DELETE CASCADE,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  lessons_completed INT DEFAULT 0,
  total_lessons INT NOT NULL,
  last_lesson_id VARCHAR(50),
  completed_at TIMESTAMP,
  certificate_earned BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS coc_lesson_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id VARCHAR(50) NOT NULL REFERENCES coc_lessons(id) ON DELETE CASCADE,
  course_id VARCHAR(50) NOT NULL REFERENCES coc_courses(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  time_spent INT DEFAULT 0, -- seconds
  quiz_score INT,
  quiz_attempts INT DEFAULT 0,
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_coc_course_progress_user ON coc_course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_coc_lesson_progress_user ON coc_lesson_progress(user_id);

-- ============================================================================
-- CoC Historical Context for Scripture Sections
-- ============================================================================

CREATE TABLE IF NOT EXISTS coc_scripture_context (
  id SERIAL PRIMARY KEY,
  volume VARCHAR(10) NOT NULL, -- 'bom', 'dc', 'ot', 'nt'
  book VARCHAR(100),
  chapter INT,
  section INT, -- For D&C
  context_type VARCHAR(50), -- 'historical', 'theological', 'saints_herald', 'joseph_smith_iii'
  title VARCHAR(255),
  content TEXT NOT NULL,
  source_url TEXT,
  source_type VARCHAR(50), -- 'archive_org', 'centerplace', 'latterdaytruth'
  author VARCHAR(255),
  publication_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coc_context_volume_book ON coc_scripture_context(volume, book, chapter);
CREATE INDEX IF NOT EXISTS idx_coc_context_section ON coc_scripture_context(section) WHERE volume = 'dc';

-- ============================================================================
-- Sample Data: Section 156 (Women's Ordination)
-- ============================================================================

INSERT INTO coc_scripture_context (volume, section, context_type, title, content, source_type)
VALUES (
  'dc',
  156,
  'historical',
  'Section 156: Women''s Ordination (1984)',
  E'Received by President W. Wallace Smith on April 1, 1984, and sustained by World Conference on April 5, 1984.\n\nThis revelation authorized the ordination of women to all offices of priesthood, marking one of the most significant and controversial moments in RLDS/CoC history.\n\n**Historical Context:**\n- Debated since the 1920s\n- Increasing advocacy in 1960s-1970s\n- World Conference discussions: 1978, 1980, 1982\n- First presented to conference April 1984\n\n**Impact:**\n- Sustained by conference vote (April 5, 1984)\n- Led to schism: approximately 50,000 members left\n- Formation of Restoration Branches\n- First women ordained in 1985 (Ginger Barfield, Linda L. Booth, and others)\n- Currently approximately 25% of CoC priesthood are women (2024)\n\n**Key Quote:**\n"The time has come for you to respond to the need for a broader participation of women in the life of the church, including their ordination to priesthood."\n\n**Theological Basis:**\n- Worth of all persons (enduring principle)\n- All are called to ministry\n- Biblical precedent: Deborah, Priscilla, Phoebe, and others\n- Continuing revelation adapts to new understanding',
  'centerplace'
);

-- ============================================================================
-- Sample Data: Enduring Principles
-- ============================================================================

INSERT INTO coc_study_materials (title, author, publication_year, material_type, copyright_status, summary, tags)
VALUES (
  'Enduring Principles',
  'Community of Christ',
  2013,
  'modern_curriculum',
  'copyrighted',
  'Nine enduring principles that guide Community of Christ: Grace and generosity, Sacredness of creation, Continuing revelation, Worth of all persons, All are called, Responsible choices, Pursuit of peace (Shalom), Unity in diversity, Blessings of community.',
  ARRAY['theology', 'mission', 'identity', 'principles']
);

COMMIT;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check new columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'doctrine_covenants_verses'
  AND column_name IN ('tradition', 'prophet_received', 'date_received', 'conference_date');

-- Check new tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'coc_%';

-- Show CoC context
SELECT * FROM coc_scripture_context LIMIT 5;
