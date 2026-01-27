/**
 * Quiz data for Community of Christ courses
 */

import { type QuizData } from '../components/Quiz';

export const COC_QUIZZES: QuizData[] = [
  {
    id: 'quiz-intro-coc-1',
    lessonId: 'intro-coc-1',
    title: 'Origins and History Quiz',
    description: 'Test your knowledge of CoC origins and the 1844 succession crisis',
    passingScore: 70,
    questions: [
      {
        id: 'q1',
        question: 'What year did Joseph Smith Jr. die, leading to the succession crisis?',
        options: ['1830', '1844', '1860', '1884'],
        correctAnswer: 1,
        explanation: 'Joseph Smith Jr. was martyred on June 27, 1844, creating a leadership crisis in the early Latter Day Saint movement.',
      },
      {
        id: 'q2',
        question: 'Who led the majority of Latter Day Saints to Utah?',
        options: ['Sidney Rigdon', 'James Strang', 'Brigham Young', 'Joseph Smith III'],
        correctAnswer: 2,
        explanation: 'Brigham Young, as president of the Quorum of the Twelve Apostles, led about 70% of members to Utah, forming what became the LDS Church.',
      },
      {
        id: 'q3',
        question: 'What role did Emma Smith play in RLDS formation?',
        options: [
          'She became the first prophet',
          'She opposed polygamy and preserved the Joseph Smith Translation',
          'She joined Brigham Young in Utah',
          'She had no involvement'
        ],
        correctAnswer: 1,
        explanation: 'Emma Smith firmly opposed polygamy, refused to go to Utah, and preserved the Joseph Smith Translation manuscript, which she gave to the RLDS Church in 1866.',
      },
      {
        id: 'q4',
        question: 'When was the RLDS Church formally organized?',
        options: ['1844', '1850', '1860', '1870'],
        correctAnswer: 2,
        explanation: 'The RLDS Church was formally reorganized at the Amboy Conference on April 6, 1860, with Joseph Smith III as president.',
      },
      {
        id: 'q5',
        question: 'How old was Joseph Smith III when his father died?',
        options: ['11 years old', '18 years old', '25 years old', '30 years old'],
        correctAnswer: 0,
        explanation: 'Joseph Smith III was only 11 years old when his father was martyred in 1844. He resisted taking leadership for 16 years before accepting in 1860.',
      },
      {
        id: 'q6',
        question: 'When did RLDS change its name to Community of Christ?',
        options: ['1984', '1994', '2001', '2010'],
        correctAnswer: 2,
        explanation: 'The church officially changed its name from Reorganized Church of Jesus Christ of Latter Day Saints to Community of Christ in 2001.',
      },
    ],
  },
  {
    id: 'quiz-intro-coc-2',
    lessonId: 'intro-coc-2',
    title: 'Eight Sacraments Quiz',
    description: 'Test your understanding of CoC sacraments and theology',
    passingScore: 70,
    questions: [
      {
        id: 'q1',
        question: 'How many sacraments does Community of Christ practice?',
        options: ['Two', 'Five', 'Seven', 'Eight'],
        correctAnswer: 3,
        explanation: 'Community of Christ practices eight sacraments: Baptism, Confirmation, Lord\'s Supper, Laying on of Hands for the Sick, Ordination, Marriage, Child Blessing, and Evangelist Blessing.',
      },
      {
        id: 'q2',
        question: 'What is the key theological difference between CoC sacraments and LDS ordinances?',
        options: [
          'CoC has more sacraments',
          'CoC sees them as means of grace, not requirements for salvation',
          'CoC only allows adults to participate',
          'CoC performs them in temples only'
        ],
        correctAnswer: 1,
        explanation: 'CoC teaches that sacraments are means of grace that help us experience God\'s presence, not requirements for salvation. This reflects grace-based theology rather than ordinance-based salvation.',
      },
      {
        id: 'q3',
        question: 'What does "open communion" mean in Community of Christ?',
        options: [
          'Communion is held outdoors',
          'Anyone can administer communion',
          'All Christians are welcome to partake, regardless of membership',
          'Communion is optional'
        ],
        correctAnswer: 2,
        explanation: 'Open communion means the Lord\'s Supper is offered to all Christians, not just CoC members in good standing. No worthiness interview is required.',
      },
      {
        id: 'q4',
        question: 'Why doesn\'t Community of Christ practice temple ordinances for the dead?',
        options: [
          'They don\'t have temples',
          'They believe God\'s grace is sufficient for all beyond death',
          'It\'s against the law',
          'They haven\'t decided yet'
        ],
        correctAnswer: 1,
        explanation: 'CoC believes God\'s love and grace extend beyond death, and salvation is by grace rather than required rituals. They trust God\'s justice and mercy for all people.',
      },
      {
        id: 'q5',
        question: 'When were women first ordained to priesthood in Community of Christ?',
        options: ['1960', '1974', '1985', '2001'],
        correctAnswer: 2,
        explanation: 'Following the 1984 revelation in Section 156, the first women were ordained to priesthood in Community of Christ in 1985.',
      },
      {
        id: 'q6',
        question: 'What is an Evangelist Blessing in CoC?',
        options: [
          'A blessing given at birth',
          'A personal blessing similar to LDS patriarchal blessing but without lineage',
          'A blessing for missionaries only',
          'A weekly blessing during communion'
        ],
        correctAnswer: 1,
        explanation: 'An Evangelist Blessing is a personal, spiritual blessing given once by an Evangelist. It\'s similar to LDS Patriarchal Blessings but does not include lineage declarations.',
      },
    ],
  },
  {
    id: 'quiz-intro-coc-3',
    lessonId: 'intro-coc-3',
    title: 'Enduring Principles Quiz',
    description: 'Test your knowledge of the nine Enduring Principles',
    passingScore: 70,
    questions: [
      {
        id: 'q1',
        question: 'How many Enduring Principles guide Community of Christ?',
        options: ['Six', 'Eight', 'Nine', 'Twelve'],
        correctAnswer: 2,
        explanation: 'Community of Christ has nine Enduring Principles that were identified in 2007 at World Conference.',
      },
      {
        id: 'q2',
        question: 'Which Enduring Principle relates to environmental stewardship?',
        options: [
          'Grace and Generosity',
          'Sacredness of Creation',
          'Worth of All Persons',
          'Blessings of Community'
        ],
        correctAnswer: 1,
        explanation: 'The "Sacredness of Creation" principle teaches that all creation has worth because of God\'s nature, making environmental stewardship a spiritual practice.',
      },
      {
        id: 'q3',
        question: 'What does "Shalom" mean in the "Pursuit of Peace" principle?',
        options: [
          'Absence of conflict',
          'Wholeness, justice, and right relationships',
          'Military peace',
          'Silence'
        ],
        correctAnswer: 1,
        explanation: 'Shalom is a Hebrew word meaning wholeness, justice, and right relationships - much more than just the absence of conflict. It\'s active peacemaking.',
      },
      {
        id: 'q4',
        question: 'Which principle led directly to women\'s ordination?',
        options: [
          'All Are Called',
          'Worth of All Persons',
          'Continuing Revelation',
          'All of the above'
        ],
        correctAnswer: 3,
        explanation: 'Women\'s ordination resulted from multiple principles: Worth of All Persons (equality), All Are Called (gifted ministry), and Continuing Revelation (Section 156).',
      },
      {
        id: 'q5',
        question: 'What does "Continuing Revelation" mean?',
        options: [
          'The Bible is still being written',
          'God continues to reveal truth through the Holy Spirit',
          'Only prophets receive revelation',
          'Revelation ended with Joseph Smith Jr.'
        ],
        correctAnswer: 1,
        explanation: 'Continuing Revelation means God didn\'t stop revealing truth after scripture was written. The Spirit continues to guide the church, as seen in D&C Section 167 (2023).',
      },
      {
        id: 'q6',
        question: 'In what year were the Enduring Principles first identified?',
        options: ['1984', '2001', '2007', '2015'],
        correctAnswer: 2,
        explanation: 'The nine Enduring Principles were identified at the 2007 World Conference and were mentioned in D&C Section 163.',
      },
    ],
  },
  {
    id: 'quiz-intro-coc-4',
    lessonId: 'intro-coc-4',
    title: 'Section 156 & Women\'s Ordination Quiz',
    description: 'Test your understanding of this historic 1984 revelation',
    passingScore: 70,
    questions: [
      {
        id: 'q1',
        question: 'Who received the revelation in Section 156?',
        options: [
          'Joseph Smith III',
          'Frederick M. Smith',
          'W. Wallace Smith',
          'Wallace B. Smith'
        ],
        correctAnswer: 2,
        explanation: 'Section 156 was received by W. Wallace Smith, who served as Prophet-President from 1958-1978 and remained prophet until 1989.',
      },
      {
        id: 'q2',
        question: 'When was Section 156 presented to World Conference?',
        options: ['April 1, 1984', 'April 5, 1984', 'April 1, 1985', 'April 5, 1985'],
        correctAnswer: 1,
        explanation: 'Section 156 was received on April 1, 1984, and presented to World Conference on April 5, 1984, where it was sustained by vote.',
      },
      {
        id: 'q3',
        question: 'Approximately how many members left RLDS Church over women\'s ordination?',
        options: ['5,000', '15,000', '50,000', '100,000'],
        correctAnswer: 2,
        explanation: 'About 50,000 members (out of ~250,000) left the RLDS Church over Section 156, forming independent Restoration Branches.',
      },
      {
        id: 'q4',
        question: 'What are Restoration Branches?',
        options: [
          'A new CoC program',
          'Groups that rejected Section 156 and maintain pre-1984 practices',
          'International CoC congregations',
          'A type of priesthood office'
        ],
        correctAnswer: 1,
        explanation: 'Restoration Branches are independent congregations that rejected Section 156 and women\'s ordination, maintaining pre-1984 RLDS practices.',
      },
      {
        id: 'q5',
        question: 'What biblical passage is often cited in support of women\'s ordination?',
        options: [
          '1 Timothy 2:12',
          'Galatians 3:28',
          'Genesis 1:1',
          'John 3:16'
        ],
        correctAnswer: 1,
        explanation: 'Galatians 3:28 states "There is no longer Jew or Greek, slave or free, male and female; for all of you are one in Christ Jesus," supporting equality.',
      },
      {
        id: 'q6',
        question: 'What was Section 156 primarily about?',
        options: [
          'Only women\'s ordination',
          'Multiple topics including temple, mission, and women\'s ordination',
          'Financial matters',
          'Building projects'
        ],
        correctAnswer: 1,
        explanation: 'Section 156 addressed multiple topics including temple dedication, church organization, and mission. Women\'s ordination (verse 9) was one part of a larger revelation about church identity.',
      },
    ],
  },
  {
    id: 'quiz-intro-coc-5',
    lessonId: 'intro-coc-5',
    title: 'Temple Theology Quiz',
    description: 'Test your understanding of CoC temples and their purpose',
    passingScore: 70,
    questions: [
      {
        id: 'q1',
        question: 'How many temples does Community of Christ own?',
        options: ['None', 'One', 'Two', 'Five'],
        correctAnswer: 2,
        explanation: 'Community of Christ owns two temples: the Kirtland Temple (acquired 1880) and the Independence Temple (dedicated 1994).',
      },
      {
        id: 'q2',
        question: 'When was the Kirtland Temple dedicated?',
        options: ['1830', '1836', '1844', '1860'],
        correctAnswer: 1,
        explanation: 'The Kirtland Temple was dedicated on March 27, 1836, and featured spectacular Pentecostal experiences including visions and speaking in tongues.',
      },
      {
        id: 'q3',
        question: 'What is the primary purpose of CoC temples?',
        options: [
          'Secret ordinances for salvation',
          'Proxy baptisms for the dead',
          'Worship, peace, reconciliation, and community gathering',
          'Only for priesthood meetings'
        ],
        correctAnswer: 2,
        explanation: 'CoC temples are for worship, peace work, reconciliation, and community gathering - not for exclusive saving ordinances.',
      },
      {
        id: 'q4',
        question: 'Who can enter Independence Temple?',
        options: [
          'Only CoC members with temple recommends',
          'Only priesthood holders',
          'Anyone - it\'s open to all',
          'Only those who have been through the endowment'
        ],
        correctAnswer: 2,
        explanation: 'Independence Temple is open to all people - no temple recommend, membership, or worthiness interview required. This reflects CoC\'s emphasis on grace and inclusion.',
      },
      {
        id: 'q5',
        question: 'What does "people of the Temple" mean (D&C 164:9)?',
        options: [
          'People who attend temple regularly',
          'Those who see violence but proclaim peace, extend reconciliation, find healing',
          'Temple workers only',
          'Those who live near temples'
        ],
        correctAnswer: 1,
        explanation: 'Being "people of the Temple" means actively pursuing peace in a violent world, reconciliation amid conflict, and healing for broken spirits.',
      },
      {
        id: 'q6',
        question: 'Why doesn\'t CoC practice proxy ordinances for the dead?',
        options: [
          'They forgot to build baptismal fonts',
          'They trust God\'s grace is sufficient for all beyond death',
          'It\'s too expensive',
          'They plan to start soon'
        ],
        correctAnswer: 1,
        explanation: 'CoC believes salvation is by grace, not ordinances. They trust that God\'s love and justice extend to all people, including those who have died.',
      },
    ],
  },
  {
    id: 'quiz-intro-coc-6',
    lessonId: 'intro-coc-6',
    title: 'Book of Mormon in CoC Perspective Quiz',
    description: 'Test your understanding of CoC\'s approach to the Book of Mormon',
    passingScore: 70,
    questions: [
      {
        id: 'q1',
        question: 'Does Community of Christ require members to believe in Book of Mormon historicity?',
        options: [
          'Yes, it\'s required',
          'No, diverse views are welcomed',
          'Only new members must believe',
          'It\'s under discussion'
        ],
        correctAnswer: 1,
        explanation: 'CoC does not require belief in Book of Mormon historicity. Some view it as ancient record, others as inspired fiction with spiritual truths. Both perspectives are welcomed.',
      },
      {
        id: 'q2',
        question: 'How does CoC\'s use of the Book of Mormon compare to LDS Church?',
        options: [
          'CoC uses it more frequently',
          'CoC uses it occasionally; LDS uses it centrally',
          'Both use it equally',
          'CoC doesn\'t use it at all'
        ],
        correctAnswer: 1,
        explanation: 'CoC uses the Book of Mormon occasionally in worship and study, while the LDS Church studies it extensively and considers it the "most correct book on earth."',
      },
      {
        id: 'q3',
        question: 'What themes does CoC emphasize when reading the Book of Mormon?',
        options: [
          'Lamanite ancestry of Native Americans',
          'Temple ordinances foreshadowed',
          'Christ, grace, peace, justice, social ethics',
          'Pre-existence and plan of salvation'
        ],
        correctAnswer: 2,
        explanation: 'CoC emphasizes Christ\'s teachings, grace over works, peace (Anti-Nephi-Lehies), social justice (care for poor), and inclusion ("all are alike unto God").',
      },
      {
        id: 'q4',
        question: 'What does CoC use as a "hermeneutical key" to interpret scripture?',
        options: [
          'Joseph Smith\'s teachings',
          'Church tradition',
          'Jesus Christ',
          'Historical context only'
        ],
        correctAnswer: 2,
        explanation: 'CoC uses Christ as the interpretive lens (hermeneutical key) for all scripture, accepting what aligns with Christ\'s love and critiquing what doesn\'t.',
      },
      {
        id: 'q5',
        question: 'What is the "inspired fiction" view of the Book of Mormon?',
        options: [
          'It\'s completely made up without value',
          'It\'s a 19th century creation with profound spiritual truths',
          'It\'s fiction mixed with true history',
          'It\'s only for entertainment'
        ],
        correctAnswer: 1,
        explanation: 'The "inspired fiction" view held by many CoC members sees the Book of Mormon as Joseph Smith\'s inspired 19th century creation containing valuable spiritual truths.',
      },
      {
        id: 'q6',
        question: 'How does CoC handle problematic passages in the Book of Mormon (like "skin of blackness")?',
        options: [
          'Ignores them',
          'Defends them as correct',
          'Acknowledges issues, interprets through Christ, critiques harmful parts',
          'Removes them from the text'
        ],
        correctAnswer: 2,
        explanation: 'CoC acknowledges problematic passages may reflect 19th century prejudices, interprets through Christ as lens, and feels free to critique passages that contradict Christ\'s love.',
      },
    ],
  },
];

export default COC_QUIZZES;
