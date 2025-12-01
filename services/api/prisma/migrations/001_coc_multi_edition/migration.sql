-- CreateTable: Scripture Works
CREATE TABLE "scripture_works" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scripture_works_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Editions
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

-- CreateTable: Verse Mappings
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

-- AlterTable: Verses (add new columns for edition support)
ALTER TABLE "verses" DROP CONSTRAINT IF EXISTS "verses_book_chapter_verse_language_key";
ALTER TABLE "verses" ADD COLUMN IF NOT EXISTS "editionId" TEXT;
ALTER TABLE "verses" ADD COLUMN IF NOT EXISTS "verseType" TEXT DEFAULT 'standard';
ALTER TABLE "verses" DROP COLUMN IF EXISTS "language";

-- Update existing verses to use CoC edition (temporary - will need proper migration)
-- UPDATE "verses" SET "editionId" = 'coc-bom-1908' WHERE "editionId" IS NULL;

-- CreateIndex
CREATE INDEX "editions_workId_idx" ON "editions"("workId");
CREATE INDEX "editions_isDefault_idx" ON "editions"("isDefault");
CREATE INDEX "editions_displayOrder_idx" ON "editions"("displayOrder");

CREATE UNIQUE INDEX "verse_mappings_fromVerseId_toVerseId_key" ON "verse_mappings"("fromVerseId", "toVerseId");
CREATE INDEX "verse_mappings_fromVerseId_idx" ON "verse_mappings"("fromVerseId");
CREATE INDEX "verse_mappings_toVerseId_idx" ON "verse_mappings"("toVerseId");

CREATE UNIQUE INDEX "verses_editionId_book_chapter_verse_key" ON "verses"("editionId", "book", "chapter", "verse");
CREATE INDEX "verses_editionId_book_chapter_idx" ON "verses"("editionId", "book", "chapter");
CREATE INDEX "verses_editionId_book_idx" ON "verses"("editionId", "book");

-- AddForeignKey
ALTER TABLE "editions" ADD CONSTRAINT "editions_workId_fkey" FOREIGN KEY ("workId") REFERENCES "scripture_works"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "verses" ADD CONSTRAINT "verses_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "editions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "verse_mappings" ADD CONSTRAINT "verse_mappings_fromVerseId_fkey" FOREIGN KEY ("fromVerseId") REFERENCES "verses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "verse_mappings" ADD CONSTRAINT "verse_mappings_toVerseId_fkey" FOREIGN KEY ("toVerseId") REFERENCES "verses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
