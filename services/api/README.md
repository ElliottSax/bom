# API Service

GraphQL API with Fastify, Prisma, and PostgreSQL.

## Features

- **GraphQL API**: Type-safe queries and mutations
- **Scripture Data**: Book of Mormon, D&C sections
- **User Management**: Authentication and profiles
- **Study Features**: Highlights, notes, bookmarks, reading goals
- **Search**: Keyword and semantic search (planned)
- **Performance**: DataLoader for N+1 prevention, Redis caching

## Tech Stack

- **Server**: Fastify 4
- **GraphQL**: Apollo Server 4
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Cache**: Redis 7+
- **Auth**: JWT tokens
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+ (optional, for caching)

### Installation

```bash
# From project root
npm install

# Or from this directory
cd services/api
npm install
```

### Environment Setup

Create `.env.development`:

```env
NODE_ENV=development
PORT=4000

# Database (local)
DATABASE_URL=postgresql://postgres:postgres@localhost:5435/bom_study_tools_dev

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=dev-secret-change-in-production
JWT_EXPIRES_IN=7d

# Logging
LOG_LEVEL=debug
```

Create `.env.production`:

```env
NODE_ENV=production
PORT=4000

# Database (production)
DATABASE_URL=postgresql://user:pass@host:5432/bom_study_tools

# Redis
REDIS_URL=redis://host:6379

# Auth
JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=30d

# Logging
LOG_LEVEL=info
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npm run db:migrate

# Import scripture data
./import-all-scriptures.sh

# Start server
npm run dev
```

Visit http://localhost:4000/graphql for GraphQL Playground.

## Project Structure

```
services/api/
├── src/
│   ├── graphql/
│   │   ├── schema.ts          # GraphQL schema definition
│   │   ├── resolvers.ts       # Query/mutation resolvers
│   │   ├── context.ts         # Request context
│   │   ├── loaders.ts         # DataLoader instances
│   │   └── server.ts          # Apollo Server setup
│   ├── lib/
│   │   ├── prisma.ts         # Prisma client
│   │   └── redis.ts          # Redis client
│   ├── middleware/
│   │   ├── auth.ts           # JWT authentication
│   │   ├── rateLimit.ts      # Rate limiting
│   │   └── validation.ts     # Input validation
│   ├── routes/
│   │   ├── auth.ts           # Auth endpoints
│   │   └── health.ts         # Health check
│   ├── scripts/
│   │   ├── import-verses.ts  # Import scripture data
│   │   └── scrape-*.ts       # Scripture scrapers
│   ├── validation/
│   │   └── schemas.ts        # Zod validation schemas
│   └── index.ts              # Server entry point
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Migration history
├── .env.example
└── package.json
```

## GraphQL API

### Endpoints

- **GraphQL**: `http://localhost:4000/graphql`
- **Health**: `http://localhost:4000/health`
- **Auth**: `http://localhost:4000/auth/login`

### Schema Overview

```graphql
type Query {
  # Scripture queries
  verse(id: ID!): Verse
  chapter(editionId: String!, book: String!, chapter: Int!): Chapter
  search(input: SearchInput!): SearchResults!

  # User queries
  me: User
  highlights: [Highlight!]!
  notes: [Note!]!
  readingGoals: [ReadingGoal!]!
}

type Mutation {
  # User mutations
  createHighlight(input: HighlightInput!): Highlight!
  createNote(input: NoteInput!): Note!
  createReadingGoal(input: GoalInput!): ReadingGoal!
  updateReadingProgress(goalId: ID!, progress: Int!): ReadingGoal!
}
```

### Example Queries

**Get a chapter:**

```graphql
query GetChapter {
  chapter(editionId: "coc-bom-1908", book: "I Nephi", chapter: 1) {
    verses {
      id
      verse
      text
    }
  }
}
```

**Search scriptures:**

```graphql
query SearchScriptures {
  search(input: { query: "faith", limit: 10 }) {
    results {
      verse {
        id
        book
        chapter
        verse
        text
      }
      score
      highlights
    }
    total
  }
}
```

**Create highlight:**

```graphql
mutation CreateHighlight {
  createHighlight(
    input: {
      verseId: "coc-bom-1908:I Nephi:3:7"
      color: "YELLOW"
    }
  ) {
    id
    color
    createdAt
  }
}
```

## Database

### Schema

Main tables:
- `users` - User accounts
- `verses` - Scripture verses (11,787 rows)
- `highlights` - User highlights
- `notes` - User notes
- `bookmarks` - Saved verses
- `reading_goals` - User goals
- `reading_history` - Progress tracking

