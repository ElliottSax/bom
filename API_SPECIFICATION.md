# API Specification

## Overview

This document defines the API contract for the Book of Mormon study tools platform. The primary API is GraphQL for flexibility and efficiency, with REST endpoints for specific use cases (file uploads, webhooks).

**Base URLs:**
- Production: `https://api.gospellibrary.org`
- Staging: `https://api-staging.gospellibrary.org`
- Development: `http://localhost:4000`

**GraphQL Endpoint:** `/graphql`
**REST Endpoints:** `/api/v1/*`

**Authentication:** JWT Bearer tokens
**Rate Limiting:** 1000 requests/hour per user, 100 requests/minute

---

## Table of Contents

1. [Authentication](#authentication)
2. [GraphQL Schema](#graphql-schema)
3. [Query Examples](#query-examples)
4. [Mutation Examples](#mutation-examples)
5. [Subscription Examples](#subscription-examples)
6. [REST Endpoints](#rest-endpoints)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)
9. [Versioning](#versioning)

---

## 1. Authentication

### JWT Token Structure

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "deviceId": "device_abc123",
  "iat": 1700000000,
  "exp": 1700086400,
  "scope": ["read", "write"]
}
```

### Obtaining a Token

**Request:**
```http
POST /api/v1/auth/token
Content-Type: application/json

{
  "deviceId": "device_abc123",
  "provider": "device"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400,
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Using the Token

**GraphQL:**
```http
POST /graphql
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "query": "{ myHighlights { id verseId color } }"
}
```

### Token Refresh

**Request:**
```http
POST /api/v1/auth/refresh
Authorization: Bearer [current_token]
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400
}
```

---

## 2. GraphQL Schema

### Complete Schema

```graphql
# ===== Types =====

type Query {
  # Scripture queries
  verse(reference: String!): Verse
  verses(book: String!, chapter: Int!): [Verse!]!
  book(id: String!): Book
  books: [Book!]!

  # Search
  searchScriptures(
    query: String!
    filters: SearchFilters
    limit: Int = 20
    offset: Int = 0
  ): SearchResults!

  semanticSearch(
    query: String!
    limit: Int = 10
    threshold: Float = 0.7
  ): [Verse!]!

  # User data
  me: User
  myHighlights(
    verseId: String
    color: String
    limit: Int = 100
    offset: Int = 0
  ): [Highlight!]!

  myNotes(
    filters: NoteFilters
    sort: NoteSort
    limit: Int = 50
    offset: Int = 0
  ): [Note!]!

  note(id: ID!): Note

  # Reading progress
  readingProgress(planId: ID): ReadingProgress!
  readingPlans: [ReadingPlan!]!
  readingPlan(id: ID!): ReadingPlan

  # Statistics
  studyStats(dateRange: DateRange): StudyStatistics!

  # AI features
  askQuestion(question: String!, context: [String!]): AIResponse!
  getSuggestedVerses(verseId: String!, limit: Int = 10): [Verse!]!
  getCrossReferences(verseId: String!): [CrossReference!]!

  # Memory cards
  memoryCards(deckId: ID): [MemoryCard!]!
  memoryCardsDue: [MemoryCard!]!
  memoryStats: MemoryStatistics!

  # Groups
  myGroups: [Group!]!
  group(id: ID!): Group
  groupDiscussions(groupId: ID!, verseId: String): [Discussion!]!
}

type Mutation {
  # Highlights
  createHighlight(input: HighlightInput!): Highlight!
  updateHighlight(id: ID!, input: HighlightInput!): Highlight!
  deleteHighlight(id: ID!): Boolean!

  # Notes
  createNote(input: NoteInput!): Note!
  updateNote(id: ID!, input: NoteInput!): Note!
  deleteNote(id: ID!): Boolean!

  # Reading progress
  markChapterComplete(book: String!, chapter: Int!): ReadingProgress!
  updateReadingPosition(
    book: String!
    chapter: Int!
    verse: Int!
  ): Boolean!
  joinReadingPlan(planId: ID!): ReadingPlanProgress!

  # Study sessions
  startStudySession: StudySession!
  endStudySession(id: ID!, activities: StudyActivitiesInput): StudySession!

  # User preferences
  updatePreferences(input: PreferencesInput!): User!

  # Memory cards
  createMemoryCard(input: MemoryCardInput!): MemoryCard!
  reviewMemoryCard(id: ID!, quality: Int!): MemoryCard!
  deleteMemoryCard(id: ID!): Boolean!

  # Groups
  createGroup(input: GroupInput!): Group!
  joinGroup(groupId: ID!): GroupMembership!
  leaveGroup(groupId: ID!): Boolean!
  createDiscussion(
    groupId: ID!
    verseId: String!
    content: String!
  ): Discussion!
  addComment(discussionId: ID!, content: String!): Comment!

  # Feedback
  submitFeedback(
    type: FeedbackType!
    target: String!
    rating: Int
    comment: String
  ): Boolean!
}

type Subscription {
  syncStatusChanged: SyncStatus!
  newRecommendation: Verse!
  groupActivityUpdate(groupId: ID!): GroupActivity!
}

# ===== Core Types =====

type User {
  id: ID!
  deviceId: String!
  preferences: Preferences!
  stats: UserStats!
  createdAt: DateTime!
}

type Preferences {
  fontSize: Int!
  fontFamily: String!
  theme: String!
  language: String!
  lineHeight: Float!
  notificationsEnabled: Boolean!
  studyReminderTime: String
}

type UserStats {
  totalStudyTime: Int!
  versesRead: Int!
  highlightsCreated: Int!
  notesCreated: Int!
  currentStreak: Int!
  longestStreak: Int!
}

type Book {
  id: String!
  title: String!
  abbrev: String!
  testament: String
  chapterCount: Int!
  chapters: [Chapter!]!
}

type Chapter {
  book: String!
  number: Int!
  title: String
  summary: String
  verses: [Verse!]!
}

type Verse {
  id: ID!
  reference: String!
  book: String!
  chapter: Int!
  verse: Int!
  text(language: String = "en"): String!
  highlights: [Highlight!]!
  notes: [Note!]!
  crossReferences: [CrossReference!]!
  aiSuggestions: [Verse!]!
  topics: [String!]!
  people: [String!]!
  places: [String!]!
  footnotes: [Footnote!]!
}

type Highlight {
  id: ID!
  userId: ID!
  verseId: String!
  color: String!
  style: String!
  startOffset: Int
  endOffset: Int
  createdAt: DateTime!
  updatedAt: DateTime!
  syncStatus: SyncStatus!
  sharedWithGroups: [ID!]
}

type Note {
  id: ID!
  userId: ID!
  verseId: String!
  title: String
  content: String!
  tags: [String!]!
  isPrivate: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
  syncStatus: SyncStatus!
  sharedWithGroups: [ID!]
}

type CrossReference {
  id: ID!
  fromVerse: String!
  toVerse: String!
  type: CrossRefType!
  strength: Float
  explanation: String
  source: String!
}

type Footnote {
  id: ID!
  verseId: String!
  marker: String!
  content: String!
  references: [String!]
}

# ===== Search Types =====

type SearchResults {
  total: Int!
  results: [SearchResult!]!
  facets: SearchFacets
  took: Int!
}

type SearchResult {
  verse: Verse!
  score: Float!
  highlights: [String!]!
  explanation: String
}

type SearchFacets {
  books: [FacetCount!]!
  topics: [FacetCount!]!
}

type FacetCount {
  value: String!
  count: Int!
}

# ===== AI Types =====

type AIResponse {
  answer: String!
  sources: [Verse!]!
  confidence: Float!
  disclaimer: String!
  conversationId: ID
}

# ===== Reading Progress Types =====

type ReadingProgress {
  userId: ID!
  booksCompleted: [String!]!
  chaptersRead: [ChapterProgress!]!
  currentPosition: Position
  percentComplete: Float!
}

type ChapterProgress {
  book: String!
  chapter: Int!
  completed: Boolean!
  lastVerseRead: Int
  completedAt: DateTime
}

type Position {
  book: String!
  chapter: Int!
  verse: Int!
}

type ReadingPlan {
  id: ID!
  title: String!
  description: String
  duration: Int!
  daily: Boolean!
  sections: [ReadingSection!]!
}

type ReadingSection {
  day: Int!
  passages: [String!]!
}

type ReadingPlanProgress {
  planId: ID!
  userId: ID!
  currentDay: Int!
  completedDays: [Int!]!
  startedAt: DateTime!
}

# ===== Study Session Types =====

type StudySession {
  id: ID!
  userId: ID!
  startTime: DateTime!
  endTime: DateTime
  duration: Int
  versesRead: [String!]!
  activities: StudyActivities
}

type StudyActivities {
  highlightsCreated: Int!
  notesCreated: Int!
  searchesPerformed: Int!
  versesMemorized: Int!
}

type StudyStatistics {
  totalSessions: Int!
  totalTime: Int!
  averageSessionTime: Int!
  versesRead: Int!
  highlightsCreated: Int!
  notesCreated: Int!
  currentStreak: Int!
  longestStreak: Int!
  studyTimeByDay: [DayStats!]!
}

type DayStats {
  date: Date!
  minutes: Int!
  versesRead: Int!
}

# ===== Memory Card Types =====

type MemoryCard {
  id: ID!
  userId: ID!
  verseId: String!
  verse: Verse!
  deckId: ID
  easeFactor: Float!
  interval: Int!
  repetitions: Int!
  nextReview: DateTime!
  lastReviewed: DateTime
  createdAt: DateTime!
}

type MemoryStatistics {
  totalCards: Int!
  cardsLearning: Int!
  cardsReviewing: Int!
  cardsMastered: Int!
  cardsDueToday: Int!
  averageRetention: Float!
  studyStreak: Int!
}

# ===== Group Types =====

type Group {
  id: ID!
  name: String!
  description: String
  privacy: GroupPrivacy!
  createdBy: ID!
  memberCount: Int!
  members: [GroupMember!]!
  createdAt: DateTime!
}

type GroupMember {
  userId: ID!
  role: GroupRole!
  joinedAt: DateTime!
}

type Discussion {
  id: ID!
  groupId: ID!
  verseId: String!
  verse: Verse!
  content: String!
  authorId: ID!
  comments: [Comment!]!
  likes: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Comment {
  id: ID!
  discussionId: ID!
  content: String!
  authorId: ID!
  likes: Int!
  createdAt: DateTime!
}

type GroupActivity {
  id: ID!
  groupId: ID!
  type: GroupActivityType!
  actorId: ID!
  content: String
  timestamp: DateTime!
}

# ===== Enums =====

enum SyncStatus {
  SYNCED
  PENDING
  FAILED
  CONFLICT
}

enum CrossRefType {
  MANUAL
  AI_SUGGESTED
  TOPICAL
  DOCTRINAL
}

enum NoteSort {
  CREATED_DESC
  CREATED_ASC
  UPDATED_DESC
  REFERENCE_ASC
}

enum FeedbackType {
  AI_RESPONSE
  SEARCH_RESULT
  BUG_REPORT
  FEATURE_REQUEST
  GENERAL
}

enum GroupPrivacy {
  PUBLIC
  PRIVATE
  INVITE_ONLY
}

enum GroupRole {
  ADMIN
  MODERATOR
  MEMBER
}

enum GroupActivityType {
  MEMBER_JOINED
  DISCUSSION_CREATED
  COMMENT_ADDED
  NOTE_SHARED
}

# ===== Inputs =====

input SearchFilters {
  books: [String!]
  topics: [String!]
  startDate: Date
  endDate: Date
  language: String
}

input NoteFilters {
  verseId: String
  tags: [String!]
  startDate: Date
  endDate: Date
  hasContent: String
}

input DateRange {
  start: Date!
  end: Date!
}

input HighlightInput {
  verseId: String!
  color: String!
  style: String = "highlight"
  startOffset: Int
  endOffset: Int
}

input NoteInput {
  verseId: String!
  title: String
  content: String!
  tags: [String!]
  isPrivate: Boolean = true
}

input PreferencesInput {
  fontSize: Int
  fontFamily: String
  theme: String
  language: String
  lineHeight: Float
  notificationsEnabled: Boolean
  studyReminderTime: String
}

input StudyActivitiesInput {
  highlightsCreated: Int!
  notesCreated: Int!
  searchesPerformed: Int!
  versesMemorized: Int!
}

input MemoryCardInput {
  verseId: String!
  deckId: ID
}

input GroupInput {
  name: String!
  description: String
  privacy: GroupPrivacy!
}

# ===== Scalars =====

scalar DateTime
scalar Date
```

---

## 3. Query Examples

### Get a Verse

**Query:**
```graphql
query GetVerse($reference: String!) {
  verse(reference: $reference) {
    id
    reference
    text
    book
    chapter
    verse
    topics
    highlights {
      id
      color
      style
    }
    notes {
      id
      title
      content
      tags
      createdAt
    }
    crossReferences {
      toVerse
      type
      strength
    }
  }
}
```

**Variables:**
```json
{
  "reference": "1 Nephi 3:7"
}
```

**Response:**
```json
{
  "data": {
    "verse": {
      "id": "1-nephi-3-7",
      "reference": "1 Nephi 3:7",
      "text": "And it came to pass that I, Nephi, said unto my father: I will go and do the things which the Lord hath commanded, for I know that the Lord giveth no commandments unto the children of men, save he shall prepare a way for them that they may accomplish the thing which he commandeth them.",
      "book": "1-nephi",
      "chapter": 3,
      "verse": 7,
      "topics": ["obedience", "faith", "commandments"],
      "highlights": [
        {
          "id": "highlight_123",
          "color": "yellow",
          "style": "highlight"
        }
      ],
      "notes": [
        {
          "id": "note_456",
          "title": "Personal Application",
          "content": "This verse reminds me that God provides a way when He asks something of us.",
          "tags": ["faith", "obedience"],
          "createdAt": "2025-11-15T14:30:00Z"
        }
      ],
      "crossReferences": [
        {
          "toVerse": "Philippians 4:13",
          "type": "AI_SUGGESTED",
          "strength": 0.85
        }
      ]
    }
  }
}
```

---

### Search Scriptures

**Query:**
```graphql
query SearchScriptures(
  $query: String!
  $filters: SearchFilters
  $limit: Int
) {
  searchScriptures(query: $query, filters: $filters, limit: $limit) {
    total
    took
    results {
      verse {
        reference
        text
      }
      score
      highlights
    }
    facets {
      books {
        value
        count
      }
    }
  }
}
```

**Variables:**
```json
{
  "query": "faith seed",
  "filters": {
    "books": ["alma"]
  },
  "limit": 5
}
```

**Response:**
```json
{
  "data": {
    "searchScriptures": {
      "total": 12,
      "took": 45,
      "results": [
        {
          "verse": {
            "reference": "Alma 32:28",
            "text": "Now, we will compare the word unto a seed..."
          },
          "score": 0.95,
          "highlights": ["<mark>seed</mark>", "<mark>faith</mark>"]
        }
      ],
      "facets": {
        "books": [
          { "value": "alma", "count": 12 }
        ]
      }
    }
  }
}
```

---

### Get Study Statistics

**Query:**
```graphql
query GetStudyStats($dateRange: DateRange!) {
  studyStats(dateRange: $dateRange) {
    totalSessions
    totalTime
    averageSessionTime
    versesRead
    currentStreak
    longestStreak
    studyTimeByDay {
      date
      minutes
      versesRead
    }
  }
}
```

**Variables:**
```json
{
  "dateRange": {
    "start": "2025-11-01",
    "end": "2025-11-19"
  }
}
```

**Response:**
```json
{
  "data": {
    "studyStats": {
      "totalSessions": 15,
      "totalTime": 720,
      "averageSessionTime": 48,
      "versesRead": 450,
      "currentStreak": 12,
      "longestStreak": 15,
      "studyTimeByDay": [
        {
          "date": "2025-11-19",
          "minutes": 35,
          "versesRead": 25
        },
        {
          "date": "2025-11-18",
          "minutes": 50,
          "versesRead": 40
        }
      ]
    }
  }
}
```

---

### Ask AI a Question

**Query:**
```graphql
query AskQuestion($question: String!) {
  askQuestion(question: $question) {
    answer
    sources {
      reference
      text
    }
    confidence
    disclaimer
  }
}
```

**Variables:**
```json
{
  "question": "What does the Book of Mormon teach about faith?"
}
```

**Response:**
```json
{
  "data": {
    "askQuestion": {
      "answer": "The Book of Mormon teaches that faith is...",
      "sources": [
        {
          "reference": "Alma 32:21",
          "text": "And now as I said concerning faith—faith is not to have a perfect knowledge of things; therefore if ye have faith ye hope for things which are not seen, which are true."
        },
        {
          "reference": "Ether 12:6",
          "text": "And now, I, Moroni, would speak somewhat concerning these things; I would show unto the world that faith is things which are hoped for and not seen; wherefore, dispute not because ye see not, for ye receive no witness until after the trial of your faith."
        }
      ],
      "confidence": 0.92,
      "disclaimer": "This response is AI-generated and not official church doctrine. Please study the scriptures and seek personal revelation."
    }
  }
}
```

---

## 4. Mutation Examples

### Create a Highlight

**Mutation:**
```graphql
mutation CreateHighlight($input: HighlightInput!) {
  createHighlight(input: $input) {
    id
    verseId
    color
    style
    createdAt
    syncStatus
  }
}
```

**Variables:**
```json
{
  "input": {
    "verseId": "1-nephi-3-7",
    "color": "yellow",
    "style": "highlight"
  }
}
```

**Response:**
```json
{
  "data": {
    "createHighlight": {
      "id": "highlight_789",
      "verseId": "1-nephi-3-7",
      "color": "yellow",
      "style": "highlight",
      "createdAt": "2025-11-19T10:30:00Z",
      "syncStatus": "PENDING"
    }
  }
}
```

---

### Create a Note

**Mutation:**
```graphql
mutation CreateNote($input: NoteInput!) {
  createNote(input: $input) {
    id
    verseId
    title
    content
    tags
    isPrivate
    createdAt
    syncStatus
  }
}
```

**Variables:**
```json
{
  "input": {
    "verseId": "alma-32-28",
    "title": "Faith and Works",
    "content": "This verse shows how faith requires action...",
    "tags": ["faith", "action", "testimony"],
    "isPrivate": true
  }
}
```

**Response:**
```json
{
  "data": {
    "createNote": {
      "id": "note_987",
      "verseId": "alma-32-28",
      "title": "Faith and Works",
      "content": "This verse shows how faith requires action...",
      "tags": ["faith", "action", "testimony"],
      "isPrivate": true,
      "createdAt": "2025-11-19T10:35:00Z",
      "syncStatus": "PENDING"
    }
  }
}
```

---

### Review Memory Card

**Mutation:**
```graphql
mutation ReviewMemoryCard($id: ID!, $quality: Int!) {
  reviewMemoryCard(id: $id, quality: $quality) {
    id
    easeFactor
    interval
    repetitions
    nextReview
  }
}
```

**Variables:**
```json
{
  "id": "card_123",
  "quality": 4
}
```

**Response:**
```json
{
  "data": {
    "reviewMemoryCard": {
      "id": "card_123",
      "easeFactor": 2.6,
      "interval": 6,
      "repetitions": 2,
      "nextReview": "2025-11-25T10:00:00Z"
    }
  }
}
```

---

### Create Group Discussion

**Mutation:**
```graphql
mutation CreateDiscussion(
  $groupId: ID!
  $verseId: String!
  $content: String!
) {
  createDiscussion(
    groupId: $groupId
    verseId: $verseId
    content: $content
  ) {
    id
    verseId
    content
    authorId
    createdAt
  }
}
```

**Variables:**
```json
{
  "groupId": "group_456",
  "verseId": "1-nephi-3-7",
  "content": "How do we apply this verse in our daily lives?"
}
```

**Response:**
```json
{
  "data": {
    "createDiscussion": {
      "id": "discussion_789",
      "verseId": "1-nephi-3-7",
      "content": "How do we apply this verse in our daily lives?",
      "authorId": "user_123",
      "createdAt": "2025-11-19T11:00:00Z"
    }
  }
}
```

---

## 5. Subscription Examples

### Sync Status Updates

**Subscription:**
```graphql
subscription SyncStatusChanged {
  syncStatusChanged {
    status
    itemsRemaining
    lastSyncTime
  }
}
```

**Response Stream:**
```json
{
  "data": {
    "syncStatusChanged": {
      "status": "SYNCING",
      "itemsRemaining": 5,
      "lastSyncTime": "2025-11-19T10:30:00Z"
    }
  }
}

{
  "data": {
    "syncStatusChanged": {
      "status": "SYNCED",
      "itemsRemaining": 0,
      "lastSyncTime": "2025-11-19T10:30:15Z"
    }
  }
}
```

---

### Group Activity Updates

**Subscription:**
```graphql
subscription GroupActivityUpdate($groupId: ID!) {
  groupActivityUpdate(groupId: $groupId) {
    id
    type
    actorId
    content
    timestamp
  }
}
```

**Variables:**
```json
{
  "groupId": "group_456"
}
```

**Response Stream:**
```json
{
  "data": {
    "groupActivityUpdate": {
      "id": "activity_123",
      "type": "DISCUSSION_CREATED",
      "actorId": "user_789",
      "content": "Started a discussion on 1 Nephi 3:7",
      "timestamp": "2025-11-19T11:00:00Z"
    }
  }
}
```

---

## 6. REST Endpoints

### File Upload

**Endpoint:** `POST /api/v1/uploads`

**Use Case:** Upload profile pictures or verse images (future feature)

**Request:**
```http
POST /api/v1/uploads
Authorization: Bearer [token]
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="file"; filename="image.jpg"
Content-Type: image/jpeg

[binary data]
--boundary--
```

**Response:**
```json
{
  "url": "https://cdn.gospellibrary.org/uploads/abc123.jpg",
  "fileId": "file_abc123",
  "size": 102400,
  "mimeType": "image/jpeg"
}
```

---

### Export Data (GDPR)

**Endpoint:** `GET /api/v1/users/me/export`

**Request:**
```http
GET /api/v1/users/me/export
Authorization: Bearer [token]
```

**Response:**
```json
{
  "exportId": "export_123",
  "status": "processing",
  "estimatedTime": 300
}
```

**Check Status:**
```http
GET /api/v1/exports/export_123
Authorization: Bearer [token]
```

**Response (when ready):**
```json
{
  "exportId": "export_123",
  "status": "completed",
  "downloadUrl": "https://exports.gospellibrary.org/user_data_123.json",
  "expiresAt": "2025-11-20T10:00:00Z",
  "size": 524288
}
```

---

### Delete Account (GDPR)

**Endpoint:** `DELETE /api/v1/users/me`

**Request:**
```http
DELETE /api/v1/users/me
Authorization: Bearer [token]
Content-Type: application/json

{
  "confirmation": "DELETE_MY_ACCOUNT"
}
```

**Response:**
```json
{
  "message": "Account deletion initiated. All data will be permanently deleted within 30 days.",
  "deletionDate": "2025-12-19T00:00:00Z"
}
```

---

### Health Check

**Endpoint:** `GET /api/v1/health`

**Request:**
```http
GET /api/v1/health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.2.3",
  "uptime": 864000,
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "vectorDB": "healthy"
  }
}
```

---

## 7. Error Handling

### Error Response Format

```json
{
  "errors": [
    {
      "message": "Verse not found",
      "extensions": {
        "code": "NOT_FOUND",
        "reference": "1 Nephi 100:1",
        "timestamp": "2025-11-19T10:00:00Z"
      }
    }
  ]
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHENTICATED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |
| `CONFLICT` | 409 | Resource conflict (e.g., sync conflict) |

### Validation Error Example

```json
{
  "errors": [
    {
      "message": "Validation failed",
      "extensions": {
        "code": "VALIDATION_ERROR",
        "fields": {
          "verseId": "Invalid verse reference format",
          "color": "Must be one of: yellow, green, blue, pink, orange"
        }
      }
    }
  ]
}
```

---

## 8. Rate Limiting

### Limits

- **Authenticated Users:** 1000 requests/hour, 100 requests/minute
- **Unauthenticated:** 100 requests/hour, 10 requests/minute
- **Search Queries:** 60 requests/minute (more CPU intensive)
- **AI Queries:** 10 requests/minute (most expensive)

### Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1700000000
```

### Rate Limit Exceeded Response

```json
{
  "errors": [
    {
      "message": "Rate limit exceeded",
      "extensions": {
        "code": "RATE_LIMIT_EXCEEDED",
        "retryAfter": 60,
        "limit": 1000,
        "resetAt": "2025-11-19T11:00:00Z"
      }
    }
  ]
}
```

---

## 9. Versioning

### Strategy

- **Current Version:** v1
- **Deprecation Notice:** 6 months before removal
- **Breaking Changes:** New major version (v2)
- **Non-Breaking Changes:** Same version, documented in changelog

### Version Header

```http
API-Version: 1
```

### Deprecated Field Example

```graphql
type Note {
  id: ID!
  content: String!
  body: String! @deprecated(reason: "Use 'content' instead. Will be removed in v2.")
}
```

---

## 10. Pagination

### Cursor-Based Pagination

**Query:**
```graphql
query GetNotes($cursor: String, $limit: Int = 20) {
  myNotes(after: $cursor, limit: $limit) {
    edges {
      node {
        id
        content
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
```

### Offset-Based Pagination

**Query:**
```graphql
query GetHighlights($offset: Int = 0, $limit: Int = 50) {
  myHighlights(offset: $offset, limit: $limit) {
    id
    verseId
    color
  }
}
```

---

## Appendix: Request Examples

### cURL Examples

**Get Verse:**
```bash
curl -X POST https://api.gospellibrary.org/graphql \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { verse(reference: \"1 Nephi 3:7\") { reference text } }"
  }'
```

**Create Highlight:**
```bash
curl -X POST https://api.gospellibrary.org/graphql \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation CreateHighlight($input: HighlightInput!) { createHighlight(input: $input) { id color } }",
    "variables": {
      "input": {
        "verseId": "1-nephi-3-7",
        "color": "yellow"
      }
    }
  }'
```

---

**Document Version:** 1.0
**Last Updated:** November 19, 2025
**API Version:** v1
**Status:** Draft - Ready for Implementation
