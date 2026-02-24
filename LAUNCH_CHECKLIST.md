# BOM Study Tools - Launch Checklist

**Target Launch Date**: February 14, 2026
**Current Status**: 90% Complete - Ready for Final Push

---

## Pre-Launch (CRITICAL)

### Infrastructure Setup
- [x] Fly.io CLI installed
- [x] Fly.io authenticated (elliottsaxton@gmail.com)
- [x] Vercel CLI installed
- [x] Vercel project configured
- [ ] **Add credit card to Fly.io** ⚠️ BLOCKER
- [ ] Confirm apps resumed (after credit card)

### Scripture Data
- [x] Book of Mormon data prepared (15 books)
- [x] Doctrine & Covenants data prepared (167 sections)
- [x] Import script created (`import-all-scriptures-flyio.sh`)
- [ ] Execute import script
- [ ] Verify 11,787+ verses imported
- [ ] Test verse queries via GraphQL

### Web Application
- [x] Build passes successfully
- [x] Next.js configuration complete
- [x] API URL configured for production
- [x] Onboarding flow created
- [x] Feedback modal created
- [ ] Deploy to Vercel production
- [ ] Verify deployment accessible
- [ ] Test on desktop browser
- [ ] Test on mobile browser

---

## Day of Launch

### Morning (Infrastructure)
**Time Estimate**: 1 hour

- [ ] **USER: Add credit card to Fly.io** (2 min)
  - Visit: https://fly.io/trial
  - Add payment method
  - Confirm apps resume

- [ ] Import scripture data (30 min)
  ```bash
  cd /mnt/e/projects/bom
  chmod +x import-all-scriptures-flyio.sh
  ./import-all-scriptures-flyio.sh
  ```

- [ ] Verify import succeeded
  ```bash
  curl https://bom-study-tools-api.fly.dev/graphql \
    -H "Content-Type: application/json" \
    -d '{"query": "{ statistics { totalVerses totalBooks } }"}'
  ```
  Expected: ~11,787 verses, 15 books

- [ ] Test API health
  ```bash
  curl https://bom-study-tools-api.fly.dev/health
  ```

### Afternoon (Deployment)
**Time Estimate**: 1 hour

- [ ] Deploy web app to Vercel
  ```bash
  cd /mnt/e/projects/bom
  chmod +x deploy-web-to-vercel.sh
  ./deploy-web-to-vercel.sh
  ```

- [ ] Verify web app accessible
  - Open deployment URL
  - Check homepage loads
  - Verify no JavaScript errors

- [ ] Run end-to-end tests
  ```bash
  cd /mnt/e/projects/bom
  chmod +x test-end-to-end.sh
  ./test-end-to-end.sh
  ```
  Target: 100% pass rate

### Evening (Testing)
**Time Estimate**: 45 minutes

#### Core Features Test
- [ ] Homepage displays correctly
- [ ] Can browse to Book of Mormon
- [ ] Can select 1 Nephi
- [ ] Chapter list appears
- [ ] Can read 1 Nephi chapter 1
- [ ] Verses display correctly
- [ ] Text is readable and formatted

#### Study Features Test
- [ ] Can highlight text
- [ ] Highlight saves and persists
- [ ] Can add note to verse
- [ ] Note saves and displays
- [ ] Can bookmark verse
- [ ] Bookmark appears in list
- [ ] Can search for "Nephi"
- [ ] Search results appear

#### UI/UX Test
- [ ] Theme toggle works (light/dark)
- [ ] Responsive on mobile
- [ ] Navigation is smooth
- [ ] No console errors
- [ ] No 404 errors
- [ ] Images/icons load

#### Offline Test
- [ ] Read a chapter
- [ ] Turn off WiFi/airplane mode
- [ ] Refresh browser
- [ ] Chapter still loads
- [ ] Can navigate cached pages

#### Performance Test
- [ ] Page loads in <2 seconds
- [ ] API responses in <500ms (warm)
- [ ] No layout shift
- [ ] Smooth scrolling

---

## Launch Announcement

### Social Media Posts
**Time Estimate**: 30 minutes

- [ ] Post to Twitter/X (see LAUNCH_ANNOUNCEMENT.md)
- [ ] Post to Facebook
- [ ] Post to LinkedIn
- [ ] Post to relevant CoC forums
- [ ] Share in CoC study groups

### Beta Tester Outreach
**Time Estimate**: 15 minutes

- [ ] Email 10-20 beta testers
- [ ] Share deployment URL
- [ ] Request feedback
- [ ] Provide feedback form link

### Documentation
**Time Estimate**: 15 minutes

- [ ] Update CLAUDE.md with launch status
- [ ] Create LAUNCH_SUCCESS.md with metrics
- [ ] Document deployment URLs
- [ ] Save important configuration

---

## Post-Launch (Day 1)

### Monitoring
- [ ] Check Fly.io logs for errors
  ```bash
  flyctl logs -a bom-study-tools-api -f
  ```
- [ ] Monitor Vercel deployment logs
- [ ] Watch for user feedback
- [ ] Track any bug reports

### User Support
- [ ] Respond to questions within 4 hours
- [ ] Acknowledge bug reports
- [ ] Prioritize critical issues
- [ ] Thank early users

