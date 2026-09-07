# Testing Guide

## Quick Start

```bash
# Run all tests
npm test

# Run tests for specific workspace
npm test --workspace=apps/web
npm test --workspace=apps/mobile

# Run with coverage
npm test -- --coverage

# Watch mode (development)
npm test -- --watch
```

---

## Test Structure

### Web App (`apps/web/app/__tests__/`)

```
__tests__/
├── test-utils.ts                    # Shared utilities
├── integration/
│   └── reading-goals-flow.test.ts   # Integration tests
├── hooks.test.ts                    # Original hook tests
├── logger.test.ts                   # Logger tests
├── useLocalStorage.test.ts          # LocalStorage hook
├── useCrossReferences.test.ts       # ✨ NEW
├── useDailyVerse.test.ts            # ✨ NEW
├── useMemorization.test.ts          # ✨ NEW
├── useOnboarding.test.ts            # ✨ NEW
├── useReadingGoals.test.ts          # ✨ NEW
├── useWordStudy.test.ts             # ✨ NEW
└── FeedbackModal.test.tsx           # ✨ NEW
```

### Mobile App (`apps/mobile/src/__tests__/`)

```
__tests__/
├── test-utils.ts                    # Mobile utilities
├── bugFixes.test.ts                 # Bug fix verification
├── logger.test.ts                   # Logger tests
├── usePersistedState.test.ts        # Persisted state hook
├── AccessibleView.test.tsx          # ✨ NEW
├── OfflineIndicator.test.tsx        # ✨ NEW
└── OnboardingScreen.test.tsx        # ✨ NEW
```

---

## What's Been Added

### ✅ New Test Files (13 files, ~4,500 LOC)

#### Web Hooks (6 files, ~255 tests)

1. **useCrossReferences.test.ts** - Cross-reference lookups and Bible parallels
2. **useDailyVerse.test.ts** - Daily verse selection and rotation
3. **useMemorization.test.ts** - Spaced repetition memorization system
4. **useOnboarding.test.ts** - Onboarding flow state management
5. **useReadingGoals.test.ts** - Reading goal tracking and streaks
6. **useWordStudy.test.ts** - Word study and concordance

#### Web Components (1 file, ~38 tests)

1. **FeedbackModal.test.tsx** - User feedback submission

#### Mobile Components (3 files, ~105 tests)

1. **AccessibleView.test.tsx** - Accessibility wrapper component
2. **OfflineIndicator.test.tsx** - Network status indicator
3. **OnboardingScreen.test.tsx** - Mobile onboarding flow

#### Integration Tests (1 file, ~15 tests)

1. **reading-goals-flow.test.ts** - End-to-end reading goals journey

#### Test Utilities (2 files)

1. **apps/web/app/**tests**/test-utils.ts** - Web testing helpers
2. **apps/mobile/src/**tests**/test-utils.ts** - Mobile testing helpers

---

## Test Coverage by Feature

### Memorization System ✅

- ✓ Add/remove verses
- ✓ Spaced repetition algorithm
- ✓ Progressive hint system
- ✓ Review tracking and statistics
- ✓ Level progression (0-5)
- ✓ localStorage persistence

### Reading Goals ✅

- ✓ Create daily/weekly goals
- ✓ Track progress
- ✓ Calculate streaks
- ✓ Goal completion
- ✓ Multiple concurrent goals
- ✓ Goal history

### Word Study ✅

- ✓ Search across volumes
- ✓ Group results by book
- ✓ Text highlighting
- ✓ Error handling
- ✓ Input validation

### Cross References ✅

- ✓ Verse lookups
- ✓ Chapter references
- ✓ Reference formatting
- ✓ Type labeling (quote, parallel, allusion, related)

### Daily Verse ✅

- ✓ Deterministic selection
- ✓ Day-based rotation
- ✓ Leap year handling
- ✓ Time zone consistency

### Onboarding ✅

- ✓ New user detection
- ✓ Completion tracking
- ✓ Manual reset
- ✓ SSR compatibility

### Accessibility ✅

