/**
 * Accessible View Component
 *
 * A wrapper component that applies accessibility props to a View,
 * ensuring consistent accessibility attributes across the app.
 */

import React from 'react';
import { View, ViewStyle, StyleProp, AccessibilityRole } from 'react-native';

interface AccessibleViewProps {
  children: React.ReactNode;
  accessibilityLabel: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

export function AccessibleView({
  children,
  accessibilityLabel,
  accessibilityRole,
  accessibilityHint,
  style,
}: AccessibleViewProps) {
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityHint={accessibilityHint}
      style={style}
    >
      {children}
    </View>
  );
}
