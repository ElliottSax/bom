# Book of Mormon Study Tools - Community of Christ Edition

A modern scripture study platform for the Community of Christ featuring the Book of Mormon (1908 edition), Doctrine & Covenants (167 sections), and Inspired Version Bible.

## Quick Start

```bash
# Clone and install
git clone https://github.com/ElliottSax/bom.git
cd bom
npm install

# Start infrastructure
make docker-up

# Run database migrations
make db-migrate

# Start all development servers
make dev
```

Visit:

- Web app: http://localhost:3000
- API: http://localhost:4000/graphql
- Mobile: Use Metro bundler instructions

## Features

**Scripture Study**

- Cross-references between verses
- Highlighting and note-taking
- Daily verse rotation
- Reading goals and progress tracking
- Spaced repetition memorization

**Technical Capabilities**

- Offline-first mobile app
- Real-time sync across devices
- GraphQL API with DataLoader optimization
- Semantic search (planned)
- Community of Christ specific versification

## Project Structure

This is a monorepo managed with npm workspaces and Turborepo:

```
bom/
├── apps/
│   ├── mobile/          # React Native app (iOS + Android)
│   └── web/             # Next.js web application
├── services/
│   └── api/             # GraphQL API (TypeScript + Fastify + Prisma)
├── packages/
│   ├── shared/          # Shared utilities and types
│   └── graphql/         # GraphQL schema and generated types
└── scripts/             # Build, deploy, and maintenance scripts
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system design.

## Development

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- For mobile: Xcode (iOS) or Android Studio (Android)

### Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start infrastructure**

   ```bash
   make docker-up  # Starts PostgreSQL, Redis, Qdrant
   ```

3. **Run migrations**

   ```bash
   make db-migrate
   ```

4. **Start development servers**
   ```bash
   # All services
   make dev

   # Individual services
   make web-dev      # Web only
   make api-dev      # API only
   make mobile-ios   # iOS only
   make mobile-android  # Android only
   ```

### Available Commands

```bash
make help          # Show all available commands
make build         # Build all packages
make test          # Run all tests
make lint          # Lint all code
make format        # Format with Prettier
make type-check    # TypeScript type checking
make clean         # Clean build artifacts
```

## Testing

```bash
# Run all tests
npm test

# Test specific workspace
cd apps/web && npm test
cd apps/mobile && npm test
cd services/api && npm test

# Integration tests
./test-end-to-end.sh
```

## Deployment

### Production

```bash
# Build production assets
npm run build

# Deploy API (Fly.io)
./deploy-flyio-free.sh

# Deploy web (Vercel)
./deploy-web-to-vercel.sh

