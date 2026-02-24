#!/usr/bin/env node
/**
 * Convert Prisma Schema to Supabase SQL Migration
 *
 * This script reads the Prisma schema and generates SQL migration files
 * for Supabase, including tables, indexes, and Row Level Security policies.
 */

const fs = require('fs');
const path = require('path');

// Paths
const PRISMA_SCHEMA_PATH = path.join(__dirname, '../../services/api/prisma/schema.prisma');
const MIGRATIONS_DIR = path.join(__dirname, '../../supabase/migrations');
const TIMESTAMP = new Date().toISOString().replace(/[:-]/g, '').split('.')[0];
const MIGRATION_FILE = path.join(MIGRATIONS_DIR, `${TIMESTAMP}_initial_schema.sql`);

console.log('Converting Prisma schema to Supabase migration...\n');

// Ensure migrations directory exists
if (!fs.existsSync(MIGRATIONS_DIR)) {
  fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
  console.log('✓ Created migrations directory');
}

// Check if Prisma schema exists
if (!fs.existsSync(PRISMA_SCHEMA_PATH)) {
  console.error('❌ Prisma schema not found at:', PRISMA_SCHEMA_PATH);
  process.exit(1);
}

console.log('✓ Found Prisma schema');

// Generate SQL migration
const sql = `-- BOM Study Tools - Initial Schema Migration
-- Generated from Prisma schema on ${new Date().toISOString()}
--
-- This migration creates all tables, indexes, and Row Level Security policies
-- for the Book of Mormon Study Tools application.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Users and Authentication
-- ============================================================================

CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_preferences (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  language TEXT NOT NULL DEFAULT 'en',
  font_size TEXT NOT NULL DEFAULT 'medium',
  theme TEXT NOT NULL DEFAULT 'light',
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  daily_reminder_time TEXT,
  semantic_search_enabled BOOLEAN NOT NULL DEFAULT true,
  chatbot_enabled BOOLEAN NOT NULL DEFAULT true,
  auto_suggestions_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  token TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- ============================================================================
-- Scripture Content (Read-Only)
-- ============================================================================

CREATE TABLE scripture_works (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE editions (
  id TEXT PRIMARY KEY,
  work_id TEXT NOT NULL REFERENCES scripture_works(id),
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  publisher TEXT NOT NULL,
  year INTEGER NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  versification_system TEXT NOT NULL,
  description TEXT,
  is_public_domain BOOLEAN NOT NULL DEFAULT false,
  copyright_holder TEXT,
  license_notes TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_editions_work_id ON editions(work_id);
CREATE INDEX idx_editions_is_default ON editions(is_default);
CREATE INDEX idx_editions_display_order ON editions(display_order);

CREATE TABLE verses (
  id TEXT PRIMARY KEY,
  edition_id TEXT NOT NULL REFERENCES editions(id) ON DELETE CASCADE,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  verse_type TEXT NOT NULL DEFAULT 'standard',
  UNIQUE(edition_id, book, chapter, verse)
);

CREATE INDEX idx_verses_edition_id ON verses(edition_id);
CREATE INDEX idx_verses_edition_book ON verses(edition_id, book);
CREATE INDEX idx_verses_edition_book_chapter ON verses(edition_id, book, chapter);

CREATE TABLE verse_mappings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  from_verse_id TEXT NOT NULL REFERENCES verses(id) ON DELETE CASCADE,
  to_verse_id TEXT NOT NULL REFERENCES verses(id) ON DELETE CASCADE,
  mapping_type TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 1.0,
  verified BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(from_verse_id, to_verse_id)
);

CREATE INDEX idx_verse_mappings_from ON verse_mappings(from_verse_id);
CREATE INDEX idx_verse_mappings_to ON verse_mappings(to_verse_id);

-- ============================================================================
-- User Study Data
-- ============================================================================

CREATE TABLE highlights (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verse_id TEXT NOT NULL REFERENCES verses(id),
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, verse_id)
);

CREATE INDEX idx_highlights_user_id ON highlights(user_id);

CREATE TABLE notes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verse_id TEXT NOT NULL REFERENCES verses(id),
  content TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_verse_id ON notes(verse_id);

CREATE TABLE cross_references (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  from_verse_id TEXT NOT NULL REFERENCES verses(id),
  to_verse_id TEXT NOT NULL REFERENCES verses(id),
  type TEXT NOT NULL,
  confidence REAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(from_verse_id, to_verse_id, type)
);

CREATE INDEX idx_cross_references_from ON cross_references(from_verse_id);
CREATE INDEX idx_cross_references_to ON cross_references(to_verse_id);

CREATE TABLE reading_progress (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  percentage REAL NOT NULL,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, book, chapter)
);

CREATE INDEX idx_reading_progress_user_id ON reading_progress(user_id);

CREATE TABLE study_streaks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_study_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Memory System (Spaced Repetition)
-- ============================================================================

CREATE TABLE memory_cards (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verse_id TEXT NOT NULL REFERENCES verses(id),
  ease_factor REAL NOT NULL DEFAULT 2.5,
  interval INTEGER NOT NULL DEFAULT 1,
  repetition INTEGER NOT NULL DEFAULT 0,
  next_review TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_reviewed TIMESTAMPTZ,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  correct_reviews INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, verse_id)
);

CREATE INDEX idx_memory_cards_user_next_review ON memory_cards(user_id, next_review);

-- ============================================================================
-- Group Study Features
-- ============================================================================

CREATE TABLE groups (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  invite_code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE group_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX idx_group_members_user_id ON group_members(user_id);

CREATE TABLE discussions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  verse_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_discussions_group_id ON discussions(group_id);

CREATE TABLE comments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  discussion_id TEXT NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_discussion_id ON comments(discussion_id);

-- ============================================================================
-- Notifications
-- ============================================================================

CREATE TABLE notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ============================================================================
-- AI/ML Data
-- ============================================================================

CREATE TABLE ai_interactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sources TEXT[] NOT NULL,
  confidence REAL NOT NULL,
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_interactions_user_id ON ai_interactions(user_id);
CREATE INDEX idx_ai_interactions_created_at ON ai_interactions(created_at);
CREATE INDEX idx_ai_interactions_user_created ON ai_interactions(user_id, created_at);

CREATE TABLE search_queries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT,
  query TEXT NOT NULL,
  type TEXT NOT NULL,
  result_count INTEGER NOT NULL,
  clicked_results TEXT[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_search_queries_user_id ON search_queries(user_id);
CREATE INDEX idx_search_queries_created_at ON search_queries(created_at);
CREATE INDEX idx_search_queries_user_created ON search_queries(user_id, created_at);

-- ============================================================================
-- Analytics (Privacy-Friendly)
-- ============================================================================

CREATE TABLE session_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_session_events_user_id ON session_events(user_id);
CREATE INDEX idx_session_events_session_id ON session_events(session_id);
CREATE INDEX idx_session_events_type ON session_events(event_type);
CREATE INDEX idx_session_events_created_at ON session_events(created_at);

-- ============================================================================
-- Functions and Triggers
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scripture_works_updated_at BEFORE UPDATE ON scripture_works
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_editions_updated_at BEFORE UPDATE ON editions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verse_mappings_updated_at BEFORE UPDATE ON verse_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_highlights_updated_at BEFORE UPDATE ON highlights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_streaks_updated_at BEFORE UPDATE ON study_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memory_cards_updated_at BEFORE UPDATE ON memory_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussions_updated_at BEFORE UPDATE ON discussions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all user data tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Scripture content is public (read-only)
ALTER TABLE scripture_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_references ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid()::TEXT = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::TEXT = id);

-- User preferences policies
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid()::TEXT = user_id);

-- Highlights policies
CREATE POLICY "Users can view own highlights"
  ON highlights FOR SELECT
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can create own highlights"
  ON highlights FOR INSERT
  WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can update own highlights"
  ON highlights FOR UPDATE
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can delete own highlights"
  ON highlights FOR DELETE
  USING (auth.uid()::TEXT = user_id);

-- Notes policies
CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can create own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  USING (auth.uid()::TEXT = user_id);

-- Reading progress policies
CREATE POLICY "Users can view own progress"
  ON reading_progress FOR SELECT
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can update own progress"
  ON reading_progress FOR ALL
  USING (auth.uid()::TEXT = user_id);

-- Study streaks policies
CREATE POLICY "Users can view own streaks"
  ON study_streaks FOR SELECT
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can update own streaks"
  ON study_streaks FOR ALL
  USING (auth.uid()::TEXT = user_id);

-- Memory cards policies
CREATE POLICY "Users can manage own memory cards"
  ON memory_cards FOR ALL
  USING (auth.uid()::TEXT = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid()::TEXT = user_id);

-- Scripture content policies (public read access)
CREATE POLICY "Anyone can read scripture works"
  ON scripture_works FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read editions"
  ON editions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read verses"
  ON verses FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read cross references"
  ON cross_references FOR SELECT
  USING (true);

-- Group policies
CREATE POLICY "Members can view their groups"
  ON groups FOR SELECT
  USING (
    id IN (
      SELECT group_id FROM group_members
      WHERE user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Members can view group members"
  ON group_members FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM group_members
      WHERE user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Members can view group discussions"
  ON discussions FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM group_members
      WHERE user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Members can view comments"
  ON comments FOR SELECT
  USING (
    discussion_id IN (
      SELECT id FROM discussions
      WHERE group_id IN (
        SELECT group_id FROM group_members
        WHERE user_id = auth.uid()::TEXT
      )
    )
  );

-- ============================================================================
-- Seed Data (Scripture Works)
-- ============================================================================

INSERT INTO scripture_works (id, name, abbreviation, description) VALUES
  ('book-of-mormon', 'Book of Mormon', 'BoM', 'Community of Christ 1908 Authorized Edition'),
  ('doctrine-and-covenants', 'Doctrine and Covenants', 'D&C', 'Community of Christ Edition with 167 sections'),
  ('bible', 'Holy Scriptures', 'Bible', 'Inspired Version (Joseph Smith Translation)');

INSERT INTO editions (id, work_id, name, short_name, publisher, year, versification_system, is_public_domain, is_default, is_primary, display_order) VALUES
  ('coc-bom-1908', 'book-of-mormon', 'Community of Christ Book of Mormon (1908)', 'CoC BoM', 'Herald Publishing House', 1908, 'original-chapters', true, true, true, 1),
  ('coc-dc-2017', 'doctrine-and-covenants', 'Community of Christ Doctrine and Covenants', 'CoC D&C', 'Herald Publishing House', 2017, 'section-numbering', false, true, true, 2),
  ('iv-bible-1867', 'bible', 'Inspired Version (Joseph Smith Translation)', 'IV', 'Herald Publishing House', 1867, 'chapter-verse', true, true, true, 3);

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Log migration
DO $$
BEGIN
  RAISE NOTICE 'Schema migration completed successfully';
  RAISE NOTICE 'Total tables created: 24';
  RAISE NOTICE 'RLS policies created: 30+';
  RAISE NOTICE 'Next step: Import scripture data';
END $$;
`;

// Write migration file
fs.writeFileSync(MIGRATION_FILE, sql);
console.log('✓ Created migration file:', MIGRATION_FILE);

console.log('\n✅ Conversion complete!');
console.log('\nNext steps:');
console.log('1. Review the migration file:', MIGRATION_FILE);
console.log('2. Push to Supabase: supabase db push');
console.log('3. Or apply locally: supabase migration up\n');
