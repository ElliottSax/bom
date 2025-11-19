# ADR-001: Mobile Framework Selection

**Date:** 2025-11-19
**Status:** Proposed
**Deciders:** Technical Lead, Mobile Squad Lead, Product Manager

## Context

We need to build mobile applications for iOS and Android to provide Book of Mormon study tools. The framework choice will significantly impact:
- Development speed and cost
- Performance and user experience
- Team hiring and expertise requirements
- Long-term maintenance
- Feature parity across platforms

## Decision

We will use **React Native 0.77+** with the New Architecture as our primary mobile framework.

## Rationale

### Key Factors:

1. **Cross-Platform Efficiency**
   - Single codebase for iOS and Android reduces development time by ~40%
   - Estimated 2-3 engineers per platform with native vs. 3-4 total with React Native
   - Critical for 18-month timeline with budget constraints

2. **Web Code Reuse**
   - Gospel Library already has web presence
   - Share business logic between mobile and web (React)
   - Shared component library possible with react-native-web

3. **Team Expertise**
   - Larger pool of JavaScript/TypeScript developers
   - Easier to find React Native developers than Flutter/Dart
   - Existing web team can contribute to mobile codebase

4. **Ecosystem Maturity**
   - Mature ecosystem with extensive third-party libraries
   - Well-documented solutions for common problems
   - Strong community support (Meta-backed)

5. **Performance Improvements**
   - New Architecture (0.74+) eliminates JavaScript bridge bottleneck
   - JSI provides near-native performance for most use cases
   - Sufficient for text-heavy application (95% of our use case)

### Trade-offs Accepted:

- **Performance:** Slightly slower than native/Flutter for complex animations (acceptable trade-off for our use case)
- **Bundle Size:** Larger than Flutter (but manageable with code splitting)
- **Platform-Specific Issues:** Occasional platform-specific bugs (mitigated with thorough testing)

## Consequences

### Positive:

- ✅ Faster development (single codebase)
- ✅ Lower personnel costs (fewer specialized roles)
- ✅ Code sharing with web application
- ✅ Large talent pool for hiring
- ✅ Extensive library ecosystem
- ✅ Hot reload for rapid iteration
- ✅ Strong TypeScript support

### Negative:

- ❌ Performance ceiling lower than native/Flutter
- ❌ Occasional platform-specific issues
- ❌ Dependency on Meta for framework maintenance
- ❌ Larger app bundle size
- ❌ Learning curve for iOS/Android platform specifics still required

### Neutral:

- 🔄 OTA updates possible (CodePush) but requires careful management
- 🔄 Navigation libraries less mature than native but improving

## Alternatives Considered

### Option 1: Flutter
**Pros:**
- Best rendering performance (60-120fps consistently)
- Beautiful, consistent UI across platforms
- Growing ecosystem
- Excellent for text-heavy apps

**Cons:**
- Dart language learning curve
- Smaller talent pool
- No web code reuse (different framework)
- Less mature ecosystem than React Native
- Team would need to learn new language

**Decision:** Rejected due to Dart learning curve and lack of web synergy

### Option 2: Native (Swift + Kotlin)
**Pros:**
- Maximum performance
- Full platform API access
- Best user experience
- No framework dependencies

**Cons:**
- 2x development time and cost
- Separate iOS and Android teams required
- No code sharing
- Higher personnel costs (need 6-8 mobile engineers vs. 3-4)
- Inconsistent feature releases

**Decision:** Rejected due to budget and timeline constraints

### Option 3: Progressive Web App (PWA) Only
**Pros:**
- Single codebase for all platforms
- No app store approval
- Instant updates

**Cons:**
- Limited offline capabilities
- Poor performance compared to native
- No access to native features (notifications, widgets)
- Inconsistent experience across browsers

**Decision:** Rejected as primary approach; will build PWA as supplementary

## Implementation Plan

1. **Phase 0 (Month 1-2):**
   - Set up React Native project with New Architecture
   - Configure TypeScript, ESLint, Prettier
   - Set up navigation (React Navigation)
   - Implement CI/CD for mobile

2. **Proof of Concept:**
   - Build basic scripture reader
   - Test offline capabilities
   - Measure performance on low-end devices
   - Validate approach before full commitment

3. **Team Training:**
   - React Native workshop for team
   - iOS/Android platform-specific training
   - Best practices documentation

4. **Decision Review:**
   - Re-evaluate after Phase 1 (Month 6)
   - If performance issues arise, consider hybrid approach
   - Keep option open to add native views for critical features

## Success Criteria

- App launch time < 2 seconds
- Chapter load time < 1 second
- Smooth scrolling (60fps)
- Works on 3-year-old devices
- <200MB bundle size
- <5% platform-specific bug rate

## References

- [React Native New Architecture](https://reactnative.dev/docs/the-new-architecture/landing-page)
- [Performance Comparison: React Native vs Flutter 2025](https://www.browserstack.com/guide/flutter-vs-react-native)
- Technical Implementation Guide: Mobile Architecture section

## Notes

This decision can be revisited after Phase 1 if:
- Performance targets not met
- Team encounters significant blockers
- Framework direction changes significantly

**Last Updated:** 2025-11-19
**Next Review:** 2026-05-19 (after Phase 1 completion)