### Metrics Collection
- [ ] Count unique visitors (if analytics installed)
- [ ] Track page views
- [ ] Note most visited pages
- [ ] Record user feedback themes

---

## Week 1 Post-Launch

### Daily Tasks
- [ ] Check logs for errors (morning & evening)
- [ ] Respond to feedback
- [ ] Fix critical bugs within 24 hours
- [ ] Update bug list

### Gather Feedback
- [ ] Email beta testers for detailed feedback
- [ ] Create Google Form for user survey
- [ ] Analyze common feature requests
- [ ] Prioritize improvements

### Success Metrics
Target by end of Week 1:
- [ ] 10+ unique users
- [ ] 100+ page views
- [ ] 0 critical bugs
- [ ] 5+ positive comments
- [ ] Feature roadmap defined

---

## Week 2-3 Post-Launch

### Analytics Setup
- [ ] Install Plausible Analytics
  ```bash
  # Sign up: https://plausible.io
  # Add script to layout.tsx
  ```
- [ ] Install Sentry error tracking
  ```bash
  cd apps/web
  npm install @sentry/nextjs
  npx @sentry/wizard -i nextjs
  ```

### Feature Iterations
- [ ] Review top 5 feature requests
- [ ] Implement quick wins
- [ ] Plan larger features
- [ ] Update roadmap

### Mobile App Planning
- [ ] Assess demand for mobile apps
- [ ] If demand exists, start iOS build
- [ ] If demand exists, start Android build
- [ ] Prepare app store materials

---

## Month 1 Post-Launch

### Growth Metrics
Target by end of Month 1:
- [ ] 50+ active users
- [ ] 1,000+ page views
- [ ] <5 critical bugs
- [ ] 5+ testimonials

### Community Building
- [ ] Create feedback email list
- [ ] Share user testimonials
- [ ] Feature request voting
- [ ] Community forum (if needed)

### Technical Improvements
- [ ] Optimize bundle size
- [ ] Improve load time
- [ ] Add more cross-references
- [ ] Enhance search functionality

---

## Optional Enhancements

### Phase 2: Mobile Apps (Weeks 2-4)
- [ ] Build React Native iOS app
- [ ] Build React Native Android app
- [ ] Test on physical devices
- [ ] Submit to TestFlight (iOS)
- [ ] Submit to Play Console (Android)
- [ ] Beta test with 10-20 users
- [ ] Public launch

### Phase 3: Advanced Features (Months 2-3)
- [ ] AI study assistant (requires OpenAI API)
- [ ] Semantic search (requires vector DB)
- [ ] Audio scripture playback
- [ ] Study groups (social features)
- [ ] Push notifications
- [ ] Email digests

### Phase 4: Community (Month 3+)
- [ ] Discussion forums
- [ ] Shared annotations
- [ ] Community insights
- [ ] Lesson plans
- [ ] Multi-language support

---

## Rollback Plan

If critical issues occur post-launch:

### API Issues
```bash
# Check logs
flyctl logs -a bom-study-tools-api

# Restart app
flyctl apps restart bom-study-tools-api

# Check database
flyctl postgres connect -a bom-postgres
```

### Web App Issues
```bash
# Rollback to previous deployment
cd apps/web
vercel rollback

# Or redeploy
vercel --prod
```

### Data Issues
```bash
# Reimport scripture data
cd /mnt/e/projects/bom
./import-all-scriptures-flyio.sh
```

---

## Emergency Contacts

**Fly.io Support**: https://fly.io/docs/about/support/
**Vercel Support**: https://vercel.com/support
**Community**: Community of Christ forums

---

## Launch Day Timeline

**09:00 AM** - Add credit card to Fly.io
**09:30 AM** - Import scripture data
**10:30 AM** - Verify data import
**11:00 AM** - Deploy web app
**11:30 AM** - Run automated tests
**12:00 PM** - Manual testing (lunch break)
**01:00 PM** - Fix any critical bugs
**02:00 PM** - Final checks
**03:00 PM** - **🚀 LAUNCH!**
**03:15 PM** - Social media announcements
**03:30 PM** - Email beta testers
**04:00 PM** - Monitor feedback
**05:00 PM** - Celebrate! 🎉

---

## Success Criteria

### Minimum Viable Launch
- ✅ API is accessible (HTTP 200)
- ✅ Scripture data imported (11,787 verses)
- ✅ Web app deployed and accessible
- ✅ Can read Book of Mormon
- ✅ Can read Doctrine & Covenants
- ✅ Highlights work
- ✅ Notes work
- ✅ No critical bugs

### Ideal Launch
- ✅ All minimum criteria met
- ✅ Onboarding flow working
- ✅ Analytics installed
- ✅ 10 beta testers invited
- ✅ Positive initial feedback
- ✅ Social media posts published
- ✅ <2s page load time
- ✅ 100% test pass rate

---

## Current Status

**Infrastructure**: ✅ Ready (need credit card)
**Scripture Data**: ✅ Prepared (need to import)
**Web App**: ✅ Built (need to deploy)
**Testing**: ⏳ Ready to run
**Marketing**: ✅ Materials prepared
**Launch**: ⏸️ Waiting for credit card

**Estimated Time to Launch**: 2-3 hours after credit card added

---

**Next Immediate Action**: Add credit card to Fly.io at https://fly.io/trial

---

_Last Updated: February 14, 2026_
