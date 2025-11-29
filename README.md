# Book of Mormon Study Tools - Community of Christ

Digital scripture study platform for **Community of Christ** scripture texts, featuring the Book of Mormon, Doctrine and Covenants (167 sections), and Inspired Version Bible with proper versification support.

## Project Focus

This project is designed specifically for **Community of Christ** scriptures and their unique versification systems:

- **Book of Mormon** - Original 1830 chapter divisions (not LDS Pratt 1879 versification)
- **Doctrine & Covenants** - 167 sections (sections 114+ are CoC-specific revelations)
- **Bible** - Inspired Version (Joseph Smith Translation) and NRSV

### About the LDS Research Documents

The `LDS_STUDY_TOOLS_*.md` files contain **competitive analysis** of LDS Church's Gospel Library app and other scripture study platforms. This research informs our feature decisions but the platform is built specifically for Community of Christ texts and theology.

## 📋 Quick Links

- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Complete project overview with all deliverables
- **[COMMUNITY_OF_CHRIST_VERSIFICATION.md](./docs/COMMUNITY_OF_CHRIST_VERSIFICATION.md)** - CoC scripture versification guide
- **[DEVELOPER_ONBOARDING.md](./DEVELOPER_ONBOARDING.md)** - Get started in <30 minutes
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Codebase layout and architecture

## 🏗️ Project Structure

This is a production-ready monorepo using npm workspaces and Turborepo. See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for complete directory layout and setup instructions.

**Quick Start:**
```bash
npm install           # Install all dependencies
make docker-up        # Start PostgreSQL, Redis, Qdrant
make db-migrate       # Run database migrations
make dev              # Start all development servers
```

**Workspaces:**
- `apps/mobile` - React Native mobile app (iOS + Android)
- `apps/web` - Next.js 14 web application
- `services/api` - GraphQL API server (Apollo + Fastify)
- `packages/shared` - Shared utilities and types
- `packages/graphql` - GraphQL schema and generated types

## 📚 Research Documents

### [LDS_STUDY_TOOLS_RESEARCH.md](./LDS_STUDY_TOOLS_RESEARCH.md)
**Competitive Analysis** (for reference only)

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

**Note:** These gaps inform our feature planning for Community of Christ study tools.

### Market Context

**Leading Competitors:**
- **YouVersion**: 500M+ downloads, excellent reading plans, daily engagement
- **Logos**: Professional-grade with 2024 AI features, advanced research tools
- **Blue Letter Bible**: Deep word study, interlinear, completely free
- **AI Apps (2025)**: Semantic search, personalized devotionals, 73% engagement boost

### Recommended Improvements

#### High Priority (Quick Wins)
1. **Enhanced Search** - Semantic/concept search, Boolean operators, filters
2. **AI Cross-References** - Auto-suggest related passages based on themes
3. **Reading Plans & Progress** - Expanded plans, streaks, completion tracking
4. **Visualization Dashboard** - Study stats, cross-reference maps, progress charts

#### Medium Priority (Strategic)
5. **AI Study Assistant** - Chat interface for questions (with disclaimers)
6. **Group Study Features** - Collaborative reading, shared notes, discussions
7. **Advanced Note Organization** - Hierarchical tags, templates, export
8. **Personalized Engagement** - Daily verse, smart reminders, recommendations

#### Future Considerations
9. **Parallel Text Views** - Side-by-side version comparison
10. **Voice Integration** - Voice journaling, hands-free study
11. **Memory System** - Spaced repetition for scripture memorization

## 🔧 Technical Stack Recommendations

### Mobile Framework
**Primary: React Native 0.77+** (New Architecture)
- Reason: Cross-platform, large ecosystem, web code reuse
- Alternative: Flutter 3.29+ (better performance for text-heavy apps)

### AI/ML Infrastructure
**Semantic Search:**
- Vector DB: Qdrant (open-source) or Pinecone (managed)
- Embeddings: Sentence Transformers (fine-tuned on scriptures)
- Search: Hybrid (semantic + keyword)

**RAG Chatbot:**
- LLM: GPT-4 (API) or Llama 3 (local via Ollama)
- Framework: LangChain
- Important: Clear disclaimers, theological review process

### Data Architecture
**Offline-First:**
- Scripture text: SQLite (read-only, ~50MB local storage)
- User data: PouchDB + CouchDB (master-master sync)
- Sync strategy: Per-user databases, optimistic UI

### Privacy & Analytics
- Analytics: Matomo (self-hosted, GDPR compliant)
- Encryption: AES-256 for sensitive notes
- Auth: Device-based with optional cloud sync

### Testing & Deployment
- Testing: Jest (unit), Detox (E2E), 70/20/10 pyramid
- CI/CD: Fastlane + GitHub Actions
- Deployment: Staged rollouts, A/B testing

## 📊 Key Statistics from Research

