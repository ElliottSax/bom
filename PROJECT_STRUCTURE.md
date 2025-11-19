# Project Structure

Book of Mormon Study Tools - Monorepo structure using npm workspaces and Turborepo.

## Directory Layout

```
bom/
├── apps/                       # Applications
│   ├── mobile/                 # React Native mobile app (iOS + Android)
│   │   ├── src/
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── screens/        # Screen components
│   │   │   ├── navigation/     # Navigation setup
│   │   │   ├── services/       # API clients, offline sync
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── utils/          # Utility functions
│   │   │   ├── types/          # TypeScript types
│   │   │   └── theme/          # Design system
│   │   ├── android/            # Android native code
│   │   ├── ios/                # iOS native code
│   │   └── package.json
│   │
│   └── web/                    # Next.js 14 web application
│       ├── src/
│       │   ├── app/            # Next.js App Router
│       │   ├── components/     # React components
│       │   ├── lib/            # Utilities, API clients
│       │   └── hooks/          # Custom hooks
│       ├── public/             # Static assets
│       └── package.json
│
├── services/                   # Backend services
│   └── api/                    # GraphQL API server
│       ├── src/
│       │   ├── schema/         # GraphQL schema definitions
│       │   ├── resolvers/      # GraphQL resolvers
│       │   ├── models/         # Database models (Prisma)
│       │   ├── services/       # Business logic
│       │   ├── middleware/     # Auth, logging, rate limiting
│       │   ├── utils/          # Utilities
│       │   ├── loaders/        # DataLoader instances
│       │   └── index.ts        # Entry point
│       ├── prisma/
│       │   ├── schema.prisma   # Database schema
│       │   └── migrations/     # Database migrations
│       └── package.json
│
├── packages/                   # Shared packages
│   ├── shared/                 # Shared utilities and types
│   │   ├── src/
│   │   │   ├── types/          # TypeScript types
│   │   │   └── utils/          # Validation, constants
│   │   └── package.json
│   │
│   └── graphql/                # GraphQL schema and generated types
│       ├── schema.graphql      # GraphQL schema
│       ├── codegen.yml         # Code generation config
│       └── package.json
│
├── docs/                       # Documentation
│   ├── adr/                    # Architecture Decision Records
│   │   ├── 001-mobile-framework-selection.md
│   │   ├── 002-graphql-api-architecture.md
│   │   ├── 003-offline-first-architecture.md
│   │   ├── 004-vector-database-for-semantic-search.md
│   │   ├── 005-ai-llm-integration-strategy.md
│   │   └── README.md
│   └── ...                     # Other documentation
│
├── .github/
│   └── workflows/              # GitHub Actions CI/CD
│       ├── ci.yml              # Main CI pipeline
│       └── mobile-ci.yml       # Mobile-specific CI
│
├── .husky/                     # Git hooks
│   └── pre-commit              # Pre-commit hook
│
├── package.json                # Root package.json (workspaces)
├── turbo.json                  # Turborepo configuration
├── tsconfig.json               # Root TypeScript config
├── .eslintrc.js                # ESLint configuration
├── .prettierrc.json            # Prettier configuration
├── docker-compose.yml          # Production Docker setup
├── docker-compose.dev.yml      # Development Docker setup
├── Makefile                    # Common development tasks
└── README.md                   # Project overview
```

## Workspaces

This project uses npm workspaces for managing dependencies across the monorepo:

- `apps/*` - Application packages (mobile, web)
- `services/*` - Backend services (api)
- `packages/*` - Shared packages (shared, graphql)

## Package Dependencies

```
┌─────────────┐
│   mobile    │──┐
└─────────────┘  │
                 │
┌─────────────┐  │    ┌─────────────┐
│     web     │──┼───→│   shared    │
└─────────────┘  │    └─────────────┘
                 │
┌─────────────┐  │    ┌─────────────┐
│     api     │──┴───→│   graphql   │
└─────────────┘       └─────────────┘
```

All apps and services depend on `@bom/shared` and `@bom/graphql`.

## Technology Stack

### Mobile (apps/mobile)
- React Native 0.77+ (New Architecture)
- React Navigation
- Apollo Client (GraphQL)
- PouchDB (offline storage)
- SQLite (scripture content)

### Web (apps/web)
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Apollo Client (GraphQL)
- Radix UI

### API (services/api)
- Node.js + TypeScript
- Apollo Server (GraphQL)
- Fastify (HTTP server)
- Prisma (ORM)
- PostgreSQL (database)
- Redis (caching)
- Qdrant (vector database)

### Shared (packages/shared)
- TypeScript
- Zod (validation)

### GraphQL (packages/graphql)
- GraphQL
- GraphQL Code Generator

## Development

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- iOS: Xcode 15+, CocoaPods
- Android: Android Studio, JDK 17

### Getting Started

```bash
# Install dependencies
npm install

# Start infrastructure (PostgreSQL, Redis, Qdrant)
make docker-up

# Run database migrations
make db-migrate

# Seed database
make db-seed

# Start all development servers
make dev
```

### Individual Commands

```bash
# Mobile
npm run mobile:ios
npm run mobile:android

# Web
npm run web:dev

# API
npm run api:dev

# Run tests
npm test

# Lint
npm run lint

# Type check
npm run type-check
```

## Building for Production

```bash
# Build all packages
npm run build

# Build Docker images
docker-compose build

# Run production
docker-compose up
```

## CI/CD

Automated pipelines run on every push:

1. **Lint** - ESLint checks
2. **Type Check** - TypeScript validation
3. **Test** - Unit and integration tests
4. **Build** - Compile all packages

Mobile CI includes:
- iOS build (macOS runner)
- Android build (Ubuntu runner)
- E2E tests with Detox

## Related Documentation

- [README.md](./README.md) - Project overview
- [Development Plan](./DEVELOPMENT_PLAN.md) - 18-month roadmap
- [User Stories](./USER_STORIES.md) - Product requirements
- [API Specification](./API_SPECIFICATION.md) - GraphQL API docs
- [Technical Implementation](./LDS_STUDY_TOOLS_TECHNICAL_IMPLEMENTATION.md) - Technical guide
- [ADRs](./docs/adr/README.md) - Architecture decisions

## Questions?

See individual package READMEs:
- [apps/mobile/README.md](./apps/mobile/README.md)
- [apps/web/README.md](./apps/web/README.md)
- [services/api/README.md](./services/api/README.md)
