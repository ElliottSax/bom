/**
 * Loading States Components
 *
 * Provides consistent loading indicators and skeletons across the app
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
  Pressable,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Basic loading spinner
interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
}

export function LoadingSpinner({
  size = 'large',
  color,
  message,
}: LoadingSpinnerProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.spinnerContainer}>
      <ActivityIndicator
        size={size}
        color={color || colors.primary}
      />
      {message && (
        <Text style={[styles.loadingMessage, { color: colors.textSecondary }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

// Full screen loading overlay
interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  transparent?: boolean;
}

export function LoadingOverlay({
  visible,
  message = 'Loading...',
  transparent = true,
}: LoadingOverlayProps) {
  const { colors } = useTheme();

  if (!visible) return null;

  return (
    <View
      style={[
        styles.overlay,
        {
          backgroundColor: transparent
            ? 'rgba(0, 0, 0, 0.5)'
            : colors.background,
        },
      ]}
    >
      <View style={[styles.overlayContent, { backgroundColor: colors.surface }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.overlayMessage, { color: colors.text }]}>
          {message}
        </Text>
      </View>
    </View>
  );
}

// Skeleton loader for content
interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}: SkeletonProps) {
  const { colors, isDark } = useTheme();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: isDark ? '#333' : '#E0E0E0',
          opacity,
        },
        style,
      ]}
    />
  );
}

// Verse skeleton loader
export function VerseSkeleton() {
  return (
    <View style={styles.verseSkeletonContainer}>
      <Skeleton width={50} height={16} style={{ marginBottom: 8 }} />
      <Skeleton width="100%" height={14} style={{ marginBottom: 4 }} />
      <Skeleton width="90%" height={14} style={{ marginBottom: 4 }} />
      <Skeleton width="75%" height={14} />
    </View>
  );
}

// Search result skeleton
export function SearchResultSkeleton() {
  return (
    <View style={styles.searchResultSkeleton}>
      <View style={styles.searchResultHeader}>
        <Skeleton width={100} height={16} />
        <Skeleton width={60} height={14} />
      </View>
      <Skeleton width="100%" height={14} style={{ marginTop: 8, marginBottom: 4 }} />
      <Skeleton width="85%" height={14} />
    </View>
  );
}

// Notebook card skeleton
export function NotebookCardSkeleton() {
  return (
    <View style={styles.notebookCardSkeleton}>
      <Skeleton width={40} height={40} borderRadius={20} />
      <View style={styles.notebookCardContent}>
        <Skeleton width={120} height={18} style={{ marginBottom: 4 }} />
        <Skeleton width={80} height={14} />
      </View>
    </View>
  );
}

// List skeleton with multiple items
interface ListSkeletonProps {
  count?: number;
  renderItem?: () => React.ReactNode;
}

export function ListSkeleton({
  count = 5,
  renderItem = () => <SearchResultSkeleton />,
}: ListSkeletonProps) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.listSkeletonItem}>
          {renderItem()}
        </View>
      ))}
    </View>
  );
}

// Error state component
interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  icon?: string;
}

export function ErrorState({
  message = 'Something went wrong',
  onRetry,
  icon = '❌',
}: ErrorStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.errorStateContainer}>
      <Text style={styles.errorIcon}>{icon}</Text>
      <Text style={[styles.errorMessage, { color: colors.text }]}>
        {message}
      </Text>
      {onRetry && (
        <Pressable
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={onRetry}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      )}
    </View>
  );
}

// Empty state component
interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function EmptyState({
  title = 'No Data',
  message = 'No items to display',
  icon = '📭',
  action,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
        {message}
      </Text>
      {action && (
        <Pressable
          style={[styles.emptyAction, { backgroundColor: colors.primary }]}
          onPress={action.onPress}
        >
          <Text style={styles.emptyActionText}>{action.label}</Text>
        </Pressable>
      )}
    </View>
  );
}

// Pull to refresh indicator
interface RefreshControlProps {
  refreshing: boolean;
  onRefresh: () => void;
  tintColor?: string;
}

export function CustomRefreshControl({
  refreshing,
  onRefresh,
  tintColor,
}: RefreshControlProps) {
  const { colors } = useTheme();

  return {
    refreshing,
    onRefresh,
    tintColor: tintColor || colors.primary,
    progressBackgroundColor: colors.surface,
  };
}

const styles = StyleSheet.create({
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingMessage: {
    marginTop: 12,
    fontSize: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  overlayContent: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  overlayMessage: {
    marginTop: 12,
    fontSize: 16,
  },
  verseSkeletonContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchResultSkeleton: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  searchResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notebookCardSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
  },
  notebookCardContent: {
    marginLeft: 12,
    flex: 1,
  },
  listSkeletonItem: {
    marginBottom: 12,
  },
  errorStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyAction: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});