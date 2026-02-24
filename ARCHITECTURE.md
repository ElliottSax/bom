# System Architecture

Book of Mormon Study Tools - Technical architecture and design decisions.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────┐         ┌────────────────────┐          │
│  │   Mobile App       │         │    Web App         │          │
│  │  (React Native)    │         │   (Next.js 14)     │          │
│  │                    │         │                    │          │
│  │  • Offline-First   │         │  • Server-Side     │          │
│  │  • AsyncStorage    │         │    Rendering       │          │
│  │  • Local Caching   │         │  • Apollo Client   │          │
│  └────────────────────┘         └────────────────────┘          │
│           │                              │                       │
└───────────┼──────────────────────────────┼───────────────────────┘
            │                              │
            └──────────────┬───────────────┘
                           │
                     GraphQL over HTTP
                           │
┌─────────────────────────┼─────────────────────────────────────┐
│                         ▼           API Layer                  │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              GraphQL API (Apollo Server 4)                │ │
│  │                                                            │ │
│  │  • Type-safe queries/mutations                            │ │
│  │  • DataLoader for N+1 prevention                          │ │
│  │  • JWT authentication                                     │ │
│  │  • Rate limiting                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                           │                                    │
│                           ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Business Logic Layer                         │ │
│  │                                                            │ │
│  │  • Resolvers (GraphQL handlers)                           │ │
│  │  • Validators (Zod schemas)                               │ │
│  │  • Middleware (auth, logging, rate limit)                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│                           │                                    │
└───────────────────────────┼────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
┌──────────────────────────────────────────────────────────────┐
│                    Data Layer                                 │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────┐      │
│  │ PostgreSQL  │   │    Redis     │   │   Qdrant     │      │
│  │   (Prisma)  │   │   (Cache)    │   │  (Vectors)   │      │
│  │             │   │              │   │   [Planned]  │      │
│  │ • Verses    │   │ • Sessions   │   │ • Semantic   │      │
│  │ • Users     │   │ • Rate limit │   │   search     │      │
│  │ • Notes     │   │ • Cache      │   │              │      │
│  │ • Goals     │   │              │   │              │      │
│  └─────────────┘   └──────────────┘   └──────────────┘      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Architecture Patterns

### 1. Monorepo Structure

**Pattern**: npm workspaces + Turborepo
**Rationale**:
- Shared code between web and mobile
- Centralized dependency management
- Parallel build/test execution
- Type-safe imports across packages

**Structure**:
```
bom/
├── apps/
│   ├── mobile/      # React Native app
│   └── web/         # Next.js app
├── services/
│   └── api/         # GraphQL API
└── packages/
    ├── shared/      # Shared utilities
    └── graphql/     # GraphQL schema
```

### 2. GraphQL API

**Pattern**: Schema-first GraphQL with Apollo Server
**Rationale**:
- Type-safe API contract
- Flexible data fetching (no over/under-fetching)
- Single endpoint for all data needs
- Built-in introspection and documentation

**Key Components**:
- **Schema**: Type definitions (`schema.ts`)
- **Resolvers**: Query/mutation handlers (`resolvers.ts`)
- **DataLoaders**: Batch and cache database queries
- **Context**: Request-scoped data (user, loaders)

### 3. Offline-First Mobile

**Pattern**: Local-first with optional cloud sync
**Rationale**:
- Users can read scriptures offline
- Fast app performance (no network latency)
- Reduced server costs
- Graceful degradation

**Implementation**:
- **Scripture Data**: Embedded in app bundle
- **User Data**: AsyncStorage (local)
- **Sync**: Optional, conflict resolution with "last write wins"
- **Network Detection**: `useNetworkStatus` hook

### 4. Database Design

**Pattern**: Normalized relational schema with Prisma ORM
**Rationale**:
- Data integrity with foreign keys
- Type-safe database queries
- Automatic migrations
- Familiar SQL semantics

