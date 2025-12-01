-- Community of Christ Scripture Study Tools - Complete Schema Migration
-- This migration creates all tables from scratch

-- ============================================================================
-- Users and Authentication
-- ============================================================================

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "fontSize" TEXT NOT NULL DEFAULT 'medium',
    "theme" TEXT NOT NULL DEFAULT 'light',
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "dailyReminderTime" TEXT,
    "semanticSearchEnabled" BOOLEAN NOT NULL DEFAULT true,
    "chatbotEnabled" BOOLEAN NOT NULL DEFAULT true,
    "autoSuggestionsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- ============================================================================
-- Scripture Content (Multi-Edition Support)
-- ============================================================================

CREATE TABLE "scripture_works" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scripture_works_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "editions" (
    "id" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "versificationSystem" TEXT NOT NULL,
    "description" TEXT,
    "isPublicDomain" BOOLEAN NOT NULL DEFAULT false,
    "copyrightHolder" TEXT,
    "licenseNotes" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "editions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "editions_workId_idx" ON "editions"("workId");
CREATE INDEX "editions_isDefault_idx" ON "editions"("isDefault");
CREATE INDEX "editions_displayOrder_idx" ON "editions"("displayOrder");

CREATE TABLE "verses" (
    "id" TEXT NOT NULL,
    "editionId" TEXT NOT NULL,
    "book" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "verse" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "verseType" TEXT NOT NULL DEFAULT 'standard',

    CONSTRAINT "verses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "verses_editionId_book_chapter_verse_key" ON "verses"("editionId", "book", "chapter", "verse");
CREATE INDEX "verses_editionId_book_chapter_idx" ON "verses"("editionId", "book", "chapter");
CREATE INDEX "verses_editionId_book_idx" ON "verses"("editionId", "book");

CREATE TABLE "verse_mappings" (
    "id" TEXT NOT NULL,
    "fromVerseId" TEXT NOT NULL,
    "toVerseId" TEXT NOT NULL,
    "mappingType" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verse_mappings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "verse_mappings_fromVerseId_toVerseId_key" ON "verse_mappings"("fromVerseId", "toVerseId");
CREATE INDEX "verse_mappings_fromVerseId_idx" ON "verse_mappings"("fromVerseId");
CREATE INDEX "verse_mappings_toVerseId_idx" ON "verse_mappings"("toVerseId");

-- ============================================================================
-- User Study Data
-- ============================================================================

CREATE TABLE "highlights" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verseId" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "highlights_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "highlights_userId_verseId_key" ON "highlights"("userId", "verseId");
CREATE INDEX "highlights_userId_idx" ON "highlights"("userId");

CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verseId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notes_userId_idx" ON "notes"("userId");
CREATE INDEX "notes_verseId_idx" ON "notes"("verseId");

CREATE TABLE "cross_references" (
    "id" TEXT NOT NULL,
    "fromVerseId" TEXT NOT NULL,
    "toVerseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cross_references_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cross_references_fromVerseId_toVerseId_type_key" ON "cross_references"("fromVerseId", "toVerseId", "type");
CREATE INDEX "cross_references_fromVerseId_idx" ON "cross_references"("fromVerseId");
CREATE INDEX "cross_references_toVerseId_idx" ON "cross_references"("toVerseId");

CREATE TABLE "reading_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "book" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "verse" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reading_progress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "reading_progress_userId_book_chapter_key" ON "reading_progress"("userId", "book", "chapter");
CREATE INDEX "reading_progress_userId_idx" ON "reading_progress"("userId");

CREATE TABLE "study_streaks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastStudyDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_streaks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "study_streaks_userId_key" ON "study_streaks"("userId");

-- ============================================================================
-- Memory System (Spaced Repetition)
-- ============================================================================

CREATE TABLE "memory_cards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verseId" TEXT NOT NULL,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "repetition" INTEGER NOT NULL DEFAULT 0,
    "nextReview" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReviewed" TIMESTAMP(3),
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "correctReviews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memory_cards_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "memory_cards_userId_verseId_key" ON "memory_cards"("userId", "verseId");
CREATE INDEX "memory_cards_userId_nextReview_idx" ON "memory_cards"("userId", "nextReview");

-- ============================================================================
-- Group Study Features
-- ============================================================================

CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "inviteCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "groups_inviteCode_key" ON "groups"("inviteCode");

CREATE TABLE "group_members" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_members_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "group_members_groupId_userId_key" ON "group_members"("groupId", "userId");
CREATE INDEX "group_members_userId_idx" ON "group_members"("userId");

CREATE TABLE "discussions" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "verseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discussions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "discussions_groupId_idx" ON "discussions"("groupId");

CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "discussionId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "comments_discussionId_idx" ON "comments"("discussionId");

-- ============================================================================
-- Notifications
-- ============================================================================

CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- ============================================================================
-- AI/ML Data
-- ============================================================================

CREATE TABLE "ai_interactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sources" TEXT[],
    "confidence" DOUBLE PRECISION NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_interactions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ai_interactions_userId_idx" ON "ai_interactions"("userId");
CREATE INDEX "ai_interactions_createdAt_idx" ON "ai_interactions"("createdAt");

CREATE TABLE "search_queries" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "query" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "resultCount" INTEGER NOT NULL,
    "clickedResults" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_queries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "search_queries_userId_idx" ON "search_queries"("userId");
CREATE INDEX "search_queries_createdAt_idx" ON "search_queries"("createdAt");

-- ============================================================================
-- Analytics (Privacy-Friendly)
-- ============================================================================

CREATE TABLE "session_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "session_events_userId_idx" ON "session_events"("userId");
CREATE INDEX "session_events_sessionId_idx" ON "session_events"("sessionId");
CREATE INDEX "session_events_eventType_idx" ON "session_events"("eventType");
CREATE INDEX "session_events_createdAt_idx" ON "session_events"("createdAt");

-- ============================================================================
-- Foreign Key Constraints
-- ============================================================================

ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "editions" ADD CONSTRAINT "editions_workId_fkey" FOREIGN KEY ("workId") REFERENCES "scripture_works"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "verses" ADD CONSTRAINT "verses_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "editions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "verse_mappings" ADD CONSTRAINT "verse_mappings_fromVerseId_fkey" FOREIGN KEY ("fromVerseId") REFERENCES "verses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "verse_mappings" ADD CONSTRAINT "verse_mappings_toVerseId_fkey" FOREIGN KEY ("toVerseId") REFERENCES "verses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "highlights" ADD CONSTRAINT "highlights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "highlights" ADD CONSTRAINT "highlights_verseId_fkey" FOREIGN KEY ("verseId") REFERENCES "verses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "notes" ADD CONSTRAINT "notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notes" ADD CONSTRAINT "notes_verseId_fkey" FOREIGN KEY ("verseId") REFERENCES "verses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "cross_references" ADD CONSTRAINT "cross_references_fromVerseId_fkey" FOREIGN KEY ("fromVerseId") REFERENCES "verses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cross_references" ADD CONSTRAINT "cross_references_toVerseId_fkey" FOREIGN KEY ("toVerseId") REFERENCES "verses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "study_streaks" ADD CONSTRAINT "study_streaks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "memory_cards" ADD CONSTRAINT "memory_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "memory_cards" ADD CONSTRAINT "memory_cards_verseId_fkey" FOREIGN KEY ("verseId") REFERENCES "verses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "group_members" ADD CONSTRAINT "group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "discussions" ADD CONSTRAINT "discussions_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "comments" ADD CONSTRAINT "comments_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "discussions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
