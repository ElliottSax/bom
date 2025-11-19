# ADR-005: AI/LLM Integration Strategy

**Date:** 2025-11-19
**Status:** Proposed
**Deciders:** Technical Lead, AI/ML Specialist, Product Manager, Theological Advisor

## Context

We want to provide an AI chatbot that answers questions about the Book of Mormon, helping users understand scripture better. This is a sensitive feature requiring:
- Doctrinal accuracy
- Appropriate disclaimers
- Grounded responses (no hallucinations)
- Cost-effective implementation
- Theological review process
- Kill switch capability

**Key Concerns:**
1. AI generating doctrinally incorrect information
2. Users treating AI as authoritative
3. Cost of API calls at scale
4. Privacy of user queries
5. Response quality and relevance

## Decision

We will implement a **RAG (Retrieval Augmented Generation) architecture** using:
- **Primary LLM:** OpenAI GPT-4 (API)
- **Fallback LLM:** Llama 3 (self-hosted via Ollama) for cost control
- **Framework:** LangChain for RAG pipeline
- **Retrieval:** Qdrant vector database (from ADR-004)
- **Deployment:** Hybrid (API + self-hosted)

**Safeguards:**
- Mandatory disclaimer on every response
- Theological review of common queries
- User feedback mechanism
- Kill switch to disable if problems arise
- Beta label during Phase 2

## Rationale

### Why RAG (Not Fine-Tuned Model):

1. **Grounded Responses:**
   - RAG retrieves relevant verses first
   - LLM answers based on retrieved context
   - Reduces hallucinations
   - Citable sources for every answer

2. **Cost-Effective:**
   - No expensive fine-tuning
   - Pay only for inference
   - Can switch providers easily

3. **Up-to-Date:**
   - Add new commentary without retraining
   - Update retrieval data only
   - Model improvements automatic

4. **Transparency:**
   - Can show which verses informed answer
   - Users see sources
   - Builds trust

### Why GPT-4 (Primary):

1. **Quality:**
   - Best instruction following
   - Understands context well
   - Good at summarization
   - Handles nuanced questions

2. **Reliability:**
   - Production-ready API
   - High uptime (99.9%)
   - Rate limiting protection
   - Automatic scaling

3. **Safety:**
   - Built-in content moderation
   - Safety filters
   - Reduces inappropriate responses

4. **Speed:**
   - Reasonable latency (1-3 seconds)
   - Streaming responses supported
   - Good user experience

**Trade-offs:**
- Cost: $0.03/1K input tokens, $0.06/1K output tokens
- Estimated: ~$500-1,000/month for Phase 2 beta
- Privacy: Queries sent to OpenAI (with opt-in)

### Why Llama 3 (Fallback):

1. **Cost Control:**
   - No per-query costs
   - Infrastructure cost only (~$200-400/month)
   - Predictable expenses

2. **Privacy:**
   - No data leaves our infrastructure
   - Full control over queries
   - GDPR compliant

3. **Reliability:**
   - Not dependent on third-party API
   - Fallback if OpenAI unavailable
   - Can run offline if needed

**Trade-offs:**
- Lower quality than GPT-4
- Requires GPU infrastructure
- More operational complexity
- Longer response times

## Architecture

```
User Question
    ↓
┌───▼────────────────────────────┐
│  Query Understanding           │
│  (Extract intent, entities)    │
└───┬────────────────────────────┘
    ↓
┌───▼────────────────────────────┐
│  Semantic Search (Qdrant)      │
│  Find relevant verses          │
└───┬────────────────────────────┘
    ↓
┌───▼────────────────────────────┐
│  Context Assembly              │
│  Format verses + metadata      │
└───┬────────────────────────────┘
    ↓
┌───▼────────────────────────────┐
│  LLM Generation                │
│  GPT-4 (primary)               │
│  Llama 3 (fallback)            │
└───┬────────────────────────────┘
    ↓
┌───▼────────────────────────────┐
│  Response Post-Processing      │
│  - Add disclaimer              │
│  - Format citations            │
│  - Quality checks              │
└───┬────────────────────────────┘
    ↓
Response to User
```

## Implementation

### RAG Pipeline (LangChain):

