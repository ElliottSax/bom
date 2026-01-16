/**
 * Courses Hook
 *
 * Manage Book of Mormon courses with lessons, quizzes, and progress tracking
 * Seminary/Institute style structured learning
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COURSE_PROGRESS_KEY = '@bom_course_progress';
const QUIZ_RESULTS_KEY = '@bom_quiz_results';

// Types
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type LessonType = 'reading' | 'study' | 'quiz' | 'reflection';
export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank';

export interface ScriptureReference {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  scriptureRef?: ScriptureReference;
}

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  description: string;
  duration: number; // minutes
  objectives: string[];
  scriptures: ScriptureReference[];
  content: string; // markdown content
  keyTerms?: { term: string; definition: string }[];
  discussionQuestions?: string[];
  quiz?: QuizQuestion[];
  applicationChallenge?: string;
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  level: CourseLevel;
  duration: string; // e.g., "4 weeks"
  lessonsCount: number;
  icon: string;
  color: string;
  lessons: Lesson[];
  prerequisites?: string[];
  outcomes: string[];
}

export interface LessonProgress {
  lessonId: string;
  courseId: string;
  completed: boolean;
  completedAt?: number;
  timeSpent: number; // seconds
  quizScore?: number;
  quizAttempts?: number;
}

export interface CourseProgress {
  courseId: string;
  startedAt: number;
  lessonsCompleted: number;
  totalLessons: number;
  lastLessonId?: string;
  completedAt?: number;
  certificateEarned: boolean;
}

export interface QuizResult {
  lessonId: string;
  courseId: string;
  score: number;
  totalQuestions: number;
  answers: { questionId: string; correct: boolean }[];
  completedAt: number;
}

// Sample Course Data
const COURSES: Course[] = [
  {
    id: 'intro-bom',
    title: 'Introduction to the Book of Mormon',
    subtitle: 'Understanding the Keystone of Our Religion',
    description: 'A foundational course exploring the origins, purpose, and core teachings of the Book of Mormon. Perfect for new readers or those wanting a deeper understanding.',
    level: 'beginner',
    duration: '2 weeks',
    lessonsCount: 10,
    icon: '📖',
    color: '#4CAF50',
    outcomes: [
      'Understand the historical context of the Book of Mormon',
      'Identify the major prophets and their teachings',
      'Recognize key doctrines and themes',
      'Develop a personal study habit',
    ],
    lessons: [
      {
        id: 'intro-1',
        title: 'What is the Book of Mormon?',
        type: 'study',
        description: 'Discover the origins and purpose of this sacred record.',
        duration: 20,
        objectives: [
          'Learn about the Book of Mormon\'s origins',
          'Understand its purpose as a witness of Christ',
          'Recognize its relationship to the Bible',
        ],
        scriptures: [
          { book: 'Title Page', chapter: 1, verseStart: 1 },
          { book: 'I Nephi', chapter: 1, verseStart: 1, verseEnd: 4 },
        ],
        content: `# What is the Book of Mormon?

The Book of Mormon is a volume of holy scripture comparable to the Bible. It is a record of God's dealings with ancient inhabitants of the Americas and contains the fulness of the everlasting gospel.

## Key Points

1. **Ancient Record**: Written by prophets who lived on the American continent from about 600 BC to 421 AD
2. **Witness of Christ**: Its primary purpose is to testify that Jesus is the Christ
3. **Companion to the Bible**: Works alongside the Bible to establish truth
4. **Translated by Joseph Smith**: Through the gift and power of God

## The Title Page

The Book of Mormon's title page was written by Moroni, the last prophet to write in the record. It states the book's purpose clearly.`,
        keyTerms: [
          { term: 'Nephites', definition: 'Descendants of Nephi who generally followed God\'s commandments' },
          { term: 'Lamanites', definition: 'Descendants of Laman who often opposed the Nephites' },
          { term: 'Plates', definition: 'Metal sheets on which ancient prophets wrote their records' },
        ],
        discussionQuestions: [
          'Why do you think another witness of Christ is important?',
          'How might the Book of Mormon complement your Bible study?',
        ],
        applicationChallenge: 'Read the Title Page of the Book of Mormon and write down what you learn about its purpose.',
      },
      {
        id: 'intro-2',
        title: 'Nephi\'s Vision and Call',
        type: 'reading',
        description: 'Study the beginning of Nephi\'s remarkable journey.',
        duration: 25,
        objectives: [
          'Understand the setting of the Book of Mormon',
          'Learn about Lehi\'s family',
          'Recognize patterns of prophetic calling',
        ],
        scriptures: [
          { book: 'I Nephi', chapter: 1, verseStart: 1, verseEnd: 20 },
        ],
        content: `# Nephi's Vision and Call

The Book of Mormon begins with Nephi, a young man living in Jerusalem around 600 BC. His father Lehi receives a vision warning of Jerusalem's destruction.

## The Setting

- **Time**: About 600 BC, during the reign of King Zedekiah
- **Place**: Jerusalem, before its destruction by Babylon
- **Context**: A time of wickedness and false prophets

## Lehi's Vision

Lehi sees a pillar of fire and receives a book from heaven. He learns that Jerusalem will be destroyed, and is commanded to take his family into the wilderness.

## Nephi's Response

Despite being "exceedingly young," Nephi shows great faith:
- He believes his father's words
- He prays for understanding
- He commits to keeping God's commandments`,
        keyTerms: [
          { term: 'Vision', definition: 'A revelation from God, often showing future events' },
          { term: 'Prophet', definition: 'One called by God to speak His words' },
        ],
        discussionQuestions: [
          'What qualities does Nephi demonstrate even at a young age?',
          'How does Nephi\'s response differ from his brothers?',
        ],
      },
      {
        id: 'intro-quiz-1',
        title: 'Quiz: The Beginning',
        type: 'quiz',
        description: 'Test your knowledge of the Book of Mormon\'s introduction.',
        duration: 10,
        objectives: ['Review key concepts from lessons 1-2'],
        scriptures: [],
        content: 'Complete this quiz to test your understanding of the first two lessons.',
        quiz: [
          {
            id: 'q1',
            type: 'multiple_choice',
            question: 'Who wrote the Title Page of the Book of Mormon?',
            options: ['Nephi', 'Mormon', 'Moroni', 'Joseph Smith'],
            correctAnswer: 2,
            explanation: 'Moroni, the last prophet to write in the Book of Mormon, wrote the Title Page.',
          },
          {
            id: 'q2',
            type: 'true_false',
            question: 'The Book of Mormon record begins around 600 BC in Jerusalem.',
            options: ['True', 'False'],
            correctAnswer: 0,
            explanation: 'The Book of Mormon begins with Lehi\'s family in Jerusalem around 600 BC.',
          },
          {
            id: 'q3',
            type: 'multiple_choice',
            question: 'What did Lehi receive in his vision that told him about Jerusalem?',
            options: ['A sword', 'A book', 'A stone', 'A staff'],
            correctAnswer: 1,
            explanation: 'Lehi received a book from heaven that told him of Jerusalem\'s coming destruction.',
          },
          {
            id: 'q4',
            type: 'multiple_choice',
            question: 'What is the primary purpose of the Book of Mormon?',
            options: [
              'To record history',
              'To testify of Christ',
              'To replace the Bible',
              'To teach geography',
            ],
            correctAnswer: 1,
            explanation: 'The Title Page states the book\'s purpose is to convince all that Jesus is the Christ.',
          },
        ],
      },
      {
        id: 'intro-3',
        title: 'The Brass Plates',
        type: 'study',
        description: 'Learn about the importance of scriptures to Nephi\'s family.',
        duration: 20,
        objectives: [
          'Understand why the brass plates were important',
          'Learn about obedience through Nephi\'s example',
          'Recognize the value of scriptures',
        ],
        scriptures: [
          { book: 'I Nephi', chapter: 3, verseStart: 1, verseEnd: 7 },
          { book: 'I Nephi', chapter: 4, verseStart: 1, verseEnd: 18 },
        ],
        content: `# The Brass Plates

Lehi sends his sons back to Jerusalem to obtain the brass plates - a record of their ancestors and the scriptures.

## Why Were the Brass Plates Important?

1. **Preserved their language**: Without them, their language would have been corrupted
2. **Contained the scriptures**: The law of Moses and writings of prophets
3. **Recorded their genealogy**: Their family history back to Joseph of Egypt

## Nephi's Famous Declaration

When commanded to return for the plates, Nephi responds with one of the most quoted verses:

> "I will go and do the things which the Lord hath commanded, for I know that the Lord giveth no commandments unto the children of men, save he shall prepare a way for them that they may accomplish the thing which he commandeth them." (1 Nephi 3:7)

## Lessons Learned

- Obedience brings blessings
- The Lord prepares the way
- Scriptures are worth great sacrifice`,
        keyTerms: [
          { term: 'Brass Plates', definition: 'A record containing scriptures and genealogy, kept by Laban in Jerusalem' },
          { term: 'Laban', definition: 'A wealthy man in Jerusalem who possessed the brass plates' },
        ],
        discussionQuestions: [
          'Why do you think God required such effort to obtain the scriptures?',
          'How does Nephi\'s attitude differ from his brothers throughout this experience?',
        ],
        applicationChallenge: 'Memorize 1 Nephi 3:7 this week.',
      },
      {
        id: 'intro-4',
        title: 'Lehi\'s Dream',
        type: 'study',
        description: 'Explore one of the most symbolic visions in scripture.',
        duration: 30,
        objectives: [
          'Understand the symbols in Lehi\'s dream',
          'Apply the dream\'s message personally',
          'Recognize the importance of holding to the word of God',
        ],
        scriptures: [
          { book: 'I Nephi', chapter: 8, verseStart: 1, verseEnd: 38 },
        ],
        content: `# Lehi's Dream: The Tree of Life

One of the most detailed and symbolic visions in all scripture, Lehi's dream teaches us about the path to eternal life.

## Key Symbols

| Symbol | Meaning |
|--------|---------|
| Tree of Life | The love of God |
| Fruit | Eternal life, joy |
| Iron Rod | The word of God |
| Mist of Darkness | Temptations of the devil |
| Great and Spacious Building | Pride of the world |
| River of Water | Depths of hell |
| Strait and Narrow Path | Path to eternal life |

## Groups in the Vision

1. **Those who start but let go**: Lost in mists of darkness
2. **Those who hold the rod and partake**: But then fall away due to mocking
3. **Those who hold fast and stay faithful**: Reach the tree and remain
4. **Those in the building**: Mock those at the tree

## Application

The dream teaches us that:
- We must hold to the word of God continuously
- Peer pressure and pride are real dangers
- The reward is worth the journey`,
        keyTerms: [
          { term: 'Iron Rod', definition: 'Represents the word of God - scriptures and prophetic guidance' },
          { term: 'Tree of Life', definition: 'Represents the love of God and eternal life' },
        ],
        discussionQuestions: [
          'Which group in the vision do you most identify with? Why?',
          'What are modern "mists of darkness" that could cause people to lose their way?',
          'How can we better "hold to the rod" in our daily lives?',
        ],
        applicationChallenge: 'Read scriptures daily this week as a way of "holding to the rod."',
      },
      {
        id: 'intro-5',
        title: 'Nephi\'s Vision of Christ',
        type: 'reading',
        description: 'See how Nephi received his own witness of the Savior.',
        duration: 25,
        objectives: [
          'Understand Nephi\'s expanded vision',
          'See prophecies of Christ\'s life',
          'Recognize the Book of Mormon\'s testimony of Christ',
        ],
        scriptures: [
          { book: 'I Nephi', chapter: 11, verseStart: 1, verseEnd: 36 },
        ],
        content: `# Nephi's Vision of Christ

After hearing his father's dream, Nephi desires to see and understand the same things. He is taken in vision and shown much more.

## What Nephi Saw

1. **The Virgin Mary**: "A virgin, most beautiful and fair"
2. **Christ's Birth**: The condescension of God
3. **Christ's Ministry**: Healing the sick, teaching the people
4. **Christ's Crucifixion**: "Lifted up upon the cross and slain"
5. **The Twelve Apostles**: Following the Lamb of God

## The Meaning of the Tree

An angel asks Nephi, "Knowest thou the meaning of the tree?"

Nephi responds that it represents the love of God. The angel confirms: "Yea, it is the love of God, which sheddeth itself abroad in the hearts of the children of men; wherefore, it is the most desirable above all things."

## Key Insight

The tree and its fruit represent God's love - made manifest through Jesus Christ and His Atonement.`,
        discussionQuestions: [
          'Why do you think Nephi was shown the life of Christ 600 years before it happened?',
          'How does knowing Christ\'s love change your perspective on Lehi\'s dream?',
        ],
      },
      {
        id: 'intro-quiz-2',
        title: 'Quiz: Dreams and Visions',
        type: 'quiz',
        description: 'Test your understanding of Lehi\'s dream and Nephi\'s vision.',
        duration: 10,
        objectives: ['Review lessons 4-5'],
        scriptures: [],
        content: 'Complete this quiz about the visions in 1 Nephi.',
        quiz: [
          {
            id: 'q5',
            type: 'multiple_choice',
            question: 'What does the iron rod represent in Lehi\'s dream?',
            options: ['Strength', 'The word of God', 'Wealth', 'The path'],
            correctAnswer: 1,
            explanation: 'The iron rod represents the word of God - the scriptures and prophetic guidance.',
          },
          {
            id: 'q6',
            type: 'multiple_choice',
            question: 'What does the Tree of Life represent?',
            options: ['Heaven', 'The church', 'The love of God', 'Immortality'],
            correctAnswer: 2,
            explanation: 'The angel told Nephi the tree represents the love of God.',
          },
          {
            id: 'q7',
            type: 'true_false',
            question: 'The great and spacious building represents the pride of the world.',
            options: ['True', 'False'],
            correctAnswer: 0,
            explanation: 'The building represents worldly pride and the mockery of those who follow God.',
          },
          {
            id: 'q8',
            type: 'multiple_choice',
            question: 'What did Nephi see that helped explain the meaning of the tree?',
            options: [
              'A garden',
              'The life and mission of Jesus Christ',
              'The creation of the world',
              'The final judgment',
            ],
            correctAnswer: 1,
            explanation: 'Nephi saw Christ\'s birth, ministry, and crucifixion - showing that the tree represents God\'s love manifest through Christ.',
          },
        ],
      },
      {
        id: 'intro-6',
        title: 'Crossing the Ocean',
        type: 'study',
        description: 'Learn about Nephi\'s faith in building the ship.',
        duration: 20,
        objectives: [
          'Understand the challenges of the journey',
          'See examples of faith and obedience',
          'Recognize the importance of following divine guidance',
        ],
        scriptures: [
          { book: 'I Nephi', chapter: 17, verseStart: 7, verseEnd: 16 },
          { book: 'I Nephi', chapter: 18, verseStart: 1, verseEnd: 6 },
        ],
        content: `# Crossing the Ocean

After years in the wilderness, Nephi's family reaches the sea. The Lord commands Nephi to build a ship - but not like ships men build.

## Nephi's Shipbuilding

- Commanded by God to build a ship
- Brothers mock: "Our brother is a fool"
- Nephi responds with faith and power
- Built according to God's instructions, not man's

## The Voyage

The journey across the ocean brings both trials and miracles:
- Laman and Lemuel rebel and bind Nephi
- The Liahona stops working
- A great storm arises
- Nephi is freed and the storm calms
- They arrive safely in the promised land

## Lessons of Faith

1. God's ways are higher than man's ways
2. Obedience brings miracles
3. Rebellion brings consequences
4. God delivers the faithful`,
        discussionQuestions: [
          'What do you think it took for Nephi to start building a ship when he had no training?',
          'How do the consequences of rebellion on the ship apply to us today?',
        ],
      },
      {
        id: 'intro-7',
        title: 'The Promised Land',
        type: 'reading',
        description: 'Discover what happened after arriving in the Americas.',
        duration: 20,
        objectives: [
          'Learn about the early days in the promised land',
          'Understand the division between Nephites and Lamanites',
          'See Nephi\'s continuing faith and leadership',
        ],
        scriptures: [
          { book: 'II Nephi', chapter: 5, verseStart: 1, verseEnd: 18 },
        ],
        content: `# The Promised Land

After arriving in the Americas, Nephi's family begins a new chapter - but old conflicts continue.

## Arrival and Settlement

- They plant seeds brought from Jerusalem
- They discover animals and ore in the land
- They prosper in their new home

## The Division

Despite reaching the promised land, Laman and Lemuel's anger grows. God warns Nephi to flee:

- Nephi takes all who will follow
- They travel many days into the wilderness
- They establish a new settlement (the land of Nephi)
- The people call themselves Nephites

## Nephi's Leadership

In the new settlement, Nephi:
- Teaches his people to work and build
- Constructs a temple like Solomon's
- Makes weapons for defense
- Records their history on plates

## The Beginning of Two Nations

This division marks the beginning of the Nephite and Lamanite peoples whose history comprises the rest of the Book of Mormon.`,
        discussionQuestions: [
          'Why do you think conflicts from the old world followed them to the new?',
          'What does Nephi\'s immediate building of a temple tell us about his priorities?',
        ],
      },
      {
        id: 'intro-8',
        title: 'Nephi\'s Testimony',
        type: 'reflection',
        description: 'Conclude with Nephi\'s powerful witness of Christ.',
        duration: 15,
        objectives: [
          'Understand Nephi\'s final witness',
          'Recognize the doctrine of Christ',
          'Apply Nephi\'s teachings personally',
        ],
        scriptures: [
          { book: 'II Nephi', chapter: 31, verseStart: 1, verseEnd: 21 },
          { book: 'II Nephi', chapter: 33, verseStart: 10, verseEnd: 15 },
        ],
        content: `# Nephi's Testimony

As Nephi concludes his record, he leaves a powerful testimony of Jesus Christ and the gospel.

## The Doctrine of Christ

In 2 Nephi 31, Nephi outlines what he calls "the doctrine of Christ":

1. **Faith** in Jesus Christ
2. **Repentance** from sins
3. **Baptism** by water
4. **Gift of the Holy Ghost** (baptism by fire)
5. **Endure to the End** in following Christ

## Nephi's Final Witness

"And now, my beloved brethren, I know by this that unless a man shall endure to the end, in following the example of the Son of the living God, he cannot be saved."

## His Personal Testimony

Nephi concludes his record with these words:

"I glory in plainness; I glory in truth; I glory in my Jesus, for he hath redeemed my soul from hell."

## Reflection

As you complete this introductory course, consider:
- What has the Book of Mormon taught you about Jesus Christ?
- How can you apply Nephi's teachings in your life?
- What commitment will you make for continued study?`,
        discussionQuestions: [
          'What stands out to you most about Nephi\'s testimony?',
          'How does the "doctrine of Christ" provide a clear path to follow?',
          'What commitment will you make based on this course?',
        ],
        applicationChallenge: 'Write your own testimony of what you\'ve learned from studying Nephi\'s record.',
      },
      {
        id: 'intro-final-quiz',
        title: 'Final Assessment',
        type: 'quiz',
        description: 'Comprehensive quiz covering the entire course.',
        duration: 15,
        objectives: ['Demonstrate mastery of course content'],
        scriptures: [],
        content: 'Complete this final assessment to earn your course completion certificate.',
        quiz: [
          {
            id: 'fq1',
            type: 'multiple_choice',
            question: 'What year (approximately) does the Book of Mormon record begin?',
            options: ['100 BC', '600 BC', '33 AD', '421 AD'],
            correctAnswer: 1,
          },
          {
            id: 'fq2',
            type: 'multiple_choice',
            question: 'Why did Lehi\'s family leave Jerusalem?',
            options: [
              'To find treasure',
              'God warned them of Jerusalem\'s destruction',
              'They were exiled',
              'To start a new business',
            ],
            correctAnswer: 1,
          },
          {
            id: 'fq3',
            type: 'multiple_choice',
            question: 'What did the brass plates contain?',
            options: [
              'Gold and silver',
              'Scriptures and genealogy',
              'Maps of the promised land',
              'Instructions for building ships',
            ],
            correctAnswer: 1,
          },
          {
            id: 'fq4',
            type: 'fill_blank',
            question: 'Complete Nephi\'s declaration: "I will go and ___"',
            correctAnswer: 'do',
            explanation: '"I will go and do the things which the Lord hath commanded" - 1 Nephi 3:7',
          },
          {
            id: 'fq5',
            type: 'multiple_choice',
            question: 'What does the fruit of the Tree of Life represent?',
            options: ['Wisdom', 'Wealth', 'Eternal life and God\'s love', 'Power'],
            correctAnswer: 2,
          },
          {
            id: 'fq6',
            type: 'true_false',
            question: 'Nephi built the ship according to the common methods of his day.',
            options: ['True', 'False'],
            correctAnswer: 1,
            explanation: 'Nephi built the ship according to God\'s instructions, not the manner of men.',
          },
          {
            id: 'fq7',
            type: 'multiple_choice',
            question: 'What is the first principle in the Doctrine of Christ?',
            options: ['Baptism', 'Repentance', 'Faith in Jesus Christ', 'Service'],
            correctAnswer: 2,
          },
          {
            id: 'fq8',
            type: 'multiple_choice',
            question: 'What did Nephi build shortly after settling in the promised land?',
            options: ['A palace', 'A temple', 'A fort', 'A library'],
            correctAnswer: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'prophets-bom',
    title: 'Prophets of the Book of Mormon',
    subtitle: 'Leaders, Teachers, and Examples',
    description: 'A deep dive into the major prophets of the Book of Mormon - their lives, teachings, and examples of faith. More lessons coming soon!',
    level: 'intermediate',
    duration: '4 weeks',
    lessonsCount: 1,
    icon: '👤',
    color: '#2196F3',
    outcomes: [
      'Know the major prophets and their contributions',
      'Understand prophetic patterns and callings',
      'Apply prophetic teachings to modern life',
      'Strengthen personal testimony through prophetic examples',
    ],
    lessons: [
      {
        id: 'prophets-1',
        title: 'Introduction: What is a Prophet?',
        type: 'study',
        description: 'Understand the role and calling of prophets in scripture.',
        duration: 20,
        objectives: [
          'Define what a prophet is',
          'Understand how prophets are called',
          'Recognize prophetic patterns',
        ],
        scriptures: [
          { book: 'Jacob', chapter: 4, verseStart: 4, verseEnd: 6 },
        ],
        content: `# What is a Prophet?

A prophet is one who is called by God to speak His words, teach His truths, and testify of Jesus Christ.

## Prophetic Roles

1. **Seer**: One who sees things not visible to natural eyes
2. **Revelator**: One who receives and shares God's revelation
3. **Testifier**: One who bears witness of Christ
4. **Leader**: One who guides God's people

## Prophets in the Book of Mormon

The Book of Mormon contains the writings and stories of many prophets spanning 1,000 years. Each adds unique insights and teachings while maintaining the central message: Jesus is the Christ.`,
        discussionQuestions: [
          'Why does God use prophets to communicate with His children?',
          'What qualities do you notice in prophetic callings?',
        ],
      },
    ],
  },
  {
    id: 'christ-bom',
    title: 'Christ in the Book of Mormon',
    subtitle: 'Another Testament of Jesus Christ',
    description: 'Discover the many ways the Book of Mormon testifies of Jesus Christ - prophecies, types, and His personal ministry. More lessons coming soon!',
    level: 'intermediate',
    duration: '3 weeks',
    lessonsCount: 1,
    icon: '✝️',
    color: '#9C27B0',
    outcomes: [
      'Recognize prophecies of Christ throughout the Book of Mormon',
      'Understand types and symbols pointing to Christ',
      'Study Christ\'s ministry among the Nephites',
      'Deepen personal testimony of Jesus Christ',
    ],
    lessons: [
      {
        id: 'christ-1',
        title: 'Prophecies of Christ\'s Coming',
        type: 'study',
        description: 'Explore how Book of Mormon prophets foretold Christ\'s birth and mission.',
        duration: 25,
        objectives: [
          'Identify major prophecies of Christ',
          'Understand the clarity of Book of Mormon prophecy',
          'See how prophecy strengthens faith',
        ],
        scriptures: [
          { book: 'I Nephi', chapter: 11, verseStart: 13, verseEnd: 21 },
          { book: 'Mosiah', chapter: 3, verseStart: 5, verseEnd: 12 },
        ],
        content: `# Prophecies of Christ's Coming

The Book of Mormon contains remarkably clear and detailed prophecies about Jesus Christ - often more specific than Old Testament prophecies.

## Examples of Specific Prophecies

1. **His Mother's Name**: Mary (Mosiah 3:8)
2. **His Ministry**: Healing the sick, raising the dead
3. **His Suffering**: More than man can suffer
4. **His Atonement**: Taking upon himself the sins of the world

## Why Such Clarity?

Book of Mormon prophets were given clear revelation because:
- They needed hope during difficult times
- They taught people who had no access to the Bible
- God wanted to leave a powerful second witness for our day`,
        discussionQuestions: [
          'Why do you think Book of Mormon prophecies are so detailed?',
          'How does specific prophecy affect your faith?',
        ],
      },
    ],
  },
];

export function useCourses() {
  const [progress, setProgress] = useState<Map<string, CourseProgress>>(new Map());
  const [lessonProgress, setLessonProgress] = useState<Map<string, LessonProgress>>(new Map());
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Load progress on mount
  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const [progressJson, quizJson] = await Promise.all([
        AsyncStorage.getItem(COURSE_PROGRESS_KEY),
        AsyncStorage.getItem(QUIZ_RESULTS_KEY),
      ]);

      if (progressJson) {
        const data = JSON.parse(progressJson);
        setProgress(new Map(Object.entries(data.courses || {})));
        setLessonProgress(new Map(Object.entries(data.lessons || {})));
      }

      if (quizJson) {
        setQuizResults(JSON.parse(quizJson));
      }
    } catch (err) {
      console.error('Failed to load course progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async (
    newProgress: Map<string, CourseProgress>,
    newLessonProgress: Map<string, LessonProgress>
  ) => {
    try {
      await AsyncStorage.setItem(
        COURSE_PROGRESS_KEY,
        JSON.stringify({
          courses: Object.fromEntries(newProgress),
          lessons: Object.fromEntries(newLessonProgress),
        })
      );
      setProgress(newProgress);
      setLessonProgress(newLessonProgress);
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  };

  const saveQuizResults = async (results: QuizResult[]) => {
    try {
      await AsyncStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify(results));
      setQuizResults(results);
    } catch (err) {
      console.error('Failed to save quiz results:', err);
    }
  };

  // Get all courses
  const courses = COURSES;

  // Get course by ID
  const getCourse = useCallback((courseId: string): Course | undefined => {
    return COURSES.find((c) => c.id === courseId);
  }, []);

  // Get lesson by ID
  const getLesson = useCallback((courseId: string, lessonId: string): Lesson | undefined => {
    const course = getCourse(courseId);
    return course?.lessons.find((l) => l.id === lessonId);
  }, [getCourse]);

  // Start a course
  const startCourse = useCallback(
    async (courseId: string) => {
      const course = getCourse(courseId);
      if (!course) return;

      const newProgress = new Map(progress);
      newProgress.set(courseId, {
        courseId,
        startedAt: Date.now(),
        lessonsCompleted: 0,
        totalLessons: course.lessons.length,
        certificateEarned: false,
      });

      await saveProgress(newProgress, lessonProgress);
    },
    [progress, lessonProgress, getCourse]
  );

  // Complete a lesson
  const completeLesson = useCallback(
    async (courseId: string, lessonId: string, timeSpent: number, quizScore?: number) => {
      const course = getCourse(courseId);
      if (!course) return;

      const key = `${courseId}-${lessonId}`;
      const newLessonProgress = new Map(lessonProgress);
      newLessonProgress.set(key, {
        lessonId,
        courseId,
        completed: true,
        completedAt: Date.now(),
        timeSpent,
        quizScore,
      });

      // Update course progress
      const newProgress = new Map(progress);
      const courseProgress = newProgress.get(courseId) || {
        courseId,
        startedAt: Date.now(),
        lessonsCompleted: 0,
        totalLessons: course.lessons.length,
        certificateEarned: false,
      };

      const completedCount = course.lessons.filter((l) =>
        newLessonProgress.get(`${courseId}-${l.id}`)?.completed
      ).length;

      courseProgress.lessonsCompleted = completedCount;
      courseProgress.lastLessonId = lessonId;

      // Check if course is complete
      if (completedCount === course.lessons.length) {
        courseProgress.completedAt = Date.now();
        courseProgress.certificateEarned = true;
      }

      newProgress.set(courseId, courseProgress);
      await saveProgress(newProgress, newLessonProgress);
    },
    [progress, lessonProgress, getCourse]
  );

  // Submit quiz results
  const submitQuiz = useCallback(
    async (
      courseId: string,
      lessonId: string,
      answers: { questionId: string; correct: boolean }[]
    ): Promise<QuizResult> => {
      const score = answers.filter((a) => a.correct).length;
      const result: QuizResult = {
        lessonId,
        courseId,
        score,
        totalQuestions: answers.length,
        answers,
        completedAt: Date.now(),
      };

      const newResults = [...quizResults, result];
      await saveQuizResults(newResults);

      // Complete the lesson if passed (>= 70%)
      if (score / answers.length >= 0.7) {
        await completeLesson(courseId, lessonId, 0, score);
      }

      return result;
    },
    [quizResults, completeLesson]
  );

  // Get course progress
  const getCourseProgress = useCallback(
    (courseId: string): CourseProgress | undefined => {
      return progress.get(courseId);
    },
    [progress]
  );

  // Get lesson progress
  const getLessonProgress = useCallback(
    (courseId: string, lessonId: string): LessonProgress | undefined => {
      return lessonProgress.get(`${courseId}-${lessonId}`);
    },
    [lessonProgress]
  );

  // Get next lesson
  const getNextLesson = useCallback(
    (courseId: string): Lesson | undefined => {
      const course = getCourse(courseId);
      if (!course) return undefined;

      for (const lesson of course.lessons) {
        if (!lessonProgress.get(`${courseId}-${lesson.id}`)?.completed) {
          return lesson;
        }
      }
      return undefined;
    },
    [getCourse, lessonProgress]
  );

  // Get courses in progress
  const coursesInProgress = useMemo(() => {
    return Array.from(progress.values()).filter(
      (p) => p.lessonsCompleted > 0 && !p.completedAt
    );
  }, [progress]);

  // Get completed courses
  const completedCourses = useMemo(() => {
    return Array.from(progress.values()).filter((p) => p.completedAt);
  }, [progress]);

  // Format duration
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Get level color
  const getLevelColor = (level: CourseLevel): string => {
    switch (level) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FF9800';
      case 'advanced':
        return '#F44336';
    }
  };

  return {
    courses,
    loading,
    getCourse,
    getLesson,
    startCourse,
    completeLesson,
    submitQuiz,
    getCourseProgress,
    getLessonProgress,
    getNextLesson,
    coursesInProgress,
    completedCourses,
    formatDuration,
    getLevelColor,
  };
}
