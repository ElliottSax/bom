# Current Development Status - Community of Christ Scripture Study Tools

**Last Updated:** November 29, 2025
**Current Phase:** Phase 0 → Phase 1 Transition
**Status:** ✅ Phase 0 Complete, Dependencies Installing

---

## ✅ Recently Completed

### 1. Project Scope Clarification
- **Committed** documentation updates clarifying Community of Christ focus
- Added `COMMUNITY_OF_CHRIST_VERSIFICATION.md` with detailed versification guide
- Updated all docs to emphasize:
  - Book of Mormon: 1830 original chapters (not LDS Pratt 1879)
  - Doctrine & Covenants: 167 sections (114+ are CoC-specific)
  - Bible: Inspired Version (Joseph Smith Translation) + NRSV
  - LDS research documents are competitive analysis only

### 2. Development Environment Setup
- ✅ `.env.development` file created with:
  - JWT secret generated
  - PostgreSQL connection for `bom_development` database
  - Redis caching configuration
  - Development-friendly CORS and rate limiting
  - Feature flags (AI disabled for Phase 1, will enable in Phase 2)

### 3. Phase 0 Infrastructure (Previously Completed)
- ✅ Complete middleware framework (validation, rate limiting, CORS)
- ✅ Health check endpoints
- ✅ Security hardening
- ✅ Comprehensive test suite (~40 tests)
- ✅ Docker Compose files (development, production, monitoring)
- ✅ Prisma schema with full CoC versification support
- ✅ Complete documentation suite

---

## 🔄 In Progress

### Dependencies Installation
**Status:** npm install running (WSL2 performance issues)

**Issue:** pnpm install repeatedly timed out on WSL2
**Solution:** Switched to npm install --legacy-peer-deps
**Progress:** npm actively running, consuming ~53% CPU

**Estimated Completion:** ~5-10 minutes (depending on WSL2 performance)

---

## 📋 Next Steps (Once Dependencies Install)

### Immediate Tasks

1. **Verify Installation**
   ```bash
   # Check if node_modules created
   ls node_modules packages/*/node_modules services/*/node_modules apps/*/node_modules

   # Run TypeScript compilation test
   cd services/api && npm run build
   ```

2. **Start Docker Services**
   ```bash
   # Start PostgreSQL, Redis, Qdrant
   docker-compose -f docker-compose.dev.yml up -d

   # Verify services are healthy
   docker-compose -f docker-compose.dev.yml ps
   ```

3. **Database Setup**
   ```bash
   cd services/api

   # Generate Prisma Client
   npx prisma generate

   # Create database and run migrations
   npx prisma migrate dev --name init

   # Seed database with CoC scripture data
   npm run db:seed
   ```

4. **Run Tests**
   ```bash
   # From project root
   npm test

   # Expected: All validation, middleware, and CORS tests pass
   # Target: 70%+ code coverage
   ```

5. **Start Development Server**
   ```bash
   # Start API server
   cd services/api && npm run dev

   # API should be available at http://localhost:4000
   # Test: curl http://localhost:4000/health
   ```

### Phase 1 Development Tasks

#### Month 3: Sprint 1-2 (Backend Foundation)

**Backend Squad Tasks:**
- [ ] Implement authentication endpoints (register, login)
- [ ] Create GraphQL schema for scripture queries
- [ ] Build verse lookup resolvers
- [ ] Implement basic search (keyword)
- [ ] Set up Apollo Server with Fastify

**Priority User Stories:**
- US-100: Browse Scripture by Book/Chapter (P0, 8 points)
- US-101: Read Scripture with Formatting (P0, 5 points)
- US-102: Dark Mode Support (P1, 5 points)

**Deliverables:**
- Users can browse Book of Mormon by book/chapter
- Basic reading experience functional
- API serves CoC Book of Mormon content
- Authentication working

#### Scripture Data Requirements

**CoC Book of Mormon Data Needed:**
1. Book names with original 1830 chapter divisions
2. Full text for all verses
3. Cross-reference mapping to LDS edition
4. Metadata (topics, people, places)

**Data Sources:**
- Primary: Community of Christ official texts
- Mapping: Joseph Smith Papers versification tables
- Format: SQL seed files for Prisma

---

## 🎯 Phase 1 Success Criteria

### Technical Milestones
- [ ] All dependencies installed successfully
- [ ] Database migrated with CoC versification support
- [ ] Tests passing with 70%+ coverage
- [ ] API serving scripture content
- [ ] Authentication working
- [ ] Basic GraphQL queries functional

### Feature Completion
- [ ] Scripture reading (book, chapter, verse lookup)
- [ ] User registration and login
- [ ] Basic search (keyword)
- [ ] Offline-first data architecture
- [ ] Sync framework (foundation)

### Quality Targets
- Test coverage: >70%
- API response time: <300ms (p95)
- Page load time: <1s
- Zero critical bugs
- Accessibility: WCAG AA minimum

---