# Import scripture data
./import-all-scriptures-flyio.sh
```

### Environments

- **Development**: Local with Docker services
- **Staging**: Not yet configured
- **Production**: API on Fly.io, Web on Vercel, Database on Fly.io Postgres

See deployment scripts in `/scripts` for detailed procedures.

## Contributing

### Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test thoroughly
3. Commit with clear messages: `git commit -m "feat: add feature"`
4. Push and create a pull request

### Code Style

- TypeScript for all new code
- ESLint + Prettier for formatting
- Run `make lint` and `make format` before committing
- Use conventional commits (feat, fix, docs, etc.)

### Testing Requirements

- Add tests for new features
- Maintain 70%+ code coverage
- All tests must pass before merging

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design and architecture
- [apps/web/README.md](./apps/web/README.md) - Web app documentation
- [apps/mobile/README.md](./apps/mobile/README.md) - Mobile app documentation
- [services/api/README.md](./services/api/README.md) - API documentation
- [DEVELOPER_ONBOARDING.md](./DEVELOPER_ONBOARDING.md) - New developer guide
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Codebase organization

## Community of Christ Resources

### Scripture Editions

- **Book of Mormon**: 1908 CoC Authorized Edition (original 1830 chapters)
- **Doctrine & Covenants**: 167 sections (sections 114-167 are CoC-specific)
- **Bible**: Inspired Version (Joseph Smith Translation)

### Reference Documents

- [COMMUNITY_OF_CHRIST_VERSIFICATION.md](./docs/COMMUNITY_OF_CHRIST_VERSIFICATION.md) - Versification guide
- [COC_INTEGRATION_PLAN.md](./COC_INTEGRATION_PLAN.md) - Integration roadmap
- [COC_RLDS_STUDY_MATERIALS_CATALOG.md](./COC_RLDS_STUDY_MATERIALS_CATALOG.md) - Study materials catalog

**Note**: This platform is built specifically for Community of Christ scriptures and theology. The LDS research documents in this repo are for competitive analysis only.

## Workspaces

- `apps/mobile` - React Native mobile app (iOS + Android)
- `apps/web` - Next.js 14 web application
- `services/api` - GraphQL API server (Apollo + Fastify)
- `packages/shared` - Shared utilities and types
- `packages/graphql` - GraphQL schema and generated types

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:

- Open an issue on GitHub
- Review existing documentation
- Check the DEVELOPER_ONBOARDING guide

## Acknowledgments

Built for the Community of Christ community with scriptures and theology specific to the CoC tradition.

---

## Research Documents (Reference Only)

### [LDS_STUDY_TOOLS_RESEARCH.md](./LDS_STUDY_TOOLS_RESEARCH.md)

**Competitive Analysis**

Analysis of LDS Gospel Library app and other scripture study platforms used as competitive intelligence for feature planning. Note: This project focuses on Community of Christ scriptures, not LDS tools.

**Contents:**

- Current LDS study tools (Gospel Library, manuals, web resources)
- Competitive analysis of 8+ leading platforms
- Feature comparison matrix
- Gap analysis (critical gaps vs. market leaders)
- Improvement opportunities prioritized by impact
- Best practices synthesis
- Implementation considerations

**Key Findings:**

- Gospel Library has solid foundation but lacks modern innovations
- Critical gaps: AI features, advanced search, visualization, community tools
- 73% engagement increase with AI-powered features (industry data)
- Detailed recommendations across 11 priority areas

### [LDS_STUDY_TOOLS_TECHNICAL_IMPLEMENTATION.md](./LDS_STUDY_TOOLS_TECHNICAL_IMPLEMENTATION.md)

**Technical Implementation Guide**

Comprehensive technical specifications with code examples, architecture patterns, and implementation strategies.

**Contents (14 Major Sections):**

1. **AI & Machine Learning** - Semantic search, RAG chatbots, embeddings, fine-tuning
2. **Mobile Architecture** - React Native vs Flutter vs PWA comparison
3. **Offline-First Architecture** - PouchDB, SQLite, sync strategies
4. **Data Visualization** - D3.js network graphs, study dashboards
5. **Scripture Memory Systems** - Spaced repetition (SM-2 algorithm)
6. **UX Patterns** - Highlighting, annotations, reading experience
7. **Accessibility** - WCAG compliance, screen readers, color blindness
8. **Privacy & Security** - GDPR, encryption, data minimization
9. **Analytics** - Matomo, Plausible (privacy-friendly)
10. **Testing Strategy** - Unit, integration, E2E (Detox, Maestro)
11. **Internationalization** - i18next, RTL support, multilingual
12. **CI/CD** - Fastlane, GitHub Actions automation
13. **Performance** - CDN, virtual scrolling, query optimization
14. **Engagement** - Push notifications, streaks, achievements

**Includes:**

- Production-ready code examples in JavaScript/TypeScript
- Architecture diagrams and data flow illustrations
- Database schemas and query patterns
- Testing examples (unit, integration, E2E)
- Deployment pipelines (iOS/Android)
- Performance optimization techniques

### [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)

**18-Month Implementation Roadmap**

Complete project plan with detailed timelines, team structure, budgets, and risk management for building the platform.

**Contents (11 Major Sections):**

1. **Project Overview** - Vision, objectives, success criteria, scope
2. **Development Phases** - 6 phases from foundation to launch (Months 1-18)
3. **Team Structure** - 4 squads, 12-18 FTEs, hiring timeline, roles
4. **Technical Architecture** - System design, databases, APIs, mobile architecture
5. **Detailed Phase Breakdown** - Sprint-by-sprint plans with deliverables
6. **Risk Management** - 12 key risks with mitigation strategies
7. **Quality Assurance** - Testing strategy, performance, accessibility, security
8. **Deployment Strategy** - Environments, release process, monitoring
9. **Budget & Resources** - $6.0M-$6.5M total (personnel, infrastructure, contingency)
10. **Success Metrics** - KPIs, analytics, A/B testing framework
11. **Governance** - Decision-making, change control, communication

**Key Details:**

- **Timeline:** 18 months (6 phases, 2-week sprints)
- **Team:** 19 FTEs (Backend, Mobile, Web, DevOps squads)
- **Budget:** $6.0M-$6.5M (includes 20% contingency)
- **Phases:** Foundation → Core Platform → Intelligence → Engagement → Community → Launch
- **Target:** 1M downloads, 200K DAU, 4.7+ rating within 6 months of launch

### [USER_STORIES.md](./USER_STORIES.md)

**Product Requirements & User Stories**

Complete set of user stories organized by development phase with acceptance criteria and effort estimates.

**Contents:**

- 54 user stories across all 6 phases
- Stories organized by epic (Scripture Reading, Search, Highlighting, Notes, AI, Memory, Groups)
- Each story includes: acceptance criteria, priority (P0-P3), effort (story points), sprint assignment
- Epic summaries with total story points per phase
- Bug report and technical spike templates
- Story point scale (Fibonacci: 1, 2, 3, 5, 8, 13, 21)

**Story Distribution:**

- Phase 0 (Foundation): 3 stories, 26 points
- Phase 1 (Core Platform): 18 stories, 177 points
- Phase 2 (Intelligence): 11 stories, 150 points
- Phase 3 (Engagement): 11 stories, 106 points
- Phase 4 (Community): 6 stories, 89 points
- Phase 5 (Launch): 5 stories, 76 points
- **Total: 54 stories, 624 points**

### [API_SPECIFICATION.md](./API_SPECIFICATION.md)

**GraphQL & REST API Documentation**

Complete API contract with schema definitions, examples, and integration patterns.

**Contents:**

- Complete GraphQL schema (types, queries, mutations, subscriptions)
- 50+ example queries and mutations with variables and responses
- REST endpoints for file uploads, data export (GDPR), health checks
- Authentication with JWT tokens
- Error handling with comprehensive error codes
- Rate limiting (1000 req/hour authenticated, 100 req/minute)
- Pagination (cursor-based and offset-based)
- Versioning strategy
- cURL examples for common operations

**Key Features:**

- Verse queries with highlights, notes, cross-references
- Semantic and keyword search
- AI chatbot interactions
- Memory card spaced repetition
- Group study and discussions
- Real-time sync subscriptions
- Study statistics and analytics

## 🎯 Community of Christ Scripture Texts

### Supported Scripture Works

**1. Book of Mormon**

- **Versification:** Original 1830 chapter divisions (not Pratt 1879)
- **Example:** III Nephi 5:8 (CoC) vs. 3 Nephi 11:7 (LDS)
- **Chapters:** Longer narrative-based chapters
- **Publisher:** Herald Publishing House
- **Status:** Public domain

**2. Doctrine and Covenants**

- **Sections:** 167 (and growing!)
- **CoC-Specific:** Sections 114-167 are Community of Christ revelations
- **Latest:** Section 167 (2025, Stephen M. Veazey presidency)
- **Divergence:** Section numbering differs from LDS after section 2
- **Publisher:** Herald Publishing House
- **Status:** Early sections public domain, recent sections © Community of Christ

**3. Holy Scriptures (Bible)**

- **Inspired Version** (Joseph Smith Translation) - Primary
- **NRSV** (New Revised Standard Version) - Recommended alternative
- **Publisher:** Herald Publishing House
- **Status:** Inspired Version 1867 edition is public domain

See **[COMMUNITY_OF_CHRIST_VERSIFICATION.md](./docs/COMMUNITY_OF_CHRIST_VERSIFICATION.md)** for detailed versification guide.

---

## 🎯 Executive Summary (Competitive Analysis)

The research documents analyze LDS Gospel Library app and competitors as **competitive intelligence** for building Community of Christ study tools.

### Current State: Gospel Library App (LDS)

**Strengths:**

- ✅ Comprehensive LDS content (scriptures, manuals, conference talks)
- ✅ Solid basic features (highlighting, notes, tags, sync)
- ✅ Free, authoritative, trusted source
- ✅ Active development (2025 updates: study plans, help section)

**Critical Gaps:**

- ❌ No AI-powered features (semantic search, intelligent suggestions)
- ❌ Limited search (keyword only, no concepts/themes)
- ❌ No visualization tools (cross-reference graphs, study insights)
- ❌ Minimal community features (no group study, collaboration)
- ❌ Limited personalization (same experience for everyone)

These documents contain competitive analysis of LDS and other scripture platforms. They inform our feature planning but this platform is built specifically for Community of Christ.
