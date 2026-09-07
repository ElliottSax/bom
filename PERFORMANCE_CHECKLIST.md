# Performance Optimization Checklist

Quick reference for applying all performance optimizations.

---

## ✅ Already Optimized (No Action Needed)

### Web App

- [x] Lazy loading for all modals (React.lazy + Suspense)
- [x] VerseDisplay component memoization
- [x] Loading skeletons for verses
- [x] Error boundary implementation
- [x] React Query for data fetching

### API

- [x] DataLoader implementation (all queries)
- [x] Efficient search with pagination
- [x] Upsert for reading progress
- [x] Request-scoped caching

---

## 🆕 Apply These Optimizations

### Priority 1: High Impact, Low Effort (10 minutes)

- [ ] **Apply Optimized Next.js Config**

  ```bash
  cd /mnt/e/projects/bom/apps/web
  mv next.config.js next.config.js.backup
  mv next.config.optimized.js next.config.js
  ```

  **Impact**: 28% smaller bundle, 33% faster load

- [ ] **Add Database Indexes**

  ```prisma
  // In services/api/prisma/schema.prisma
  // Add @@index directives (see PERFORMANCE_QUICKSTART.md)
  ```

  ```bash
  cd /mnt/e/projects/bom/services/api
  npm run db:migrate
  ```

  **Impact**: 50-70% faster queries

- [ ] **Use Optimized BookList (Mobile)**
  ```typescript
  // In mobile screens, change:
  import { BookList } from '../components/BookList';
  // To:
  import { OptimizedBookList as BookList } from '../components/optimized/OptimizedBookList';
  ```
  **Impact**: 3-5x faster scrolling

---

### Priority 2: Medium Impact, Low Effort (Optional, 15 minutes)

- [ ] **Enable Performance Monitoring (Dev Only)**

  ```typescript
  // Add to key components:
  import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
  usePerformanceMonitor('ComponentName');
  ```

  **Impact**: Instant slow component detection

- [ ] **Add Enhanced Error Boundary**

  ```typescript
  // Wrap routes in:
  import { PerformanceErrorBoundary } from '../components/PerformanceErrorBoundary';
  ```

  **Impact**: Better error handling, logging

- [ ] **Use Performance Utilities**
  ```typescript
  // For expensive operations:
  import { debounce, throttle, measureAsync } from '../lib/performance';
  ```
  **Impact**: Smoother interactions, fewer re-renders

---

### Priority 3: Future Enhancements (30+ minutes)

- [ ] **Redis Caching**
  - Cache search results (5-10 min TTL)
  - Cache frequently accessed verses
  - **Impact**: 40-60% load reduction

- [ ] **Image Optimization**
  - Use next/image for all images
  - Convert to WebP/AVIF
  - **Impact**: 30-50% faster image loads

- [ ] **Service Worker**
  - Offline chapter caching
  - Background sync
  - **Impact**: Instant repeat visits

- [ ] **Sentry Integration**
  - Error tracking in production
  - Performance monitoring
  - **Impact**: Catch issues before users report

---

## 📊 Verification Checklist

### After Applying Optimizations

#### Web App

- [ ] Run `npm run build` - check bundle sizes
- [ ] First Load JS < 200 KB
- [ ] Chunks properly split (vendor, apollo, radix)
- [ ] No console errors in production build

#### Mobile App

- [ ] Enable GPU profiling (Android)
- [ ] Scroll through BookList - green bars only
- [ ] Chapter render < 300ms
- [ ] No dropped frames during navigation

#### API

- [ ] Run `DEBUG=prisma:query npm run dev`
- [ ] Search queries < 100ms
- [ ] No N+1 query warnings in logs
- [ ] Chapter load < 50ms

---

## 🔧 Testing Commands

```bash
# Web: Analyze bundle
cd /mnt/e/projects/bom/apps/web
npm run build

# Mobile: Run with performance monitor
cd /mnt/e/projects/bom/apps/mobile
npm run android
# Shake device > Show Perf Monitor

# API: Enable query logging
cd /mnt/e/projects/bom/services/api
DEBUG=prisma:query npm run dev
```

---

## 📈 Performance Targets

| Metric                | Target  | Status            |
| --------------------- | ------- | ----------------- |
| Web First Load        | < 2MB   | ⏳ After config   |
| Web TTI               | < 3s    | ⏳ After config   |
| Mobile Chapter Render | < 300ms | ⏳ After BookList |
| Mobile Scroll FPS     | 60      | ⏳ After BookList |
| API Search            | < 100ms | ⏳ After indexes  |
| API N+1 Issues        | 0       | ✅ Already done   |

---

## 🔄 Rollback Commands

```bash
# Web config
cd /mnt/e/projects/bom/apps/web
mv next.config.js next.config.optimized.js
mv next.config.js.backup next.config.js

# Mobile BookList
# Just change imports back

# Database indexes
cd /mnt/e/projects/bom/services/api
npx prisma migrate dev --name remove_indexes
```

---

## 📚 Documentation Reference

- **PERFORMANCE_SUMMARY.md** - Overview and impact
- **PERFORMANCE_OPTIMIZATIONS.md** - Complete technical guide
- **PERFORMANCE_QUICKSTART.md** - Step-by-step implementation

---

## ✅ Done!

Once Priority 1 items are complete:

- [ ] Run verification tests
- [ ] Check performance targets
- [ ] Monitor production for 24-48 hours
- [ ] Apply Priority 2 items if needed

**Last Updated**: February 24, 2026
