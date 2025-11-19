# Book of Mormon Study Tools - Mobile App

React Native mobile application for iOS and Android.

## Architecture Decision

See [ADR-001: Mobile Framework Selection](../../docs/adr/001-mobile-framework-selection.md) for the decision to use React Native 0.77+ with New Architecture.

## Getting Started

### Prerequisites

- Node.js 18+
- React Native development environment
- iOS: Xcode 15+, CocoaPods
- Android: Android Studio, JDK 17

### Installation

```bash
# Install dependencies
npm install

# iOS: Install CocoaPods
cd ios && pod install && cd ..

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Project Structure

```
apps/mobile/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation configuration
│   ├── services/        # API clients, offline sync
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript types
│   └── theme/           # Design system (colors, typography)
├── android/             # Android native code
├── ios/                 # iOS native code
├── index.js             # Entry point
└── package.json
```

## Key Features

- Offline-first architecture with SQLite + PouchDB
- GraphQL API integration with Apollo Client
- Cross-platform UI with React Native
- Semantic search integration
- Push notifications
- Accessibility support (WCAG 2.1)

## Development

### Running Tests

```bash
npm test
```

### End-to-End Tests

```bash
# iOS
detox test --configuration ios

# Android
detox test --configuration android
```

### Building for Production

```bash
# iOS
cd ios && xcodebuild -workspace BoMStudyTools.xcworkspace -scheme BoMStudyTools archive

# Android
cd android && ./gradlew assembleRelease
```

## Related Documentation

- [User Stories](../../USER_STORIES.md)
- [Technical Implementation Guide](../../LDS_STUDY_TOOLS_TECHNICAL_IMPLEMENTATION.md)
- [Offline-First Architecture](../../docs/adr/003-offline-first-architecture.md)
