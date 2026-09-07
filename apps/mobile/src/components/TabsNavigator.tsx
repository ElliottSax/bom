/**
 * Tabs Navigator Component
 *
 * Browser-like tabs for multiple study sessions
 */

import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import type { StudyTabData } from '../types';
import { logger } from '../utils/logger';

const log = logger.scope('TabsNavigator');

const TABS_KEY = '@bom_study_tabs';
const MAX_TABS = 10;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StudyTab {
  id: string;
  title: string;
  type: 'verse' | 'search' | 'notes' | 'books';
  data: StudyTabData;
  lastAccessed: string;
  scrollPosition?: number;
}

interface TabsNavigatorProps {
  onTabChange: (tab: StudyTab) => void;
  currentContent: React.ReactNode;
}

export function TabsNavigator({ onTabChange, currentContent }: TabsNavigatorProps) {
  const { colors } = useTheme();
  const [tabs, setTabs] = useState<StudyTab[]>([
    {
      id: 'tab_1',
      title: 'Home',
      type: 'books',
      data: {},
      lastAccessed: new Date().toISOString(),
    },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab_1');
  const [showTabsOverview, setShowTabsOverview] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  // const tabWidthAnimation = useRef(new Animated.Value(100)).current; // Reserved for tab width animations

  // Load tabs from storage
  React.useEffect(() => {
    loadTabs();

    // Cleanup function to save tabs on unmount
    return () => {
      // Save current state when component unmounts
      saveTabs(tabs, activeTabId);
    };
  }, []);

  const loadTabs = async () => {
    try {
      const savedTabs = await AsyncStorage.getItem(TABS_KEY);
      if (savedTabs) {
        const parsed = JSON.parse(savedTabs);
        setTabs(parsed.tabs);
        setActiveTabId(parsed.activeId);
      }
    } catch (error) {
      log.error('Error loading tabs:', error);
    }
  };

  const saveTabs = async (newTabs: StudyTab[], activeId: string) => {
    try {
      await AsyncStorage.setItem(TABS_KEY, JSON.stringify({ tabs: newTabs, activeId }));
    } catch (error) {
      log.error('Error saving tabs:', error);
    }
  };

  const addTab = (type: StudyTab['type'] = 'books', data: StudyTabData = {}) => {
    if (tabs.length >= MAX_TABS) {
      Alert.alert('Maximum Tabs', `Maximum ${MAX_TABS} tabs allowed`);
      return;
    }

    const newTab: StudyTab = {
      id: `tab_${Date.now()}`,
      title: getTabTitle(type, data),
      type,
      data,
      lastAccessed: new Date().toISOString(),
    };

    const newTabs = [...tabs, newTab];
    setTabs(newTabs);
    setActiveTabId(newTab.id);
    saveTabs(newTabs, newTab.id);
    onTabChange(newTab);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) {
      // Can't close the last tab
      return;
    }

    const tabIndex = tabs.findIndex((t) => t.id === tabId);
    const newTabs = tabs.filter((t) => t.id !== tabId);

    let newActiveId = activeTabId;
    if (tabId === activeTabId) {
      // Switch to adjacent tab
      newActiveId = newTabs[Math.max(0, tabIndex - 1)].id;
    }

    setTabs(newTabs);
    setActiveTabId(newActiveId);
    saveTabs(newTabs, newActiveId);

    const newActiveTab = newTabs.find((t) => t.id === newActiveId);
    if (newActiveTab) {
      onTabChange(newActiveTab);
    }
  };

  const switchTab = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab) {
      setActiveTabId(tabId);

      // Update last accessed
      const updatedTabs = tabs.map((t) =>
        t.id === tabId ? { ...t, lastAccessed: new Date().toISOString() } : t
      );
      setTabs(updatedTabs);
      saveTabs(updatedTabs, tabId);
      onTabChange(tab);
    }
  };

  const getTabTitle = (type: StudyTab['type'], data: StudyTabData): string => {
    switch (type) {
      case 'verse':
        return `${data.verse?.book || 'Verse'} ${data.verse?.chapter || ''}`;
      case 'search':
        return `Search: ${data.search?.query || '...'}`;
      case 'notes':
        return 'Notes';
      case 'books':
        return 'Books';
      default:
        return 'New Tab';
    }
  };

  const getTabIcon = (type: StudyTab['type']): string => {
    switch (type) {
      case 'verse':
        return '📖';
      case 'search':
        return '🔍';
      case 'notes':
        return '📝';
      case 'books':
        return '📚';
      default:
        return '📄';
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    tabBar: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    tabBarContent: {
      flexDirection: 'row',
      paddingVertical: 8,
    },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginHorizontal: 2,
      backgroundColor: colors.background,
      borderRadius: 8,
      minWidth: 120,
      maxWidth: 200,
    },
    activeTab: {
      backgroundColor: colors.primary + '15',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    tabIcon: {
      marginRight: 6,
      fontSize: 14,
    },
    tabTitle: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
    },
    activeTabTitle: {
      color: colors.primary,
      fontWeight: '600',
    },
    closeButton: {
      marginLeft: 8,
      padding: 2,
    },
    closeButtonText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    addTabButton: {
      padding: 8,
      marginHorizontal: 8,
      justifyContent: 'center',
    },
    addTabButtonText: {
      fontSize: 24,
      color: colors.primary,
    },
    tabsOverviewButton: {
      padding: 8,
      marginRight: 8,
      justifyContent: 'center',
    },
    tabsOverviewButtonText: {
      fontSize: 16,
      color: colors.primary,
    },
    content: {
      flex: 1,
    },
    tabsOverview: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.background,
      zIndex: 1000,
    },
    overviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    overviewTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    overviewGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 16,
    },
    overviewTab: {
      width: (SCREEN_WIDTH - 48) / 2,
      height: 120,
      margin: 8,
      padding: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'space-between',
    },
    overviewTabActive: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    overviewTabHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    overviewTabIcon: {
      fontSize: 24,
    },
    overviewTabClose: {
      padding: 4,
    },
    overviewTabTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginTop: 8,
    },
    overviewTabSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {/* Tab Bar */}
      <View style={dynamicStyles.tabBar}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={dynamicStyles.tabBarContent}
        >
          {tabs.map((tab) => (
            <Pressable
              key={tab.id}
              style={[dynamicStyles.tab, tab.id === activeTabId && dynamicStyles.activeTab]}
              onPress={() => switchTab(tab.id)}
            >
              <Text style={dynamicStyles.tabIcon}>{getTabIcon(tab.type)}</Text>
              <Text
                style={[
                  dynamicStyles.tabTitle,
                  tab.id === activeTabId && dynamicStyles.activeTabTitle,
                ]}
                numberOfLines={1}
              >
                {tab.title}
              </Text>
              {tabs.length > 1 && (
                <Pressable style={dynamicStyles.closeButton} onPress={() => closeTab(tab.id)}>
                  <Text style={dynamicStyles.closeButtonText}>×</Text>
                </Pressable>
              )}
            </Pressable>
          ))}

          <Pressable style={dynamicStyles.addTabButton} onPress={() => addTab()}>
            <Text style={dynamicStyles.addTabButtonText}>+</Text>
          </Pressable>
        </ScrollView>

        <Pressable
          style={dynamicStyles.tabsOverviewButton}
          onPress={() => setShowTabsOverview(true)}
        >
          <Text style={dynamicStyles.tabsOverviewButtonText}>{tabs.length} ▼</Text>
        </Pressable>
      </View>

      {/* Content */}
      <View style={dynamicStyles.content}>{currentContent}</View>

      {/* Tabs Overview */}
      {showTabsOverview && (
        <View style={dynamicStyles.tabsOverview}>
          <View style={dynamicStyles.overviewHeader}>
            <Text style={dynamicStyles.overviewTitle}>All Tabs</Text>
            <Pressable onPress={() => setShowTabsOverview(false)}>
              <Text style={dynamicStyles.closeButtonText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView>
            <View style={dynamicStyles.overviewGrid}>
              {tabs.map((tab) => (
                <Pressable
                  key={tab.id}
                  style={[
                    dynamicStyles.overviewTab,
                    tab.id === activeTabId && dynamicStyles.overviewTabActive,
                  ]}
                  onPress={() => {
                    switchTab(tab.id);
                    setShowTabsOverview(false);
                  }}
                >
                  <View style={dynamicStyles.overviewTabHeader}>
                    <Text style={dynamicStyles.overviewTabIcon}>{getTabIcon(tab.type)}</Text>
                    {tabs.length > 1 && (
                      <Pressable
                        style={dynamicStyles.overviewTabClose}
                        onPress={() => closeTab(tab.id)}
                      >
                        <Text style={dynamicStyles.closeButtonText}>×</Text>
                      </Pressable>
                    )}
                  </View>
                  <View>
                    <Text style={dynamicStyles.overviewTabTitle} numberOfLines={1}>
                      {tab.title}
                    </Text>
                    <Text style={dynamicStyles.overviewTabSubtitle}>
                      {new Date(tab.lastAccessed).toLocaleTimeString()}
                    </Text>
                  </View>
                </Pressable>
              ))}

              {/* Add new tab card */}
              {tabs.length < MAX_TABS && (
                <Pressable
                  style={[
                    dynamicStyles.overviewTab,
                    { justifyContent: 'center', alignItems: 'center' },
                  ]}
                  onPress={() => {
                    addTab();
                    setShowTabsOverview(false);
                  }}
                >
                  <Text style={{ fontSize: 36, color: colors.primary }}>+</Text>
                  <Text style={{ color: colors.textSecondary, marginTop: 8 }}>New Tab</Text>
                </Pressable>
              )}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// Hook to use tabs functionality
export function useTabs() {
  const [currentTab, setCurrentTab] = useState<StudyTab | null>(null);

  const openInNewTab = useCallback((type: StudyTab['type'], data: StudyTabData) => {
    // This would be connected to the TabsNavigator
    log.debug('Opening in new tab:', { type, data });
  }, []);

  const updateCurrentTab = useCallback(
    (updates: Partial<StudyTab>) => {
      if (currentTab) {
        setCurrentTab({ ...currentTab, ...updates });
      }
    },
    [currentTab]
  );

  return {
    currentTab,
    openInNewTab,
    updateCurrentTab,
  };
}
