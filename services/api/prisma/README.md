# Database Schema Documentation

This directory contains the Prisma schema and database migrations for the Book of Mormon Study Tools API.

## Overview

We use **PostgreSQL** as our primary database with **Prisma** as the ORM. See [ADR-002](../../../docs/adr/002-graphql-api-architecture.md) for context on our data architecture decisions.

## Schema Organization

The schema is organized into logical sections:

### 1. Users and Authentication
- `User` - User accounts
- `UserPreferences` - User settings (theme, notifications, AI features)
- `RefreshToken` - JWT refresh tokens

### 2. Scripture Content (Read-Only)
- `Verse` - Book of Mormon verses
  - Populated via seed script
  - Rarely updated (only for corrections)

### 3. User Study Data
- `Highlight` - Verse highlights with colors
- `Note` - User notes with tags
- `CrossReference` - Connections between verses (official, AI-suggested, user-created)
- `ReadingProgress` - Track reading position per book/chapter
- `StudyStreak` - Daily study streak tracking

### 4. Memory System
- `MemoryCard` - Spaced repetition cards using SM-2 algorithm
  - See [Technical Implementation Guide](../../../LDS_STUDY_TOOLS_TECHNICAL_IMPLEMENTATION.md) for algorithm details

### 5. Group Study Features
- `Group` - Study groups
- `GroupMember` - Group membership with roles
- `Discussion` - Group discussions about verses
- `Comment` - Comments on discussions

### 6. Notifications
- `Notification` - Push notifications and in-app messages

### 7. AI/ML Data
- `AIInteraction` - Chatbot interactions with feedback
- `SearchQuery` - Search analytics for improving results

### 8. Analytics (Privacy-Friendly)
- `SessionEvent` - User behavior events
  - Anonymized
  - Used for feature usage analytics
  - Compliant with GDPR (see privacy policy)

## Database Migrations

### Creating a Migration

```bash
# 1. Modify schema.prisma
# 2. Create migration
npx prisma migrate dev --name descriptive_migration_name

# This will:
# - Generate SQL migration files
# - Apply migration to database
# - Regenerate Prisma client
```

### Applying Migrations (Production)

```bash
npx prisma migrate deploy
```

### Resetting Database (Development Only)

```bash
npx prisma migrate reset
# This will:
# - Drop database
# - Create database
# - Apply all migrations
# - Run seed script
```

## Seeding

### Run Seed Script

```bash
npm run db:seed
# Or
npx prisma db seed
```

### Seed Data Includes:

- **10 sample verses** from 1 Nephi 3, Alma 32, and Moroni 10
- **2 test users**:
  - `nephi@example.com` (password: `password123`)
  - `alma@example.com` (password: `password123`)
- Sample highlights, notes, reading progress
- Sample group with discussion
- Sample notifications

### Custom Seed Data

Edit `prisma/seed.ts` to add more sample data for development.

## Prisma Studio

Explore the database with Prisma Studio:

```bash
npx prisma studio
# Opens http://localhost:5555
```

## Schema Reference

### User Model

```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  password    String   // Hashed with bcrypt
  displayName String?
  avatarUrl   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  preferences      UserPreferences?
  highlights       Highlight[]
  notes            Note[]
  // ... other relations
}
```

**Fields:**
- `id` - CUID (Collision-resistant Unique Identifier)
- `email` - Unique email address
- `password` - bcrypt hashed password
- `displayName` - Optional display name
- `avatarUrl` - Optional profile picture URL

**Relations:**
- One-to-one with `UserPreferences`
- One-to-many with `Highlight`, `Note`, etc.

### Verse Model

```prisma
model Verse {
  id        String @id // Format: "1-nephi-3-7"
  book      String
  chapter   Int
  verse     Int
  text      String @db.Text
  language  String @default("en")

  // Relations
  highlights       Highlight[]
  notes            Note[]
  crossReferencesFrom CrossReference[] @relation("FromVerse")
  crossReferencesTo   CrossReference[] @relation("ToVerse")
  memoryCards      MemoryCard[]
}
```

**Fields:**
- `id` - Human-readable ID (e.g., `1-nephi-3-7`)
- `book` - Book identifier (e.g., `1-nephi`)
- `chapter` - Chapter number
- `verse` - Verse number
- `text` - Verse text content
- `language` - ISO 639-1 code (default: `en`)

**Indexes:**
- Unique on `(book, chapter, verse, language)`
- Index on `(book, chapter)` for fast chapter queries

### Highlight Model

```prisma
model Highlight {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  verseId   String
  verse     Verse    @relation(fields: [verseId], references: [id])
  color     String   // yellow, blue, green, pink, orange, purple
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, verseId]) // One highlight per verse per user
}
```

