// Jest setup file for React Native testing
import 'react-native-gesture-handler/jestSetup';

// Mock react-native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  Version: 123,
  isTesting: true,
  select: jest.fn((obj) => obj.ios || obj.default),
}));

// Mock Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn(() => ({ width: 375, height: 812 })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/AnimatedImplementation', () => {
  const ActualAnimated = jest.requireActual(
    'react-native/Libraries/Animated/AnimatedImplementation'
  );
  return {
    ...ActualAnimated,
    timing: (value, config) => ({
      ...ActualAnimated.timing(value, config),
      start: (callback) => {
        value.setValue(config.toValue);
        callback && callback({ finished: true });
      },
    }),
  };
});

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactTestRenderer') ||
      args[0].includes('Warning: An update to') ||
      args[0].includes('Warning: Failed prop type') ||
      args[0].includes('Warning: React.createElement'))
  ) {
    return;
  }
  originalConsoleError.call(console, ...args);
};

console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Animated:') ||
      args[0].includes('Setting a timer'))
  ) {
    return;
  }
  originalConsoleWarn.call(console, ...args);
};

// Set up global test utilities
global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 0);
};

global.cancelAnimationFrame = (id) => {
  clearTimeout(id);
};