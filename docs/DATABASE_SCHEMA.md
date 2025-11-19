# Database Schema Overview

Complete database schema for the Book of Mormon Study Tools platform.

## Quick Reference

- **ORM**: Prisma
- **Database**: PostgreSQL 15+
- **Schema Location**: `services/api/prisma/schema.prisma`
- **Migrations**: `services/api/prisma/migrations/`
- **Documentation**: `services/api/prisma/README.md`

## Schema Organization

### 1. Users & Authentication (4 models)
- `User` - User accounts with email/password
- `UserPreferences` - Settings (theme, notifications, AI features)
- `RefreshToken` - JWT refresh tokens for authentication
- `StudyStreak` - Daily study streak tracking

**Key Features:**
- bcrypt password hashing
- JWT-based authentication
- Per-user preferences
- Cascade deletes for data privacy

### 2. Scripture Content (1 model)
- `Verse` - Book of Mormon verses (read-only)

**Characteristics:**
- Human-readable IDs (e.g., `1-nephi-3-7`)
- Indexed for fast chapter/verse lookups
- Multilingual support (language field)
- Populated via seed script

### 3. User Study Data (4 models)
- `Highlight` - Colored verse highlights
- `Note` - User notes with tags
- `CrossReference` - Verse connections (official, AI-suggested, user-created)
- `ReadingProgress` - Current reading position

**Features:**
- One highlight per verse per user (unique constraint)
- Tag-based note organization
- Cross-reference confidence scores
- Progress tracking with percentages

### 4. Memory System (1 model)
- `MemoryCard` - Spaced repetition flashcards

**Implementation:**
- SM-2 algorithm for optimal spacing
- Tracks ease factor, interval, repetitions
- Next review date scheduling
- Success rate statistics

See [Technical Implementation Guide](../LDS_STUDY_TOOLS_TECHNICAL_IMPLEMENTATION.md) for SM-2 algorithm details.

### 5. Group Study (4 models)
- `Group` - Study groups (public/private)
- `GroupMember` - Membership with roles (admin, moderator, member)
- `Discussion` - Group discussions about verses
- `Comment` - Comments on discussions

**Features:**
- Invite codes for private groups
- Role-based permissions
- Threaded discussions
- Cascade deletes on group removal

### 6. Notifications (1 model)
- `Notification` - In-app and push notifications

**Types:**
- `daily_reminder` - Daily study reminders
- `streak_milestone` - Streak achievements
- `new_feature` - Product updates
- `system` - System messages

### 7. AI/ML Data (2 models)
- `AIInteraction` - Chatbot Q&A with sources
- `SearchQuery` - Search analytics

**Analytics:**
- User feedback on AI responses
- Click-through rate tracking
- Query refinement data
- Privacy-preserving design

### 8. Analytics (1 model)
- `SessionEvent` - User behavior events

**Privacy Features:**
- Anonymized data collection
- GDPR compliant
- Flexible JSON event data
- Time-based indexes for reporting

## Total Models: 17

## Key Design Decisions

### 1. Offline-First Compatible

The schema is designed to work with offline-first sync:
- `createdAt` and `updatedAt` timestamps on all mutable entities
- CUIDs (Collision-resistant IDs) prevent conflicts
- Per-user data isolation for easier sync

See [ADR-003: Offline-First Architecture](../adr/003-offline-first-architecture.md)

### 2. Performance Optimizations

**Indexes:**
```sql
-- Fast user lookups
CREATE INDEX highlights_user_id_idx ON highlights(user_id);
CREATE INDEX notes_user_id_idx ON notes(user_id);

-- Fast verse lookups
CREATE INDEX highlights_verse_id_idx ON highlights(verse_id);
CREATE INDEX notes_verse_id_idx ON notes(verse_id);

-- Efficient memory card queries
CREATE INDEX memory_cards_user_id_next_review_idx ON memory_cards(user_id, next_review);

-- Time-based queries
CREATE INDEX notifications_created_at_idx ON notifications(created_at);
CREATE INDEX session_events_created_at_idx ON session_events(created_at);
```

**Unique Constraints:**
```sql
-- Prevent duplicate highlights
UNIQUE(user_id, verse_id) ON highlights

-- Unique reading progress per chapter
UNIQUE(user_id, book, chapter) ON reading_progress
```

### 3. Data Integrity

**Cascade Deletes:**
When a user is deleted, all related data is automatically removed:
- User preferences
- Highlights, notes, memory cards
- Reading progress, study streaks
- Group memberships
- Notifications

**Foreign Keys:**
All relationships use foreign keys for referential integrity:
```prisma
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
```

### 4. Flexible Data

**JSON Fields:**
For flexible, schema-less data:
```prisma
eventData Json? // SessionEvent: flexible event-specific data
```

**Array Fields:**
For lists without additional tables:
```prisma
tags String[] // Note: array of tag strings
sources String[] // AIInteraction: array of verse IDs
```

## Entity Relationships

```
User
├── has one UserPreferences
├── has one StudyStreak
├── has many Highlights
├── has many Notes
├── has many MemoryCards
├── has many ReadingProgress
├── has many GroupMembers
└── has many Notifications

Verse
├── has many Highlights
├── has many Notes
├── has many MemoryCards
├── has many CrossReferences (from)
└── has many CrossReferences (to)

Group
├── has many GroupMembers
└── has many Discussions
    └── has many Comments
```

