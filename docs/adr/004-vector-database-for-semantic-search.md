# ADR-004: Vector Database Selection for Semantic Search

**Date:** 2025-11-19
**Status:** Proposed
**Deciders:** Technical Lead, AI/ML Specialist, Backend Squad Lead

## Context

We need semantic search capabilities to allow users to find scripture passages by concept and meaning, not just keywords. For example, searching "faith as a seed" should find Alma 32:28 even though those exact words don't appear together.

**Requirements:**
- Store 6,500+ verse embeddings (Book of Mormon)
- Query performance < 500ms for typical searches
- Filter by metadata (book, chapter, topics)
- Scalable to 50+ languages (future)
- Support for hybrid search (semantic + keyword)
- Self-hostable for cost control and data sovereignty

**Technical Needs:**
- Vector similarity search (cosine similarity)
- Metadata filtering
- High availability
- Reasonable cost
- Good developer experience

## Decision

We will use **Qdrant** as our vector database for semantic search.

**Deployment:**
- Self-hosted on Kubernetes (Phase 2)
- Qdrant Cloud for initial development/testing
- Migrate to self-hosted for production cost control

## Rationale

### Why Qdrant:

1. **Open-Source:**
   - Self-hostable (critical for budget)
   - No vendor lock-in
   - Community-driven development
   - MIT license

2. **Performance:**
   - Rust-based (fast, efficient)
   - HNSW algorithm for similarity search
   - 60-100ms query latency for 1M vectors
   - Sufficient for our use case (6,500 verses × 50 languages = 325K vectors max)

3. **Advanced Filtering:**
   - Filter by book, chapter, topics, language
   - Payload-based filtering doesn't hurt performance
   - Critical for user experience

4. **Developer Experience:**
   - Clean REST and gRPC APIs
   - Python, JavaScript, Rust SDKs
   - Good documentation
   - Active community

5. **Cost:**
   - Self-hosted: ~$200-500/month (vs. $1-2K for managed alternatives)
   - Scales horizontally
   - No per-query costs

6. **Features:**
   - Payload storage (no separate DB needed for metadata)
   - CRUD operations on vectors
   - Snapshots and backups
   - Clustering support

### Trade-offs Accepted:

- **Operational Complexity:** Need to self-host (but worth cost savings)
- **Smaller Ecosystem:** Less mature than Pinecone (but actively developed)
- **Learning Curve:** New technology for team (but good docs)

## Consequences

### Positive:

- ✅ Open-source (no vendor lock-in)
- ✅ Self-hostable (cost control)
- ✅ Excellent performance (60-100ms queries)
- ✅ Advanced filtering capabilities
- ✅ Scales to millions of vectors
- ✅ Good developer experience
- ✅ Active development and community
- ✅ Supports hybrid search

### Negative:

- ❌ Need to self-host and maintain
- ❌ Less mature than Pinecone
- ❌ Smaller community than Elasticsearch
- ❌ Team needs to learn new system

### Neutral:

- 🔄 Can start with Qdrant Cloud, migrate to self-hosted
- 🔄 Migration path available if needed (standard vector format)
- 🔄 Backup and recovery procedures needed

## Alternatives Considered

### Option 1: Pinecone

**Pros:**
- Fully managed (no ops)
- Mature platform
- Excellent performance
- Simple to use
- Great documentation

**Cons:**
- SaaS only (no self-hosting)
- Expensive ($70-200/month minimum, scales with usage)
- Vendor lock-in
- Data sovereignty concerns
- Pricing unpredictable at scale

**Cost Comparison:**
- Pinecone: $70/month starter + $0.096/hour per pod = ~$800-1,500/month at scale
- Qdrant Self-Hosted: ~$200-500/month (VM costs only)

**Decision:** Rejected due to cost and vendor lock-in

### Option 2: Weaviate

**Pros:**
- Open-source
- Self-hostable
- GraphQL interface
- Knowledge graph features
- Good for hybrid search

