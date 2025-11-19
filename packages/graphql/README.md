# @bom/graphql

GraphQL schema definitions and generated TypeScript types.

## Usage

### Generating Types

```bash
npm run codegen
```

This generates TypeScript types from the GraphQL schema into `src/generated/types.ts`.

### Importing Types

```typescript
import { Verse, Highlight, CreateHighlightInput } from '@bom/graphql';
```

## Schema

The GraphQL schema is defined in `schema.graphql`. See [API_SPECIFICATION.md](../../API_SPECIFICATION.md) for complete documentation.

## Development

When you modify `schema.graphql`:
1. Run `npm run codegen` to regenerate types
2. Update the API server resolvers
3. Update client queries/mutations as needed
