# ADR-002: GraphQL as Primary API Architecture

**Date:** 2025-11-19
**Status:** Proposed
**Deciders:** Technical Lead, Backend Squad Lead, Mobile Squad Lead

## Context

We need to define the API architecture for communication between mobile/web clients and backend services. The API will handle:
- Scripture content queries
- User data (highlights, notes, progress)
- Search (keyword and semantic)
- AI features (chatbot, recommendations)
- Real-time sync
- Group collaboration

Key requirements:
- Efficient data fetching (avoid over-fetching/under-fetching)
- Flexible for evolving client needs
- Support for real-time updates
- Strong typing for reliability
- Mobile-friendly (minimize requests)

## Decision

We will use **GraphQL** as our primary API architecture, with supplementary REST endpoints for specific use cases (file uploads, webhooks).

**Implementation:**
- Apollo Server for GraphQL server
- Apollo Client for web/mobile clients
- GraphQL Subscriptions (WebSockets) for real-time features
- REST endpoints for: file uploads, GDPR data exports, webhooks

## Rationale

### Key Advantages for Our Use Case:

1. **Efficient Data Fetching**
   - Clients request exactly what they need
   - Single request for verse + highlights + notes + cross-references
   - Critical for mobile bandwidth efficiency
   - Reduces API calls from ~5-10 (REST) to 1 (GraphQL) for typical scripture view

2. **Flexible Evolution**
   - Add new fields without breaking existing clients
   - Deprecate fields gracefully
   - Clients opt-in to new features
   - Reduces need for API versioning

3. **Strong Typing**
   - Schema serves as contract
   - Automatic validation
   - Generated TypeScript types for clients
   - Reduces runtime errors

4. **Developer Experience**
   - GraphiQL/Apollo Studio for exploration
   - Self-documenting API
   - Code generation for clients
   - Faster frontend development

5. **Real-Time Capabilities**
   - Built-in subscriptions for sync status
   - Group activity notifications
   - Recommendation updates

6. **Mobile Optimized**
   - Batch related queries
   - Persistent queries for reduced payload
   - Automatic query deduplication
   - Intelligent caching with Apollo Client

### Trade-offs Accepted:

- **Learning Curve:** Team needs to learn GraphQL (but worth investment)
- **Caching Complexity:** More complex than REST HTTP caching (but Apollo handles it)
- **File Uploads:** Need multipart upload spec or REST fallback (using REST)
- **Server Complexity:** More sophisticated server implementation (but better long-term)

## Consequences

### Positive:

- ✅ Efficient network usage (critical for mobile)
- ✅ Reduced API endpoint proliferation
- ✅ Type safety across stack
- ✅ Excellent developer experience
- ✅ Self-documenting API
- ✅ Real-time capabilities built-in
- ✅ Flexible for future features
- ✅ Reduced over-fetching/under-fetching

### Negative:

- ❌ Learning curve for team
- ❌ More complex error handling
- ❌ Requires GraphQL-specific security considerations
- ❌ HTTP caching less straightforward
- ❌ File uploads require workaround

### Neutral:

- 🔄 Need to implement rate limiting at resolver level
- 🔄 Query complexity analysis required to prevent abuse
- 🔄 Monitoring and observability needs GraphQL-aware tools

## Alternatives Considered

### Option 1: REST API Only
**Pros:**
- Team already familiar
- Simple HTTP caching
- Wide tooling support
- Easier to debug

**Cons:**
- Over-fetching/under-fetching common
- Multiple round-trips for related data
- API versioning required for changes
- More endpoints to maintain
- Difficult to make flexible queries

**Example Problem:**
```
// REST: 4 requests to load scripture view
GET /api/verses/1-nephi-3-7
GET /api/verses/1-nephi-3-7/highlights
GET /api/verses/1-nephi-3-7/notes
GET /api/verses/1-nephi-3-7/cross-references

// GraphQL: 1 request
query {
  verse(reference: "1-nephi-3-7") {
    text
    highlights { color }
    notes { content }
    crossReferences { toVerse }
  }
}
```

**Decision:** Rejected as primary approach due to inefficiency

### Option 2: gRPC
**Pros:**
- Excellent performance (binary protocol)
- Strong typing with Protocol Buffers
- Efficient for microservices