```python
from langchain.chat_models import ChatOpenAI
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Qdrant
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

# Initialize components
embeddings = OpenAIEmbeddings()
vectorstore = Qdrant.from_existing_collection(
    embedding=embeddings,
    collection_name="scripture_embeddings"
)

llm = ChatOpenAI(
    model="gpt-4",
    temperature=0.3,  # Lower for factual responses
    max_tokens=500
)

# Custom prompt
prompt_template = """
You are a scripture study assistant for the Book of Mormon.
Your role is to help users understand the text using only the provided context.

Context from Book of Mormon:
{context}

User Question: {question}

Instructions:
1. Answer based ONLY on the provided context
2. Cite specific verse references
3. If the context doesn't contain the answer, say "I don't have enough information from the provided verses to answer that question."
4. Do not add personal interpretations
5. Keep answers concise and clear

Answer:"""

PROMPT = PromptTemplate(
    template=prompt_template,
    input_variables=["context", "question"]
)

# Create RAG chain
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),
    chain_type_kwargs={"prompt": PROMPT}
)

# Use it
response = qa_chain.run("What does the Book of Mormon teach about faith?")
```

### Response Format:

```json
{
  "answer": "The Book of Mormon teaches that faith is...",
  "sources": [
    {
      "reference": "Alma 32:21",
      "text": "And now as I said concerning faith...",
      "relevance": 0.92
    }
  ],
  "confidence": 0.87,
  "disclaimer": "This response is AI-generated and not official church doctrine. Please study the scriptures and seek personal revelation.",
  "conversationId": "conv_123"
}
```

### Cost Management:

**Strategies:**
1. **Caching:**
   ```python
   # Cache common questions
   cache_key = hash(question)
   if cached := redis.get(cache_key):
       return cached
   ```

2. **Response Streaming:**
   ```python
   # Stream tokens as generated
   for token in llm.stream(prompt):
       yield token
   ```

3. **Fallback to Llama:**
   ```python
   try:
       response = gpt4_chain.run(question)
   except (RateLimitError, APIError):
       response = llama_chain.run(question)
   ```

4. **Rate Limiting:**
   - 10 queries per user per hour
   - Prevents abuse
   - Reduces costs

## Consequences

### Positive:

- ✅ Grounded in scripture (RAG reduces hallucinations)
- ✅ Citable sources for transparency
- ✅ Cost-effective (RAG cheaper than fine-tuning)
- ✅ Can switch LLM providers easily
- ✅ Fallback option (Llama 3) for reliability
- ✅ Streaming responses for better UX
- ✅ Privacy option (self-hosted fallback)

### Negative:

- ❌ Ongoing API costs (GPT-4)
- ❌ Dependency on OpenAI
- ❌ Requires GPU for Llama fallback
- ❌ Complexity of maintaining two LLMs
- ❌ Prompt engineering required
- ❌ Quality depends on retrieval

### Neutral:

- 🔄 Need theological review process
- 🔄 Require robust monitoring
- 🔄 User education about AI limitations

## Alternatives Considered

### Option 1: Fine-Tuned Model

**Approach:**
- Fine-tune LLaMA or GPT on scripture corpus
- Deploy custom model

**Pros:**
- Optimized for scripture domain
- Better quality (potentially)
- No retrieval needed

**Cons:**
- Expensive ($10K-50K for fine-tuning)
- Still hallucinates
- Hard to update knowledge
- Requires re-training for changes
- No source citations

**Decision:** Rejected - too expensive, less transparent

### Option 2: No AI Feature

**Approach:**
- Don't build chatbot
- Rely on search only

**Pros:**
- No AI risks
- Simpler
- Cheaper

**Cons:**
- Miss competitive feature
- 73% engagement boost from AI (market data)
- Users expect AI in 2025

**Decision:** Rejected - competitive disadvantage

### Option 3: Third-Party Religious AI

**Approach:**
- Integrate existing religious AI service

**Pros:**
- Pre-built
- Less development

**Cons:**
- Not Book of Mormon specific
- Generic Christian content
- Less control
- Privacy concerns
- Ongoing costs

**Decision:** Rejected - not LDS-specific

### Option 4: GPT-4 Only (No Fallback)

**Approach:**
- Use GPT-4 exclusively
- No self-hosted option

**Pros:**
- Simpler architecture
- Best quality
- Less operational overhead

**Cons:**
- Single point of failure
- No cost control
- Privacy concerns
- Vendor lock-in

**Decision:** Rejected - need fallback and cost control

## Safeguards

### 1. Mandatory Disclaimer:

Every response includes:
```
⚠️ AI-generated response
This is not official church doctrine.
Study the scriptures and seek personal revelation.
```

### 2. Theological Review:

- Top 100 questions reviewed by theological advisor
- Responses vetted for accuracy
- Approved responses cached
- Problematic topics blacklisted

### 3. User Feedback:

```typescript
interface Feedback {
  responseId: string;
  helpful: boolean;  // thumbs up/down
  issue?: 'inaccurate' | 'inappropriate' | 'unclear' | 'other';
  comment?: string;
}
```

