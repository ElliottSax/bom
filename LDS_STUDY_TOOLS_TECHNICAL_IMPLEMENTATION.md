# Scripture Study Tools - Technical Implementation Guide

> **📌 PROJECT SCOPE NOTE:**
> This document provides technical implementation guidance for scripture study features. While the research references LDS Gospel Library and other platforms, **this project is built for Community of Christ scriptures**.
>
> **Community of Christ Specific Requirements:**
> - Book of Mormon: Original 1830 chapter divisions (not Pratt 1879)
> - Doctrine & Covenants: 167 sections (sections 114+ are CoC revelations)
> - Bible: Inspired Version (JST) and NRSV
> - See [COMMUNITY_OF_CHRIST_VERSIFICATION.md](./docs/COMMUNITY_OF_CHRIST_VERSIFICATION.md)

---

## Executive Summary

This document provides technical implementation details and recommendations for building modern scripture study tools for Community of Christ. It draws on competitive analysis of LDS Gospel Library and other platforms to inform technology choices, architectures, and implementation patterns.

---

## Table of Contents

1. [AI & Machine Learning Implementation](#1-ai--machine-learning-implementation)
2. [Mobile Architecture & Frameworks](#2-mobile-architecture--frameworks)
3. [Offline-First Architecture](#3-offline-first-architecture)
4. [Data Visualization](#4-data-visualization)
5. [Scripture Memory Systems](#5-scripture-memory-systems)
6. [User Experience Patterns](#6-user-experience-patterns)
7. [Accessibility Implementation](#7-accessibility-implementation)
8. [Data Privacy & Security](#8-data-privacy--security)
9. [Analytics & Metrics](#9-analytics--metrics)
10. [Testing Strategy](#10-testing-strategy)
11. [Internationalization](#11-internationalization)
12. [CI/CD & Deployment](#12-cicd--deployment)
13. [Performance Optimization](#13-performance-optimization)
14. [Engagement Mechanisms](#14-engagement-mechanisms)

---

## 1. AI & Machine Learning Implementation

### 1.1 Semantic Search Architecture

#### Technology Stack

**Vector Databases:**
- **Qdrant** (Recommended for open-source): Rust-based, excellent performance, sophisticated metadata filtering
- **Pinecone** (For managed solution): Fully managed, handles billions of vectors, minimal operational overhead
- **Weaviate** (For hybrid search): GraphQL interface, knowledge graph capabilities, structural understanding

**Embedding Models:**
- **Sentence Transformers**: State-of-the-art text embeddings based on BERT
- **BERT variants**: Fine-tune on religious text corpus
- **OpenAI Embeddings**: High quality but requires API calls

#### Implementation Approach

```
1. Data Preparation
   ├── Extract all Book of Mormon verses
   ├── Include chapter summaries and footnotes
   ├── Add metadata (book, chapter, verse, topics)
   └── Create semantic chunks (verses, paragraphs, topics)

2. Generate Embeddings
   ├── Use Sentence Transformers (all-MiniLM-L6-v2 or similar)
   ├── Fine-tune on LDS scripture corpus if possible
   ├── Generate embeddings for each chunk
   └── Store in vector database with metadata

3. Query Processing
   ├── User enters natural language query
   ├── Generate query embedding using same model
   ├── Perform similarity search in vector DB
   ├── Retrieve top K most similar verses
   └── Return results with context and metadata

4. Hybrid Search (Recommended)
   ├── Combine semantic search (vector)
   ├── With keyword search (traditional)
   └── Use weighted ranking for best results
```

**Performance Metrics:**
- Query latency: 10-100ms for 1M-10M vectors
- Semantic search understands concepts, not just keywords
- Example: "faith as a seed" finds Alma 32:28 even without exact words

#### Fine-Tuning for Religious Text

**Approach:**
```python
from sentence_transformers import SentenceTransformer, InputExample, losses
from torch.utils.data import DataLoader

# Load base model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Create training examples (verse pairs with similarity scores)
train_examples = [
    InputExample(texts=['Moroni 10:4', 'James 1:5'], label=0.9),  # Similar
    InputExample(texts=['1 Nephi 3:7', '2 Nephi 2:25'], label=0.7),
    # ... more examples from cross-references
]

# Fine-tune on scripture-specific data
train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=16)
train_loss = losses.CosineSimilarityLoss(model)

model.fit(
    train_objectives=[(train_dataloader, train_loss)],
    epochs=3,
    warmup_steps=100
)
```

### 1.2 RAG (Retrieval Augmented Generation) Chatbot

#### Architecture Components

```
User Query
    ↓
Query Understanding (LLM)
    ↓
Semantic Search (Vector DB) → Retrieve Relevant Verses
    ↓
Context Assembly
    ↓
LLM Generation (with context)
    ↓
Response + Source Citations
```

#### Technology Stack

**Option 1: Open Source Stack**
- LLM: Llama 3, Mistral, or similar (run via Ollama locally)
- Vector DB: Qdrant
- Framework: LangChain or LlamaIndex
- Deployment: On-premise or private cloud

**Option 2: Managed APIs**
- LLM: OpenAI GPT-4, Anthropic Claude
- Vector DB: Pinecone
- Framework: LangChain
- Deployment: Cloud-based

#### Implementation Example

```python
from langchain.chat_models import ChatOpenAI
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Qdrant
from langchain.chains import RetrievalQA

# Initialize components
embeddings = OpenAIEmbeddings()
vectorstore = Qdrant.from_existing_collection(
    embedding=embeddings,
    collection_name="book_of_mormon"
)

llm = ChatOpenAI(model="gpt-4", temperature=0.3)

# Create RAG chain
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectorstore.as_retriever(search_kwargs={"k": 5})
)

# Use it
response = qa_chain.run("What does the Book of Mormon teach about faith?")
```

#### Critical Considerations for LDS Implementation

**Theological Accuracy:**
- Add explicit disclaimers: "AI-generated response, not official church doctrine"
- Implement theological review process for common queries
- Train/fine-tune on authoritative LDS sources (scriptures, conference talks, manuals)
- Limit responses to scriptural content rather than doctrinal interpretations

**Prompt Engineering:**
```
System Prompt Example:
"You are a scripture study assistant. You help users understand
the Book of Mormon by providing relevant passages and context.
Always cite specific verses. Never claim doctrinal authority.
If a question requires doctrinal interpretation, direct users
to official church resources. Focus on what the text says, not
personal interpretation."
```

### 1.3 Cross-Reference Discovery

#### AI-Powered Approach

**Method 1: Embedding Similarity**
- For each verse, find K most similar verses by cosine similarity
- Filter by similarity threshold (e.g., > 0.75)
- Rank by relevance and thematic connection

**Method 2: Topic Modeling**
- Use LDA (Latent Dirichlet Allocation) or NMF
- Identify topics across scripture corpus
- Link verses sharing dominant topics

**Method 3: Hybrid (Recommended)**
- Combine embedding similarity with existing cross-references
- Use supervised learning to identify patterns in manual cross-references
- Apply patterns to discover new connections

#### Implementation

```python
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# Get embeddings for all verses
verse_embeddings = load_verse_embeddings()  # Shape: (num_verses, embedding_dim)

# For a specific verse
verse_id = 1234  # e.g., Moroni 10:4
verse_embedding = verse_embeddings[verse_id]

# Calculate similarities
similarities = cosine_similarity(
    verse_embedding.reshape(1, -1),
    verse_embeddings
)[0]

# Get top 10 most similar (excluding self)
top_indices = np.argsort(similarities)[-11:-1][::-1]
suggested_cross_refs = [get_verse_reference(idx) for idx in top_indices]

# Result: ['James 1:5', 'Alma 32:27', '1 Nephi 10:17', ...]
```

---

## 2. Mobile Architecture & Frameworks

### 2.1 Platform Comparison

#### React Native (Recommended for Cross-Platform)

**Pros:**
- Large developer community
- Extensive third-party libraries
- Shared codebase for iOS/Android/Web
- New Architecture (0.74+): Bridgeless mode, JSI for faster native communication
- Hot reload for rapid development
- Can leverage existing web developers

**Cons:**
- Performance slightly behind native for complex UIs
- Larger bundle sizes than Flutter
- Occasional platform-specific bugs

**Use Case Fit:**
- Gospel Library already has web presence
- Team may have JavaScript/TypeScript expertise
- Need to share logic with web app

#### Flutter (Best Performance)

**Pros:**
- Superior rendering performance (60-120fps consistently)
- Impeller rendering engine (hardware optimization)
- Beautiful, consistent UI across platforms
- Excellent for text-heavy apps
- Hot reload
- Growing ecosystem

**Cons:**
- Dart language learning curve
- Smaller ecosystem than React Native
- Larger initial download size

**Use Case Fit:**
- Performance-critical reading experience
- Heavy text rendering and animations
- Team willing to learn Dart

#### Progressive Web App (PWA)

**Pros:**
- Single codebase for all platforms
- No app store approval needed
- Instant updates
- Lower development cost
- Service workers enable offline functionality

**Cons:**
- Limited offline capabilities compared to native
- Cannot serve all app features offline
- Less access to device features
- Inconsistent experience across browsers
- Not ideal for complex offline-first use cases

**Use Case Fit:**
- Supplementary to native apps
- Quick rollout of features
- Users who prefer web access

### 2.2 Recommended Architecture

**Hybrid Approach:**
```
Core Scripture Reading: Native (React Native or Flutter)
    ↓
    ├── Offline-first architecture
    ├── Full text storage locally
    ├── Rich highlighting/annotation features
    └── Maximum performance

Supplementary Features: PWA
    ↓
    ├── Web-based study guides
    ├── Community features
    ├── Admin tools
    └── Quick feature experimentation
```

### 2.3 Technology Stack Recommendation

**For React Native:**
```
Framework: React Native 0.77+ (New Architecture)
Language: TypeScript (type safety)
State Management: Zustand or Redux Toolkit
Navigation: React Navigation
Local Database: WatermelonDB (built on SQLite)
Sync: Custom sync layer with PouchDB protocol
UI Components: React Native Paper or custom
Testing: Jest + Detox (E2E)
```

**For Flutter:**
```
Framework: Flutter 3.29+
Language: Dart
State Management: Riverpod or Bloc
Navigation: Go Router
Local Database: Drift (type-safe SQLite)
Sync: Custom with Hive or ObjectBox
UI: Material Design 3 with custom theming
Testing: Flutter Test + integration_test
```

---

## 3. Offline-First Architecture

### 3.1 Core Principles

**Offline-first** means the app prioritizes local experience:
1. Data is read from and written to local storage first
2. Synchronization happens opportunistically in background
3. App remains fully functional without network
4. Conflicts are resolved gracefully

### 3.2 Architecture Pattern

```
User Action
    ↓
Local Database (Immediate Response)
    ↓
Sync Queue (Changes queued)
    ↓
Background Sync Process
    ↓
    ├── When network available
    ├── Send queued changes to server
    ├── Pull remote updates
    └── Resolve conflicts
```

### 3.3 Technology Options

#### Option 1: PouchDB + CouchDB

**Architecture:**
```
Mobile App (PouchDB)
    ↔ IndexedDB (Browser) or SQLite (React Native)
    ↔ CouchDB Server
```

**Features:**
- Master-master replication
- Built-in conflict resolution
- Per-user databases
- Automatic sync when online

**Implementation:**
```javascript
// Initialize PouchDB
const localDB = new PouchDB('scriptures');
const remoteDB = new PouchDB('https://server.com/db/user123');

// Two-way sync
localDB.sync(remoteDB, {
  live: true,
  retry: true
}).on('change', function (info) {
  // Handle change
}).on('error', function (err) {
  // Handle error
});

// User highlights a verse (works offline)
await localDB.put({
  _id: 'highlight_12345',
  type: 'highlight',
  verse: '1 Nephi 3:7',
  color: 'yellow',
  timestamp: Date.now(),
  userId: 'user123'
});
```

**Conflict Resolution:**
```javascript
localDB.replicate.from(remoteDB).on('complete', function (info) {
  info.docs.forEach(doc => {
    if (doc._conflicts) {
      // Custom resolution logic
      resolveConflict(doc);
    }
  });
});

function resolveConflict(doc) {
  // Strategy 1: Last Write Wins
  // Keep the document with most recent timestamp

  // Strategy 2: Merge
  // Combine both versions intelligently

  // Strategy 3: User Choice
  // Present both versions to user
}
```

#### Option 2: Custom Sync with SQLite

**For Scripture Text (Read-Only):**
```
App Installation
    ↓
Download full scripture database (SQLite file)
    ↓
Store locally (10-50 MB)
    ↓
All reads from local DB
    ↓
Periodic updates for corrections/additions
```

**For User Data (Read-Write):**
```
User creates highlight/note
    ↓
Store in local SQLite table
    ↓
Mark as "needs_sync = true"
    ↓
Background process:
    ├── Check network
    ├── If online: POST to API
    ├── On success: Mark "needs_sync = false"
    └── On failure: Retry with exponential backoff
```

**Implementation (React Native):**
```javascript
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({
  name: 'scriptures.db',
  location: 'default'
});

// Store user highlight offline
function saveHighlight(verse, color) {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO highlights (verse, color, needs_sync) VALUES (?, ?, ?)',
      [verse, color, 1],
      (tx, results) => {
        // Trigger background sync
        syncWhenOnline();
      }
    );
  });
}

// Background sync
async function syncWhenOnline() {
  const isOnline = await checkNetworkStatus();
  if (!isOnline) return;

  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM highlights WHERE needs_sync = 1',
      [],
      async (tx, results) => {
        for (let i = 0; i < results.rows.length; i++) {
          const item = results.rows.item(i);
          try {
            await fetch('https://api.server.com/highlights', {
              method: 'POST',
              body: JSON.stringify(item)
            });

            // Mark as synced
            tx.executeSql(
              'UPDATE highlights SET needs_sync = 0 WHERE id = ?',
              [item.id]
            );
          } catch (error) {
            // Will retry later
            console.log('Sync failed, will retry');
          }
        }
      }
    );
  });
}
```

### 3.4 Data Sync Strategy

**Per-User Database Model:**
```
Server:
    ├── scriptures (global, read-only)
    ├── user_123_data (personal highlights, notes)
    ├── user_456_data
    └── ...

Client:
    ├── scriptures (local copy, rarely updated)
    └── user_data (syncs with server user_123_data)
```

**Sync Triggers:**
- App startup (pull latest changes)
- User makes change (push to server when online)
- Periodic background sync (every 15 minutes)
- Network reconnection (immediate sync)
- Manual "Sync Now" button

---

## 4. Data Visualization

### 4.1 Cross-Reference Network Graphs

#### Technology: D3.js

**Implementation Approach:**
```javascript
import * as d3 from 'd3';

// Data structure
const data = {
  nodes: [
    { id: '1-nephi-3-7', label: '1 Nephi 3:7', group: 'Book of Mormon' },
    { id: 'philippians-4-13', label: 'Philippians 4:13', group: 'Bible' },
    // ... more nodes
  ],
  links: [
    { source: '1-nephi-3-7', target: 'philippians-4-13', type: 'similar_theme' },
    // ... more links
  ]
};

// Create force-directed graph
const width = 800;
const height = 600;

const svg = d3.select('#graph')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const simulation = d3.forceSimulation(data.nodes)
  .force('link', d3.forceLink(data.links).id(d => d.id))
  .force('charge', d3.forceManyBody().strength(-100))
  .force('center', d3.forceCenter(width / 2, height / 2));

// Draw links
const link = svg.append('g')
  .selectAll('line')
  .data(data.links)
  .enter().append('line')
  .attr('stroke', '#999')
  .attr('stroke-opacity', 0.6);

// Draw nodes
const node = svg.append('g')
  .selectAll('circle')
  .data(data.nodes)
  .enter().append('circle')
  .attr('r', 5)
  .attr('fill', d => colorByGroup(d.group))
  .call(drag(simulation));

// Add labels
const label = svg.append('g')
  .selectAll('text')
  .data(data.nodes)
  .enter().append('text')
  .text(d => d.label)
  .attr('font-size', 10)
  .attr('dx', 8);

// Update positions on tick
simulation.on('tick', () => {
  link
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y);

  node
    .attr('cx', d => d.x)
    .attr('cy', d => d.y);

  label
    .attr('x', d => d.x)
    .attr('y', d => d.y);
});

// Add interactivity
node.on('click', function(event, d) {
  // Navigate to verse
  openVerse(d.id);
});

node.on('mouseover', function(event, d) {
  // Highlight connected nodes
  highlightConnections(d);
});
```

#### Mobile Considerations

For mobile devices, use:
- **Simplified graphs** (fewer nodes, show subsets)
- **Touch-optimized controls** (pinch to zoom, drag to pan)
- **Canvas rendering** instead of SVG for better performance
- **Progressive loading** (load nodes on demand)

**Alternative: React Force Graph**
```jsx
import { ForceGraph2D } from 'react-force-graph';

<ForceGraph2D
  graphData={data}
  nodeLabel="label"
  nodeColor={node => colorByGroup(node.group)}
  onNodeClick={node => openVerse(node.id)}
  width={windowWidth}
  height={windowHeight}
/>
```

### 4.2 Study Statistics Dashboard

**Metrics to Visualize:**
- Study time per day/week/month
- Verses read (progress through Book of Mormon)
- Notes created over time
- Highlights by color/topic
- Reading streak
- Topics studied (word cloud)

**Recommended Library: Recharts (React)**
```jsx
import { LineChart, Line, BarChart, Bar, PieChart, Pie } from 'recharts';

// Study time over last 30 days
<LineChart data={studyTimeData}>
  <Line type="monotone" dataKey="minutes" stroke="#8884d8" />
  <XAxis dataKey="date" />
  <YAxis />
</LineChart>

// Highlights by color
<PieChart>
  <Pie data={highlightsByColor} dataKey="count" nameKey="color" />
</PieChart>

// Progress through books
<BarChart data={progressByBook}>
  <Bar dataKey="percentComplete" fill="#82ca9d" />
  <XAxis dataKey="book" />
  <YAxis />
</BarChart>
```

---

## 5. Scripture Memory Systems

### 5.1 Spaced Repetition Algorithm

**Implementation: SM-2 Algorithm** (used by Anki, Remember Me)

```javascript
class SpacedRepetitionCard {
  constructor(verseId, verseText) {
    this.verseId = verseId;
    this.verseText = verseText;
    this.easeFactor = 2.5;  // Initial ease
    this.interval = 1;       // Days until next review
    this.repetition = 0;     // Number of successful reviews
    this.nextReview = Date.now();
  }

  review(quality) {
    // quality: 0-5 (0=complete fail, 5=perfect)
    if (quality < 3) {
      // Failed, restart
      this.repetition = 0;
      this.interval = 1;
    } else {
      // Successful
      if (this.repetition === 0) {
        this.interval = 1;
      } else if (this.repetition === 1) {
        this.interval = 6;
      } else {
        this.interval = Math.round(this.interval * this.easeFactor);
      }

      this.repetition++;

      // Adjust ease factor
      this.easeFactor = this.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

      if (this.easeFactor < 1.3) {
        this.easeFactor = 1.3;
      }
    }

    this.nextReview = Date.now() + (this.interval * 24 * 60 * 60 * 1000);
  }

  isDueForReview() {
    return Date.now() >= this.nextReview;
  }
}

// Usage
const card = new SpacedRepetitionCard('moroni-10-4', 'And when ye shall receive...');

// User reviews the verse
// quality 4 = remembered with slight hesitation
card.review(4);

// Check when to review next
console.log(`Next review in ${card.interval} days`);
```

### 5.2 Memory Techniques

**Type-Based Practice Modes:**

1. **Fill in the Blank**
```jsx
function FillInBlankPractice({ verse }) {
  const words = verse.text.split(' ');
  const blankedIndices = selectRandomIndices(words, 3);  // Blank 3 words

  return (
    <div>
      {words.map((word, i) =>
        blankedIndices.includes(i) ?
          <input key={i} className="blank" /> :
          <span key={i}>{word} </span>
      )}
    </div>
  );
}
```

2. **First Letter Hints**
```jsx
function FirstLetterHints({ verse }) {
  const words = verse.text.split(' ');

  return (
    <div>
      {words.map((word, i) =>
        <span key={i}>{word[0]}___  </span>
      )}
    </div>
  );
}
```

3. **Word Scramble**
```jsx
function WordScramble({ verse }) {
  const words = verse.text.split(' ');
  const scrambled = shuffle(words);

  const [userOrder, setUserOrder] = useState([]);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="words">
        {scrambled.map((word, i) => (
          <Draggable key={i} draggableId={word} index={i}>
            <WordChip>{word}</WordChip>
          </Draggable>
        ))}
      </Droppable>
    </DragDropContext>
  );
}
```

4. **Memory Grids**
```
Visual grid showing first letter of each word:

A | w | y | s | r | t | t | o
y | s | r | t | i | i | t | i
i | g | t | b | t | H | G | a
a | i | w | m | u | y | k
```

### 5.3 Progress Tracking

```javascript
class MemoryProgress {
  constructor(userId) {
    this.userId = userId;
    this.versesMemorized = new Set();
    this.reviewHistory = [];
  }

  addVerse(verseId) {
    this.versesMemorized.add(verseId);
  }

  recordReview(verseId, quality, timeSpent) {
    this.reviewHistory.push({
      verseId,
      quality,
      timeSpent,
      timestamp: Date.now()
    });
  }

  getStreak() {
    // Calculate consecutive days with reviews
    const today = new Date().setHours(0, 0, 0, 0);
    const sortedDays = this.getUniqueDays().sort().reverse();

    let streak = 0;
    let expectedDay = today;

    for (const day of sortedDays) {
      if (day === expectedDay) {
        streak++;
        expectedDay -= 24 * 60 * 60 * 1000;  // Previous day
      } else {
        break;
      }
    }

    return streak;
  }

  getUniqueDays() {
    return [...new Set(this.reviewHistory.map(r =>
      new Date(r.timestamp).setHours(0, 0, 0, 0)
    ))];
  }

  getStats() {
    return {
      totalVersesMemorized: this.versesMemorized.size,
      totalReviews: this.reviewHistory.length,
      currentStreak: this.getStreak(),
      averageQuality: this.calculateAverageQuality(),
      reviewsThisWeek: this.getReviewsInRange(7)
    };
  }
}
```

---

## 6. User Experience Patterns

### 6.1 Highlighting & Annotation

**Best Practices:**

1. **Touch-Optimized Selection**
```jsx
// Use native text selection when possible
<Text selectable onSelectionChange={handleSelection}>
  {verseText}
</Text>

// On selection, show context menu
function handleSelection(event) {
  const { selection } = event.nativeEvent;
  showContextMenu({
    position: getSelectionPosition(),
    options: ['Highlight', 'Note', 'Share', 'Copy']
  });
}
```

2. **Color Picker UI**
```jsx
// Horizontal color swipe (mobile pattern)
<ScrollView horizontal>
  <ColorOption color="yellow" />
  <ColorOption color="green" />
  <ColorOption color="blue" />
  <ColorOption color="pink" />
  <ColorOption color="orange" />
</ScrollView>

// Tap-hold for more colors
<ColorOption
  color="yellow"
  onLongPress={() => showCustomColorPicker()}
/>
```

3. **Persistent Highlight Rendering**
```jsx
function VerseWithHighlights({ verse, highlights }) {
  const segments = splitTextByHighlights(verse.text, highlights);

  return (
    <Text>
      {segments.map((segment, i) =>
        segment.highlighted ? (
          <Text key={i} style={{ backgroundColor: segment.color }}>
            {segment.text}
          </Text>
        ) : (
          <Text key={i}>{segment.text}</Text>
        )
      )}
    </Text>
  );
}
```

4. **Edit Existing Highlights**
```jsx
// Tap on highlight to edit
<TouchableOpacity onPress={() => editHighlight(highlight)}>
  <HighlightedText highlight={highlight} />
</TouchableOpacity>

function editHighlight(highlight) {
  showOptions({
    'Change Color': () => showColorPicker(highlight),
    'Add Note': () => openNoteEditor(highlight),
    'Remove Highlight': () => deleteHighlight(highlight)
  });
}
```

### 6.2 Note-Taking Interface

**Quick Note Entry:**
```jsx
function QuickNoteModal({ verse, onSave }) {
  const [note, setNote] = useState('');
  const [tags, setTags] = useState([]);

  return (
    <Modal>
      <VersePreview>{verse.text}</VersePreview>

      <TextInput
        placeholder="What stands out to you?"
        value={note}
        onChange={setNote}
        multiline
        autoFocus
      />

      <TagSelector
        selectedTags={tags}
        onTagsChange={setTags}
        suggestions={['faith', 'prayer', 'testimony', 'love']}
      />

      <Button onPress={() => onSave({ note, tags, verse })}>
        Save Note
      </Button>
    </Modal>
  );
}
```

**Advanced Note Templates:**
```jsx
const noteTemplates = {
  'Personal Application': {
    prompts: [
      'How does this apply to my life?',
      'What will I do differently?',
      'Who can I share this with?'
    ]
  },
  'Question': {
    prompts: [
      'What question do I have?',
      'Where might I find the answer?'
      ]
  },
  'Insight': {
    prompts: [
      'What did I learn?',
      'What connections do I see?',
      'Why is this significant?'
    ]
  },
  'Testimony': {
    prompts: [
      'How does this strengthen my testimony?',
      'What do I know to be true?'
    ]
  }
};
```

### 6.3 Reading Experience

**Typography Settings:**
```jsx
function ReadingSettings() {
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Serif');
  const [lineHeight, setLineHeight] = useState(1.5);
  const [theme, setTheme] = useState('light');

  return (
    <SettingsPanel>
      <Slider
        label="Font Size"
        min={12}
        max={24}
        value={fontSize}
        onChange={setFontSize}
      />

      <Select
        label="Font"
        options={['Serif', 'Sans-Serif', 'Dyslexic-Friendly']}
        value={fontFamily}
        onChange={setFontFamily}
      />

      <Slider
        label="Line Spacing"
        min={1.0}
        max={2.0}
        step={0.1}
        value={lineHeight}
        onChange={setLineHeight}
      />

      <ThemePicker
        options={['light', 'sepia', 'dark']}
        value={theme}
        onChange={setTheme}
      />
    </SettingsPanel>
  );
}
```

**Smooth Scrolling & Navigation:**
```jsx
// Auto-scroll to verse (e.g., from search results)
function scrollToVerse(verseId) {
  const element = document.getElementById(verseId);
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });

  // Highlight briefly
  element.classList.add('flash-highlight');
  setTimeout(() => {
    element.classList.remove('flash-highlight');
  }, 2000);
}

// Pagination vs continuous scroll
// Option 1: Chapter-based pagination
<Pager currentPage={chapter} onPageChange={setChapter} />

// Option 2: Infinite scroll (all chapters)
<VirtualizedList
  data={allVerses}
  renderItem={VerseComponent}
  onEndReached={loadNextChapter}
/>
```

---

## 7. Accessibility Implementation

### 7.1 WCAG Compliance

**Level AA Requirements:**

1. **Text Contrast**
```jsx
// Minimum contrast ratios
const colorPalette = {
  light: {
    background: '#FFFFFF',
    text: '#000000',        // 21:1 ratio
    secondary: '#595959',   // 7:1 ratio
    link: '#0066CC'         // 8:1 ratio
  },
  dark: {
    background: '#1E1E1E',  // Not pure black
    text: '#E0E0E0',        // 15:1 ratio
    secondary: '#B0B0B0',   // 9:1 ratio
    link: '#66B3FF'         // 7:1 ratio
  }
};

// Utility function to check contrast
function checkContrast(foreground, background) {
  const ratio = calculateContrastRatio(foreground, background);
  return ratio >= 4.5;  // WCAG AA for normal text
}
```

2. **Semantic HTML/Accessible Components**
```jsx
// Bad
<div onClick={openVerse}>1 Nephi 3:7</div>

// Good
<button
  onClick={openVerse}
  aria-label="Open 1 Nephi chapter 3 verse 7"
>
  1 Nephi 3:7
</button>

// Screen reader announcements
function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.textContent = message;
  document.body.appendChild(announcement);

  setTimeout(() => announcement.remove(), 1000);
}

// Example usage
function saveNote(note) {
  // ... save logic
  announceToScreenReader('Note saved successfully');
}
```

3. **Keyboard Navigation**
```jsx
// Ensure all interactive elements are keyboard accessible
<VerseList>
  {verses.map((verse, index) => (
    <VerseItem
      key={verse.id}
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          openVerse(verse);
        }
      }}
      aria-label={`${verse.reference}: ${verse.text}`}
    >
      {verse.text}
    </VerseItem>
  ))}
</VerseList>

// Skip links for screen readers
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
```

4. **Alternative Text**
```jsx
// All images need alt text
<Image
  source={require('./map-of-lehi-journey.png')}
  alt="Map showing Lehi's journey from Jerusalem through the wilderness to the promised land"
/>

// Decorative images
<Image
  source={require('./decorative-border.png')}
  alt=""  // Empty alt for decorative images
  aria-hidden="true"
/>
```

### 7.2 Screen Reader Optimization

**Proper ARIA Labels:**
```jsx
<nav aria-label="Book of Mormon navigation">
  <button
    aria-label="Previous chapter"
    aria-controls="scripture-content"
  >
    ←
  </button>

  <select
    aria-label="Select book and chapter"
    onChange={navigateToChapter}
  >
    <option>1 Nephi 1</option>
    <option>1 Nephi 2</option>
  </select>

  <button
    aria-label="Next chapter"
    aria-controls="scripture-content"
  >
    →
  </button>
</nav>

<main id="scripture-content" role="main">
  <h1>{currentChapter.title}</h1>
  <p>{currentChapter.summary}</p>

  {verses.map(verse => (
    <p key={verse.id}>
      <span className="verse-number" aria-label={`Verse ${verse.number}`}>
        {verse.number}
      </span>
      {verse.text}
    </p>
  ))}
</main>
```

**Focus Management:**
```jsx
function ChapterNavigation() {
  const contentRef = useRef();

  function goToNextChapter() {
    loadNextChapter();
    // Move focus to first verse
    contentRef.current.focus();
    announceToScreenReader('Chapter loaded');
  }

  return (
    <>
      <button onClick={goToNextChapter}>Next Chapter</button>
      <div ref={contentRef} tabIndex={-1}>
        {/* Chapter content */}
      </div>
    </>
  );
}
```

### 7.3 Vision Accessibility

**Font Size Scaling:**
```jsx
// Respect system font size settings
import { PixelRatio } from 'react-native';

const fontScale = PixelRatio.getFontScale();

const styles = {
  text: {
    fontSize: 16 * fontScale,  // Scales with system settings
  },
  heading: {
    fontSize: 24 * fontScale
  }
};

// Allow manual override
function TextSizeControl() {
  const [userScale, setUserScale] = useState(1.0);

  return (
    <>
      <Slider
        min={0.5}
        max={2.0}
        value={userScale}
        onChange={setUserScale}
        aria-label="Adjust text size"
      />
      <Text style={{ fontSize: 16 * userScale * fontScale }}>
        {scriptureText}
      </Text>
    </>
  );
}
```

**Color Blindness Support:**
```jsx
// Avoid relying solely on color
// Bad: Only color indicates highlight type
<Highlight color="red" />  // What does red mean?

// Good: Color + icon/pattern
<Highlight
  color="red"
  icon="question"
  label="Question"
  pattern="dotted"
/>

// Provide alternative color schemes
const highlightSchemes = {
  standard: ['yellow', 'green', 'blue', 'pink'],
  colorblind: ['yellow', 'blue', 'orange', 'purple'],  // Distinguishable
  high_contrast: ['#FFFF00', '#00FFFF', '#FF00FF', '#00FF00']
};
```

---

## 8. Data Privacy & Security

### 8.1 GDPR Compliance

**Key Requirements:**

1. **Consent Management**
```jsx
function ConsentManager() {
  const [consents, setConsents] = useState({
    necessary: true,  // Always required
    analytics: false,
    personalization: false,
    marketing: false
  });

  return (
    <ConsentDialog>
      <h2>Privacy Settings</h2>

      <ConsentOption
        name="Necessary Cookies"
        checked={true}
        disabled={true}
        description="Required for app functionality"
      />

      <ConsentOption
        name="Analytics"
        checked={consents.analytics}
        onChange={(v) => setConsents({...consents, analytics: v})}
        description="Help us improve the app with usage data"
      />

      <ConsentOption
        name="Personalization"
        checked={consents.personalization}
        onChange={(v) => setConsents({...consents, personalization: v})}
        description="Personalized study recommendations"
      />

      <Button onClick={() => saveConsents(consents)}>
        Save Preferences
      </Button>
    </ConsentDialog>
  );
}
```

2. **Data Minimization**
```javascript
// Only collect what's needed
const userProfile = {
  userId: generateUUID(),  // Anonymous ID
  // DON'T collect: name, email, location unless needed

  preferences: {
    fontSize: 16,
    theme: 'light',
    language: 'en'
  },

  studyData: {
    highlights: [],
    notes: [],
    progress: {}
  }
  // No sensitive data in analytics events
};
```

3. **Right to Deletion**
```javascript
async function deleteUserData(userId) {
  // Remove all user data
  await database.deleteHighlights(userId);
  await database.deleteNotes(userId);
  await database.deleteProgress(userId);
  await database.deletePreferences(userId);
  await analytics.deleteUserProfile(userId);

  // Anonymize any remaining logs
  await logs.anonymizeUser(userId);

  return {
    success: true,
    message: 'All your data has been deleted'
  };
}
```

4. **Data Export (Portability)**
```javascript
async function exportUserData(userId) {
  const data = {
    exportDate: new Date().toISOString(),
    user: userId,
    highlights: await database.getHighlights(userId),
    notes: await database.getNotes(userId),
    progress: await database.getProgress(userId),
    preferences: await database.getPreferences(userId)
  };

  // Return as JSON
  return JSON.stringify(data, null, 2);
}
```

### 8.2 Encryption

**Data at Rest:**
```javascript
// Mobile: Use platform encryption
// iOS: Data Protection API (automatic with keychain)
// Android: EncryptedSharedPreferences

import EncryptedStorage from 'react-native-encrypted-storage';

async function saveSecureData(key, value) {
  await EncryptedStorage.setItem(key, JSON.stringify(value));
}

async function getSecureData(key) {
  const encrypted = await EncryptedStorage.getItem(key);
  return JSON.parse(encrypted);
}
```

**Data in Transit:**
```javascript
// Always use HTTPS/TLS 1.3
const apiClient = axios.create({
  baseURL: 'https://api.gospellibrary.org',  // HTTPS only
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Certificate pinning for extra security
import { create } from 'axios';
import { Agent } from 'https';

const httpsAgent = new Agent({
  ca: fs.readFileSync('./ca-certificate.pem'),  // Pin certificate
  rejectUnauthorized: true
});

const secureClient = create({
  httpsAgent,
  baseURL: 'https://api.gospellibrary.org'
});
```

**Sensitive Fields:**
```javascript
// Encrypt sensitive notes (e.g., personal reflections)
import CryptoJS from 'crypto-js';

function encryptNote(noteText, userKey) {
  return CryptoJS.AES.encrypt(noteText, userKey).toString();
}

function decryptNote(encryptedNote, userKey) {
  const bytes = CryptoJS.AES.decrypt(encryptedNote, userKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// User key derived from device + user password
const userKey = deriveKey(deviceId, userPassword);
```

### 8.3 Privacy-by-Design

**Anonymous Analytics:**
```javascript
// Use hashed IDs instead of real user IDs
function hashUserId(userId) {
  return CryptoJS.SHA256(userId + SALT).toString();
}

// Track events without PII
analytics.track({
  event: 'verse_highlighted',
  properties: {
    userId: hashUserId(userId),  // Hashed
    book: 'book-of-mormon',
    // NO verse content, NO note content
    timestamp: Date.now()
  }
});
```

**Local-First Processing:**
```javascript
// Process data locally instead of sending to server
function generatePersonalizedRecommendations(userHistory) {
  // Run recommendation algorithm locally
  const recommendations = localMLModel.predict(userHistory);

  // No need to send user history to server
  return recommendations;
}
```

---

## 9. Analytics & Metrics

### 9.1 Privacy-Friendly Analytics

**Matomo (Recommended for Religious Apps):**

```javascript
// Self-hosted, GDPR compliant
import MatomoTracker from '@datapunt/matomo-tracker-js';

const tracker = new MatomoTracker({
  urlBase: 'https://analytics.gospellibrary.org',
  siteId: 1,
  heartBeat: {  // Track time on page
    active: true,
    seconds: 15
  },
  configurations: {
    disableCookies: true,  // Cookieless tracking
    setSecureCookie: true,
    setRequestMethod: 'POST'
  }
});

// Track page view
tracker.trackPageView({
  documentTitle: '1 Nephi 3',
  href: '/scriptures/bom/1-ne/3'
});

// Track custom events
tracker.trackEvent({
  category: 'scripture-study',
  action: 'highlight-created',
  name: 'yellow',
  value: 1
});

// Track study time
let studyStartTime = Date.now();

function trackStudySession() {
  const duration = (Date.now() - studyStartTime) / 1000;
  tracker.trackEvent({
    category: 'engagement',
    action: 'study-session',
    value: Math.round(duration)
  });
}
```

**Plausible (Simple, Privacy-Focused):**

```javascript
// Lightweight, no cookies
import Plausible from 'plausible-tracker';

const plausible = Plausible({
  domain: 'gospellibrary.org',
  apiHost: 'https://plausible.io'  // Or self-hosted
});

// Automatic pageview tracking
plausible.enableAutoPageviews();

// Custom events
plausible.trackEvent('Highlight Created');

plausible.trackEvent('Note Saved', {
  props: {
    hasTag: true,
    wordCount: 50
  }
});

// Goals
plausible.trackEvent('Completed Book', {
  props: {
    book: '1-nephi'
  }
});
```

### 9.2 Key Metrics to Track

**Engagement Metrics:**
```javascript
const engagementMetrics = {
  // Daily Active Users
  dau: countUniqueUsers(today),

  // Session duration
  averageSessionTime: calculateAverage(allSessionDurations),

  // Study frequency
  studySessions: {
    daily: countSessions('1d'),
    weekly: countSessions('7d'),
    monthly: countSessions('30d')
  },

  // Retention
  retention: {
    day1: percentReturningUsers(1),
    day7: percentReturningUsers(7),
    day30: percentReturningUsers(30)
  },

  // Content consumption
  versesRead: countVersesRead(),
  chaptersCompleted: countChaptersCompleted(),
  booksCompleted: countBooksCompleted(),

  // Feature usage
  highlightsCreated: countHighlights(),
  notesCreated: countNotes(),
  searchesPerformed: countSearches(),
  sharesPerformed: countShares()
};
```

**Feature Adoption:**
```javascript
// Track which features users discover and use
const featureAdoption = {
  highlighting: {
    discovered: 5000,  // Saw the feature
    tried: 3500,       // Used at least once
    active: 2000       // Used in last 30 days
  },

  ai_chat: {
    discovered: 2000,
    tried: 1200,
    active: 800
  },

  memory_cards: {
    discovered: 1000,
    tried: 600,
    active: 400
  }
};

// Calculate adoption funnel
function calculateAdoptionFunnel(feature) {
  return {
    awareness: feature.discovered / totalUsers,
    trial: feature.tried / feature.discovered,
    activation: feature.active / feature.tried
  };
}
```

---

## 10. Testing Strategy

### 10.1 Testing Pyramid

**Distribution:**
- 70-80% Unit Tests (fast, isolated)
- 15-20% Integration Tests (component interactions)
- 5-10% E2E Tests (full user flows)

### 10.2 Unit Testing

**Example: Testing Scripture Search**
```javascript
// searchEngine.test.js
import { searchScriptures } from './searchEngine';

describe('Scripture Search', () => {
  test('finds exact verse by reference', () => {
    const results = searchScriptures('1 Nephi 3:7');
    expect(results[0].reference).toBe('1 Nephi 3:7');
    expect(results[0].text).toContain('I will go and do');
  });

  test('finds verses by keyword', () => {
    const results = searchScriptures('faith seed');
    expect(results).toContainEqual(
      expect.objectContaining({
        reference: 'Alma 32:28',
        text: expect.stringContaining('seed')
      })
    );
  });

  test('supports boolean operators', () => {
    const results = searchScriptures('faith AND works');
    results.forEach(result => {
      expect(result.text.toLowerCase()).toMatch(/faith.*works|works.*faith/);
    });
  });

  test('handles typos with fuzzy matching', () => {
    const results = searchScriptures('nphie');  // Typo of "nephi"
    expect(results.length).toBeGreaterThan(0);
  });
});
```

**Example: Testing Spaced Repetition**
```javascript
// spacedRepetition.test.js
import { SpacedRepetitionCard } from './spacedRepetition';

describe('Spaced Repetition Algorithm', () => {
  let card;

  beforeEach(() => {
    card = new SpacedRepetitionCard('moroni-10-4', 'And when ye shall...');
  });

  test('initial interval is 1 day', () => {
    expect(card.interval).toBe(1);
    expect(card.repetition).toBe(0);
  });

  test('successful review increases interval', () => {
    card.review(4);  // Good quality
    expect(card.interval).toBeGreaterThan(1);
    expect(card.repetition).toBe(1);
  });

  test('failed review resets progress', () => {
    card.review(5);  // Perfect
    card.review(5);  // Perfect
    expect(card.repetition).toBe(2);

    card.review(1);  // Fail
    expect(card.repetition).toBe(0);
    expect(card.interval).toBe(1);
  });

  test('ease factor adjusts based on performance', () => {
    const initialEase = card.easeFactor;
    card.review(5);  // Perfect
    expect(card.easeFactor).toBeGreaterThan(initialEase);

    card.review(3);  // Barely passed
    expect(card.easeFactor).toBeLessThan(initialEase);
  });
});
```

### 10.3 Integration Testing

**Example: Testing Sync Workflow**
```javascript
// sync.integration.test.js
import { createLocalDB, createRemoteDB, syncDatabases } from './sync';

describe('Database Sync Integration', () => {
  let localDB, remoteDB;

  beforeEach(async () => {
    localDB = await createLocalDB();
    remoteDB = await createRemoteDB();
  });

  afterEach(async () => {
    await localDB.destroy();
    await remoteDB.destroy();
  });

  test('syncs new highlights to remote', async () => {
    // Create highlight locally
    await localDB.put({
      _id: 'highlight_123',
      type: 'highlight',
      verse: '1 Nephi 3:7',
      color: 'yellow'
    });

    // Sync
    await syncDatabases(localDB, remoteDB);

    // Verify on remote
    const remoteDoc = await remoteDB.get('highlight_123');
    expect(remoteDoc.verse).toBe('1 Nephi 3:7');
  });

  test('resolves conflicts with last-write-wins', async () => {
    // Create document in both DBs
    const docId = 'note_456';
    await localDB.put({ _id: docId, text: 'Local version', timestamp: 100 });
    await remoteDB.put({ _id: docId, text: 'Remote version', timestamp: 200 });

    // Sync
    await syncDatabases(localDB, remoteDB);

    // Should keep newer version
    const doc = await localDB.get(docId);
    expect(doc.text).toBe('Remote version');
  });
});
```

### 10.4 End-to-End Testing

**Example: Detox (React Native)**
```javascript
// e2e/studyFlow.test.js
describe('Scripture Study Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should allow user to read and highlight a verse', async () => {
    // Navigate to 1 Nephi 3
    await element(by.id('book-selector')).tap();
    await element(by.text('1 Nephi')).tap();
    await element(by.text('Chapter 3')).tap();

    // Find verse 7
    await waitFor(element(by.id('verse-3-7')))
      .toBeVisible()
      .withTimeout(2000);

    // Long press to select
    await element(by.id('verse-3-7')).longPress();

    // Tap highlight button
    await element(by.id('highlight-button')).tap();

    // Choose color
    await element(by.id('color-yellow')).tap();

    // Verify highlight applied
    await expect(element(by.id('verse-3-7-highlight'))).toBeVisible();
  });

  it('should save notes offline and sync later', async () => {
    // Disable network
    await device.setNetworkConnection('offline');

    // Create note
    await element(by.id('verse-3-7')).tap();
    await element(by.id('add-note-button')).tap();
    await element(by.id('note-input')).typeText('This verse inspires me');
    await element(by.id('save-note')).tap();

    // Verify saved locally
    await expect(element(by.text('This verse inspires me'))).toBeVisible();

    // Enable network
    await device.setNetworkConnection('online');

    // Wait for sync
    await waitFor(element(by.id('sync-indicator')))
      .not.toBeVisible()
      .withTimeout(5000);

    // Verify synced (check on another device/simulator)
    // ... verification logic
  });
});
```

**Example: Maestro (Simpler YAML Approach)**
```yaml
# study_flow.yaml
appId: org.gospellibrary.app
---
- launchApp
- tapOn: "1 Nephi"
- tapOn: "Chapter 3"
- scrollUntilVisible:
    element: "Verse 7"
- longPressOn: "Verse 7"
- tapOn: "Highlight"
- tapOn:
    id: "color-yellow"
- assertVisible: "Highlighted verse 7"
```

---

## 11. Internationalization

### 11.1 Implementation Strategy

**Using i18next (React/React Native):**

```javascript
// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const resources = {
  en: {
    translation: {
      "search_placeholder": "Search scriptures...",
      "highlight_verb": "Highlight",
      "note_verb": "Add Note",
      "verse_count": "{{count}} verse",
      "verse_count_plural": "{{count}} verses",
      "study_time": "Study time: {{minutes}} min"
    }
  },
  es: {
    translation: {
      "search_placeholder": "Buscar escrituras...",
      "highlight_verb": "Resaltar",
      "note_verb": "Agregar Nota",
      "verse_count": "{{count}} versículo",
      "verse_count_plural": "{{count}} versículos",
      "study_time": "Tiempo de estudio: {{minutes}} min"
    }
  },
  pt: {
    translation: {
      "search_placeholder": "Pesquisar escrituras...",
      "highlight_verb": "Destacar",
      "note_verb": "Adicionar Nota",
      "verse_count": "{{count}} versículo",
      "verse_count_plural": "{{count}} versículos",
      "study_time": "Tempo de estudo: {{minutes}} min"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',  // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Load saved language preference
AsyncStorage.getItem('language').then(lang => {
  if (lang) i18n.changeLanguage(lang);
});

export default i18n;
```

**Usage in Components:**
```jsx
import { useTranslation } from 'react-i18next';

function SearchBar() {
  const { t } = useTranslation();

  return (
    <TextInput
      placeholder={t('search_placeholder')}
    />
  );
}

function VerseActions() {
  const { t } = useTranslation();

  return (
    <>
      <Button>{t('highlight_verb')}</Button>
      <Button>{t('note_verb')}</Button>
    </>
  );
}

function SearchResults({ count }) {
  const { t } = useTranslation();

  return (
    <Text>{t('verse_count', { count })}</Text>
    // Automatically uses plural form when count !== 1
  );
}
```

### 11.2 Scripture Text Localization

**Multilingual Scripture Storage:**
```javascript
// Database schema
const scriptureSchema = {
  verseId: 'string (primary key)',
  book: 'string',
  chapter: 'number',
  verse: 'number',
  translations: {
    en: 'And it came to pass...',
    es: 'Y aconteció que...',
    pt: 'E aconteceu que...',
    fr: 'Et il arriva que...',
    // ... more languages
  }
};

// Fetch verse in user's language
function getVerse(verseId, language = 'en') {
  const verse = database.getVerse(verseId);
  return verse.translations[language] || verse.translations['en'];
}
```

**RTL Language Support:**
```jsx
import { I18nManager } from 'react-native';

// Detect RTL languages (Arabic, Hebrew)
const isRTL = ['ar', 'he'].includes(currentLanguage);

if (isRTL !== I18nManager.isRTL) {
  I18nManager.forceRTL(isRTL);
  // Requires app restart
  RNRestart.Restart();
}

// Apply RTL styles
const styles = StyleSheet.create({
  container: {
    flexDirection: isRTL ? 'row-reverse' : 'row'
  },
  text: {
    textAlign: isRTL ? 'right' : 'left',
    writingDirection: isRTL ? 'rtl' : 'ltr'
  }
});
```

### 11.3 Date & Number Formatting

```javascript
import { format } from 'date-fns';
import { enUS, es, ptBR } from 'date-fns/locale';

const locales = { en: enUS, es, pt: ptBR };

function formatDate(date, language) {
  return format(date, 'PPP', { locale: locales[language] });
}

// Numbers
function formatNumber(number, language) {
  return new Intl.NumberFormat(language).format(number);
}

// Usage
formatDate(new Date(), 'es');  // "15 de noviembre de 2025"
formatNumber(1234.56, 'pt');   // "1.234,56"
```

---

## 12. CI/CD & Deployment

### 12.1 Fastlane Setup

**Fastfile (iOS):**
```ruby
# fastlane/Fastfile
default_platform(:ios)

platform :ios do
  desc "Run tests"
  lane :test do
    run_tests(
      scheme: "GospelLibrary",
      devices: ["iPhone 15 Pro"]
    )
  end

  desc "Build for testing"
  lane :build do
    build_app(
      scheme: "GospelLibrary",
      export_method: "development"
    )
  end

  desc "Deploy to TestFlight"
  lane :beta do
    # Increment build number
    increment_build_number

    # Build app
    build_app(
      scheme: "GospelLibrary",
      export_method: "app-store"
    )

    # Upload to TestFlight
    upload_to_testflight(
      skip_waiting_for_build_processing: true
    )

    # Notify team
    slack(
      message: "New beta build uploaded to TestFlight!",
      channel: "#mobile-dev"
    )
  end

  desc "Deploy to App Store"
  lane :release do
    # Run tests first
    test

    # Capture screenshots
    capture_screenshots

    # Build
    build_app(
      scheme: "GospelLibrary",
      export_method: "app-store"
    )

    # Upload
    upload_to_app_store(
      submit_for_review: false,  # Manual submission
      automatic_release: false
    )
  end
end
```

**Fastfile (Android):**
```ruby
platform :android do
  desc "Run tests"
  lane :test do
    gradle(task: "test")
  end

  desc "Build APK"
  lane :build do
    gradle(
      task: "assemble",
      build_type: "Release"
    )
  end

  desc "Deploy to Play Store (Internal Testing)"
  lane :internal do
    gradle(task: "bundle")

    upload_to_play_store(
      track: "internal",
      aab: "app/build/outputs/bundle/release/app-release.aab"
    )
  end

  desc "Deploy to Play Store (Production)"
  lane :release do
    # Run tests
    test

    # Build bundle
    gradle(
      task: "bundle",
      build_type: "Release"
    )

    # Upload
    upload_to_play_store(
      track: "production",
      aab: "app/build/outputs/bundle/release/app-release.aab",
      rollout: "0.1"  # Staged rollout (10%)
    )
  end
end
```

### 12.2 GitHub Actions Workflow

```yaml
# .github/workflows/ios.yml
name: iOS CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: macos-latest

    steps:
    - uses: actions/checkout@v3

    - name: Set up Ruby
      uses: ruby/setup-ruby@v1
      with:
        ruby-version: 3.0
        bundler-cache: true

    - name: Install dependencies
      run: |
        cd ios
        pod install

    - name: Run tests
      run: bundle exec fastlane test

    - name: Upload test results
      uses: actions/upload-artifact@v3
      with:
        name: test-results
        path: fastlane/test_output

  beta:
    runs-on: macos-latest
    needs: test
    if: github.ref == 'refs/heads/develop'

    steps:
    - uses: actions/checkout@v3

    - name: Set up Ruby
      uses: ruby/setup-ruby@v1
      with:
        ruby-version: 3.0

    - name: Deploy to TestFlight
      env:
        FASTLANE_USER: ${{ secrets.APPLE_ID }}
        FASTLANE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
        MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
      run: bundle exec fastlane beta
```

```yaml
# .github/workflows/android.yml
name: Android CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Set up JDK
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'

    - name: Run tests
      run: ./gradlew test

    - name: Upload test reports
      uses: actions/upload-artifact@v3
      with:
        name: test-reports
        path: app/build/reports/tests

  internal:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/develop'

    steps:
    - uses: actions/checkout@v3

    - name: Set up Ruby
      uses: ruby/setup-ruby@v1
      with:
        ruby-version: 3.0

    - name: Deploy to Play Store Internal
      env:
        GOOGLE_PLAY_JSON_KEY: ${{ secrets.GOOGLE_PLAY_JSON_KEY }}
      run: bundle exec fastlane internal
```

---

## 13. Performance Optimization

### 13.1 CDN for Static Assets

**Setup with CloudFlare:**
```javascript
// Serve scripture images, icons, fonts from CDN
const CDN_URL = 'https://cdn.gospellibrary.org';

const assetUrls = {
  icons: `${CDN_URL}/icons/`,
  images: `${CDN_URL}/images/`,
  fonts: `${CDN_URL}/fonts/`
};

// Preload critical assets
<link rel="preload" href={`${assetUrls.fonts}serif.woff2`} as="font" />
<link rel="preload" href={`${assetUrls.icons}highlight.svg`} as="image" />

// Lazy load images
<img
  src={`${assetUrls.images}map-lehis-journey.jpg`}
  loading="lazy"
  alt="Map of Lehi's journey"
/>
```

**Caching Strategy:**
```
Cache-Control Headers:
├── Scripture text: max-age=31536000 (1 year, immutable)
├── Icons/fonts: max-age=31536000 (1 year, immutable)
├── Images: max-age=604800 (1 week)
├── HTML: no-cache (always revalidate)
└── API responses: max-age=300 (5 minutes)
```

### 13.2 Text Rendering Optimization

**Virtual Scrolling (React Native):**
```jsx
import { FlatList } from 'react-native';

function ChapterView({ verses }) {
  const renderVerse = ({ item }) => (
    <VerseComponent verse={item} />
  );

  return (
    <FlatList
      data={verses}
      renderItem={renderVerse}
      keyExtractor={item => item.id}
      windowSize={5}  // Only render 5 screens worth
      maxToRenderPerBatch={10}  // Render 10 items at a time
      updateCellsBatchingPeriod={50}  // Batch updates
      removeClippedSubviews={true}  // Unmount off-screen views
      initialNumToRender={15}  // Initial batch
    />
  );
}
```

**Memoization:**
```jsx
import React, { memo } from 'react';

// Only re-render if verse or highlights change
const VerseComponent = memo(({ verse, highlights }) => {
  return (
    <View>
      <Text>{verse.number}</Text>
      <HighlightedText text={verse.text} highlights={highlights} />
    </View>
  );
}, (prevProps, nextProps) => {
  return prevProps.verse.id === nextProps.verse.id &&
         prevProps.highlights.length === nextProps.highlights.length;
});
```

### 13.3 Database Query Optimization

**Indexing:**
```sql
-- Index frequently queried fields
CREATE INDEX idx_verses_reference ON verses(book, chapter, verse);
CREATE INDEX idx_highlights_user ON highlights(userId);
CREATE INDEX idx_notes_verse ON notes(verseId);
CREATE INDEX idx_notes_created ON notes(createdAt DESC);

-- Full-text search index
CREATE VIRTUAL TABLE verses_fts USING fts5(
  verseId UNINDEXED,
  text,
  content=verses
);
```

**Query Optimization:**
```javascript
// Bad: Load all verses then filter in JS
const allVerses = await db.getAllVerses();
const filtered = allVerses.filter(v => v.book === '1-nephi');

// Good: Query directly
const filtered = await db.query(
  'SELECT * FROM verses WHERE book = ? ORDER BY chapter, verse',
  ['1-nephi']
);

// Use prepared statements
const stmt = db.prepare('SELECT * FROM verses WHERE book = ? AND chapter = ?');
const verses = stmt.all('1-nephi', 3);
```

---

## 14. Engagement Mechanisms

### 14.1 Push Notifications

**Implementation (React Native):**
```javascript
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

// Configure
PushNotification.configure({
  onNotification: function (notification) {
    if (notification.userInteraction) {
      // User tapped notification
      navigateToVerse(notification.data.verseId);
    }

    notification.finish(PushNotificationIOS.FetchResult.NoData);
  },

  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  popInitialNotification: true,
  requestPermissions: true,
});

// Schedule daily reminder
function scheduleStudyReminder(timeOfDay) {
  PushNotification.localNotificationSchedule({
    channelId: 'study-reminders',
    title: 'Time for scripture study',
    message: 'Continue your journey through the Book of Mormon',
    date: new Date(timeOfDay),  // User's preferred time
    repeatType: 'day',
    allowWhileIdle: true,
    data: { screen: 'continue-reading' }
  });
}

// Verse of the day
function sendVerseOfTheDay(verse) {
  PushNotification.localNotification({
    channelId: 'verse-of-day',
    title: 'Verse of the Day',
    message: `${verse.reference}: ${verse.text.substring(0, 100)}...`,
    bigText: verse.text,
    data: { verseId: verse.id }
  });
}

// Milestone celebrations
function celebrateMilestone(milestone) {
  PushNotification.localNotification({
    channelId: 'milestones',
    title: '🎉 Congratulations!',
    message: milestone.message,
    // e.g., "You've completed 1 Nephi!"
  });
}
```

**Best Practices:**
- Ask permission at the right time (not on first app open)
- Personalize based on user study habits
- Respect quiet hours
- Allow users to customize frequency
- Make notifications actionable

### 14.2 Streaks & Achievements

```javascript
class StreakManager {
  constructor(userId) {
    this.userId = userId;
    this.activities = [];  // Load from DB
  }

  async recordStudyActivity() {
    const today = this.getToday();

    // Check if already studied today
    if (!this.hasStudiedToday()) {
      this.activities.push({
        date: today,
        timestamp: Date.now()
      });

      await this.save();

      // Check for new achievements
      this.checkAchievements();
    }
  }

  getCurrentStreak() {
    const sortedDays = this.activities
      .map(a => a.date)
      .sort()
      .reverse();

    let streak = 0;
    let expectedDate = this.getToday();

    for (const date of sortedDays) {
      if (date === expectedDate) {
        streak++;
        expectedDate = this.getPreviousDay(expectedDate);
      } else {
        break;
      }
    }

    return streak;
  }

  checkAchievements() {
    const streak = this.getCurrentStreak();
    const totalDays = this.activities.length;

    const achievements = [];

    // Streak milestones
    if (streak === 7) achievements.push('week-warrior');
    if (streak === 30) achievements.push('month-master');
    if (streak === 100) achievements.push('centurion');

    // Total days
    if (totalDays === 100) achievements.push('hundred-days');
    if (totalDays === 365) achievements.push('year-scholar');

    // Award new achievements
    achievements.forEach(id => this.awardAchievement(id));
  }

  awardAchievement(achievementId) {
    const achievement = ACHIEVEMENTS[achievementId];

    // Save to profile
    userProfile.addAchievement(achievementId);

    // Show celebration
    showAchievementModal(achievement);

    // Send notification
    PushNotification.localNotification({
      title: '🏆 Achievement Unlocked!',
      message: achievement.name,
      bigText: achievement.description
    });
  }
}

const ACHIEVEMENTS = {
  'week-warrior': {
    name: 'Week Warrior',
    description: 'Studied for 7 days in a row',
    icon: '🔥',
    points: 50
  },
  'month-master': {
    name: 'Month Master',
    description: 'Studied for 30 days in a row',
    icon: '⭐',
    points: 200
  },
  'first-highlight': {
    name: 'First Light',
    description: 'Created your first highlight',
    icon: '✨',
    points: 10
  },
  'note-taker': {
    name: 'Note Taker',
    description: 'Created 10 notes',
    icon: '📝',
    points: 30
  },
  'book-complete': {
    name: 'Book Complete',
    description: 'Finished reading an entire book',
    icon: '📖',
    points: 100
  }
};
```

---

## Conclusion

This technical implementation guide provides a comprehensive foundation for building modern Book of Mormon study tools. The recommendations are based on:

- **Current market leaders**: YouVersion, Logos, Blue Letter Bible
- **Emerging technologies**: AI/ML, vector search, RAG chatbots
- **Best practices**: Offline-first, privacy-by-design, accessibility
- **User engagement**: Spaced repetition, gamification, personalization
- **Modern tooling**: React Native/Flutter, CI/CD, testing automation

### Key Takeaways

1. **AI Integration is Essential**: Semantic search and RAG chatbots are table stakes in 2025
2. **Offline-First is Critical**: Users expect full functionality without network
3. **Privacy Matters**: GDPR compliance and user trust are paramount for religious apps
4. **Engagement Drives Retention**: Streaks, achievements, and push notifications boost DAU
5. **Accessibility is Non-Negotiable**: WCAG compliance ensures inclusivity
6. **Testing Prevents Regressions**: Comprehensive testing pyramid saves debugging time
7. **Performance Optimization**: Virtual scrolling, CDN, and indexing enable smooth UX

### Implementation Priorities

**Phase 1 (Foundation):**
- Offline-first architecture with sync
- Enhanced search (semantic + keyword)
- Core UX (highlighting, notes, reading settings)
- Basic analytics

**Phase 2 (Intelligence):**
- AI-powered cross-reference suggestions
- Semantic search with vector database
- Personalized recommendations
- Study statistics dashboard

**Phase 3 (Engagement):**
- RAG chatbot for Q&A
- Spaced repetition memory system
- Achievement system
- Push notifications

**Phase 4 (Advanced):**
- Network visualization
- Community features
- Voice integration
- AR/VR experiences (future consideration)

---

*Document compiled: November 19, 2025*
*Technical implementation research for Book of Mormon study tools*
*Based on analysis of market leaders and emerging technologies*
