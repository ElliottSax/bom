# Developer Onboarding Guide

Welcome to the Book of Mormon Study Tools project! This guide will help you get set up and productive quickly.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Understanding the Codebase](#understanding-the-codebase)
4. [Development Workflow](#development-workflow)
5. [Testing](#testing)
6. [Code Standards](#code-standards)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)
9. [Resources](#resources)

## Prerequisites

### Required Software

1. **Node.js 18+**
   ```bash
   # Install using nvm (recommended)
   nvm install 18
   nvm use 18

   # Or download from nodejs.org
   ```

2. **Git**
   ```bash
   git --version  # Should be 2.30+
   ```

3. **Docker & Docker Compose**
   ```bash
   docker --version         # Should be 20.10+
   docker-compose --version # Should be 2.0+
   ```

4. **Code Editor**
   - Recommended: [Visual Studio Code](https://code.visualstudio.com/)
   - Install recommended extensions (see [.vscode/extensions.json](#recommended-vscode-extensions))

### Platform-Specific (for mobile development)

#### iOS Development
- **macOS only**
- Xcode 15+ (from Mac App Store)
- CocoaPods: `sudo gem install cocoapods`
- Xcode Command Line Tools: `xcode-select --install`

#### Android Development
- Android Studio (any platform)
- Java JDK 17
- Android SDK (API 33+)
- Set `ANDROID_HOME` environment variable

### Optional but Recommended

- **Make**: For simplified commands (comes with macOS/Linux, Windows users: install via Chocolatey)
- **PostgreSQL client**: `psql` for database debugging
- **Redis client**: `redis-cli` for cache debugging

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ElliottSax/bom.git
cd bom
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
npm install

# This will also:
# - Set up git hooks (Husky)
# - Build shared packages
```

### 3. Start Infrastructure Services

```bash
# Start PostgreSQL, Redis, Qdrant via Docker
make docker-up

# Or manually:
docker-compose -f docker-compose.dev.yml up -d
```

Wait for all services to be healthy (check with `docker-compose ps`).

### 4. Set Up Environment Variables

#### API Service
```bash
cd services/api
cp .env.example .env

# Edit .env with your settings
# For local development, defaults should work
```

#### Web App
```bash
cd apps/web
echo "NEXT_PUBLIC_API_URL=http://localhost:4000/graphql" > .env.local
```

#### Mobile App
```bash
cd apps/mobile
echo "API_URL=http://localhost:4000/graphql" > .env
```

### 5. Database Setup

```bash
# Run migrations
make db-migrate

# Seed with sample data
make db-seed
```

### 6. Generate GraphQL Types

```bash
cd packages/graphql
npm run codegen
```

### 7. Build Shared Packages

```bash
# From root directory
npm run build
```

### 8. Start Development Servers

Choose your focus area:

#### Full Stack Development
```bash
make dev
# This starts API, web, and watches all packages
```

#### API Only
```bash
npm run api:dev
# Runs on http://localhost:4000
# GraphQL Playground: http://localhost:4000/graphql
```

#### Web Only
```bash
npm run web:dev
# Runs on http://localhost:3000
```

#### Mobile (iOS)
```bash
# First time setup
cd apps/mobile/ios
pod install
cd ../..

# Run app
npm run mobile:ios
```

#### Mobile (Android)
```bash
npm run mobile:android
```

## Understanding the Codebase

### Monorepo Structure

This is a **monorepo** using npm workspaces and Turborepo:

```
bom/
├── apps/          # Applications (mobile, web)
├── services/      # Backend services (api)
├── packages/      # Shared code (shared, graphql)
└── docs/          # Documentation
```

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for complete layout.

### Key Concepts

#### 1. Workspaces
Each folder in `apps/`, `services/`, and `packages/` is a separate npm package. They reference each other using workspace protocol:

```json
"dependencies": {
  "@bom/shared": "workspace:*",
  "@bom/graphql": "workspace:*"
}
```

#### 2. Turborepo
Turborepo orchestrates builds and caching:
- Runs tasks in dependency order
- Caches build outputs
- Parallelizes when possible

#### 3. Shared Packages

**@bom/shared**: Shared types and utilities
```typescript
import { Verse, HighlightColor, validateVerseReference } from '@bom/shared';
```

**@bom/graphql**: GraphQL schema and generated types
```typescript
import { GetVerseQuery, CreateHighlightMutation } from '@bom/graphql';
```

### Architecture Decisions

We've documented major architectural decisions in [docs/adr/](./docs/adr/). **Read these first!**

1. [ADR-001: Mobile Framework Selection](./docs/adr/001-mobile-framework-selection.md) - Why React Native
2. [ADR-002: GraphQL API Architecture](./docs/adr/002-graphql-api-architecture.md) - Why GraphQL
3. [ADR-003: Offline-First Architecture](./docs/adr/003-offline-first-architecture.md) - How offline sync works
4. [ADR-004: Vector Database for Semantic Search](./docs/adr/004-vector-database-for-semantic-search.md) - Qdrant for AI search
5. [ADR-005: AI/LLM Integration Strategy](./docs/adr/005-ai-llm-integration-strategy.md) - RAG chatbot approach

### Data Flow

```
┌──────────┐
│  Mobile  │
│   App    │
└────┬─────┘
     │
┌────▼─────┐     ┌─────────────┐
│   Web    │────→│  GraphQL    │
│   App    │     │     API     │
└──────────┘     └──────┬──────┘
                        │
                 ┌──────▼──────┐
                 │  PostgreSQL │
                 └─────────────┘

                 ┌─────────────┐
                 │    Redis    │
                 │  (Caching)  │
                 └─────────────┘

                 ┌─────────────┐
                 │   Qdrant    │
                 │  (Vectors)  │
                 └─────────────┘
```

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `claude/*` - Claude-generated code (your branch will follow this pattern)

### Making Changes

1. **Create a branch** (if not using Claude branch)
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code
   - Add tests
   - Update documentation

3. **Verify locally**
   ```bash
   npm run lint        # Lint check
   npm run type-check  # TypeScript check
   npm run test        # Run tests
   npm run build       # Build all packages
   ```

4. **Commit**
   ```bash
   git add .
   git commit -m "Your commit message"
   # Pre-commit hooks will run automatically (lint, type-check)
   ```

5. **Push**
   ```bash
   git push -u origin your-branch-name
   ```

6. **Create Pull Request**
   - Go to GitHub
   - Create PR against `develop`
   - Fill in PR template
   - Request reviews

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, missing semi-colons, etc.
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Updating build tasks, package manager configs, etc.

**Examples:**
```
feat(mobile): add semantic search to scripture reader

Implemented semantic search using Qdrant vector database.
Users can now search by concepts, not just keywords.

Closes #123
```

```
fix(api): resolve N+1 query in highlights resolver

Added DataLoader to batch highlight queries by verse ID.
Reduces database queries from O(n) to O(1).
```

## Testing

### Test Strategy

We follow the testing pyramid:
- **70% Unit Tests** - Fast, isolated
- **20% Integration Tests** - API + Database
- **10% E2E Tests** - Full user flows

### Running Tests

```bash
# All tests
npm test

# Specific package
cd apps/mobile
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Writing Tests

#### Unit Test Example (Jest)

```typescript
// packages/shared/src/utils/validation.test.ts
import { validateVerseReference } from './validation';

describe('validateVerseReference', () => {
  it('should accept valid verse references', () => {
    expect(validateVerseReference('1-nephi-3-7')).toBe(true);
    expect(validateVerseReference('alma-32-28')).toBe(true);
  });

  it('should reject invalid verse references', () => {
    expect(validateVerseReference('invalid')).toBe(false);
    expect(validateVerseReference('1nephi37')).toBe(false);
  });
});
```

#### Integration Test Example

```typescript
// services/api/src/resolvers/verse.test.ts
import { createTestClient } from 'apollo-server-testing';
import { server } from '../server';

describe('Verse Resolver', () => {
  it('should fetch verse by reference', async () => {
    const { query } = createTestClient(server);

    const GET_VERSE = gql`
      query GetVerse($reference: String!) {
        verse(reference: $reference) {
          id
          text
        }
      }
    `;

    const { data } = await query({
      query: GET_VERSE,
      variables: { reference: '1-nephi-3-7' },
    });

    expect(data.verse).toBeDefined();
    expect(data.verse.text).toContain('I will go and do');
  });
});
```

#### E2E Test Example (Detox)

```typescript
// apps/mobile/e2e/scripture-reader.test.ts
describe('Scripture Reader', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should display verse text', async () => {
    await element(by.id('search-input')).typeText('1-nephi-3-7');
    await element(by.id('search-button')).tap();

    await expect(element(by.text('I will go and do'))).toBeVisible();
  });
});
```

## Code Standards

### TypeScript

- **Strict mode enabled** - No implicit `any`
- **Explicit return types** for exported functions
- **Interfaces over types** for object shapes

```typescript
// Good
export interface Verse {
  id: string;
  text: string;
}

export function formatVerse(verse: Verse): string {
  return `${verse.id}: ${verse.text}`;
}

// Avoid
export type Verse = {
  id: string;
  text: string;
};

export function formatVerse(verse) {  // Missing types
  return `${verse.id}: ${verse.text}`;
}
```

### React/React Native

- **Functional components** with hooks
- **Named exports** for components
- **Props interfaces** defined above component

```typescript
// Good
interface VerseCardProps {
  verse: Verse;
  onPress: () => void;
}

export function VerseCard({ verse, onPress }: VerseCardProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{verse.text}</Text>
    </TouchableOpacity>
  );
}

// Avoid
export default ({ verse, onPress }) => {  // No types, default export
  return <TouchableOpacity onPress={onPress}>...</TouchableOpacity>;
};
```

### File Naming

- **Components**: PascalCase (e.g., `VerseCard.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)
- **Tests**: Same as source file + `.test.ts` (e.g., `VerseCard.test.tsx`)

### Import Order

1. External dependencies
2. Internal packages (`@bom/*`)
3. Relative imports
4. Types (if separate)

```typescript
// Good
import React, { useState } from 'react';
import { View, Text } from 'react-native';

import { Verse, HighlightColor } from '@bom/shared';
import { useGetVerseQuery } from '@bom/graphql';

import { VerseCard } from './components/VerseCard';
import { formatDate } from '../utils/formatDate';

import type { Navigation } from './types';
```

### Linting

ESLint and Prettier are configured. Run before committing:

```bash
npm run lint        # Check for issues
npm run lint -- --fix  # Auto-fix issues
npm run format      # Format all files
```

Pre-commit hooks will run these automatically.

## Common Tasks

### Add a New GraphQL Query

1. Update schema:
   ```graphql
   # packages/graphql/schema.graphql
   type Query {
     myNewQuery(input: String!): Result!
   }
   ```

2. Regenerate types:
   ```bash
   cd packages/graphql
   npm run codegen
   ```

3. Implement resolver:
   ```typescript
   // services/api/src/resolvers/myNewQuery.ts
   export const myNewQuery = async (parent, args, context) => {
     // Implementation
   };
   ```

4. Use in client:
   ```typescript
   import { useMyNewQueryQuery } from '@bom/graphql';

   const { data, loading } = useMyNewQueryQuery({
     variables: { input: 'value' }
   });
   ```

### Add a New Shared Type

1. Define type:
   ```typescript
   // packages/shared/src/types/myType.ts
   export interface MyType {
     id: string;
     name: string;
   }
   ```

2. Export from index:
   ```typescript
   // packages/shared/src/index.ts
   export * from './types/myType';
   ```

3. Build:
   ```bash
   cd packages/shared
   npm run build
   ```

4. Use anywhere:
   ```typescript
   import { MyType } from '@bom/shared';
   ```

### Add a Database Migration

```bash
cd services/api

# Create migration
npx prisma migrate dev --name add_new_field

# This will:
# 1. Generate SQL migration file
# 2. Apply migration to database
# 3. Regenerate Prisma client
```

### Deploy to Staging

```bash
# Build all packages
npm run build

# Build Docker images
docker-compose build

# Push to registry
docker-compose push

# Deploy (depends on your infrastructure)
# e.g., kubectl apply -f k8s/staging/
```

## Troubleshooting

### "Module not found" errors

**Cause**: Shared packages not built

**Solution**:
```bash
npm run build
# Or for specific package:
cd packages/shared && npm run build
```

### Database connection errors

**Cause**: PostgreSQL not running or wrong credentials

**Solution**:
```bash
# Check if running
docker-compose ps

# Restart services
make docker-down
make docker-up

# Check connection
psql postgresql://postgres:postgres@localhost:5432/bom_study_tools
```

### "Port already in use"

**Cause**: Previous process didn't shut down

**Solution**:
```bash
# Find process on port (e.g., 4000)
lsof -i :4000

# Kill process
kill -9 <PID>

# Or restart everything
make clean
make docker-up
make dev
```

### iOS build fails

**Cause**: Outdated pods or derived data

**Solution**:
```bash
cd apps/mobile/ios

# Clean
rm -rf Pods Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData

# Reinstall
pod install

# Build
cd .. && npm run ios
```

### GraphQL types out of sync

**Cause**: Schema changed but types not regenerated

**Solution**:
```bash
cd packages/graphql
npm run codegen

# Rebuild
npm run build
```

## Resources

### Documentation

- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Complete directory layout
- [API_SPECIFICATION.md](./API_SPECIFICATION.md) - GraphQL API docs
- [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) - 18-month roadmap
- [USER_STORIES.md](./USER_STORIES.md) - Product requirements
- [docs/adr/](./docs/adr/) - Architecture decisions

### External Resources

- [React Native Docs](https://reactnative.dev/)
- [Next.js Docs](https://nextjs.org/docs)
- [GraphQL Docs](https://graphql.org/learn/)
- [Apollo Client Docs](https://www.apollographql.com/docs/react/)
- [Prisma Docs](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### Team Communication

- **Slack**: #engineering channel
- **Stand-ups**: Daily at 10am
- **Sprint Planning**: Bi-weekly Mondays
- **Retros**: Bi-weekly Fridays

### Getting Help

1. **Check documentation** (you're here!)
2. **Search existing issues** on GitHub
3. **Ask in Slack** #engineering
4. **Create GitHub issue** if it's a bug/feature request
5. **Pair with senior dev** for complex issues

## Recommended VSCode Extensions

Create `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "apollographql.vscode-apollo",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

## Next Steps

1. ✅ Complete this onboarding guide
2. 📖 Read [ADRs](./docs/adr/) to understand key decisions
3. 🏗️ Build your first feature (start with a small bug fix)
4. 🧪 Write your first test
5. 🎉 Ship your first PR!

**Welcome to the team! 🚀**

---

**Last Updated:** 2025-11-19
**Maintained By:** Technical Lead

Questions? Reach out in #engineering Slack channel.
