# Mobile Application

React Native mobile application for iOS and Android with offline-first architecture.

## Features

- **Offline-First**: Read scriptures without internet
- **Cross-References**: Interactive scripture connections
- **Daily Verse**: Curated daily inspiration
- **Reading Goals**: Track chapters, verses, or minutes
- **Memorization**: Spaced repetition system
- **Highlights & Notes**: Persistent across devices
- **Cloud Sync**: Optional device synchronization
- **Accessible**: Screen reader support, high contrast

## Tech Stack

- **Framework**: React Native 0.73+
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **State**: React Context + Hooks
- **Storage**: AsyncStorage (local), optional cloud sync
- **Networking**: Fetch API with offline queue
- **Testing**: Jest + React Native Testing Library

## Getting Started

### Prerequisites

**Required:**
- Node.js 18+
- npm 9+
- Watchman (macOS)

**iOS:**
- macOS with Xcode 15+
- CocoaPods
- iOS Simulator or device

**Android:**
- Android Studio
- JDK 17
- Android SDK (API 34)
- Android Emulator or device

### Installation

```bash
# From project root
npm install

# Install iOS dependencies
cd apps/mobile/ios && pod install && cd ../../..

# Or use project scripts
npm run mobile:ios        # Run on iOS
npm run mobile:android    # Run on Android
```

### Environment Setup

Create `.env.development`:

```env
API_URL=http://localhost:4000/graphql
ENABLE_CLOUD_SYNC=false
LOG_LEVEL=debug
```

Create `.env.production`:

```env
API_URL=https://api.bomstudytools.com/graphql
ENABLE_CLOUD_SYNC=true
LOG_LEVEL=info
```

### Development

```bash
# From project root
make mobile-ios        # iOS
make mobile-android    # Android

# Or from this directory
npm run ios
npm run android

# Start Metro bundler separately
npm start
```

## Project Structure

```
apps/mobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── reader/         # Scripture reader components
│   │   ├── modals/         # Modal dialogs
│   │   └── ui/             # Basic UI components
│   ├── screens/            # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── ReaderScreen.tsx
│   │   ├── OnboardingScreen.tsx
│   │   └── ...
│   ├── navigation/         # Navigation setup
│   │   └── AppNavigator.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useCrossReferences.ts
│   │   ├── useDailyVerse.ts
│   │   ├── useMemorization.ts
│   │   ├── useReadingGoals.ts
│   │   └── ...
│   ├── utils/              # Utilities
│   │   ├── logger.ts
│   │   ├── storage.ts
│   │   └── ...
│   ├── types/              # TypeScript types
│   └── theme/              # Design tokens
├── android/                # Android native code
├── ios/                    # iOS native code
├── __tests__/              # Tests
├── index.js                # Entry point
└── package.json
```

## Key Hooks

### useCrossReferences

Provides scripture cross-references:

```typescript
import { useCrossReferences } from './hooks/useCrossReferences';

function ReaderScreen() {
  const { getCrossReferences, hasCrossReferences } = useCrossReferences();

  const refs = getCrossReferences('coc-bom-1908:I Nephi:3:7');
  // Returns array of CrossReference objects
}
```

See JSDoc in file for full API.

### useDailyVerse

Rotates daily inspirational verses:

```typescript
import { useDailyVerse } from './hooks/useDailyVerse';

function HomeScreen() {
  const { verse, loading, refresh, navigateToVerse } = useDailyVerse();

  // verse.text, verse.reference, verse.book, verse.chapter, verse.verse
}
```

### useMemorization

Spaced repetition memorization system:

```typescript
import { useMemorization } from './hooks/useMemorization';

function MemorizationScreen() {
  const {
    verses,
    addVerse,
    removeVerse,
    recordReview,
    getDueVerses,
    getStats
  } = useMemorization();

  const stats = getStats();
  // { total, mastered, learning, new, dueForReview }
}
```

### useReadingGoals

Track reading progress:

```typescript
import { useReadingGoals } from './hooks/useReadingGoals';

function GoalsScreen() {
  const {
    activeGoals,
    createGoal,
    recordProgress,
    getGoalStats
  } = useReadingGoals();

  // Create goal: chapters, verses, or minutes
  await createGoal('chapters', 'daily', 1);

  // Record progress
  await recordProgress(goalId, 1);
}
```