**Constraints:**
- One highlight per user per verse (enforced by unique constraint)
- Cascade delete when user is deleted

**Colors:**
- `yellow`, `blue`, `green`, `pink`, `orange`, `purple`

### Memory Card Model (Spaced Repetition)

```prisma
model MemoryCard {
  id             String   @id @default(cuid())
  userId         String
  verseId        String

  // SM-2 Algorithm fields
  easeFactor     Float    @default(2.5)  // 1.3 - 3.0
  interval       Int      @default(1)    // Days until next review
  repetition     Int      @default(0)    // Number of successful reviews
  nextReview     DateTime @default(now())

  // Study history
  lastReviewed   DateTime?
  totalReviews   Int      @default(0)
  correctReviews Int      @default(0)
}
```

**SM-2 Algorithm:**
- `easeFactor` - Difficulty multiplier (1.3-3.0, default 2.5)
- `interval` - Days until next review
- `repetition` - Number of consecutive successful reviews
- `nextReview` - Date/time of next scheduled review

See [SM-2 Algorithm](https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm) for details.

## Indexes

Indexes are added for performance on common queries:

```prisma
@@index([userId])           // Fast user lookups
@@index([verseId])          // Fast verse lookups
@@index([userId, nextReview]) // Efficient memory card queries
@@index([createdAt])        // Time-based queries
```

## Relationships

### One-to-One
- `User` ↔ `UserPreferences`
- `User` ↔ `StudyStreak`

### One-to-Many
- `User` → `Highlight[]`
- `User` → `Note[]`
- `Verse` → `Highlight[]`
- `Group` → `GroupMember[]`

### Many-to-Many
- `Verse` ↔ `Verse` (via `CrossReference`)

## Data Types

- `String` - VARCHAR (default) or TEXT (with `@db.Text`)
- `Int` - INTEGER
- `Float` - DOUBLE PRECISION
- `Boolean` - BOOLEAN
- `DateTime` - TIMESTAMP WITH TIME ZONE
- `Json` - JSONB (for flexible data)
- `String[]` - Array of strings (PostgreSQL array type)

## Best Practices

### 1. Always Use Transactions for Multi-Step Operations

```typescript
await prisma.$transaction([
  prisma.highlight.create({ data: highlightData }),
  prisma.sessionEvent.create({ data: eventData }),
]);
```

### 2. Use Cascade Deletes Carefully

```prisma
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
```

This automatically deletes related records when a user is deleted.

### 3. Soft Deletes for Important Data

Consider adding `deletedAt` for soft deletes:

```prisma
deletedAt DateTime?

@@index([deletedAt])
```

### 4. Use Indexes for Filtered Queries

If you filter by a field frequently, add an index:

```prisma
@@index([userId])
@@index([createdAt])
```

### 5. Validate Data in Application Layer

Use Zod schemas (from `@bom/shared`) before database operations:

```typescript
import { verseReferenceSchema } from '@bom/shared';

const validated = verseReferenceSchema.parse(input);
```

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/bom_study_tools
```

**Format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

**Connection Pooling:**
For production, use connection pooling (e.g., PgBouncer):
```env
DATABASE_URL=postgresql://user:password@localhost:6543/bom_study_tools?pgbouncer=true
```

## Troubleshooting

### "Migration failed" errors

```bash
# Reset and reapply migrations
npx prisma migrate reset
npx prisma migrate dev
```

### "Type X is not assignable" TypeScript errors

```bash
# Regenerate Prisma client
npx prisma generate
```

### Connection pool exhausted

Increase connection limit in Prisma schema:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connectionLimit = 20
}
```

### Slow queries

1. Check indexes: `EXPLAIN ANALYZE` in PostgreSQL
2. Add missing indexes
3. Use DataLoader to prevent N+1 queries

## Related Documentation

- [API Specification](../../../API_SPECIFICATION.md) - GraphQL API
- [Technical Implementation Guide](../../../LDS_STUDY_TOOLS_TECHNICAL_IMPLEMENTATION.md) - Architecture details
- [Offline-First Architecture ADR](../../../docs/adr/003-offline-first-architecture.md) - Sync strategy
- [Prisma Documentation](https://www.prisma.io/docs/)

## Schema Diagram

```
┌──────────┐
│   User   │
└────┬─────┘
     │
     ├─→ UserPreferences
     ├─→ Highlight ─→ Verse
     ├─→ Note ─────→ Verse
     ├─→ ReadingProgress
     ├─→ StudyStreak
     ├─→ MemoryCard ─→ Verse
     ├─→ GroupMember ─→ Group
     └─→ Notification

Verse ←─→ CrossReference ←─→ Verse

Group ─→ Discussion ─→ Comment
```

---

**Last Updated:** 2025-11-19
**Maintained By:** Backend Squad Lead
