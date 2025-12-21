import React from 'react';
import { View } from 'react-native';

export const GestureHandlerRootView = ({ children }) => children;
export const Swipeable = ({ children }) => children;
export const RectButton = ({ children, ...props }) => (
  <View {...props}>{children}</View>
);

export const State = {
  UNDETERMINED: 0,
  FAILED: 1,
  BEGAN: 2,
  CANCELLED: 3,
  ACTIVE: 4,
  END: 5,
};

export const Directions = {
  RIGHT: 1,
  LEFT: 2,
  UP: 4,
  DOWN: 8,
};

export const PanGestureHandler = ({ children }) => children;
export const TapGestureHandler = ({ children }) => children;
export const LongPressGestureHandler = ({ children }) => children;
export const ScrollView = View;
export const FlatList = View;

export default {
  GestureHandlerRootView,
  Swipeable,
  RectButton,
  State,
  Directions,
  PanGestureHandler,
  TapGestureHandler,
  LongPressGestureHandler,
  ScrollView,
  FlatList,
};