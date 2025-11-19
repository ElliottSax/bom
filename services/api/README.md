# Book of Mormon Study Tools - GraphQL API

Apollo Server with Fastify backend providing GraphQL API.

## Architecture Decision

See [ADR-002: GraphQL API Architecture](../../docs/adr/002-graphql-api-architecture.md) for the decision to use GraphQL as the primary API.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Start development server
npm run dev
```

## Project Structure

```
services/api/
├── src/
│   ├── schema/          # GraphQL schema definitions
│   ├── resolvers/       # GraphQL resolvers
│   ├── models/          # Database models (Prisma)
│   ├── services/        # Business logic
│   ├── middleware/      # Authentication, logging
│   ├── utils/           # Utility functions
│   ├── loaders/         # DataLoader instances
│   └── index.ts         # Entry point
├── prisma/
│   ├── schema.prisma    # Prisma schema
│   └── migrations/      # Database migrations
└── package.json
```

## API Endpoints

- **GraphQL**: `http://localhost:4000/graphql`
- **GraphQL Playground**: `http://localhost:4000/graphql` (dev only)
- **Health Check**: `http://localhost:4000/health`

## Environment Variables

```env
NODE_ENV=development
PORT=4000

DATABASE_URL=postgresql://user:password@localhost:5432/bom_study_tools
REDIS_URL=redis://localhost:6379

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

OPENAI_API_KEY=your-openai-key
QDRANT_URL=http://localhost:6333
```

## Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Coverage
npm run test:coverage
```

## Database

### Migrations

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npm run db:migrate

# Reset database
npx prisma migrate reset
```

### Seeding

```bash
npm run db:seed
```

## GraphQL Schema

See [API_SPECIFICATION.md](../../API_SPECIFICATION.md) for complete API documentation.

### Example Queries

```graphql
query GetVerse {
  verse(reference: "1-nephi-3-7") {
    id
    reference
    text
    highlights {
      color
    }
    notes {
      content
    }
  }
}
```

## Related Documentation

- [API Specification](../../API_SPECIFICATION.md)
- [GraphQL ADR](../../docs/adr/002-graphql-api-architecture.md)
- [Technical Implementation Guide](../../LDS_STUDY_TOOLS_TECHNICAL_IMPLEMENTATION.md)