## Offline-First Architecture

### Local Storage

- **AsyncStorage**: User preferences, reading history, goals
- **In-Memory Cache**: Scripture text, cross-references
- **No Database Required**: Scriptures are embedded

### Cloud Sync (Optional)

When enabled:
- Highlights and notes sync to API
- Reading goals sync across devices
- Conflict resolution with "last write wins"

### Network States

The app handles three states:
1. **Offline**: Full scripture reading, local features
2. **Online**: Sync + cloud features
3. **Slow Connection**: Queues requests, shows indicators

## Testing

```bash
# Unit tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Test Structure

```typescript
import { render, screen, waitFor } from '@testing-library/react-native';
import userEvent from '@testing-library/user-event';

describe('ReaderScreen', () => {
  it('renders chapter verses', async () => {
    render(<ReaderScreen book="I Nephi" chapter={1} />);

    await waitFor(() => {
      expect(screen.getByText(/I, Nephi/)).toBeTruthy();
    });
  });
});
```

### Integration Tests

Use Detox for E2E testing:

```bash
# Build test app
npm run detox:build:ios

# Run tests
npm run detox:test:ios
```

## Building for Production

### iOS

```bash
# Clean and build
cd ios
xcodebuild clean
pod install

# Archive for TestFlight/App Store
xcodebuild -workspace BoMStudyTools.xcworkspace \
  -scheme BoMStudyTools \
  -configuration Release \
  -archivePath build/BoMStudyTools.xcarchive \
  archive

# Export IPA
xcodebuild -exportArchive \
  -archivePath build/BoMStudyTools.xcarchive \
  -exportPath build \
  -exportOptionsPlist ExportOptions.plist
```

Or use Fastlane:

```bash
cd ios
fastlane ios release
```

### Android

```bash
# Build release APK
cd android
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk

# Build AAB for Play Store
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

Or use Fastlane:

```bash
cd android
fastlane android release
```

## App Store Submission

### iOS (App Store Connect)

1. Archive app in Xcode
2. Upload to App Store Connect
3. Fill in app metadata
4. Submit for review

Requirements:
- Screenshots (6.5", 5.5", 12.9")
- App icon (1024x1024)
- Privacy policy URL
- App description

### Android (Play Console)

1. Build AAB
2. Upload to Play Console
3. Fill in store listing
4. Submit for review

Requirements:
- Screenshots (phone, tablet)
- Feature graphic (1024x500)
- App icon (512x512)
- Privacy policy URL
- App description

## Performance

### Bundle Size

- iOS: ~15MB (release build)
- Android: ~10MB (release APK)

### Memory Usage

- Typical: 50-80MB
- Heavy usage: 100-150MB

### Launch Time

- Cold start: 1-2 seconds
- Warm start: <500ms

## Accessibility

- VoiceOver (iOS) and TalkBack (Android) support
- Dynamic type scaling
- High contrast mode
- Reduced motion support

Test with:
```bash
# iOS
npm run ios -- --simulator="iPhone 15 Pro"
# Enable VoiceOver in Simulator

# Android
npm run android
# Enable TalkBack in Emulator settings
```

## Troubleshooting

### Common Issues

**Metro bundler not starting:**
```bash
# Clear cache
npm start -- --reset-cache
```

**iOS build fails:**
```bash
# Clean and reinstall pods
cd ios
rm -rf Pods Podfile.lock
pod install
```

**Android build fails:**
```bash
# Clean gradle
cd android
./gradlew clean
```

**App crashes on startup:**
```bash
# Check logs
# iOS
npx react-native log-ios

# Android
npx react-native log-android
```

### Platform-Specific

**iOS**: See [SETUP.md](./SETUP.md) for detailed iOS setup

**Android**: Ensure `ANDROID_HOME` is set:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
```

## Contributing

1. Follow React Native best practices
2. Add tests for new features
3. Update JSDoc comments
4. Test on both iOS and Android
5. Run linter before committing

## Related Documentation

- [Main README](../../README.md)
- [Architecture Overview](../../ARCHITECTURE.md)
- [API Documentation](../../services/api/README.md)
- [SETUP.md](./SETUP.md) - Detailed setup instructions
