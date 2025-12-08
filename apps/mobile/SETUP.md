# Mobile App Setup Guide

This guide will help you set up and run the Book of Mormon Study Tools mobile app.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required for All Platforms
- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm or yarn** - Comes with Node.js
- **React Native CLI** - `npm install -g react-native-cli`

### iOS Development (macOS only)
- **Xcode 15+** - Install from Mac App Store
- **CocoaPods** - `sudo gem install cocoapods`
- **Xcode Command Line Tools** - `xcode-select --install`

### Android Development
- **Android Studio** - [Download](https://developer.android.com/studio)
- **JDK 17** - Included with Android Studio or download separately
- **Android SDK** - Install via Android Studio SDK Manager
- **Android Emulator** or physical device

## Installation Steps

### 1. Install Dependencies

```bash
# Navigate to mobile app directory
cd apps/mobile

# Install npm dependencies
npm install

# iOS only: Install CocoaPods dependencies
cd ios && pod install && cd ..
```

### 2. Install Additional React Native Dependencies

```bash
# Install required packages
npm install @react-native-async-storage/async-storage
npm install @react-native-community/netinfo
npm install react-native-screens react-native-safe-area-context
```

### 3. Configure Environment

The app is pre-configured to connect to:
- **Development API:** http://localhost:4000/graphql
- **Production API:** https://api.bomstudytools.org/graphql (when deployed)

To change the API endpoint, edit `/src/config/apollo.ts`.

## Running the App

### iOS Simulator

```bash
# Start Metro bundler
npm start

# In another terminal, run iOS
npm run ios

# Or specify a device
npm run ios -- --simulator="iPhone 15 Pro"
```

### Android Emulator

```bash
# Start Metro bundler
npm start

# In another terminal, run Android
npm run android

# Or specify a device
npm run android -- --deviceId=<device-id>
```

### Physical Device

#### iOS (requires Apple Developer account)
1. Open `ios/BoMStudyTools.xcworkspace` in Xcode
2. Select your device from the device dropdown
3. Click "Run" (▶️) or press ⌘R

#### Android
1. Enable USB debugging on your device
2. Connect via USB
3. Run `npm run android`

## Troubleshooting

### Common Issues

#### Metro Bundler Issues
```bash
# Reset Metro cache
npm start -- --reset-cache

# Clean build
cd android && ./gradlew clean && cd ..
cd ios && xcodebuild clean && cd ..
```

#### iOS Build Errors
```bash
# Clean CocoaPods
cd ios
pod deintegrate
pod install
cd ..
```

#### Android Build Errors
```bash
# Clean Gradle cache
cd android
./gradlew clean
./gradlew cleanBuildCache
cd ..
```

#### Database Issues
```bash
# Clear app data on device
# iOS: Delete app and reinstall
# Android: Settings → Apps → BOM Study Tools → Clear Data
```

### API Connection Issues

If the app can't connect to the API:

1. **Check API is running**
   ```bash
   # Test API endpoint
   curl http://localhost:4000/health
   ```

2. **For iOS Simulator**
   - `localhost` should work

3. **For Android Emulator**
   - Use `10.0.2.2` instead of `localhost`
   - Update `src/config/apollo.ts`:
     ```typescript
     const API_URL = __DEV__
       ? 'http://10.0.2.2:4000/graphql'  // Android emulator
       : 'https://api.bomstudytools.org/graphql';
     ```

4. **For Physical Devices**
   - Use your computer's IP address (e.g., `http://192.168.1.100:4000/graphql`)
   - Ensure API server is accessible on your local network

## Development Workflow

### Hot Reloading

React Native supports hot reloading:
- **iOS Simulator:** Press `⌘D` to open developer menu
- **Android Emulator:** Press `⌘M` (Mac) or `Ctrl+M` (Windows/Linux)
- **Physical Device:** Shake device

### Developer Menu Options

- **Reload** - Reload the JavaScript bundle
- **Debug** - Open debugger in Chrome/Edge
- **Show Inspector** - Inspect element layout
- **Hot Reloading** - Toggle hot reloading
- **Fast Refresh** - Toggle fast refresh

### Debugging

1. **React Native Debugger**
   ```bash
   npm install -g react-native-debugger
   ```

2. **Chrome DevTools**
   - Open developer menu → "Debug"
   - Open Chrome → `chrome://inspect`

3. **Flipper** (recommended)
   - Install [Flipper](https://fbflipper.com/)
   - Automatically detects React Native apps
   - Includes network inspector, layout inspector, and more

## Testing

### Run Unit Tests
```bash
npm test
```

### Run E2E Tests (Detox)
```bash
# iOS
detox build --configuration ios
detox test --configuration ios

# Android
detox build --configuration android
detox test --configuration android
```

## Building for Production

### iOS

1. Open `ios/BoMStudyTools.xcworkspace` in Xcode
2. Select "Generic iOS Device" from device dropdown
3. Product → Archive
4. Follow Xcode's app submission wizard

### Android

```bash
cd android
./gradlew assembleRelease
```

APK will be in `android/app/build/outputs/apk/release/`

## Project Structure

```
apps/mobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ScriptureReader.tsx
│   │   ├── BookList.tsx
│   │   └── ChapterList.tsx
│   ├── screens/             # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── ReaderScreen.tsx
│   │   ├── BookListScreen.tsx
│   │   ├── ChapterListScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── navigation/          # Navigation setup
│   │   └── RootNavigator.tsx
│   ├── services/            # Services (API, offline storage)
│   │   └── offlineStorage.ts
│   ├── hooks/               # Custom React hooks
│   │   └── useChapter.ts
│   ├── config/              # App configuration
│   │   └── apollo.ts
│   └── App.tsx              # Root component
├── android/                 # Android native code
├── ios/                     # iOS native code
├── index.js                 # Entry point
└── package.json
```

## Features

### Currently Implemented ✅
- Complete Book of Mormon (8,701 verses)
- Book and chapter navigation
- Scripture reader with verse highlighting
- Offline caching (SQLite)
- Apollo Client integration
- Pull-to-refresh
- Responsive layout

### Coming Soon 🚧
- Search functionality
- Note taking
- Highlighting
- Bookmarks
- Cross-references
- Reading history
- Edition switching (CoC ↔ LDS)
- Download manager for offline content
- User accounts and cloud sync

## Resources

- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Apollo Client](https://www.apollographql.com/docs/react/)
- [GraphQL API Guide](../../GRAPHQL_QUERIES_FULL_DATASET.md)
- [Project Status](../../PROJECT_STATUS_DEC_7_2025.md)

## Support

For issues or questions:
1. Check [MOBILE_APP_DEVELOPMENT_GUIDE.md](../../MOBILE_APP_DEVELOPMENT_GUIDE.md)
2. Review GraphQL queries in [GRAPHQL_QUERIES_FULL_DATASET.md](../../GRAPHQL_QUERIES_FULL_DATASET.md)
3. Check project status in [CURRENT_STATUS.md](../../CURRENT_STATUS.md)

---

**Last Updated:** December 7, 2025
**Version:** 0.1.0 (Development)
**Database:** 11,947 verses ready
