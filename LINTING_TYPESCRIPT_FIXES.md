# Linting and TypeScript Fixes Summary

## Date: 2026-02-24

## Overview
Comprehensive linting and TypeScript fixes applied across the BOM Study Tools monorepo to eliminate 'any' types, fix type errors, and improve code quality.

---

## Web App (/mnt/e/projects/bom/apps/web)

### Fixed Issues

#### 1. Missing Dependency: lucide-react
**Status**: ✅ FIXED
- **Issue**: `FeedbackModal.tsx` and `WelcomeOnboardingModal.tsx` imported from missing package
- **Fix**: Installed `lucide-react` package via npm
- **Command**: `npm install lucide-react`

#### 2. TypeScript 'any' Types Eliminated
**Status**: ✅ FIXED

**File**: `app/lib/performance.ts`
- Line 10: Changed `any[]` to `unknown[]` in debounce function
- Line 33: Changed `any[]` to `unknown[]` in throttle function
- Line 98: Changed `React.ComponentType<any>` to `React.ComponentType<Record<string, unknown>>`

**File**: `app/hooks/useShare.ts`
- Line 70: Changed `catch (error: any)` to proper Error type checking with `instanceof`

**File**: `app/__tests__/hooks.test.ts`
- Lines 114-121: Added proper interface for CourseProgress to fix implicit 'any' type errors

### Remaining Web Issues (To Be Fixed)
1. `DailyVerseWidget.tsx` - className prop issues on lines 133, 186, 216
2. `useChallenges.ts` - Type predicate and null assignment issues on lines 24, 37
3. `useNotifications.ts` - Vibrate property not in NotificationOptions on lines 86, 142

---

## Mobile App (/mnt/e/projects/bom/apps/mobile)

### Fixed Issues

#### 1. TypeScript 'any' Types Eliminated
**Status**: ✅ FIXED

**File**: `src/utils/performance.ts`
- Lines 12, 35: Changed function signatures from `any[]` to `unknown[]`
- Line 122: Changed `_data: any` to `_data: unknown`
- Lines 133: Changed `prev: any, next: any` to `prev: unknown, next: unknown`
- Lines 158-161: Changed memoize function from `any[]` to proper generics with `Parameters<T>` and `ReturnType<T>`

**File**: `src/hooks/useWordStudy.ts`
- Line 78: Replaced `any` with proper `SearchVerseResult` interface definition

**File**: `src/types/index.ts`
- Line 72: Changed `[key: string]: any` to `[key: string]: unknown`
- Line 77: Changed `data: any` to `data: NavigationData`
- Added `primaryLight` and `card` properties to ThemeColors interface

**File**: `src/hooks/useCloudSync.SECURE.ts`
- Line 393: Changed `catch (err: any)` to proper Error type checking

**File**: `src/hooks/useDataBackup.ts`
- Line 142: Changed `catch (err: any)` to proper Error type checking
- Lines 33-39: Changed all `any` types to `Record<string, unknown>` or proper types

**File**: `src/screens/RemindersScreen.tsx`
- Line 70: Changed `event: any` to `_event: unknown` (unused parameter)

**File**: `src/hooks/useOptimized.ts`
- Line 234: Changed `useRef<any>` to `useRef<ScrollView>`
- Line 237: Changed `event: any` to proper `NativeSyntheticEvent<NativeScrollEvent>`
- Line 292: Changed `value: any` to proper generic type `value: T[K]`

#### 2. ThemeColors Type Enhancements
**Status**: ✅ FIXED

Added missing color properties to ThemeColors interface:
- `primaryLight: string`
- `card: string`

Updated all components using `colors: any` to use `colors: ThemeColors`:
- `src/screens/SearchScreen.tsx`
- `src/screens/OnboardingScreen.tsx`
- `src/screens/BackupRestoreScreen.tsx`
- `src/components/ScriptureReader.tsx`
- `src/components/StudyPlanEnhanced.tsx`
- `src/components/VerseActionMenu.tsx`

#### 3. Unused Import and Variable Cleanup
**Status**: ✅ FIXED

- `src/components/VerseNotes.tsx`: Removed unused `FlatList` import
- `src/components/VerseNotes.tsx`: Added `verseId` property to Note interface
- `src/components/TabsNavigator.tsx`: Removed unused `PanResponder` import
- `src/components/TabsNavigator.tsx`: Commented out unused `isDark` variable
- `src/components/TabsNavigator.tsx`: Commented out unused `tabWidthAnimation` variable
- `src/components/TabsNavigator.tsx`: Changed `alert()` to `Alert.alert()` and added Alert import
- `src/components/StudyPlanEnhanced.tsx`: Commented out unused `startDate` variable

### Remaining Mobile Issues (To Be Fixed)
Test files in `src/components/__tests__/CrossReferences.test.tsx` have multiple type errors related to:
- Missing `route` prop in test components
- Missing Jest matcher extensions (toHaveTextContent, longPress)
- Implicit 'any' types in test callbacks

---

## API Service (/mnt/e/projects/bom/services/api)

### Status
**No 'any' types found** - API service has good TypeScript hygiene!

### Remaining API Issues (To Be Fixed)
1. **Script files**: Unused variables in scraping scripts
2. **Test file** (`src/scripts/test-graphql.ts`): GraphQL context type mismatches
3. **Auth service** (`src/services/auth.service.ts`): JWT signing type issues and missing 'name' property

---

## Summary Statistics

### Types Fixed
- **Web App**: 5 'any' types → proper types
- **Mobile App**: 35+ 'any' types → proper types
- **API Service**: 0 'any' types (already clean)

### Files Modified
- **Web App**: 4 files
- **Mobile App**: 15 files
- **Total**: 19 files

### Dependencies Added
- `lucide-react` to web app

---

## Next Steps

### High Priority
1. Fix remaining web TypeScript errors (DailyVerseWidget, useChallenges, useNotifications)
2. Fix mobile test type errors in CrossReferences.test.tsx
3. Fix API auth service JWT signing types

### Medium Priority
1. Run ESLint on all packages and fix warnings
2. Review and standardize console.log usage (use logger utility)
3. Add stricter tsconfig settings

### Low Priority
1. Clean up unused variables in API scraping scripts
2. Add type guards for safer type narrowing
3. Consider adding eslint rules to prevent 'any' types

---

## Performance Notes

All linting and type-checking operations were slow on WSL2 environment:
- **npm install**: ~13 minutes
- **tsc --noEmit**: 5-10 minutes per package
- **ESLint**: Several minutes per package

This is consistent with known WSL2 performance characteristics for Node.js file system operations.

---

## Testing Commands

```bash
# Run type-check on all packages
npm run type-check

# Run linting on all packages
npm run lint

# Run type-check on specific package
cd apps/web && npm run type-check
cd apps/mobile && npm run type-check
cd services/api && npm run type-check
```

---

## Verification Status

✅ Web app: Most 'any' types fixed, some errors remain
✅ Mobile app: All 'any' types fixed, test files need work
✅ API service: No 'any' types, minor issues in scripts
⏳ Full monorepo type-check: In progress
⏳ Full monorepo lint: Not yet run (very slow on WSL2)
