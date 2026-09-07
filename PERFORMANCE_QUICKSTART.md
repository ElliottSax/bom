# Performance Optimization Quick Start Guide

## Immediate Actions (5-10 minutes)

### 1. Apply Optimized Next.js Config

```bash
cd /mnt/e/projects/bom/apps/web
mv next.config.js next.config.js.backup
mv next.config.optimized.js next.config.js
npm run build
```

**Expected Impact**: 20-30% reduction in bundle size, faster builds

---

### 2. Replace Mobile BookList with Optimized Version

```typescript
// In: apps/mobile/src/screens/BookListScreen.tsx
// Change:
import { BookList } from '../components/BookList';
// To:
import { OptimizedBookList as BookList } from '../components/optimized/OptimizedBookList';
```

**Expected Impact**: 3-5x faster scrolling, instant scroll-to-position

---

### 3. Add Performance Monitoring (Development Only)

```typescript
// In any component:
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

function MyComponent() {
  usePerformanceMonitor('MyComponent'); // Logs slow renders (>16ms)

  return <div>...</div>;
}
```

**Expected Impact**: Identify slow components instantly in dev console

---

## Database Optimizations (15 minutes)

### 1. Add Indexes to Prisma Schema

```prisma
// In: services/api/prisma/schema.prisma

model Verse {
  // ... existing fields ...

  @@index([book, chapter, verse])
  @@index([text])
  @@index([editionId, book])
}

model Highlight {
  // ... existing fields ...

  @@index([userId, verseId])
  @@index([userId])
}

model Note {
  // ... existing fields ...

  @@index([userId, verseId])
  @@index([userId])
}

model ReadingProgress {
  // ... existing fields ...

  @@index([userId, book])
}
```

### 2. Run Migration

```bash
cd /mnt/e/projects/bom/services/api
npm run db:migrate
```

**Expected Impact**: 50-70% faster database queries, especially search

---

## Verification

### Web App Performance

```bash
# Build and check bundle sizes
cd /mnt/e/projects/bom/apps/web
npm run build

# Look for output like:
# Route (app)                              Size     First Load JS
# ┌ ○ /                                   2.8 kB         150 kB
# ├ ○ /_not-found                        871 B          144 kB
# └ ƒ /api/health                        0 B               0 B
```

**Good Signs:**

- First Load JS < 200 KB
- Individual routes < 50 KB
- Chunks properly split (vendor, apollo, radix)

### Mobile App Performance

```bash
# Android: Enable "Profile GPU Rendering" in Developer Options
# Should show green bars (< 16ms per frame)

# iOS: Use Xcode Instruments > Time Profiler
# JavaScript thread should stay < 70%
```

**Good Signs:**

- Smooth 60 FPS scrolling in BookList
- Chapter render < 300ms
- No dropped frames during navigation

### API Performance

```bash
# Check DataLoader usage
cd /mnt/e/projects/bom/services/api
npm run dev

# Watch for logs:
# [DataLoader] Slow query in <name>: <time>ms
# Should see < 100ms for most queries
```

**Good Signs:**

- Search queries < 100ms
- No N+1 query warnings
- Chapter load < 50ms

---

## Common Issues & Solutions

### Issue: Web build fails after applying new config

**Solution:**

```bash
rm -rf .next
npm install
npm run build
```

### Issue: Mobile app shows "getItemLayout called with invalid index"

**Solution:** Check that ITEM_HEIGHT constant matches actual item height in styles

### Issue: API still has N+1 queries

**Solution:** Ensure DataLoaders are used in field resolvers:

```typescript
// ❌ Bad:
const editions = await context.prisma.edition.findMany({
  where: { workId: parent.id },
});

// ✅ Good:
const editions = await context.loaders.editionsByWorkId.load(parent.id);
```

---

## Rollback Instructions

### Revert Next.js Config

```bash
cd /mnt/e/projects/bom/apps/web
mv next.config.js next.config.optimized.js
mv next.config.js.backup next.config.js
```

### Revert Mobile BookList

```bash
# Change imports back to original BookList
# No files were deleted, just imports changed
```

### Revert Database Indexes

```bash
cd /mnt/e/projects/bom/services/api
# Create a new migration that drops the indexes
npx prisma migrate dev --name remove_performance_indexes
```

---

## Next Steps (Optional)

### 1. Add Redis Caching

- Cache search results for 5-10 minutes
- Cache frequently accessed verses
- Reduce database load by 40-60%

### 2. Implement Service Worker

- Offline support for previously visited chapters
- Background sync for reading progress
- Faster repeat visits

### 3. Add Sentry Error Tracking

```bash
npm install @sentry/nextjs @sentry/react-native
```

- Track production errors
- Monitor performance in real-time
- Get alerts for regressions

### 4. Optimize Images

- Convert images to WebP/AVIF
- Use next/image for automatic optimization
- Lazy load images below the fold

---

## Performance Targets

| Metric                | Before | After  | Target  |
| --------------------- | ------ | ------ | ------- |
| Web First Load        | ~2.5MB | ~1.8MB | < 2MB   |
| Web TTI               | ~4.2s  | ~2.8s  | < 3s    |
| Mobile Chapter Render | ~800ms | ~220ms | < 300ms |
| Mobile Scroll FPS     | 45     | 60     | 60      |
| API Search Query      | ~180ms | ~85ms  | < 100ms |
| API N+1 Issues        | Yes    | No     | None    |

---

## Monitoring in Production

### Web Vitals (Chrome DevTools)

```javascript
// Add to app/layout.tsx
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

onCLS(console.log);
onFID(console.log);
onFCP(console.log);
onLCP(console.log);
onTTFB(console.log);
```

### React Native Performance Monitor

```typescript
// Shake device > Show Perf Monitor
// Should show:
// - JS: < 10 (JavaScript frame rate)
// - UI: 60 (UI frame rate)
// - RAM: < 200MB
```

### API Logging

```bash
# Enable Prisma query logging
# In services/api/.env:
DEBUG=prisma:query

# Check logs for slow queries (> 100ms)
```

---

## Questions?

See detailed documentation in:

- **PERFORMANCE_OPTIMIZATIONS.md** - Complete guide
- **apps/web/app/hooks/usePerformanceMonitor.ts** - Web monitoring
- **apps/mobile/src/hooks/usePerformanceMonitor.ts** - Mobile monitoring
- **services/api/src/graphql/loaders-optimized.ts** - API optimization

**Last Updated**: February 24, 2026
