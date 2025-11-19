# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records for the Book of Mormon Study Tools project.

## What is an ADR?

An Architecture Decision Record (ADR) captures an important architectural decision made along with its context and consequences. ADRs help teams:
- Understand why decisions were made
- Onboard new team members
- Revisit decisions when circumstances change
- Document trade-offs and alternatives

## ADR Format

Each ADR follows this structure:
- **Title:** Clear, descriptive title
- **Date:** When the decision was made
- **Status:** Proposed, Accepted, Deprecated, Superseded
- **Deciders:** Who was involved in the decision
- **Context:** The issue motivating this decision
- **Decision:** The change we're proposing or have agreed to
- **Rationale:** Why this decision was made
- **Consequences:** Positive, negative, and neutral outcomes
- **Alternatives Considered:** Other options and why they were rejected
- **Implementation:** How the decision will be executed
- **Success Criteria:** How we'll measure success
- **References:** Links to supporting documentation
- **Notes:** Additional context or review schedule

## Current ADRs

### [ADR-001: Mobile Framework Selection](./001-mobile-framework-selection.md)
**Status:** Proposed
**Date:** 2025-11-19
**Decision:** Use React Native 0.77+ with New Architecture

**Summary:** Selected React Native for cross-platform mobile development over Flutter and native development. Key factors: code reuse with web, larger talent pool, single codebase efficiency, and sufficient performance for text-heavy application.

**Key Trade-offs:**
- ✅ 40% faster development (single codebase)
- ✅ Web code reuse possible
- ❌ Slightly lower performance than native/Flutter

**Review Date:** 2026-05-19 (after Phase 1)

---

### [ADR-002: GraphQL as Primary API Architecture](./002-graphql-api-architecture.md)
**Status:** Proposed
**Date:** 2025-11-19
**Decision:** Use GraphQL for primary API, REST for specific use cases

**Summary:** Selected GraphQL over REST for efficient data fetching and flexible API evolution. Critical for mobile bandwidth efficiency and developer experience. REST endpoints maintained for file uploads, GDPR exports, and webhooks.

**Key Trade-offs:**
- ✅ Efficient data fetching (single request vs. multiple)
- ✅ Flexible evolution (add fields without breaking)
- ❌ Learning curve for team
- ❌ More complex caching

**Review Date:** 2026-05-19 (after Phase 1)

---

### [ADR-003: Offline-First Architecture](./003-offline-first-architecture.md)
**Status:** Proposed
**Date:** 2025-11-19
**Decision:** Implement offline-first with SQLite + PouchDB/CouchDB sync

**Summary:** Prioritize local-first data access with background sync for scripture study that works anywhere. SQLite for read-only scripture content, PouchDB for user data with CouchDB replication protocol.

**Key Trade-offs:**
- ✅ App works instantly, always
- ✅ Better perceived performance
- ✅ Resilient to network issues
- ❌ Increased complexity (sync engine)
- ❌ Storage required (~60-80 MB)

**Review Date:** 2026-02-19 (after Phase 1 Sprint 7)

---

### [ADR-004: Vector Database for Semantic Search](./004-vector-database-for-semantic-search.md)
**Status:** Proposed
**Date:** 2025-11-19
**Decision:** Use Qdrant for vector database (self-hosted)

**Summary:** Selected Qdrant over Pinecone, Weaviate, and Elasticsearch for semantic search. Open-source, self-hostable, excellent performance, and cost-effective. Will enable "faith as a seed" to find Alma 32:28.

**Key Trade-offs:**
- ✅ Open-source (no vendor lock-in)
- ✅ Self-hostable (~$200-500/month vs. $800-1,500)
- ✅ 60-100ms query latency
- ❌ Need to self-host and maintain

**Review Date:** 2026-08-19 (after Phase 2)

---

### [ADR-005: AI/LLM Integration Strategy](./005-ai-llm-integration-strategy.md)
**Status:** Proposed
**Date:** 2025-11-19
**Decision:** RAG architecture with GPT-4 (primary) + Llama 3 (fallback)

**Summary:** Implement RAG (Retrieval Augmented Generation) for AI chatbot using GPT-4 API as primary LLM with self-hosted Llama 3 as fallback. Includes mandatory disclaimers, theological review, and kill switch.

**Key Trade-offs:**
- ✅ Grounded in scripture (reduces hallucinations)
- ✅ Citable sources for transparency
- ✅ Fallback option for cost control
- ❌ Ongoing API costs ($500-1,000/month beta)
- ❌ Dependency on OpenAI

**Review Date:** 2026-10-19 (after Phase 2 beta)

---

## ADR Lifecycle

### Statuses

- **Proposed:** Decision has been recommended but not yet approved
- **Accepted:** Decision has been approved and is being implemented
- **Deprecated:** Decision is no longer relevant but kept for historical context
- **Superseded:** Decision has been replaced by a newer ADR

### Review Process

1. **Proposal:** Author drafts ADR and shares with team
2. **Discussion:** Team reviews and provides feedback
3. **Decision:** Deciders approve, reject, or request changes
4. **Implementation:** Team implements the decision
5. **Review:** Periodic reviews at scheduled dates

### When to Create an ADR

Create an ADR when making decisions about:
- Technology selection (languages, frameworks, databases)
- Architecture patterns (API design, data flow, deployment)
- Development practices (testing strategy, code style)
- Infrastructure choices (hosting, CI/CD, monitoring)

**Rule of Thumb:** If the decision will be difficult to change later or affects multiple teams, document it as an ADR.

## Contributing

### Creating a New ADR

1. Copy the template:
   ```bash
   cp docs/adr/template.md docs/adr/00X-your-decision.md
   ```

2. Fill in all sections

3. Submit for review (PR or design doc discussion)

4. Update this README with summary

### ADR Numbering

- Use sequential numbering (001, 002, 003, ...)
- Zero-pad to 3 digits
- Don't reuse numbers (even if ADR is deprecated)

### File Naming

```
[number]-[short-descriptive-name].md
```

Examples:
- `001-mobile-framework-selection.md`
- `002-graphql-api-architecture.md`
- `015-caching-strategy.md`

## References

- [Architecture Decision Records (Michael Nygard)](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [ADR GitHub Organization](https://adr.github.io/)
- [When to Use ADRs](https://github.com/joelparkerhenderson/architecture-decision-record)

## Questions?

Contact the Technical Lead or post in #engineering Slack channel.

---

**Last Updated:** 2025-11-19
**Maintained By:** Technical Lead
