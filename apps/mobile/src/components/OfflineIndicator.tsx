/**
 * Offline Indicator Component
 *
 * Displays a subtle warning banner at the top of the screen when
 * the device is offline. Smoothly slides in/out using the Animated API.
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useTheme } from '../contexts/ThemeContext';

const BANNER_HEIGHT = 36;
const ANIMATION_DURATION = 300;

export function OfflineIndicator() {
  const { isConnected } = useNetworkStatus();
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(-BANNER_HEIGHT)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isConnected ? -BANNER_HEIGHT : 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
  }, [isConnected, translateY]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.warning,
          transform: [{ translateY }],
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      accessibilityLabel="You are offline. Reading cached content."
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{'[ ! ]'}</Text>
        <Text
          style={[
            styles.text,
            { color: colors.surface },
          ]}
          numberOfLines={1}
        >
          You&apos;re offline - reading cached content
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: BANNER_HEIGHT,
    zIndex: 1000,
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  icon: {
    fontSize: 14,
    color: '#ffffff',
    marginRight: 8,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});