**Key Tables**:
```sql
-- Scripture data (read-only)
verses (id, editionId, book, chapter, verse, text)

-- User data
users (id, email, name, createdAt)
highlights (id, userId, verseId, color, createdAt)
notes (id, userId, verseId, content, createdAt)
bookmarks (id, userId, verseId, createdAt)
reading_goals (id, userId, type, period, target, createdAt)
reading_history (id, userId, goalId, date, progress)
```

## Tech Stack Choices

### Web Application

**Framework**: Next.js 14 (App Router)

**Why**:
- Server-side rendering for SEO
- Automatic code splitting
- API routes for backend logic
- Excellent TypeScript support
- Large ecosystem

**Alternatives Considered**:
- Remix: Less mature, smaller ecosystem
- Vite + React: No SSR out of the box
- Create React App: Deprecated

### Mobile Application

**Framework**: React Native 0.73+

**Why**:
- Code sharing with web (React components)
- Large community and ecosystem
- Native performance
- Hot reloading for fast development
- Cross-platform (iOS + Android)

**Alternatives Considered**:
- Flutter: Dart language, no web code sharing
- Native (Swift/Kotlin): 2x development cost
- Ionic/Capacitor: WebView performance issues

### API Server

**Framework**: Fastify + Apollo Server

**Why**:
- Fastify: Fastest Node.js framework
- Apollo Server: Best GraphQL implementation
- TypeScript support
- Plugin ecosystem
- Low memory footprint

**Alternatives Considered**:
- Express: Slower, older design
- Koa: Smaller ecosystem
- NestJS: Over-engineered for our needs

### Database

**Database**: PostgreSQL 15+
**ORM**: Prisma 5+

**Why**:
- PostgreSQL: ACID compliance, full-text search, JSON support
- Prisma: Type-safe queries, auto-migrations, excellent DX
- Free tier on Fly.io
- Proven reliability at scale

**Alternatives Considered**:
- MongoDB: No full-text search, eventual consistency
- MySQL: Weaker JSON support
- TypeORM: Less type-safe than Prisma

## Data Flow

### Scripture Reading Flow

```
1. User opens chapter
   └─> Mobile: Load from embedded data
   └─> Web: GraphQL query to API

2. API receives request
   └─> Check Redis cache
   └─> If miss: Query PostgreSQL
   └─> Cache result for 1 hour

3. Response includes:
   └─> Verse text
   └─> User highlights (if authenticated)
   └─> Cross-references

4. Client renders
   └─> Display verses
   └─> Apply highlights
   └─> Show cross-reference indicators
```

### Highlight Creation Flow

```
1. User highlights verse
   └─> Mobile: Save to AsyncStorage
   └─> Web: GraphQL mutation to API

2. Offline queue (mobile only)
   └─> If offline: Queue mutation
   └─> When online: Sync queued mutations

3. API mutation
   └─> Authenticate user (JWT)
   └─> Validate input (Zod)
   └─> Insert to database
   └─> Invalidate cache

4. Optimistic UI update
   └─> Show highlight immediately
   └─> Revert if mutation fails
```

### Search Flow (Current)

```
1. User searches "faith"
   └─> GraphQL query with search term

2. API performs keyword search
   └─> PostgreSQL full-text search
   └─> Rank by relevance (tsvector)
   └─> Return top 50 results

3. Extract highlights
   └─> Find matching words in verses
   └─> Extract context snippets
```

### Search Flow (Planned - Semantic)

```
1. User searches "finding God"
   └─> GraphQL query with search term

2. API generates embedding
   └─> Call to embedding model
   └─> Vector: [0.123, -0.456, ...]

3. Vector similarity search
   └─> Query Qdrant vector database
   └─> Find nearest neighbors
   └─> Return verses with similar meaning

4. Combine with keyword search
   └─> Hybrid: 50% semantic, 50% keyword
   └─> Re-rank results
```

## Security Architecture

### Authentication

**Pattern**: JWT tokens

```
1. Login flow:
   POST /auth/login { email, password }
   └─> Hash check (bcrypt)
   └─> Generate JWT (7 days)
   └─> Return token + user data

2. Authenticated requests:
   Authorization: Bearer <token>
   └─> Verify JWT signature
   └─> Extract user ID
   └─> Attach to GraphQL context
```