## 📊 Database Schema Highlights

### Community of Christ Versification Support

**ScriptureWork Model:**
- `book-of-mormon`: Book of Mormon
- `doctrine-and-covenants`: D&C (167 sections)
- `bible`: Holy Scriptures

**Edition Model:**
```typescript
{
  id: "coc-bom-1908",
  work: "book-of-mormon",
  name: "Community of Christ Book of Mormon (1908)",
  versificationSystem: "original-chapters", // vs "pratt-1879"
  isPrimary: true, // Default for CoC users
  isPublicDomain: true
}
```

**Verse Model:**
```typescript
{
  id: "coc-bom-1908:3-nephi-5-8",
  book: "III Nephi",
  chapter: 5,
  verse: 8,
  text: "...",
  // Mapped to LDS: 3 Nephi 11:7
}
```

**VerseMapping Model:**
```typescript
{
  fromVerse: "coc-bom-1908:3-nephi-5-8",
  toVerse: "lds-bom-2013:3-nephi-11-7",
  mappingType: "exact", // or "partial", "merged", "split"
  verified: true
}
```

---

## 🔧 Development Commands

### Quick Start (After Dependencies Install)
```bash
# 1. Start infrastructure
make docker-up

# 2. Run migrations
make db-migrate

# 3. Seed CoC scripture data
make db-seed

# 4. Start all services
make dev
```

### Individual Services
```bash
# API only
npm run api:dev

# Web only
npm run web:dev

# Mobile (iOS)
npm run mobile:ios

# Mobile (Android)
npm run mobile:android
```

### Testing
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Database
```bash
# Generate Prisma Client
cd services/api && npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

---

## 📁 Project Structure

```
bom/
├── apps/
│   ├── mobile/          # React Native app
│   └── web/             # Next.js web app
├── services/
│   └── api/             # GraphQL API (Fastify + Apollo)
│       ├── src/
│       │   ├── index.ts
│       │   ├── middleware/  ✅ Complete
│       │   ├── validation/  ✅ Complete
│       │   ├── routes/      ✅ Health checks done
│       │   ├── resolvers/   ⚠️  To be created (Phase 1)
│       │   └── services/    ⚠️  To be created (Phase 1)
│       └── prisma/
│           └── schema.prisma ✅ Complete with CoC support
├── packages/
│   ├── shared/          # Shared utilities
│   └── graphql/         # GraphQL schema
└── docs/
    └── COMMUNITY_OF_CHRIST_VERSIFICATION.md  ✅ Complete
```

---

## 🎓 Key Decisions

### Technology Choices
- **Database:** PostgreSQL (user data) + Qdrant (Phase 2 semantic search)
- **API:** GraphQL via Apollo Server + Fastify
- **Mobile:** React Native 0.77+ (decision locked in package.json)
- **Web:** Next.js 14 with App Router
- **ORM:** Prisma with multi-edition support
- **Package Manager:** npm (pnpm had WSL2 issues)

### Versification Strategy
- **Primary Edition:** CoC 1908 Book of Mormon (original 1830 chapters)
- **Cross-References:** Automated mapping to LDS 2013 edition
- **D&C:** All 167 sections (including CoC-specific 114-167)
- **Bible:** Inspired Version (IV/JST) as primary, NRSV as optional

### Phase 1 Scope
- **IN:** Basic reading, authentication, search, offline foundation
- **OUT:** AI features (Phase 2), memory system (Phase 3), groups (Phase 4)
- **Focus:** Solid MVP with CoC scripture content

---

## 🚀 Launch Readiness Checklist

### Phase 0 ✅
- [x] Infrastructure setup
- [x] Development environment
- [x] Middleware and security
- [x] Testing framework
- [x] Documentation complete
- [x] Team structure defined

### Phase 1 (Current)
- [ ] Dependencies installed
- [ ] Database migrated
- [ ] Scripture data seeded (CoC BoM)
- [ ] Authentication working
- [ ] GraphQL API functional
- [ ] Basic web app running
- [ ] Mobile app scaffolded

---

## 📝 Notes

### Known Issues
1. **WSL2 Performance:** npm/pnpm install slow on WSL2
   - **Workaround:** Using npm with --legacy-peer-deps
   - **Future:** Consider Docker-based dev environment

2. **Apollo Server Deprecation:** Using @apollo/server@4.12.2 (deprecated)
   - **Action:** Plan upgrade to v5 in Q1 2026
   - **Impact:** Low (EOL not until Jan 26, 2026)

### Scripture Data Priorities
1. **Phase 1:** Book of Mormon (CoC 1908) complete text
2. **Phase 2:** D&C (all 167 sections)
3. **Phase 3:** Inspired Version Bible (public domain verses)
4. **Phase 4:** NRSV Bible (if licensed)

---

**Next Action:** Wait for npm install to complete, then run database setup and start Phase 1 development.

**Estimated Time to Phase 1 Start:** ~15-20 minutes (dependencies + DB setup)
