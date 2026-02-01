/**
 * Community of Christ Course Quizzes
 *
 * Quiz data for CoC study courses
 */

import type { QuizData } from '../components/Quiz';

export const COC_QUIZZES: Record<string, QuizData> = {
  'intro-coc-1-quiz': {
    id: 'intro-coc-1-quiz',
    lessonId: 'intro-coc-1',
    title: 'Origins and History Quiz',
    description: 'Test your knowledge of the 1844 succession crisis and 1860 reorganization',
    passingScore: 70,
    questions: [
      {
        id: 'q1',
        question: 'When did Joseph Smith Jr. die?',
        options: [
          'June 27, 1844',
          'June 27, 1845',
          'April 6, 1860',
          'August 12, 1844',
        ],
        correctAnswer: 0,
        explanation:
          'Joseph Smith Jr. was martyred on June 27, 1844, in Carthage Jail, Illinois, along with his brother Hyrum.',
      },
      {
        id: 'q2',
        question:
          'Who led the majority of Latter Day Saints to Utah after the succession crisis?',
        options: [
          'Sidney Rigdon',
          'Joseph Smith III',
          'Brigham Young',
          'James Strang',
        ],
        correctAnswer: 2,
        explanation:
          'Brigham Young, as President of the Quorum of the Twelve Apostles, led approximately 70% of the membership to Utah, forming what became the LDS Church.',
      },
      {
        id: 'q3',
        question:
          'When did Joseph Smith III accept leadership of the Reorganized Church?',
        options: [
          'Immediately after his father\'s death in 1844',
          'April 6, 1860 at the Amboy Conference',
          'In 1856 after James Strang\'s death',
          'In 1866 when Emma gave the JST manuscript',
        ],
        correctAnswer: 1,
        explanation:
          'Joseph Smith III resisted leadership for 16 years after his father\'s death, finally accepting at the Amboy Conference on April 6, 1860, the 30th anniversary of the church\'s founding.',
      },
      {
        id: 'q4',
        question: 'What was Emma Smith\'s position on polygamy?',
        options: [
          'She practiced it herself',
          'She accepted it reluctantly',
          'She explicitly and publicly rejected it',
          'She had no opinion on it',
        ],
        correctAnswer: 2,
        explanation:
          'Emma Smith explicitly and publicly rejected polygamy teaching and refused to go to Utah with Brigham Young partly because of this disagreement.',
      },
      {
        id: 'q5',
        question:
          'What important manuscript did Emma Smith preserve and give to the RLDS Church?',
        options: [
          'The original Book of Mormon manuscript',
          'The Joseph Smith Translation (Inspired Version) of the Bible',
          'Joseph Smith\'s personal diary',
          'The Doctrine and Covenants manuscript',
        ],
        correctAnswer: 1,
        explanation:
          'Emma Smith preserved the Joseph Smith Translation manuscript (Inspired Version of the Bible) and gave it to the RLDS Church in 1866. It was first published in 1867.',
      },
    ],
  },

  'intro-coc-2-quiz': {
    id: 'intro-coc-2-quiz',
    lessonId: 'intro-coc-2',
    title: 'Core Beliefs Quiz',
    description: 'Test your knowledge of Community of Christ theology and sacraments',
    passingScore: 70,
    questions: [
      {
        id: 'q1',
        question: 'How many sacraments does Community of Christ recognize?',
        options: ['Two', 'Five', 'Seven', 'Eight'],
        correctAnswer: 3,
        explanation:
          'Community of Christ recognizes eight sacraments: Baptism, Confirmation, Lord\'s Supper, Marriage, Blessing of Children, Administration to the Sick, Ordination, and Evangelist Blessing.',
      },
      {
        id: 'q2',
        question:
          'Which CoC theology differs most from LDS Church teaching?',
        options: [
          'The nature of God (Trinity vs. separate beings)',
          'The priesthood structure',
          'The Book of Mormon authenticity',
          'The importance of prayer',
        ],
        correctAnswer: 0,
        explanation:
          'Community of Christ affirms a Trinitarian view of God (one God in three persons), while the LDS Church teaches that the Father, Son, and Holy Ghost are three separate, distinct beings.',
      },
      {
        id: 'q3',
        question: 'When did Community of Christ begin ordaining women to priesthood?',
        options: ['1944', '1960', '1984-1985', '2001'],
        correctAnswer: 2,
        explanation:
          'Section 156, received by Wallace B. Smith in 1984 and accepted by World Conference in 1984, authorized women\'s ordination. The first women were ordained in 1985.',
      },
      {
        id: 'q4',
        question:
          'What is Community of Christ\'s position on continuing revelation?',
        options: [
          'Revelation ended with Joseph Smith Jr.',
          'Revelation is ongoing through the Prophet-President',
          'Revelation only comes through scripture study',
          'Revelation is no longer needed',
        ],
        correctAnswer: 1,
        explanation:
          'Continuing revelation is one of the Enduring Principles of Community of Christ. The Prophet-President continues to receive revelation for the church, as evidenced by D&C sections 114-165.',
      },
      {
        id: 'q5',
        question:
          'Which of the following is NOT one of Community of Christ\'s enduring principles?',
        options: [
          'Worth of all persons',
          'Sacredness of creation',
          'Gathering to Zion in Missouri',
          'Continuing revelation',
        ],
        correctAnswer: 2,
        explanation:
          'The eight Enduring Principles (Section 163, 2007) are: Jesus Christ as Living Word, Worth of all persons, All are called, Responsible choices, Continuing revelation, Sacredness of creation, Blessings of community, and Mission initiatives. "Gathering to Zion" is not included.',
      },
    ],
  },

  'intro-coc-3-quiz': {
    id: 'intro-coc-3-quiz',
    lessonId: 'intro-coc-3',
    title: 'Scripture Differences Quiz',
    description: 'Test your knowledge of CoC scripture versification and content',
    passingScore: 70,
    questions: [
      {
        id: 'q1',
        question:
          'How does the Book of Mormon chapter division differ between CoC and LDS editions?',
        options: [
          'They are identical',
          'CoC uses original 1830 chapters; LDS uses Orson Pratt\'s 1879 chapters',
          'LDS uses original 1830 chapters; CoC uses newer divisions',
          'Both use the 1920 edition divisions',
        ],
        correctAnswer: 1,
        explanation:
          'CoC uses the original 1830 chapter divisions (narrative-based, longer chapters), while LDS uses Orson Pratt\'s 1879 chapter and verse divisions (shorter, more numerous chapters).',
      },
      {
        id: 'q2',
        question: 'How many sections are in the Community of Christ Doctrine & Covenants?',
        options: ['138', '144', '165', '167'],
        correctAnswer: 2,
        explanation:
          'As of 2026, Community of Christ D&C contains 165 sections. Section 165 (2016) is the most recent. Sections 114-165 are CoC-specific revelations.',
      },
      {
        id: 'q3',
        question: 'Which Bible translation does CoC primarily use?',
        options: [
          'King James Version (KJV)',
          'Inspired Version (Joseph Smith Translation)',
          'New Revised Standard Version (NRSV)',
          'New International Version (NIV)',
        ],
        correctAnswer: 1,
        explanation:
          'Community of Christ primarily uses the Inspired Version (Joseph Smith Translation) of the Bible, which Emma Smith preserved and gave to the church. NRSV is also recommended.',
      },
      {
        id: 'q4',
        question: 'In the CoC Book of Mormon, where would you find III Nephi 5:8?',
        options: [
          '3 Nephi 11:7 in LDS edition',
          '3 Nephi 5:8 (same in both)',
          'III Nephi 12:1 in LDS edition',
          'Mormon 5:8 in LDS edition',
        ],
        correctAnswer: 0,
        explanation:
          'Due to different chapter divisions, III Nephi 5:8 in the CoC edition corresponds to 3 Nephi 11:7 in the LDS edition. The numbering system is entirely different after II Nephi.',
      },
      {
        id: 'q5',
        question:
          'Which D&C section authorized women\'s ordination in Community of Christ?',
        options: [
          'Section 114',
          'Section 145',
          'Section 156',
          'Section 163',
        ],
        correctAnswer: 2,
        explanation:
          'Section 156, received by Wallace B. Smith in 1984 and presented to the 1984 World Conference, authorized the ordination of women to priesthood offices.',
      },
    ],
  },

  'intro-coc-6-quiz': {
    id: 'intro-coc-6-quiz',
    lessonId: 'intro-coc-6',
    title: 'Mission and Vision Final Quiz',
    description: 'Comprehensive quiz on CoC identity, mission, and future direction',
    passingScore: 75,
    questions: [
      {
        id: 'q1',
        question: 'What is the mission of Community of Christ?',
        options: [
          'To baptize every person on earth',
          'To proclaim Jesus Christ and promote communities of joy, hope, love, and peace',
          'To gather to Zion in Independence, Missouri',
          'To defend the Book of Mormon against critics',
        ],
        correctAnswer: 1,
        explanation:
          'The mission of Community of Christ is: "We proclaim Jesus Christ and promote communities of joy, hope, love, and peace." This mission emphasizes Christ-centered ministry and peace-building.',
      },
      {
        id: 'q2',
        question: 'When did the church officially change its name to "Community of Christ"?',
        options: ['1984', '2001', '2007', '2010'],
        correctAnswer: 1,
        explanation:
          'The church officially changed its name from "Reorganized Church of Jesus Christ of Latter Day Saints" to "Community of Christ" in 2001, emphasizing its Christ-centered identity.',
      },
      {
        id: 'q3',
        question:
          'What are the four areas of Temple ministry according to Section 164 (2010)?',
        options: [
          'Worship, Education, Ordinances, Gathering',
          'Peace, Reconciliation, Healing, Spiritual Formation',
          'Prayer, Study, Service, Fellowship',
          'Sacraments, Preaching, Teaching, Outreach',
        ],
        correctAnswer: 1,
        explanation:
          'Section 164 (2010), the Temple dedication revelation, identifies four purposes: Peace, Reconciliation, Healing, and Spiritual Formation - emphasizing ministry over ordinances.',
      },
      {
        id: 'q4',
        question: 'Which statement best describes CoC\'s approach to scripture?',
        options: [
          'Scripture is inerrant and literal',
          'Scripture is inspired but open to interpretation and understanding',
          'Only the Book of Mormon is authoritative',
          'Scripture has been superseded by continuing revelation',
        ],
        correctAnswer: 1,
        explanation:
          'Community of Christ views scripture as inspired but emphasizes thoughtful interpretation, scholarly study, and understanding guided by the Holy Spirit rather than strict literalism.',
      },
      {
        id: 'q5',
        question:
          'What does "Enduring Principles" (Section 163) emphasize most strongly?',
        options: [
          'Temple building and ordinance work',
          'Missionary work and conversion',
          'Core identity, mission initiatives, and worth of all persons',
          'Preparation for Christ\'s second coming',
        ],
        correctAnswer: 2,
        explanation:
          'Section 163 (2007), known as "Enduring Principles," established eight core principles that define Community of Christ identity, with strong emphasis on worth of all persons, mission initiatives, and peace-building.',
      },
      {
        id: 'q6',
        question: 'How does CoC view other Christian denominations?',
        options: [
          'As apostate churches without authority',
          'As partners in ministry and Christ\'s work',
          'As misguided but well-meaning',
          'CoC does not interact with other denominations',
        ],
        correctAnswer: 1,
        explanation:
          'Community of Christ actively engages in ecumenical dialogue and views other Christian denominations as partners in ministry, participating in the National Council of Churches and World Council of Churches.',
      },
      {
        id: 'q7',
        question: 'What is the significance of Section 165 (2016)?',
        options: [
          'It announced a new temple location',
          'It called the church to courageously make Jesus Christ the center',
          'It changed the church\'s governance structure',
          'It authorized same-sex marriage',
        ],
        correctAnswer: 1,
        explanation:
          'Section 165 (2016), titled "Courageous in Christ," called the church to courageously make Jesus Christ the center of individual and community life, emphasizing sharing ministries and generous community.',
      },
      {
        id: 'q8',
        question:
          'Which of these best describes CoC\'s current theological position?',
        options: [
          'Fundamentalist Restoration',
          'Progressive Christian with Restoration heritage',
          'Evangelical Protestant',
          'Non-denominational',
        ],
        correctAnswer: 1,
        explanation:
          'Community of Christ identifies as a progressive Christian denomination with unique Restoration heritage, combining modern theology, social justice emphasis, and distinctive scripture while maintaining connection to its Restoration roots.',
      },
    ],
  },
};