### Prisma Commands

```bash
# Generate client
npx prisma generate

# Create migration
npx prisma migrate dev --name your_migration_name

# Apply migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset
```

### Seeding Data

```bash
# Import all scriptures (Book of Mormon + D&C)
./import-all-scriptures.sh

# Import specific book
npm run import:bom
npm run import:dc
```

## Authentication

Uses JWT tokens:

```typescript
// Login
POST /auth/login
{
  "email": "user@example.com",
  "password": "password"
}

// Response
{
  "token": "eyJhbGc...",
  "user": { ... }
}

// Use token in GraphQL
Authorization: Bearer eyJhbGc...
```

## Performance

### DataLoader

Prevents N+1 queries with batching:

```typescript
// Without DataLoader: N+1 queries
for (verse of verses) {
  await getHighlights(verse.id); // N queries
}

// With DataLoader: 1 query
const loader = new DataLoader(batchGetHighlights);
for (verse of verses) {
  await loader.load(verse.id); // Batched into 1 query
}
```

### Caching

Redis caching for frequently accessed data:

```typescript
// Cache chapter data for 1 hour
await redis.set(`chapter:${key}`, JSON.stringify(data), 'EX', 3600);
```

### Query Optimization

- Indexes on `book`, `chapter`, `verse` columns
- Full-text search indexes
- Connection pooling (10 connections)
- Query result limiting

## Testing

```bash
# Unit tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# Integration tests (requires DB)
npm run test:integration
```

### Test Structure

```typescript
import { createTestContext } from './__helpers';

describe('Verse Resolvers', () => {
  const ctx = createTestContext();

  it('fetches a verse by ID', async () => {
    const result = await ctx.client.request(`
      query {
        verse(id: "coc-bom-1908:I Nephi:1:1") {
          text
        }
      }
    `);

    expect(result.verse.text).toContain('I, Nephi');
  });
});
```

## Deployment

### Fly.io (Production)

```bash
# Deploy API
./deploy-flyio-free.sh

# Check status
fly status

# View logs
fly logs

# SSH into instance
fly ssh console
```

### Environment Variables

Set in Fly.io:

```bash
fly secrets set DATABASE_URL="postgresql://..."
fly secrets set JWT_SECRET="..."
fly secrets set REDIS_URL="redis://..."
```

### Scaling

```bash
# Scale to 2 instances
fly scale count 2

# Scale memory
fly scale memory 512
```

## Monitoring

### Health Check

```bash
curl http://localhost:4000/health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2026-02-24T12:00:00Z",
  "uptime": 3600,
  "database": "connected",
  "redis": "connected"
}
```

### Logs

```bash
# Development
npm run dev  # Logs to console

# Production (Fly.io)
fly logs -a bom-api
```

### Metrics

GraphQL metrics exposed:
- Request count
- Response times
- Error rates
- Cache hit rates

## Scripture Data

### Import Scripts

Located in `src/scripts/`:
- `scrape-coc-bom.ts` - Scrape BoM from Community of Christ website
- `scrape-coc-dc.ts` - Scrape D&C sections 1-113
- `scrape-coc-dc-114-167.ts` - Scrape CoC-specific sections
- `import-verses.ts` - Import from JSON files

### Data Format

```json
{
  "editionId": "coc-bom-1908",
  "book": "I Nephi",
  "chapter": 1,
  "verse": 1,
  "text": "I, Nephi, having been born of goodly parents...",
  "verseType": "text"
}
```

## Troubleshooting

### Database Connection

**Error**: `Can't reach database server`

```bash
# Check PostgreSQL is running
pg_isready

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

### Prisma Issues

**Error**: `Prisma schema not found`

```bash
# Regenerate client
npx prisma generate
```

**Error**: `Migration conflicts`

```bash
# Reset and reapply
npx prisma migrate reset
npx prisma migrate deploy
```

### GraphQL Errors

**Error**: `Context creation failed`

```bash
# Check JWT_SECRET is set
echo $JWT_SECRET

# Check Redis connection
redis-cli ping
```

## Contributing

1. Follow GraphQL best practices
2. Add resolvers with proper error handling
3. Add tests for new resolvers
4. Update schema documentation
5. Run `npm run lint` and `npm test` before committing

## Related Documentation

- [Main README](../../README.md)
- [Architecture Overview](../../ARCHITECTURE.md)
- [Web App Documentation](../../apps/web/README.md)
- [Mobile App Documentation](../../apps/mobile/README.md)
- [API Specification](../../API_SPECIFICATION.md)
