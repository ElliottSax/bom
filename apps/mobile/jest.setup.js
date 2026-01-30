// Jest setup file for React Native testing

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true, type: 'wifi' })),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Share
jest.mock('react-native-share', () => ({
  open: jest.fn(() => Promise.resolve()),
}));

// Mock DocumentPicker
jest.mock('react-native-document-picker', () => ({
  pick: jest.fn(() => Promise.resolve([{ uri: 'file://test.json' }])),
  types: { json: 'application/json', allFiles: '*/*' },
}));

// Mock RNFS
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  writeFile: jest.fn(() => Promise.resolve()),
  readFile: jest.fn(() => Promise.resolve('{}')),
}));

// Mock PushNotification
jest.mock('react-native-push-notification', () => ({
  configure: jest.fn(),
  createChannel: jest.fn(),
  localNotificationSchedule: jest.fn(),
  cancelAllLocalNotifications: jest.fn(),
}));

// Mock SQLite
jest.mock('react-native-sqlite-storage', () => ({
  openDatabase: jest.fn(() => ({
    transaction: jest.fn(),
    executeSql: jest.fn(),
  })),
  enablePromise: jest.fn(),
}));

// Silence console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock __DEV__
global.__DEV__ = true;
