/**
 * Root Navigator
 *
 * Main navigation structure for the app
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import screens (to be created)
import { HomeScreen } from '../screens/HomeScreen';
import { BookListScreen } from '../screens/BookListScreen';
import { ChapterListScreen } from '../screens/ChapterListScreen';
import { ReaderScreen } from '../screens/ReaderScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

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
  Settings: undefined;
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
        component={HomeScreen}
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
