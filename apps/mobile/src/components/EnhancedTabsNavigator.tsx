/**
 * Enhanced Tabs Navigator Component
 *
 * Browser-like tabs for multiple study sessions with advanced features
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEnhancedTheme } from '../contexts/EnhancedThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  GestureHandlerRootView,
  Swipeable,
  RectButton,
} from 'react-native-gesture-handler';
import type { StudyTab } from '../types';
import { logger } from '../utils/logger';

const log = logger.scope('EnhancedTabsNavigator');

const TABS_KEY = '@bom_study_tabs';
const MAX_TABS = 10;
const TAB_HEIGHT = 40;

interface TabGroup {
  id: string;
  name: string;
  color: string;
  tabIds: string[];
}

interface TabsNavigatorProps {
  onTabChange: (tab: StudyTab) => void;
  currentContent: React.ReactNode;
  onNavigate: (type: string, data: any) => void;
}

export function EnhancedTabsNavigator({ onTabChange, currentContent, onNavigate }: TabsNavigatorProps) {
  const { colors } = useEnhancedTheme();
  const [tabs, setTabs] = useState<StudyTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [showTabMenu, setShowTabMenu] = useState(false);
  const [showNewTabModal, setShowNewTabModal] = useState(false);
  const [recentlyClosed, setRecentlyClosed] = useState<StudyTab[]>([]);
  const [isIncognito, setIsIncognito] = useState(false);
  const scrollViewRef = useRef<FlatList<StudyTab>>(null);
  const tabWidthAnimation = useRef(new Animated.Value(150)).current;

  // Load tabs on mount
  useEffect(() => {
    loadTabs();
  }, []);

  // Auto-save tabs
  useEffect(() => {
    if (!isIncognito && tabs.length > 0) {
      saveTabs();
    }
  }, [tabs, isIncognito]);

  const loadTabs = async () => {
    try {
      const savedTabs = await AsyncStorage.getItem(TABS_KEY);
      if (savedTabs) {
        const parsedTabs = JSON.parse(savedTabs);
        setTabs(parsedTabs);
        if (parsedTabs.length > 0) {
          setActiveTabId(parsedTabs[0].id);
          onTabChange(parsedTabs[0]);
        }
      } else {
        // Create default tab
        const defaultTab = createNewTab('home', {});
        setTabs([defaultTab]);
        setActiveTabId(defaultTab.id);
      }
    } catch (error) {
      log.error('Error loading tabs:', error);
      // Create default tab on error
      const defaultTab = createNewTab('home', {});
      setTabs([defaultTab]);
      setActiveTabId(defaultTab.id);
    }
  };

  const saveTabs = async () => {
    try {
      await AsyncStorage.setItem(TABS_KEY, JSON.stringify(tabs));
    } catch (error) {
      log.error('Error saving tabs:', error);
    }
  };

  const createNewTab = (type: StudyTab['type'] = 'home', data: any = {}, title?: string): StudyTab => {
    const tabTypes = {
      home: { icon: '🏠', title: 'Home', color: colors.primary },
      verse: { icon: '📖', title: title || 'Scripture', color: colors.accent },
      search: { icon: '🔍', title: title || 'Search', color: colors.info },
      notes: { icon: '📝', title: title || 'Notes', color: colors.success },
      books: { icon: '📚', title: title || 'Library', color: colors.warning },
      plan: { icon: '📅', title: title || 'Study Plan', color: colors.primary },
    };

    const config = tabTypes[type] || tabTypes.home;

    return {
      id: `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: config.title,
      type,
      data,
      lastAccessed: new Date().toISOString(),
      icon: config.icon,
      color: config.color,
      history: [{ type, data, title: config.title, timestamp: new Date().toISOString() }],
      currentHistoryIndex: 0,
    };
  };

  const addTab = useCallback((type?: StudyTab['type'], data?: any, title?: string) => {
    if (tabs.length >= MAX_TABS) {
      Alert.alert('Tab Limit', `Maximum of ${MAX_TABS} tabs allowed`);
      return;
    }

    const newTab = createNewTab(type, data, title);

    // Add after current tab
    const currentIndex = tabs.findIndex(t => t.id === activeTabId);
    const newTabs = [...tabs];
    newTabs.splice(currentIndex + 1, 0, newTab);

    setTabs(newTabs);
    setActiveTabId(newTab.id);
    onTabChange(newTab);

    // Animate new tab
    Animated.spring(tabWidthAnimation, {
      toValue: 150,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [tabs, activeTabId]);

  const closeTab = useCallback((tabId: string) => {
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    if (tabs.length === 1) {
      // Can't close last tab, create new one instead
      const newTab = createNewTab('home', {});
      setTabs([newTab]);
      setActiveTabId(newTab.id);
      return;
    }

    const closedTab = tabs[tabIndex];
    setRecentlyClosed(prev => [closedTab, ...prev].slice(0, 10)); // Keep last 10 closed tabs

    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);

    // Switch to adjacent tab
    if (tabId === activeTabId) {
      const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
      const newActiveTab = newTabs[newActiveIndex];
      setActiveTabId(newActiveTab.id);
      onTabChange(newActiveTab);
    }

    // Animate tab closing
    Animated.timing(tabWidthAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [tabs, activeTabId]);

  const switchTab = useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setActiveTabId(tabId);
      onTabChange(tab);

      // Update last accessed
      const updatedTabs = tabs.map(t =>
        t.id === tabId
          ? { ...t, lastAccessed: new Date().toISOString() }
          : t
      );
      setTabs(updatedTabs);
    }
  }, [tabs]);

  const duplicateTab = useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab && tabs.length < MAX_TABS) {
      const duplicatedTab = {
        ...tab,
        id: `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: `${tab.title} (Copy)`,
      };

      const currentIndex = tabs.findIndex(t => t.id === tabId);
      const newTabs = [...tabs];
      newTabs.splice(currentIndex + 1, 0, duplicatedTab);

      setTabs(newTabs);
      setActiveTabId(duplicatedTab.id);
      onTabChange(duplicatedTab);
    }
  }, [tabs]);

  const pinTab = useCallback((tabId: string) => {
    const updatedTabs = tabs.map(t =>
      t.id === tabId ? { ...t, isPinned: !t.isPinned } : t
    );

    // Sort pinned tabs to the beginning
    updatedTabs.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

    setTabs(updatedTabs);
  }, [tabs]);

  const restoreClosedTab = useCallback(() => {
    if (recentlyClosed.length > 0) {
      const [restoredTab, ...remainingClosed] = recentlyClosed;
      setRecentlyClosed(remainingClosed);

      const newTabs = [...tabs, restoredTab];
      setTabs(newTabs);
      setActiveTabId(restoredTab.id);
      onTabChange(restoredTab);
    }
  }, [recentlyClosed, tabs]);

  const navigateBack = useCallback(() => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (activeTab && activeTab.history && activeTab.currentHistoryIndex! > 0) {
      const newIndex = activeTab.currentHistoryIndex! - 1;
      const historyEntry = activeTab.history[newIndex];

      const updatedTab = {
        ...activeTab,
        currentHistoryIndex: newIndex,
        type: historyEntry.type as StudyTab['type'],
        data: historyEntry.data,
        title: historyEntry.title,
      };

      const updatedTabs = tabs.map(t =>
        t.id === activeTabId ? updatedTab : t
      );

      setTabs(updatedTabs);
      onTabChange(updatedTab);
    }
  }, [tabs, activeTabId]);

  const navigateForward = useCallback(() => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (activeTab && activeTab.history && activeTab.currentHistoryIndex! < activeTab.history.length - 1) {
      const newIndex = activeTab.currentHistoryIndex! + 1;
      const historyEntry = activeTab.history[newIndex];

      const updatedTab = {
        ...activeTab,
        currentHistoryIndex: newIndex,
        type: historyEntry.type as StudyTab['type'],
        data: historyEntry.data,
        title: historyEntry.title,
      };

      const updatedTabs = tabs.map(t =>
        t.id === activeTabId ? updatedTab : t
      );

      setTabs(updatedTabs);
      onTabChange(updatedTab);
    }
  }, [tabs, activeTabId]);

  const activeTab = tabs.find(t => t.id === activeTabId);
  const canGoBack = activeTab && activeTab.currentHistoryIndex! > 0;
  const canGoForward = activeTab && activeTab.history && activeTab.currentHistoryIndex! < activeTab.history.length - 1;

  const renderTab = ({ item: tab }: { item: StudyTab }) => {
    const isActive = tab.id === activeTabId;

    const renderRightActions = () => (
      <RectButton
        style={[styles.deleteAction, { backgroundColor: colors.error }]}
        onPress={() => closeTab(tab.id)}
      >
        <Icon name="close" size={20} color="white" />
      </RectButton>
    );

    return (
      <Swipeable
        renderRightActions={tab.isPinned ? undefined : renderRightActions}
        friction={2}
        rightThreshold={40}
      >
        <Pressable
          style={[
            styles.tab,
            isActive && [styles.activeTab, { backgroundColor: colors.card, borderBottomColor: colors.primary }],
            tab.isPinned && styles.pinnedTab,
            { borderColor: colors.border },
          ]}
          onPress={() => switchTab(tab.id)}
          onLongPress={() => {
            Alert.alert(
              'Tab Options',
              '',
              [
                { text: 'Duplicate', onPress: () => duplicateTab(tab.id) },
                { text: tab.isPinned ? 'Unpin' : 'Pin', onPress: () => pinTab(tab.id) },
                { text: 'Close', onPress: () => closeTab(tab.id), style: 'destructive' },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }}
        >
          <View style={styles.tabContent}>
            {tab.isPinned && <Icon name="push-pin" size={12} color={colors.primary} />}
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabTitle,
                isActive && styles.activeTabTitle,
                { color: isActive ? colors.text : colors.textSecondary },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {tab.title}
            </Text>
            {!tab.isPinned && (
              <Pressable
                style={styles.closeButton}
                onPress={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="close" size={16} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>
        </Pressable>
      </Swipeable>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        {/* Navigation Bar */}
        <View style={[styles.navBar, { backgroundColor: colors.card }]}>
          <Pressable
            style={[styles.navButton, !canGoBack && styles.navButtonDisabled]}
            onPress={navigateBack}
            disabled={!canGoBack}
          >
            <Icon name="arrow-back" size={20} color={canGoBack ? colors.text : colors.textDisabled} />
          </Pressable>

          <Pressable
            style={[styles.navButton, !canGoForward && styles.navButtonDisabled]}
            onPress={navigateForward}
            disabled={!canGoForward}
          >
            <Icon name="arrow-forward" size={20} color={canGoForward ? colors.text : colors.textDisabled} />
          </Pressable>

          <Pressable
            style={styles.navButton}
            onPress={() => {
              const activeTab = tabs.find(t => t.id === activeTabId);
              if (activeTab) {
                onNavigate(activeTab.type, activeTab.data);
              }
            }}
          >
            <Icon name="refresh" size={20} color={colors.text} />
          </Pressable>

          <View style={[styles.urlBar, { backgroundColor: colors.background }]}>
            <Text style={[styles.urlText, { color: colors.textSecondary }]} numberOfLines={1}>
              {activeTab?.title || 'Home'}
            </Text>
          </View>

          <Pressable
            style={styles.navButton}
            onPress={() => setShowTabMenu(true)}
          >
            <Icon name="more-vert" size={20} color={colors.text} />
          </Pressable>
        </View>

        {/* Tabs Bar */}
        <View style={[styles.tabsBar, { backgroundColor: colors.surface }]}>
          <FlatList
            ref={scrollViewRef}
            data={tabs}
            renderItem={renderTab}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsList}
          />

          <Pressable
            style={[styles.newTabButton, { backgroundColor: colors.card }]}
            onPress={() => setShowNewTabModal(true)}
          >
            <Icon name="add" size={20} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {/* Content Area */}
      <View style={styles.contentArea}>
        {currentContent}
      </View>

      {/* Tab Menu Modal */}
      <Modal
        visible={showTabMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTabMenu(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowTabMenu(false)}>
          <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                addTab();
                setShowTabMenu(false);
              }}
            >
              <Icon name="add-circle" size={20} color={colors.text} />
              <Text style={[styles.menuText, { color: colors.text }]}>New Tab</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setIsIncognito(!isIncognito);
                setShowTabMenu(false);
              }}
            >
              <Icon name={isIncognito ? "visibility" : "visibility-off"} size={20} color={colors.text} />
              <Text style={[styles.menuText, { color: colors.text }]}>
                {isIncognito ? 'Exit Incognito' : 'Incognito Mode'}
              </Text>
            </Pressable>

            {recentlyClosed.length > 0 && (
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  restoreClosedTab();
                  setShowTabMenu(false);
                }}
              >
                <Icon name="history" size={20} color={colors.text} />
                <Text style={[styles.menuText, { color: colors.text }]}>
                  Restore Closed Tab
                </Text>
              </Pressable>
            )}

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                Alert.alert(
                  'Close All Tabs?',
                  'This will close all tabs except pinned ones',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Close All',
                      style: 'destructive',
                      onPress: () => {
                        const pinnedTabs = tabs.filter(t => t.isPinned);
                        if (pinnedTabs.length > 0) {
                          setTabs(pinnedTabs);
                          setActiveTabId(pinnedTabs[0].id);
                        } else {
                          const newTab = createNewTab('home', {});
                          setTabs([newTab]);
                          setActiveTabId(newTab.id);
                        }
                      },
                    },
                  ]
                );
                setShowTabMenu(false);
              }}
            >
              <Icon name="close" size={20} color={colors.error} />
              <Text style={[styles.menuText, { color: colors.error }]}>Close All Tabs</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* New Tab Modal */}
      <Modal
        visible={showNewTabModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNewTabModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.newTabModalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Open New Tab</Text>

            <View style={styles.newTabOptions}>
              <Pressable
                style={[styles.newTabOption, { backgroundColor: colors.background }]}
                onPress={() => {
                  addTab('home');
                  setShowNewTabModal(false);
                }}
              >
                <Text style={styles.optionIcon}>🏠</Text>
                <Text style={[styles.optionText, { color: colors.text }]}>Home</Text>
              </Pressable>

              <Pressable
                style={[styles.newTabOption, { backgroundColor: colors.background }]}
                onPress={() => {
                  addTab('books');
                  setShowNewTabModal(false);
                }}
              >
                <Text style={styles.optionIcon}>📚</Text>
                <Text style={[styles.optionText, { color: colors.text }]}>Library</Text>
              </Pressable>

              <Pressable
                style={[styles.newTabOption, { backgroundColor: colors.background }]}
                onPress={() => {
                  addTab('search');
                  setShowNewTabModal(false);
                }}
              >
                <Text style={styles.optionIcon}>🔍</Text>
                <Text style={[styles.optionText, { color: colors.text }]}>Search</Text>
              </Pressable>

              <Pressable
                style={[styles.newTabOption, { backgroundColor: colors.background }]}
                onPress={() => {
                  addTab('notes');
                  setShowNewTabModal(false);
                }}
              >
                <Text style={styles.optionIcon}>📝</Text>
                <Text style={[styles.optionText, { color: colors.text }]}>Notes</Text>
              </Pressable>

              <Pressable
                style={[styles.newTabOption, { backgroundColor: colors.background }]}
                onPress={() => {
                  addTab('plan');
                  setShowNewTabModal(false);
                }}
              >
                <Text style={styles.optionIcon}>📅</Text>
                <Text style={[styles.optionText, { color: colors.text }]}>Study Plan</Text>
              </Pressable>
            </View>

            <Pressable
              style={[styles.closeModalButton, { backgroundColor: colors.border }]}
              onPress={() => setShowNewTabModal(false)}
            >
              <Text style={[styles.closeModalText, { color: colors.text }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  navButton: {
    padding: 8,
    marginHorizontal: 2,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  urlBar: {
    flex: 1,
    height: 32,
    marginHorizontal: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    justifyContent: 'center',
  },
  urlText: {
    fontSize: 14,
  },
  tabsBar: {
    flexDirection: 'row',
    height: TAB_HEIGHT,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabsList: {
    paddingHorizontal: 5,
  },
  tab: {
    minWidth: 100,
    maxWidth: 200,
    height: TAB_HEIGHT,
    paddingHorizontal: 10,
    marginRight: 2,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  pinnedTab: {
    maxWidth: 120,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  tabTitle: {
    flex: 1,
    fontSize: 13,
  },
  activeTabTitle: {
    fontWeight: '500',
  },
  closeButton: {
    marginLeft: 8,
    padding: 2,
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: TAB_HEIGHT,
  },
  newTabButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 4,
  },
  contentArea: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 12,
  },
  newTabModalContent: {
    width: '90%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  newTabOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  newTabOption: {
    width: '45%',
    padding: 15,
    margin: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
  },
  closeModalButton: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalText: {
    fontSize: 16,
    fontWeight: '500',
  },
});