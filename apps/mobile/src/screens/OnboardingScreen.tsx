import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { logger } from '../utils/logger';
import type { ThemeColors } from '../types';

const log = logger.scope('Onboarding');

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_COMPLETE_KEY = '@bom_onboarding_complete';

interface OnboardingPage {
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  features?: string[];
}

const PAGES: OnboardingPage[] = [
  {
    emoji: '\uD83D\uDCD6',
    title: 'Scripture Study Tools',
    subtitle: 'Welcome',
    description:
      'Explore the Book of Mormon with powerful study tools designed for the Community of Christ edition. Deepen your understanding and enrich your daily scripture experience.',
  },
  {
    emoji: '\u2728',
    title: 'Powerful Features',
    subtitle: 'Everything You Need',
    description:
      'A full suite of tools to support your scripture study journey.',
    features: [
      '\uD83D\uDD16  Bookmarks \u2014 Save your favorite passages',
      '\uD83D\uDCDD  Notes \u2014 Record personal insights',
      '\uD83C\uDFA8  Highlights \u2014 Color-code key verses',
      '\uD83D\uDD0D  Search \u2014 Find any word or phrase',
      '\uD83D\uDCCB  Study Plans \u2014 Guided reading schedules',
    ],
  },
  {
    emoji: '\u2600\uFE0F',
    title: 'Daily Study',
    subtitle: 'Build a Habit',
    description:
      'Strengthen your practice with tools that keep you consistent and growing every day.',
    features: [
      '\uD83C\uDF05  Daily Verse \u2014 Start each morning with inspiration',
      '\uD83C\uDFAF  Reading Goals \u2014 Set and track your progress',
      '\uD83E\uDDE0  Memorization \u2014 Commit key scriptures to heart',
    ],
  },
  {
    emoji: '\uD83D\uDE80',
    title: 'Begin Your Journey',
    subtitle: 'Get Started',
    description:
      'You are ready to dive into the scriptures. Start reading, set a goal, or explore a study plan \u2014 the choice is yours.',
  },
];

export function OnboardingScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const isLastPage = currentPage === PAGES.length - 1;

  const completeOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      log.info('Onboarding completed');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      log.error('Failed to save onboarding completion', error);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
  }, [navigation]);

  const handleSkip = useCallback(() => {
    log.info('Onboarding skipped', { fromPage: currentPage });
    completeOnboarding();
  }, [currentPage, completeOnboarding]);

  const handleNext = useCallback(() => {
    if (isLastPage) {
      completeOnboarding();
    } else {
      const nextPage = currentPage + 1;
      scrollViewRef.current?.scrollTo({
        x: nextPage * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentPage(nextPage);
      log.debug('Navigated to onboarding page', { page: nextPage });
    }
  }, [currentPage, isLastPage, completeOnboarding]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const page = Math.round(offsetX / SCREEN_WIDTH);
      if (page !== currentPage && page >= 0 && page < PAGES.length) {
        setCurrentPage(page);
      }
    },
    [currentPage],
  );

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
      />

      {/* Skip button */}
      {!isLastPage && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
          accessibilityHint="Closes the onboarding tour and goes to the home screen"
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Swipeable pages */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        style={styles.scrollView}
        accessibilityLabel="Onboarding pages"
        accessibilityRole="none"
      >
        {PAGES.map((page, index) => (
          <View
            key={index}
            style={styles.page}
            accessible
            accessibilityRole="none"
            accessibilityLabel={`Step ${index + 1} of ${PAGES.length}: ${page.title}`}
          >
            <View style={styles.pageContent}>
              {/* Emoji icon */}
              <View style={styles.emojiContainer} accessible={false}>
                <Text style={styles.emoji} accessible={false}>{page.emoji}</Text>
              </View>

              {/* Subtitle label */}
              <Text
                style={styles.subtitle}
                accessibilityRole="text"
              >
                {page.subtitle}
              </Text>

              {/* Title */}
              <Text
                style={styles.title}
                accessibilityRole="header"
              >
                {page.title}
              </Text>

              {/* Description */}
              <Text
                style={styles.description}
                accessibilityRole="text"
              >
                {page.description}
              </Text>

              {/* Feature list (if present) */}
              {page.features && (
                <View
                  style={styles.featureList}
                  accessible
                  accessibilityRole="list"
                  accessibilityLabel="Features"
                >
                  {page.features.map((feature, featureIndex) => (
                    <View
                      key={featureIndex}
                      style={styles.featureItem}
                      accessible
                      accessibilityRole="text"
                    >
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom section: dots + button */}
      <View style={styles.bottomSection}>
        {/* Page indicator dots */}
        <View
          style={styles.dotsContainer}
          accessible
          accessibilityRole="none"
          accessibilityLabel={`Page ${currentPage + 1} of ${PAGES.length}`}
        >
          {PAGES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentPage ? styles.dotActive : styles.dotInactive,
              ]}
              accessible={false}
            />
          ))}
        </View>

        {/* Action button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleNext}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={isLastPage ? 'Get started with the app' : 'Next page'}
          accessibilityHint={
            isLastPage
              ? 'Completes onboarding and opens the home screen'
              : `Advances to page ${currentPage + 2} of ${PAGES.length}`
          }
        >
          <Text style={styles.actionButtonText}>
            {isLastPage ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    skipButton: {
      position: 'absolute',
      top: 56,
      right: 24,
      zIndex: 10,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    skipText: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    scrollView: {
      flex: 1,
    },
    page: {
      width: SCREEN_WIDTH,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    pageContent: {
      paddingHorizontal: 40,
      alignItems: 'center',
      maxWidth: 400,
    },
    emojiContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 32,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    emoji: {
      fontSize: 56,
    },
    subtitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      marginBottom: 8,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 36,
    },
    description: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 24,
    },
    featureList: {
      alignSelf: 'stretch',
      marginTop: 8,
    },
    featureItem: {
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    featureText: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
    },
    bottomSection: {
      paddingBottom: 48,
      paddingHorizontal: 40,
      alignItems: 'center',
    },
    dotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 28,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 5,
    },
    dotActive: {
      backgroundColor: colors.primary,
      width: 24,
      borderRadius: 4,
    },
    dotInactive: {
      backgroundColor: colors.border,
    },
    actionButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 48,
      borderRadius: 14,
      alignSelf: 'stretch',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    actionButtonText: {
      fontSize: 17,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
  });
}