## Common Queries

### Get User with Preferences
```typescript
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: { preferences: true }
});
```

### Get Verse with User Data
```typescript
const verse = await prisma.verse.findUnique({
  where: { id: '1-nephi-3-7' },
  include: {
    highlights: { where: { userId: currentUserId } },
    notes: { where: { userId: currentUserId } },
    crossReferencesTo: { include: { fromVerse: true } }
  }
});
```

### Get Due Memory Cards
```typescript
const dueCards = await prisma.memoryCard.findMany({
  where: {
    userId: currentUserId,
    nextReview: { lte: new Date() }
  },
  include: { verse: true },
  orderBy: { nextReview: 'asc' },
  take: 10
});
```

### Get User's Study Streak
```typescript
const streak = await prisma.studyStreak.findUnique({
  where: { userId: currentUserId }
});
```

## Seeding

The database comes with sample data for development:

**Test Users:**
- `nephi@example.com` (password: `password123`)
- `alma@example.com` (password: `password123`)

**Sample Scripture Content:**
- 1 Nephi 3:1-7
- Alma 32:28
- Moroni 10:4-5

**Sample User Data:**
- Highlights and notes
- Reading progress
- Study streak (7 days)
- Memory card
- Group with discussion

Run seed: `npm run db:seed` (from `services/api`)

## Migrations

### Development Workflow

```bash
# 1. Modify schema.prisma
# 2. Create migration
cd services/api
npx prisma migrate dev --name add_new_feature

# 3. Regenerate client (automatic with migrate dev)
# 4. Update resolvers/services
```

### Production Deployment

```bash
# Apply migrations (non-interactive)
npx prisma migrate deploy

# Check migration status
npx prisma migrate status
```

### Reset Database (Dev Only)

```bash
# Drop all data and reapply migrations + seed
npm run db:reset
```

## Performance Considerations

### N+1 Query Prevention

Use DataLoader for batching:
```typescript
const highlightLoader = new DataLoader(async (verseIds) => {
  const highlights = await prisma.highlight.findMany({
    where: { verseId: { in: verseIds }, userId: currentUserId }
  });
  // Group by verseId and return in order
});
```

### Connection Pooling

Configure in DATABASE_URL:
```env
DATABASE_URL=postgresql://user:pass@host:5432/db?connection_limit=20
```

Or use external pooler (PgBouncer):
```env
DATABASE_URL=postgresql://user:pass@pgbouncer:6543/db?pgbouncer=true
```

### Query Optimization

1. **Select only needed fields:**
   ```typescript
   await prisma.verse.findMany({
     select: { id: true, text: true } // Don't load all fields
   });
   ```

2. **Use pagination:**
   ```typescript
   await prisma.verse.findMany({
     skip: (page - 1) * pageSize,
     take: pageSize
   });
   ```

3. **Analyze slow queries:**
   ```bash
   # Enable query logging
   DATABASE_URL="postgresql://...?log=query"

   # Check PostgreSQL logs
   EXPLAIN ANALYZE SELECT ...
   ```

## Security

### 1. Password Storage
Passwords are hashed with bcrypt (salt rounds: 10):
```typescript
const hashedPassword = await bcrypt.hash(password, 10);
```

### 2. SQL Injection Prevention
Prisma uses parameterized queries automatically:
```typescript
// Safe - Prisma handles parameterization
await prisma.user.findMany({
  where: { email: userInput } // No SQL injection risk
});
```

### 3. Rate Limiting
Implement at application layer (not database):
- See API rate limiting in `services/api/src/middleware/rateLimit.ts`

### 4. Data Privacy
- User data cascade deletes on account removal
- Anonymized analytics
- GDPR compliance (export, delete, portability)

## Monitoring

### Slow Query Detection

```typescript
// Add to Prisma client
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'warn' },
    { emit: 'stdout', level: 'error' }
  ]
});

prisma.$on('query', (e) => {
  if (e.duration > 1000) { // Queries over 1 second
    console.warn('Slow query detected:', e.query, e.duration);
  }
});
```

### Database Health Checks

```typescript
// Health check endpoint
app.get('/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error });
  }
});
```

## Troubleshooting

See [services/api/prisma/README.md](../services/api/prisma/README.md#troubleshooting) for:
- Migration failures
- Type errors
- Connection pool issues
- Slow query debugging

## Related Documentation

- **Detailed Schema Docs**: [services/api/prisma/README.md](../services/api/prisma/README.md)
- **API Specification**: [API_SPECIFICATION.md](../API_SPECIFICATION.md)
- **Offline Architecture**: [docs/adr/003-offline-first-architecture.md](../adr/003-offline-first-architecture.md)
- **GraphQL API**: [docs/adr/002-graphql-api-architecture.md](../adr/002-graphql-api-architecture.md)
- **Prisma Documentation**: https://www.prisma.io/docs/

---

**Last Updated:** 2025-11-19
**Schema Version:** 0.1.0 (Initial)
**Maintained By:** Backend Squad Lead
