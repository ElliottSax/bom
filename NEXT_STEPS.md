# Next Steps - Development Roadmap

**Last Updated:** December 8, 2025
**Current Phase:** Phase 1 → Phase 2 Transition
**Status:** WSL2 blockers resolved, ready for mobile development

---

## 🎯 Immediate Priorities (Next Session)

### 1. Validate API Server (15 minutes)

**Goal:** Confirm at least one solution works end-to-end

**Option A: Python Server (Fastest)**
```bash
cd services/api

# If not done yet
./setup-python-server.sh

# Start server
./start-python-server.sh
```

**Test queries in GraphQL Playground (http://localhost:4000/graphql):**

```graphql
# Test 1: Health check
{ health }

# Test 2: List editions
{
  editions {
    id
    name
    shortName
    year
  }
}

# Test 3: Get verses
{
  verses(
    editionId: "coc-bom-1908"
    book: "I Nephi"
    chapter: 1
    limit: 5
  ) {
    verse
    text
  }
}

# Test 4: Get book statistics
{
  books(editionId: "coc-bom-1908") {
    book
    verseCount
    chapters
  }
}
```

**Expected results:**
- Health returns "OK"
- 6 editions listed
- First 5 verses of I Nephi chapter 1
- 15 books with verse counts

---

**Option B: Native Linux (Best Long-term)**
```bash
# One-time setup (15 minutes)
./scripts/copy-to-native-linux.sh

# Navigate to new location
cd /home/elliott/projects/bom/services/api

# Install dependencies (2-5 minutes on native Linux)
npm install

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

**Access:** http://localhost:4000/graphql

**Verify hot reload:**
1. Edit `src/graphql/resolvers/Query.ts`
2. Add a console.log
3. Save file
4. See server restart automatically

---

### 2. Choose Primary Solution (5 minutes)

**Decision Matrix:**

| Need | Recommended Solution |
|------|---------------------|
| Individual dev, full features | Native Linux |
| Team consistency | Docker |
| Quick API testing | Python |
| Windows-heavy workflow | Windows Node.js |

**Document your choice:**
```bash
# Create team decision file
echo "## API Development Environment

**Chosen Solution:** [Native Linux/Docker/Python/Windows]

**Rationale:** [Your reasoning]

**Setup Instructions:** See [link to relevant guide]
" > TEAM_SETUP.md
```

---

### 3. Mobile App Dependencies (30 minutes)

**Prerequisites:**
- Node.js 18+ installed
- React Native CLI: `npm install -g react-native-cli`
- iOS: Xcode 14+ (macOS only)
- Android: Android Studio with SDK 33+

**Install dependencies:**
```bash
cd apps/mobile

# Install npm packages
npm install

# iOS only (macOS)
cd ios && pod install && cd ..

# Verify React Native setup
npx react-native doctor
```

**Expected issues and fixes:**

**Issue:** `Unable to resolve module @apollo/client`
```bash
npm install @apollo/client graphql
```

**Issue:** `SQLite not found`
```bash
npm install react-native-sqlite-storage
```

**Issue:** iOS build fails
```bash
cd ios
pod deintegrate
pod install
cd ..
```

---

## 📱 Phase 2: Mobile App Development (Week 1-2)

### Week 1: Basic Functionality

**Day 1-2: Environment Setup**
- [x] Database operational (11,787 verses)
- [x] API server solutions ready
- [ ] Mobile dependencies installed
- [ ] iOS simulator or Android emulator running
- [ ] First successful app launch

**Day 3-4: API Integration**
- [ ] Configure API endpoint in mobile app
- [ ] Test GraphQL queries from mobile app
- [ ] Implement error handling
- [ ] Test offline mode

**Day 5: Basic Reading Experience**
- [ ] Load and display verse list
- [ ] Implement chapter navigation
- [ ] Test with real scripture data
- [ ] Basic styling and UX

---

### Week 2: Core Features

**Day 1-2: Scripture Reader**
- [ ] Implement verse scrolling
- [ ] Chapter/book navigation
- [ ] Font size controls
- [ ] Reading progress tracking

**Day 3-4: Offline Storage**
- [ ] SQLite integration
- [ ] Download scripture data
- [ ] Sync with API
- [ ] Cache management

**Day 5: Testing & Polish**
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] User testing

---

## 🔧 Technical Tasks

### API Enhancements (Optional)

**If using Python server long-term:**
- [ ] Add mutation support
- [ ] Implement authentication
- [ ] Add subscriptions (real-time sync)
- [ ] Performance optimization

**If using TypeScript server:**
- [ ] Test all GraphQL resolvers
- [ ] Add integration tests
- [ ] Set up CI/CD pipeline
- [ ] Deploy to cloud (Fly.io/Railway)

---

### Database Enhancements

**Complete remaining scriptures:**
- [ ] Import D&C sections 145-167 (CoC-specific revelations)
- [ ] Add Inspired Version Bible text (licensing permitting)
- [ ] Add cross-reference mappings
- [ ] Optimize query performance

**User data tables:**
- [ ] Test bookmarks functionality
- [ ] Test highlights and notes
- [ ] Test memory cards
- [ ] Test sync mechanisms

---

### Documentation Updates

**Developer onboarding:**
- [ ] Record screen demo of setup process
- [ ] Create troubleshooting FAQ
- [ ] Document common errors and fixes
- [ ] Add architecture diagrams

**API documentation:**
- [ ] Generate GraphQL schema docs
- [ ] Add query examples to Postman/Insomnia
- [ ] Document authentication flow
- [ ] Create API usage guide

---

## 🎨 UI/UX Tasks

### Design System

**Colors & Typography:**
- [ ] Define CoC brand colors
- [ ] Choose font family for scriptures
- [ ] Create typography scale
- [ ] Dark mode color palette

**Components:**
- [ ] Button styles
- [ ] Input fields
- [ ] Cards and containers
- [ ] Navigation patterns

---

### User Testing

**Internal Testing:**
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test on physical devices
- [ ] Test various screen sizes

**Beta Testing (Future):**
- [ ] Recruit 10-20 beta testers
- [ ] Set up TestFlight (iOS)
- [ ] Set up Google Play Beta (Android)
- [ ] Collect feedback

---

## 🚀 Deployment Strategy

### Development Environment ✅
- [x] PostgreSQL + Redis on Docker
- [x] API server (4 solutions available)
- [ ] Mobile app on simulator/emulator

### Staging Environment (Next)
- [ ] Deploy API to cloud (Fly.io recommended)
- [ ] Set up staging database
- [ ] Configure mobile app for staging API
- [ ] Implement CI/CD pipeline

### Production Environment (Future)
- [ ] Production database (managed PostgreSQL)
- [ ] Production API deployment
- [ ] CDN for static assets
- [ ] Monitoring and logging
- [ ] App Store submission

---

## 📊 Success Metrics

### Week 1 Goals
- [ ] API server running and tested
- [ ] Mobile app launches successfully
- [ ] Can query and display verses
- [ ] Basic navigation works

### Week 2 Goals
- [ ] Offline mode functional
- [ ] All 15 books accessible
- [ ] Performance acceptable (<100ms queries)
- [ ] No critical bugs

### Month 1 Goals
- [ ] Highlighting and notes work
- [ ] Search functionality implemented
- [ ] Memory cards functional
- [ ] Ready for internal beta

---

## 🔄 Workflow Recommendations

### Daily Development Routine

**Morning (30 min):**
1. Pull latest code (if team)
2. Start API server: `./start-python-server.sh` or `npm run dev`
3. Start mobile app: `npm run ios` or `npm run android`
4. Review previous day's work

**Development (4-6 hours):**
1. Pick a task from roadmap
2. Implement with tests
3. Test on device/simulator
4. Commit frequently with good messages

**Evening (30 min):**
1. Push code to Git
2. Update documentation if needed
3. Plan next day's tasks
4. Stop services

---

### Git Workflow

**Branch Strategy:**
```bash
main                    # Production-ready
├── develop            # Integration branch
│   ├── feature/highlights
│   ├── feature/offline-sync
│   └── feature/search
└── hotfix/...         # Emergency fixes
```

**Commit Message Format:**
```
feat(mobile): Add scripture reader component
fix(api): Correct verse ordering in query
docs: Update WSL2 solutions guide
chore: Update dependencies
```

---

## 🐛 Known Issues to Address

### API Server
- [ ] Health check endpoint missing in Python server
- [ ] Mutations not implemented in Python server
- [ ] Docker build time optimization needed
- [ ] Hot reload not tested in all solutions

### Mobile App
- [ ] Dependencies not yet installed
- [ ] API endpoint needs configuration
- [ ] Offline sync strategy needs refinement
- [ ] Test coverage needs improvement

### Database
- [ ] D&C sections 145-167 not imported
- [ ] Cross-reference mappings incomplete
- [ ] Query performance not optimized
- [ ] Backup strategy not defined

---

## 💡 Optional Enhancements

### Quick Wins (Low effort, high value)
- [ ] Add version endpoint to API
- [ ] Create Postman collection for API
- [ ] Add loading states to mobile app
- [ ] Implement error boundaries

### Medium Priority
- [ ] Set up Sentry for error tracking
- [ ] Add analytics (privacy-friendly)
- [ ] Implement push notifications
- [ ] Add dark mode

### Future Considerations
- [ ] AI-powered search (semantic)
- [ ] Study groups functionality
- [ ] Audio scripture narration
- [ ] Cross-device sync

---

## 📚 Learning Resources

### React Native
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/)
- [Apollo Client React](https://www.apollographql.com/docs/react/)

### GraphQL
- [GraphQL Docs](https://graphql.org/learn/)
- [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
- [Prisma](https://www.prisma.io/docs)

### WSL2 & Development
- [WSL2 Best Practices](https://docs.microsoft.com/en-us/windows/wsl/filesystems)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

## 🤝 Team Collaboration

### If Working Solo
- Commit frequently
- Document as you go
- Test on multiple devices
- Take breaks to avoid burnout

### If Working with Team
- Daily standups (15 min)
- Code reviews before merging
- Shared development environment (Docker)
- Team documentation in Notion/Confluence

---

## 🎯 Priority Order

**This Week (Critical):**
1. ✅ Resolve WSL2 issues (DONE)
2. ⏭️ Validate one API solution works
3. ⏭️ Install mobile app dependencies
4. ⏭️ First successful mobile app run

**Next Week (Important):**
1. Complete scripture data import
2. API integration with mobile app
3. Basic reading experience
4. Offline storage implementation

**This Month (Good to have):**
1. Highlighting and notes
2. Search functionality
3. Memory cards
4. Internal beta testing

---

## 🔗 Quick Links

**Documentation:**
- [QUICK_START.md](./QUICK_START.md) - Get API running
- [WSL2_SOLUTIONS.md](./WSL2_SOLUTIONS.md) - Complete solutions guide
- [CURRENT_STATUS.md](./CURRENT_STATUS.md) - Project status
- [apps/mobile/SETUP.md](./apps/mobile/SETUP.md) - Mobile app setup

**Scripts:**
- `./scripts/copy-to-native-linux.sh` - Move to Linux
- `./scripts/start-api-docker.sh` - Start Docker API
- `./services/api/start-python-server.sh` - Start Python API

**Useful Commands:**
```bash
# Start database
docker start bom-postgres-dev bom-redis-dev

# Query database
docker exec bom-postgres-dev psql -U postgres -d bom_study_tools_dev

# View logs
docker logs -f bom-postgres-dev
docker logs -f bom-api-dev

# Mobile development
cd apps/mobile
npm run ios          # iOS
npm run android      # Android
npm run start        # Metro bundler
```

---

**Ready to build something amazing!** 🚀

**Next:** Validate API solution → Install mobile dependencies → First app run

**Timeline:** 1-2 hours to be fully operational and developing

**Last Updated:** December 8, 2025