- ✓ ARIA labels and roles
- ✓ Screen reader support
- ✓ Keyboard navigation
- ✓ Live regions

### Offline Support ✅

- ✓ Network detection
- ✓ Visual indicators
- ✓ Smooth animations
- ✓ Accessibility announcements

---

## Running Specific Tests

### By Feature

```bash
# Memorization
npm test -- useMemorization

# Reading goals
npm test -- useReadingGoals

# Word study
npm test -- useWordStudy

# Mobile components
npm test -- AccessibleView OfflineIndicator OnboardingScreen
```

### By Type

```bash
# All hook tests
npm test -- hooks

# All component tests
npm test -- Modal

# Integration tests
npm test -- integration/
```

### With Options

```bash
# Verbose output
npm test -- --verbose

# Only changed files
npm test -- --onlyChanged

# Update snapshots
npm test -- --updateSnapshot

# Run in band (serial)
npm test -- --runInBand
```

---

## Writing New Tests

### Test Structure Template

```typescript
import { renderHook, act } from '@testing-library/react';
import { useYourHook } from '../hooks/useYourHook';

describe('useYourHook', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  describe('feature group', () => {
    it('should do something specific', () => {
      // Arrange
      const { result } = renderHook(() => useYourHook());

      // Act
      act(() => {
        result.current.someMethod();
      });

      // Assert
      expect(result.current.someState).toBe(expectedValue);
    });
  });
});
```

### Best Practices

#### ✅ DO

- Use descriptive test names
- Group related tests with `describe`
- Test one thing per test case
- Use `act()` for state updates
- Clean up after tests
- Mock external dependencies
- Test edge cases and errors
- Test accessibility

#### ❌ DON'T

- Share state between tests
- Test implementation details
- Use timeouts/sleeps
- Ignore console warnings
- Skip cleanup
- Over-mock (test too little)
- Under-mock (test too much)

---

## Debugging Tests

### Failed Tests

```bash
# Run only failing tests
npm test -- --onlyFailures

# Show full error output
npm test -- --verbose

# Run single test file
npm test -- path/to/test.test.ts
```

### Debug Mode

```javascript
// Add to test
console.log(result.current); // Log state
screen.debug(); // Print DOM
```

### VSCode Debugging

1. Set breakpoint in test
2. Run "Jest: Debug"
3. Inspect variables

---

## Coverage Reports

### Generate Coverage

```bash
npm test -- --coverage
```

### View Coverage

```bash
# Web
open apps/web/coverage/lcov-report/index.html

# Mobile
open apps/mobile/coverage/lcov-report/index.html
```

### Coverage Thresholds

```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 50,
    functions: 50,
    lines: 50,
    statements: 50,
  },
}
```

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm test
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
```

### Pre-commit Hook

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["npm test -- --findRelatedTests --bail"]
  }
}
```

---

## Performance

### Test Execution Time

- Full suite: ~5 seconds
- Web tests: ~3 seconds
- Mobile tests: ~2 seconds
- Integration tests: ~1 second

### Optimization Tips

1. Use `--maxWorkers=50%` for parallel execution
2. Use `--onlyChanged` during development
3. Mock expensive operations (network, storage)
4. Use `--bail` to stop on first failure
5. Run integration tests separately

---

## Common Issues

### localStorage not defined

```typescript
// Add to jest.setup.js
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});
```

### Async operations not completing

```typescript
// Use waitFor
await waitFor(() => {
  expect(result.current.loading).toBe(false);
});
```

### React state update warnings

```typescript
// Wrap in act()
act(() => {
  result.current.updateState();
});
```

### Timers not advancing

```typescript
// Use fake timers
jest.useFakeTimers();
jest.advanceTimersByTime(1000);
jest.useRealTimers(); // Cleanup
```

---

## Resources

### Documentation

- [Jest](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)

### Examples

See `TEST_COVERAGE_SUMMARY.md` for detailed examples of all test patterns used in this project.

### Support

- Check existing tests for patterns
- Review test-utils.ts for helpers
- Create issue for test infrastructure questions

---

**Last Updated**: February 24, 2026