**Token Structure**:
```json
{
  "userId": "123",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234999999
}
```

### Authorization

**Pattern**: Context-based authorization

```typescript
// Resolver level
async function createNote(parent, args, context) {
  // Require authentication
  const user = requireUser(context);

  // Check ownership
  const note = await prisma.note.findUnique({ id: args.id });
  if (note.userId !== user.id) {
    throw new ForbiddenError('Not your note');
  }

  // Proceed with mutation
}
```

### Input Validation

**Pattern**: Zod schemas

```typescript
const createNoteSchema = z.object({
  verseId: z.string().regex(/^coc-bom-1908:.+:\d+:\d+$/),
  content: z.string().min(1).max(5000),
  tags: z.array(z.string()).max(10).optional()
});

// In resolver
const validated = createNoteSchema.parse(args.input);
```

### Rate Limiting

**Pattern**: Redis-based sliding window

```typescript
// 100 requests per 15 minutes per IP
app.use(rateLimit({
  store: redisStore,
  max: 100,
  windowMs: 15 * 60 * 1000
}));
```

## Performance Optimizations

### 1. DataLoader (N+1 Prevention)

**Problem**: Fetching highlights for 50 verses = 51 queries (1 + 50)

**Solution**: Batch queries with DataLoader

```typescript
const highlightLoader = new DataLoader(async (verseIds) => {
  // Single query for all verses
  const highlights = await prisma.highlight.findMany({
    where: { verseId: { in: verseIds } }
  });

  // Group by verseId
  return verseIds.map(id => highlights.filter(h => h.verseId === id));
});

// In resolver (batched automatically)
const highlights = await context.loaders.highlight.load(verseId);
```

### 2. Redis Caching

**Strategy**: Cache-aside pattern

```typescript
async function getChapter(editionId, book, chapter) {
  const key = `chapter:${editionId}:${book}:${chapter}`;

  // Check cache
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  // Cache miss: query database
  const data = await prisma.verse.findMany({
    where: { editionId, book, chapter }
  });

  // Cache for 1 hour
  await redis.set(key, JSON.stringify(data), 'EX', 3600);

  return data;
}
```

**Cache Invalidation**: Time-based (1 hour TTL)
**Cache Keys**: Deterministic based on query params

### 3. Database Indexes

```sql
-- Primary lookups
CREATE INDEX idx_verses_lookup ON verses(editionId, book, chapter);

-- Full-text search
CREATE INDEX idx_verses_search ON verses USING gin(to_tsvector('english', text));

-- User data lookups
CREATE INDEX idx_highlights_user ON highlights(userId);
CREATE INDEX idx_notes_user ON notes(userId);

-- Composite indexes
CREATE INDEX idx_highlights_user_verse ON highlights(userId, verseId);
```

### 4. Query Optimization

**Prisma best practices**:
- Select only needed fields
- Limit results (default 100)
- Paginate large result sets
- Use transactions for multi-step operations

```typescript
// Good: Select specific fields
const verses = await prisma.verse.findMany({
  where: { book: 'I Nephi', chapter: 1 },
  select: { id: true, verse: true, text: true },
  take: 100
});

// Bad: Select all fields
const verses = await prisma.verse.findMany({
  where: { book: 'I Nephi' }  // No limit, all columns
});
```

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────────────────────┐
│                     Vercel (Web)                         │
│  • Next.js application                                   │
│  • Edge functions (globally distributed)                 │
│  • CDN for static assets                                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   Fly.io (API + Database)                │
│                                                           │
│  ┌───────────────┐           ┌─────────────────┐        │
│  │  API Server   │───────────│  PostgreSQL     │        │
│  │  (Node.js)    │           │  (1GB storage)  │        │
│  └───────────────┘           └─────────────────┘        │
│                                                           │
│  ┌───────────────┐                                       │
│  │     Redis     │                                       │
│  │   (256MB)     │                                       │
│  └───────────────┘                                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              App Store / Play Store (Mobile)             │
│  • iOS app bundle                                        │
│  • Android APK/AAB                                       │
└─────────────────────────────────────────────────────────┘
```

### CI/CD Pipeline

```
1. Push to GitHub
   └─> GitHub Actions triggered