**Cons:**
- Not web-native (requires grpc-web)
- Poor browser support
- Limited tooling for web/mobile
- Steeper learning curve than GraphQL
- Not human-readable

**Decision:** Rejected due to web/mobile focus

### Option 3: Hybrid (GraphQL + REST)
**Pros:**
- Use best tool for each job
- GraphQL for queries, REST for mutations
- Familiar patterns

**Cons:**
- Inconsistent API experience
- Two patterns to maintain
- Confusing for clients

**Decision:** Partially adopted - GraphQL primary, REST for edge cases only

## Implementation Plan

### Phase 0 (Months 1-2):

1. **Schema Design:**
   - Define core types (Verse, Highlight, Note, etc.)
   - Design query structure
   - Plan for pagination
   - Error handling patterns

2. **Server Setup:**
   - Apollo Server configuration
   - PostgreSQL/MongoDB connectors
   - Authentication middleware
   - Rate limiting

3. **Client Setup:**
   - Apollo Client for React Native/Web
   - Code generation scripts
   - Error handling utilities
   - Cache configuration

### Phase 1 (Months 3-6):

4. **Core Queries/Mutations:**
   - Scripture queries
   - Highlight/Note CRUD
   - Search integration
   - User preferences

5. **Subscriptions:**
   - Sync status updates
   - Real-time notifications

6. **Testing:**
   - Integration tests for resolvers
   - Client query tests
   - Performance testing

## Security Considerations

1. **Query Complexity Limiting:**
   ```javascript
   const server = new ApolloServer({
     validationRules: [depthLimit(7), createComplexityLimitRule(1000)]
   });
   ```

2. **Rate Limiting:**
   - Per-user limits (1000 req/hour)
   - Per-resolver limits for expensive operations
   - GraphQL-specific rate limiting (not just endpoint-based)

3. **Authentication:**
   - JWT tokens in Authorization header
   - Context injection for user identity
   - Field-level authorization

4. **Query Whitelisting:**
   - Persistent queries in production
   - Only allow known queries
   - Prevent arbitrary complex queries

## REST Endpoints (Supplementary)

Will maintain REST endpoints for:

1. **File Uploads:**
   ```
   POST /api/v1/uploads
   ```
   Reason: Multipart uploads easier with REST

2. **GDPR Exports:**
   ```
   GET /api/v1/users/me/export
   ```
   Reason: Long-running jobs better as REST

3. **Webhooks (future):**
   ```
   POST /api/v1/webhooks/*
   ```
   Reason: External services expect REST

4. **Health Checks:**
   ```
   GET /api/v1/health
   ```
   Reason: Monitoring tools expect REST

## Performance Optimizations

1. **DataLoader Pattern:**
   - Batch database queries
   - Prevent N+1 query problem
   - Cache within request

2. **Query Complexity Analysis:**
   - Reject overly complex queries
   - Protect against DoS

3. **Persistent Queries:**
   - Reduce payload size
   - Enable query whitelisting

4. **CDN Caching:**
   - Cache scripture content (immutable)
   - Automatic Persisted Queries (APQ)

## Success Criteria

- Average query response time < 300ms (p95)
- Mobile app makes ≤50% fewer API requests than REST equivalent
- Zero N+1 query problems in production
- 100% schema test coverage
- Generated types match schema 100%

## References

- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
- [Apollo Server Documentation](https://www.apollographql.com/docs/apollo-server/)
- [Securing GraphQL](https://www.apollographql.com/blog/graphql/security/9-ways-to-secure-your-graphql-api-security-checklist/)
- API_SPECIFICATION.md in project docs

## Monitoring & Observability

Use Apollo Studio for:
- Query performance tracking
- Error rate monitoring
- Schema evolution tracking
- Client usage analytics

## Migration Path

If GraphQL proves problematic:
1. REST endpoints already exist for edge cases
2. Can add REST CRUD endpoints without removing GraphQL
3. Gradual migration path available
4. No lock-in

## Notes

- Review performance after Phase 1
- Consider GraphQL Federation if microservices needed later
- Keep REST expertise on team for edge cases

**Last Updated:** 2025-11-19
**Next Review:** 2026-05-19 (after Phase 1 completion)