- **25M+ Christians** using AI Bible apps in 2025
- **73% increase** in daily engagement with AI-powered tools
- **3-8x higher** retention with push notifications enabled
- **95% churn** within 90 days without any push notifications
- **4x higher** open rates for personalized notifications
- **65% of population** are visual learners (underserved by text-only)
- **500+ million** YouVersion downloads worldwide
- **60-100ms** query latency for semantic search (1M-10M vectors)

## 🎓 Research Methodology

### Data Sources
1. **Official Church Resources** - churchofjesuschrist.org, Gospel Library app
2. **Competitive Apps** - YouVersion, Logos, Blue Letter Bible, 15+ others
3. **Industry Reports** - Gartner, app analytics platforms, user studies
4. **Academic Research** - NLP for religious texts, memory science, UX studies
5. **Technical Documentation** - Framework docs, API references, best practices

### Analysis Approach
- Feature-by-feature comparison across 15+ criteria
- User review analysis (App Store, Google Play)
- Technical capability assessment
- Cost-benefit analysis for each recommendation
- Feasibility scoring (impact vs. complexity)

## 💡 Implementation Recommendations

### Phased Rollout Strategy

**Phase 1: Foundation** (3-6 months)
- Enhanced search (semantic + Boolean)
- Study statistics dashboard
- Expanded reading plans
- Basic offline improvements

**Phase 2: Intelligence** (6-9 months)
- AI cross-reference suggestions
- Semantic search with vector DB
- Personalized recommendations
- Advanced note organization

**Phase 3: Engagement** (9-12 months)
- RAG chatbot (with theological safeguards)
- Spaced repetition memory system
- Achievement/streak system
- Push notification optimization

**Phase 4: Advanced** (12+ months)
- Network visualization (D3.js)
- Community/group features
- Voice integration
- Third-party API

### Risk Mitigation

**Theological Accuracy (AI Features):**
- ⚠️ Clear disclaimers: "AI-generated, not official doctrine"
- ✅ Review process for common queries
- ✅ Train on authoritative sources only
- ✅ Option to disable AI features

**Privacy Concerns:**
- ✅ GDPR compliance from day one
- ✅ Data minimization (collect only what's needed)
- ✅ Encryption for sensitive content
- ✅ User control over data sharing

**Complexity Management:**
- ✅ Progressive disclosure (advanced features hidden initially)
- ✅ Maintain simplicity for core reading experience
- ✅ Extensive user testing before rollout
- ✅ Gradual feature introduction

## 🔗 Related Resources

### Tools & Platforms Analyzed
- [Gospel Library](https://www.churchofjesuschrist.org/study/scriptures) - Official LDS app
- [YouVersion](https://www.bible.com/) - Most popular Bible app
- [Logos](https://www.logos.com/) - Professional Bible software
- [Blue Letter Bible](https://www.blueletterbible.org/) - Free study tools
- [Scripture Central](https://scripturecentral.org/) - LDS scholarship
- [Viz.Bible](https://viz.bible/) - Scripture visualization

### Technical Resources
- [Sentence Transformers](https://www.sbert.net/) - Text embeddings
- [Qdrant](https://qdrant.tech/) - Vector database
- [LangChain](https://www.langchain.com/) - LLM framework
- [D3.js](https://d3js.org/) - Data visualization
- [Matomo](https://matomo.org/) - Privacy-friendly analytics
- [Fastlane](https://fastlane.tools/) - Mobile automation

### Best Practices Guides
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility guidelines
- [GDPR Info](https://gdpr-info.eu/) - Privacy regulation
- [React Native Best Practices](https://reactnative.dev/docs/performance)
- [Flutter Performance](https://docs.flutter.dev/perf)

## 📈 Success Metrics (Proposed)

### Engagement
- Daily Active Users (DAU)
- Average session duration
- Study streak retention (7-day, 30-day)
- Feature adoption rates

### Content
- Verses read per session
- Chapters completed
- Highlights/notes created
- Searches performed

### AI Features (if implemented)
- Semantic search usage rate
- Chat interactions per user
- AI suggestion acceptance rate
- User satisfaction scores

### Quality
- App crash rate < 0.1%
- Search relevance score > 85%
- Sync success rate > 99%
- Accessibility audit score: AAA

## 🤝 Contributing

This research was compiled through:
- Web research and competitive analysis
- Technical documentation review
- Industry best practices synthesis
- Academic literature on learning and memory

For questions or suggestions, please review the detailed documents above.

## 📝 License & Usage

This research is intended for:
- Product planning and development
- Technical architecture decisions
- Feature prioritization
- Competitive positioning

The implementation code examples are provided as educational references and should be adapted to specific project requirements.

---

**Project Started:** November 19, 2025
**Target Audience:** Community of Christ members and investigators
**Scripture Focus:** CoC Book of Mormon, D&C (167 sections), Inspired Version Bible
**Versification:** Original 1830 chapters (not LDS Pratt system)
**Competitive Research:** LDS Gospel Library, YouVersion, Logos (for feature planning only)