**Cons:**
- More complex (many features we don't need)
- Higher resource requirements
- Overkill for our use case
- GraphQL adds complexity

**Decision:** Rejected - too complex for our needs

### Option 3: Elasticsearch with Vector Plugin

**Pros:**
- Team may already know Elasticsearch
- Mature platform
- Can use for keyword search too
- Unified search solution

**Cons:**
- Vector search not primary focus
- Slower than specialized vector DBs
- Complex to configure for vectors
- Higher resource requirements
- Elasticsearch licensing concerns

**Decision:** Rejected - not optimized for vectors

### Option 4: PostgreSQL with pgvector

**Pros:**
- Use existing PostgreSQL knowledge
- No additional infrastructure
- Simple deployment
- Good for small scale

**Cons:**
- Poor performance at scale (>100K vectors)
- Limited filtering capabilities
- Not designed for vectors
- Manual index tuning required

**Decision:** Rejected - won't scale to our needs

### Option 5: Milvus

**Pros:**
- Open-source
- Very high performance
- Scales to billions of vectors
- Good for large deployments

**Cons:**
- Overkill for our scale (6,500 verses)
- Complex deployment (multiple components)
- Higher operational overhead
- Steeper learning curve

**Decision:** Rejected - too complex for our scale

## Implementation Plan

### Phase 2 (Months 7-8):

**Sprint 2.1:**
1. Set up Qdrant Cloud (development)
2. Generate embeddings for Book of Mormon (English)
3. Index creation and configuration
4. Basic similarity search implementation

**Sprint 2.2:**
5. Integrate with search API
6. Implement hybrid search (semantic + keyword)
7. Add metadata filtering
8. Performance testing and optimization

### Phase 2 (Months 9-10):

**Sprint 2.3:**
9. Plan self-hosted deployment
10. Set up Qdrant on Kubernetes
11. Migration from Cloud to self-hosted
12. Load testing and scaling

**Sprint 2.4:**
13. Backup and recovery procedures
14. Monitoring and alerting
15. Documentation for ops team

## Technical Details

### Embedding Generation:

**Model:** Sentence Transformers (all-MiniLM-L6-v2)
- Dimension: 384
- Fast inference
- Good quality for scripture text

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

# Generate embedding
verse_text = "And it came to pass that I, Nephi..."
embedding = model.encode(verse_text)
# embedding.shape = (384,)
```

### Collection Schema:

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

client = QdrantClient("localhost", port=6333)

# Create collection
client.create_collection(
    collection_name="scripture_embeddings",
    vectors_config=VectorParams(size=384, distance=Distance.COSINE),
)
```

### Indexing Verses:

```python
# Index a verse
client.upsert(
    collection_name="scripture_embeddings",
    points=[
        {
            "id": "1-nephi-3-7",
            "vector": embedding.tolist(),
            "payload": {
                "reference": "1 Nephi 3:7",
                "book": "1-nephi",
                "chapter": 3,
                "verse": 7,
                "text": "And it came to pass...",
                "topics": ["obedience", "faith"],
                "language": "en"
            }
        }
    ]
)
```

### Querying:

```python
# Semantic search
query_text = "faith as a seed"
query_embedding = model.encode(query_text)

results = client.search(
    collection_name="scripture_embeddings",
    query_vector=query_embedding.tolist(),
    limit=10,
    query_filter={
        "must": [
            {"key": "book", "match": {"value": "alma"}},
            {"key": "language", "match": {"value": "en"}}
        ]
    }
)

# Results include:
# - Alma 32:28 (score: 0.87)
# - Alma 32:27 (score: 0.82)
# - ...
```

### Hybrid Search:

Combine semantic (vector) + keyword (Elasticsearch/PostgreSQL FTS):

```javascript
// 1. Keyword search
const keywordResults = await searchKeyword("faith seed");

// 2. Semantic search
const semanticResults = await searchSemantic("faith seed");

// 3. Merge and re-rank
const merged = mergeResults(keywordResults, semanticResults, {
  keywordWeight: 0.4,
  semanticWeight: 0.6
});
```

## Infrastructure

### Development:

```yaml
# docker-compose.yml
version: '3'
services:
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
    volumes:
      - qdrant_storage:/qdrant/storage
volumes:
  qdrant_storage:
```

### Production (Kubernetes):

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: qdrant
spec:
  replicas: 2
  selector:
    matchLabels:
      app: qdrant
  template:
    spec:
      containers:
      - name: qdrant
        image: qdrant/qdrant:v1.5.0
        ports:
        - containerPort: 6333
        - containerPort: 6334
        volumeMounts:
        - name: qdrant-storage
          mountPath: /qdrant/storage
        resources:
          requests:
            memory: "4Gi"
            cpu: "2"
          limits:
            memory: "8Gi"
            cpu: "4"
  volumeClaimTemplates:
  - metadata:
      name: qdrant-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 50Gi
```

### Estimated Resources:

- **CPU:** 2-4 cores
- **Memory:** 4-8 GB
- **Storage:** 50 GB (room for growth)
- **Cost:** $200-500/month (depending on cloud provider)

## Performance Targets

- Query latency (p95): < 500ms
- Query latency (p50): < 200ms
- Throughput: 100+ queries/second
- Index update time: < 1 second
- Availability: 99.9%

## Monitoring

**Metrics to Track:**
- Query latency (p50, p95, p99)
- Query throughput
- Index size
- Memory usage
- Error rate

**Tools:**
- Prometheus for metrics
- Grafana for dashboards
- AlertManager for alerts

## Backup Strategy

1. **Regular Snapshots:**
   - Daily full snapshot
   - Stored in S3/GCS
   - 30-day retention

2. **Recovery:**
   - Restore from snapshot
   - Rebuild index from source data
   - Estimated RTO: < 1 hour

## Success Criteria

- ✅ Semantic search returns relevant results (>90% accuracy)
- ✅ Query performance < 500ms (p95)
- ✅ Successfully handles 325K vectors (50 languages)
- ✅ Self-hosted cost < $500/month
- ✅ 99.9% uptime
- ✅ Zero data loss

## Migration Path

If Qdrant doesn't meet needs:

1. **Switch to Pinecone:**
   - Same vector format
   - Similar API
   - Migration script available
   - Cost increase accepted

2. **Switch to Weaviate:**
   - Open-source alternative
   - More features
   - Higher complexity

3. **Fallback to Keyword Only:**
   - Disable semantic search
   - Use Elasticsearch/PostgreSQL FTS
   - Temporary solution

## References

- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [Vector Database Comparison](https://research.aimultiple.com/vector-database-for-rag/)
- [Sentence Transformers](https://www.sbert.net/)
- Technical Implementation Guide: AI & Machine Learning section

## Future Enhancements

1. **Multi-language Support:**
   - Generate embeddings for 50+ languages
   - Language-specific models
   - Cross-language search

2. **Fine-tuning:**
   - Train custom model on scripture corpus
   - Improve relevance for LDS terminology

3. **Clustering:**
   - Discover thematic clusters
   - Suggest related topics

4. **Recommendations:**
   - "Users who studied this also studied..."
   - Collaborative filtering with vectors

## Notes

- Start simple with pretrained model
- Iterate based on user feedback
- Consider fine-tuning if needed
- Monitor costs closely

**Last Updated:** 2025-11-19
**Next Review:** 2026-08-19 (after Phase 2 completion)
