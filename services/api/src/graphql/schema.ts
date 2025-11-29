export const typeDefs = `#graphql
  # Scalar types
  scalar DateTime
  scalar JSON

  # ============================================================================
  # User Types
  # ============================================================================

  type User {
    id: ID!
    email: String!
    displayName: String
    avatarUrl: String
    createdAt: DateTime!
    updatedAt: DateTime!
    preferences: UserPreferences
    highlights: [Highlight!]!
    notes: [Note!]!
    studyStreak: StudyStreak
  }

  type UserPreferences {
    id: ID!
    language: String!
    fontSize: String!
    theme: String!
    notificationsEnabled: Boolean!
    dailyReminderTime: String
    semanticSearchEnabled: Boolean!
    chatbotEnabled: Boolean!
    autoSuggestionsEnabled: Boolean!
  }

  # ============================================================================
  # Scripture Types
  # ============================================================================

  type Verse {
    id: ID!
    book: String!
    chapter: Int!
    verse: Int!
    text: String!
    language: String!
    highlights: [Highlight!]!
    notes: [Note!]!
    crossReferences: [CrossReference!]!
  }

  type CrossReference {
    id: ID!
    fromVerse: Verse!
    toVerse: Verse!
    type: String!
    confidence: Float
  }

  # ============================================================================
  # Study Types
  # ============================================================================

  type Highlight {
    id: ID!
    user: User!
    verse: Verse!
    color: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Note {
    id: ID!
    user: User!
    verse: Verse!
    content: String!
    tags: [String!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ReadingProgress {
    id: ID!
    user: User!
    book: String!
    chapter: Int!
    verse: Int!
    percentage: Float!
    lastReadAt: DateTime!
  }

  type StudyStreak {
    id: ID!
    currentStreak: Int!
    longestStreak: Int!
    lastStudyDate: DateTime!
  }

  # ============================================================================
  # Memory System Types
  # ============================================================================

  type MemoryCard {
    id: ID!
    user: User!
    verse: Verse!
    easeFactor: Float!
    interval: Int!
    repetition: Int!
    nextReview: DateTime!
    lastReviewed: DateTime
    totalReviews: Int!
    correctReviews: Int!
  }

  type MemoryReviewResult {
    card: MemoryCard!
    quality: Int!
    nextReview: DateTime!
  }

  # ============================================================================
  # Group Study Types
  # ============================================================================

  type Group {
    id: ID!
    name: String!
    description: String
    imageUrl: String
    isPrivate: Boolean!
    inviteCode: String
    members: [GroupMember!]!
    discussions: [Discussion!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type GroupMember {
    id: ID!
    group: Group!
    user: User!
    role: String!
    joinedAt: DateTime!
  }

  type Discussion {
    id: ID!
    group: Group!
    title: String!
    content: String!
    authorId: String!
    verseId: String!
    comments: [Comment!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Comment {
    id: ID!
    discussion: Discussion!
    authorId: String!
    content: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # ============================================================================
  # Search Types
  # ============================================================================

  type SearchResult {
    verse: Verse!
    score: Float!
    highlights: [String!]
  }

  type SearchResponse {
    results: [SearchResult!]!
    total: Int!
    offset: Int!
    limit: Int!
    query: String!
    type: SearchType!
  }

  enum SearchType {
    KEYWORD
    SEMANTIC
    HYBRID
  }

  # ============================================================================
  # AI Types
  # ============================================================================

  type AIResponse {
    answer: String!
    sources: [Verse!]!
    confidence: Float!
  }

  type AIInteraction {
    id: ID!
    userId: String!
    question: String!
    answer: String!
    sources: [String!]!
    confidence: Float!
    feedback: String
    createdAt: DateTime!
  }

  # ============================================================================
  # Input Types
  # ============================================================================

  input ScriptureReferenceInput {
    book: String!
    chapter: Int!
    verse: Int!
    endVerse: Int
  }

  input CreateHighlightInput {
    verseId: ID!
    color: String!
  }

  input CreateNoteInput {
    verseId: ID!
    content: String!
    tags: [String!]
  }

  input UpdateNoteInput {
    content: String
    tags: [String!]
  }

  input SearchInput {
    query: String!
    type: SearchType = HYBRID
    books: [String!]
    limit: Int = 20
    offset: Int = 0
  }

  input ReviewCardInput {
    cardId: ID!
    quality: Int! # 0-5 (SM-2 algorithm)
  }

  input CreateGroupInput {
    name: String!
    description: String
    isPrivate: Boolean = false
  }

  input CreateDiscussionInput {
    groupId: ID!
    title: String!
    content: String!
    verseId: ID!
  }

  input AIChatInput {
    message: String!
    scriptureContext: [ID!]
  }

  # ============================================================================
  # Queries
  # ============================================================================

  type Query {
    # User queries
    me: User

    # Scripture queries
    verse(id: ID!): Verse
    verses(book: String!, chapter: Int!): [Verse!]!
    verseByReference(book: String!, chapter: Int!, verse: Int!): Verse
    searchVerses(input: SearchInput!): SearchResponse!

    # Study queries
    myHighlights(verseId: ID): [Highlight!]!
    myNotes(verseId: ID): [Note!]!
    myProgress(book: String): [ReadingProgress!]!
    myStreak: StudyStreak

    # Memory system queries
    dueCards: [MemoryCard!]!
    cardStats: CardStats!

    # Group queries
    myGroups: [Group!]!
    group(id: ID!): Group
    groupDiscussions(groupId: ID!): [Discussion!]!

    # AI queries
    askQuestion(input: AIChatInput!): AIResponse!
    myAIHistory(limit: Int = 20): [AIInteraction!]!
  }

  type CardStats {
    total: Int!
    due: Int!
    new: Int!
    learning: Int!
    mastered: Int!
  }

  # ============================================================================
  # Mutations
  # ============================================================================

  type Mutation {
    # Highlight mutations
    createHighlight(input: CreateHighlightInput!): Highlight!
    deleteHighlight(id: ID!): Boolean!

    # Note mutations
    createNote(input: CreateNoteInput!): Note!
    updateNote(id: ID!, input: UpdateNoteInput!): Note!
    deleteNote(id: ID!): Boolean!

    # Reading progress
    updateProgress(verseId: ID!): ReadingProgress!

    # Memory system
    createCard(verseId: ID!): MemoryCard!
    reviewCard(input: ReviewCardInput!): MemoryReviewResult!
    deleteCard(id: ID!): Boolean!

    # Group mutations
    createGroup(input: CreateGroupInput!): Group!
    joinGroup(inviteCode: String!): Group!
    leaveGroup(groupId: ID!): Boolean!
    createDiscussion(input: CreateDiscussionInput!): Discussion!
    addComment(discussionId: ID!, content: String!): Comment!

    # AI interactions
    provideFeedback(interactionId: ID!, feedback: String!): Boolean!
  }

  # ============================================================================
  # Subscriptions (for real-time updates)
  # ============================================================================

  type Subscription {
    # Study sync
    highlightAdded(userId: ID!): Highlight!
    noteAdded(userId: ID!): Note!

    # Group activity
    newDiscussion(groupId: ID!): Discussion!
    newComment(discussionId: ID!): Comment!
  }
`;