### 4. Quality Monitoring:

- Track feedback scores
- Flag responses with low ratings
- Review by theological advisor
- Adjust prompts based on feedback

### 5. Kill Switch:

```javascript
// Feature flag for instant disable
if (!featureFlags.aiChatbot) {
  return {
    message: "AI chatbot temporarily unavailable. Please use search."
  };
}
```

### 6. Confidence Threshold:

```python
if response.confidence < 0.7:
    return "I don't have enough confidence to answer that question accurately. Please try rephrasing or searching the scriptures directly."
```

## Theological Review Process

**Phase 1: Initial Review**
1. Identify 100 most common questions (from beta)
2. Generate responses
3. Theological advisor reviews each
4. Approve, reject, or request modifications

**Phase 2: Ongoing Review**
1. Flag responses with <4.0 rating
2. Weekly review by theological advisor
3. Update prompts or blacklist topics
4. Monthly quality report

**Blacklisted Topics:**
- Doctrine not found in Book of Mormon
- Controversial interpretations
- Personal spiritual experiences
- Medical/legal advice

## Cost Projections

### Phase 2 Beta (1,000 users):
- Queries per user per month: 5
- Total queries: 5,000/month
- Average tokens per query: 1,500 (input) + 500 (output)
- Cost: ~$300-500/month

### Phase 3 (10,000 users):
- Queries: 50,000/month
- Cost: ~$3,000-5,000/month
- Mitigation: Caching, Llama fallback for common queries

### Launch (100,000 users):
- Queries: 500,000/month
- Cost: ~$30,000-50,000/month (GPT-4 only)
- With optimizations: ~$10,000-15,000/month
  - 50% cached
  - 30% Llama fallback
  - 20% GPT-4

## Privacy Considerations

**GPT-4 (OpenAI):**
- Queries sent to OpenAI (30-day retention)
- No training on user data (with API terms)
- GDPR compliant
- Require user consent

**Llama 3 (Self-Hosted):**
- No external data transmission
- Full privacy control
- No data retention concerns
- GDPR compliant by design

**User Choice:**
- Privacy toggle in settings
- "Use private AI" → routes to Llama
- "Use advanced AI" → routes to GPT-4

## Success Criteria

- ✅ Response quality rating >4.0/5.0
- ✅ Doctrinal accuracy >95% (theological review)
- ✅ Response time <3 seconds (p95)
- ✅ Cost per user <$0.50/month
- ✅ Zero doctrinally inappropriate responses
- ✅ Feature adoption >20% of users

## Testing Strategy

1. **Unit Tests:**
   - RAG pipeline components
   - Prompt templates
   - Response formatting

2. **Integration Tests:**
   - End-to-end RAG flow
   - Fallback mechanisms
   - Error handling

3. **Quality Tests:**
   - Curated Q&A pairs
   - Theological advisor validation
   - Regression tests

4. **Load Tests:**
   - 100 concurrent queries
   - Response time under load
   - Cost at scale

## Monitoring

**Metrics:**
- Query volume
- Response latency
- Cost per query
- User ratings
- Confidence scores
- Fallback rate (GPT-4 → Llama)

**Alerts:**
- Cost spike (>$100/day)
- Low ratings (<3.5 average)
- High latency (>5s p95)
- API failures

## Migration Path

If current approach fails:

1. **Switch to Different LLM:**
   - Claude 3 (Anthropic)
   - Gemini (Google)
   - Same RAG architecture

2. **Disable Feature:**
   - Feature flag off
   - Return to search only
   - Communicate to users

3. **Hybrid Approach:**
   - Simple questions: Llama
   - Complex questions: GPT-4
   - Cost-optimized routing

## References

- [LangChain RAG Tutorial](https://python.langchain.com/docs/tutorials/rag/)
- [OpenAI API](https://platform.openai.com/docs/)
- [Llama 3 Documentation](https://llama.meta.com/)
- [RAG Best Practices](https://www.pinecone.io/learn/retrieval-augmented-generation/)
- Technical Implementation Guide: AI & Machine Learning section

## Future Enhancements

1. **Conversational Memory:**
   - Remember chat history
   - Follow-up questions
   - Context awareness

2. **Multi-Modal:**
   - Accept images (maps, charts)
   - Voice input/output
   - Video references

3. **Personalization:**
   - Learn from user preferences
   - Adapt response style
   - Remember favorite topics

## Notes

- Start conservative (strict prompts, high thresholds)
- Iterate based on feedback
- Theological accuracy over quality
- Kill switch always available
- Beta label until proven

**Last Updated:** 2025-11-19
**Next Review:** 2026-10-19 (after Phase 2 beta feedback)
