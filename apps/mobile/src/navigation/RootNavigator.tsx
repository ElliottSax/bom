/**
 * Root Navigator
 *
 * Main navigation structure for the app
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Text } from 'react-native';

// Import screens
import { HomeScreen } from '../screens/HomeScreen';
import { BookListScreen } from '../screens/BookListScreen';
import { ChapterListScreen } from '../screens/ChapterListScreen';
import { ReaderScreen } from '../screens/ReaderScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { BookmarksScreen } from '../screens/BookmarksScreen';
import { NotesScreen } from '../screens/NotesScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { StudyPlanScreen } from '../screens/StudyPlanScreen';
import { OfflineDownloadScreen } from '../screens/OfflineDownloadScreen';

// Type definitions for navigation
export type RootStackParamList = {
  Main: undefined;
  Reader: {
    editionId: string;
    book: string;
    chapter: number;
  };
};

export type MainTabParamList = {
  Home: undefined;
  Read: undefined;
  Search: undefined;
  Study: undefined;
  Settings: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  Bookmarks: undefined;
  Notes: undefined;
  Progress: undefined;
  StudyPlan: undefined;
  OfflineDownload: undefined;
};

export type ReadStackParamList = {
  BookList: {
    editionId: string;
  };
  ChapterList: {
    editionId: string;
    bookName: string;
    totalChapters: number;
  };
  Reader: {
    editionId: string;
    book: string;
    chapter: number;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const ReadStack = createNativeStackNavigator<ReadStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

/**
 * Home Stack Navigator
 * Handles Home -> Bookmarks/Notes/Progress flow
 */
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0066cc',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="Bookmarks"
        component={BookmarksScreen}
        options={{ title: 'Bookmarks' }}
      />
      <HomeStack.Screen
        name="Notes"
        component={NotesScreen}
        options={{ title: 'Notes' }}
      />
      <HomeStack.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ title: 'Reading Progress' }}
      />
      <HomeStack.Screen
        name="StudyPlan"
        component={StudyPlanScreen}
        options={{ title: 'Study Plan' }}
      />
      <HomeStack.Screen
        name="OfflineDownload"
        component={OfflineDownloadScreen}
        options={{ title: 'Offline Downloads' }}
      />
    </HomeStack.Navigator>
  );
}

/**
 * Reading Stack Navigator
 * Handles Book List -> Chapter List -> Reader flow
 */
function ReadingStackNavigator() {
  return (
    <ReadStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0066cc',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <ReadStack.Screen
        name="BookList"
        component={BookListScreen}
        options={{ title: 'Books' }}
        initialParams={{ editionId: 'coc-bom-1908' }}
      />
      <ReadStack.Screen
        name="ChapterList"
        component={ChapterListScreen}
        options={({ route }) => ({
          title: route.params.bookName,
        })}
      />
      <ReadStack.Screen
        name="Reader"
        component={ReaderScreen}
        options={({ route }) => ({
          title: `${route.params.book} ${route.params.chapter}`,
        })}
      />
    </ReadStack.Navigator>
  );
}

/**
 * Main Tab Navigator
 * Bottom tabs for main app sections
 */
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#0066cc',
        tabBarInactiveTintColor: '#999999',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <Text>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Read"
        component={ReadingStackNavigator}
        options={{
          tabBarLabel: 'Read',
          tabBarIcon: () => <Text>📖</Text>,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: () => <Text>🔍</Text>,
          headerShown: true,
          headerStyle: {
            backgroundColor: '#0066cc',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Tab.Screen
        name="Study"
        component={StudyPlanScreen}
        options={{
          tabBarLabel: 'Study',
          tabBarIcon: () => <Text>📅</Text>,
          headerShown: true,
          headerTitle: 'Study Plan',
          headerStyle: {
            backgroundColor: '#0066cc',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: () => <Text>⚙️</Text>,
          headerShown: true,
          headerStyle: {
            backgroundColor: '#0066cc',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Root Navigator
 * Top-level navigation structure
 */
export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