2. Run checks
   ├─> npm run lint
   ├─> npm run type-check
   └─> npm test

3. Build artifacts
   ├─> Web: Next.js build
   ├─> API: TypeScript compile
   └─> Mobile: Not auto-deployed

4. Deploy
   ├─> Web: Vercel automatic deployment
   └─> API: Manual via ./deploy-flyio-free.sh

5. Post-deploy
   ├─> Run smoke tests
   ├─> Health check endpoint
   └─> Notify on Slack/Discord
```

## Key Design Decisions

### 1. Community of Christ Focus

**Decision**: Build specifically for CoC scriptures, not LDS

**Rationale**:
- Different versification (1830 chapters vs Pratt 1879)
- Different D&C sections (167 vs 138)
- Different theology and interpretation
- Serve underserved community

### 2. Offline-First Mobile

**Decision**: Embed all scripture data in mobile app

**Rationale**:
- Most scripture reading is offline (commutes, church)
- Eliminates server costs for read operations
- Instant loading (no network latency)
- Works in areas with poor connectivity

**Trade-off**: Larger app size (~10MB), but acceptable

### 3. Monorepo

**Decision**: Use monorepo for all code

**Rationale**:
- Share types between frontend and backend
- Coordinate changes across packages
- Single CI/CD pipeline
- Faster development iteration

**Trade-off**: More complex setup, but worth it

### 4. GraphQL over REST

**Decision**: Use GraphQL for all API operations

**Rationale**:
- Flexible data fetching (client specifies fields)
- Type-safe contract (schema as documentation)
- Single endpoint (no versioning hell)
- Built-in batching and caching

**Trade-off**: More complex than REST, but justified

### 5. No Mobile Database

**Decision**: Use AsyncStorage, not SQLite/Realm

**Rationale**:
- Scripture data is static (embedded in app)
- User data is small (highlights, notes)
- Simpler architecture (no migrations)
- AsyncStorage is fast enough

**Future**: May add SQLite if data grows

## Future Enhancements

### 1. Semantic Search

**Tech**: Qdrant + Sentence Transformers

```
1. Generate embeddings for all verses (one-time)
2. Store in Qdrant vector database
3. On search: embed query, find similar verses
4. Combine with keyword search (hybrid)
```

**Benefit**: Find verses by meaning, not just keywords

### 2. Real-time Collaboration

**Tech**: GraphQL subscriptions + WebSockets

```
1. User creates note on verse
2. Broadcast to group members via subscription
3. Real-time updates in UI
```

**Use Case**: Group study, classroom discussions

### 3. Personalization

**Tech**: User preferences, ML recommendations

```
1. Track reading patterns (books, times, topics)
2. Recommend related verses
3. Suggest reading plans
4. Personalized daily verses
```

**Privacy**: All data encrypted, opt-in

### 4. Audio Scriptures

**Tech**: Text-to-speech or human narration

```
1. Pre-record all verses (human voice)
2. Stream from CDN
3. Offline download option
4. Playback speed control
```

**Accessibility**: For visually impaired users

## Monitoring and Observability

### Metrics

- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate (% failed requests)
- Database query time
- Cache hit rate

### Logs

- Structured JSON logs
- Levels: debug, info, warn, error
- Include: timestamp, user ID, request ID, message

### Alerts

- API response time > 1 second
- Error rate > 5%
- Database connection failures
- High memory usage (> 80%)

### Tools

- Fly.io metrics (built-in)
- Vercel analytics (built-in)
- Custom logging to stdout

## Conclusion

This architecture is designed for:
- **Scalability**: Handles 1000+ concurrent users
- **Performance**: Sub-100ms API response times
- **Reliability**: 99.9% uptime target
- **Maintainability**: Clear separation of concerns
- **Cost-effectiveness**: Free tier covers initial launch

As the application grows, we can:
- Add semantic search (Qdrant)
- Scale horizontally (more API instances)
- Add CDN for scripture data
- Implement advanced caching strategies

The foundation is solid for long-term growth.
