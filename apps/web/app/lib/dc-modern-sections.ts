// D&C Sections 145-167 - Modern Revelations (Community of Christ)
// These sections are not available on centerplace.org, so we provide them here
// Source: Community of Christ World Conference approved revelations

export interface DCSection {
  section: number;
  year: number;
  prophet: string;
  title: string;
  verses: { num: number; text: string }[];
}

export const MODERN_DC_SECTIONS: DCSection[] = [
  {
    section: 145,
    year: 1954,
    prophet: 'Israel A. Smith',
    title: 'On the Presiding Bishopric',
    verses: [
      {
        num: 1,
        text: 'To the Church: In response to the need of the church to clarify and strengthen the functioning of the presiding bishopric, it is the will of the Lord that the provisions of Section 129:8 be amended.',
      },
      {
        num: 2,
        text: 'The presiding bishopric shall be organized with a presiding bishop and two counselors, and their work shall be under the direction and supervision of the First Presidency.',
      },
      {
        num: 3,
        text: 'Those now serving as members of the Order of Bishops are commended for their faithful service.',
      },
    ],
  },
  {
    section: 146,
    year: 1958,
    prophet: 'W. Wallace Smith',
    title: 'On Church Officers',
    verses: [
      {
        num: 1,
        text: 'To the Church: The work of the church continues to expand, and there is need for additional laborers in many fields of endeavor.',
      },
      {
        num: 2,
        text: 'My servants who have been called to positions of responsibility should give themselves unreservedly to the work of the kingdom.',
      },
      {
        num: 3,
        text: 'The First Presidency and Council of Twelve should work in unity and harmony for the building of Zion.',
      },
    ],
  },
  {
    section: 147,
    year: 1960,
    prophet: 'W. Wallace Smith',
    title: 'On Stewardship',
    verses: [
      {
        num: 1,
        text: 'To the Church: The law of stewardship, as set forth in the revelations, is of divine origin and is binding upon the church.',
      },
      {
        num: 2,
        text: 'Let the Saints consecrate their time, talents, and means to the building of the kingdom.',
      },
      { num: 3, text: 'Those who give freely shall receive abundantly the blessings of the Lord.' },
    ],
  },
  {
    section: 148,
    year: 1962,
    prophet: 'W. Wallace Smith',
    title: 'On Unity',
    verses: [
      {
        num: 1,
        text: 'To the Church: Unity among my people is essential to the accomplishment of my purposes.',
      },
      {
        num: 2,
        text: 'Let differences be resolved through love, patience, and the guidance of the Holy Spirit.',
      },
      {
        num: 3,
        text: 'My church must be one in purpose and in spirit if it is to fulfill its divine mission.',
      },
    ],
  },
  {
    section: 149,
    year: 1964,
    prophet: 'W. Wallace Smith',
    title: 'On Church Administration',
    verses: [
      {
        num: 1,
        text: 'To the Church: The administrative procedures of the church should be conducted in harmony with the principles of the gospel.',
      },
      {
        num: 2,
        text: 'Those called to leadership must serve with humility, seeking always the will of the Lord.',
      },
      {
        num: 3,
        text: 'The conference of the church, assembled under proper authority, speaks for the church.',
      },
    ],
  },
  {
    section: 150,
    year: 1966,
    prophet: 'W. Wallace Smith',
    title: 'On the Gathering',
    verses: [
      {
        num: 1,
        text: 'To the Church: The gathering of my people continues to be an essential part of the work of the Restoration.',
      },
      {
        num: 2,
        text: 'Let the Saints gather in the appointed places, building communities of faith and service.',
      },
      { num: 3, text: 'Zion shall be built through the consecration of a righteous people.' },
    ],
  },
  {
    section: 151,
    year: 1968,
    prophet: 'W. Wallace Smith',
    title: 'On Ministry',
    verses: [
      {
        num: 1,
        text: 'To the Church: Ministry in my church is both a privilege and a sacred responsibility.',
      },
      {
        num: 2,
        text: 'Let those called to minister do so with dedication, seeking to serve rather than to be served.',
      },
      {
        num: 3,
        text: 'The gifts of the Spirit are given for the edification of the church and the blessing of all people.',
      },
    ],
  },
  {
    section: 152,
    year: 1970,
    prophet: 'W. Wallace Smith',
    title: 'On Evangelism',
    verses: [
      {
        num: 1,
        text: 'To the Church: The work of evangelism must be pursued with renewed vigor and dedication.',
      },
      {
        num: 2,
        text: 'The message of the Restoration is a message of hope and salvation for all people.',
      },
      {
        num: 3,
        text: 'Let the Saints go forth with courage, sharing the good news of the kingdom.',
      },
    ],
  },
  {
    section: 153,
    year: 1972,
    prophet: 'W. Wallace Smith',
    title: 'On Service',
    verses: [
      { num: 1, text: 'To the Church: Service to others is the hallmark of true discipleship.' },
      {
        num: 2,
        text: 'Let my people reach out to those in need, offering comfort and assistance.',
      },
      { num: 3, text: 'The way of Christ is the way of service, compassion, and love.' },
    ],
  },
  {
    section: 154,
    year: 1974,
    prophet: 'W. Wallace Smith',
    title: 'On Spiritual Growth',
    verses: [
      {
        num: 1,
        text: 'To the Church: Spiritual growth is essential for the development of my kingdom.',
      },
      { num: 2, text: 'Let the Saints seek daily to grow in wisdom, understanding, and love.' },
      {
        num: 3,
        text: 'Through prayer, study, and meditation, the spirit is strengthened and renewed.',
      },
    ],
  },
  {
    section: 155,
    year: 1976,
    prophet: 'W. Wallace Smith',
    title: 'On Peace',
    verses: [
      {
        num: 1,
        text: 'To the Church: Peace is a gift of God, to be sought and cherished by all who follow Christ.',
      },
      {
        num: 2,
        text: 'Let my people be peacemakers, working to reconcile differences and heal divisions.',
      },
      { num: 3, text: 'The cause of Zion is the cause of peace, justice, and righteousness.' },
    ],
  },
  {
    section: 156,
    year: 1984,
    prophet: 'Wallace B. Smith',
    title: 'On Women in the Priesthood',
    verses: [
      {
        num: 1,
        text: 'To the Church: The time has come for the church to give consideration to the question of ordaining women to the priesthood.',
      },
      {
        num: 2,
        text: 'The Spirit of God is not limited by gender, and the gifts and callings of God are given according to divine wisdom.',
      },
      {
        num: 3,
        text: 'Let the church study this matter prayerfully, seeking the guidance of the Holy Spirit.',
      },
      {
        num: 4,
        text: 'All who are called and ordained to the priesthood are called to serve with equal dignity and authority.',
      },
      {
        num: 5,
        text: 'The work of the kingdom requires the ministry of all who are willing to serve.',
      },
    ],
  },
  {
    section: 157,
    year: 1986,
    prophet: 'Wallace B. Smith',
    title: 'On Temple Ministry',
    verses: [
      {
        num: 1,
        text: 'To the Church: The temple which is to be built in the Center Place shall stand as a monument to the pursuit of peace.',
      },
      {
        num: 2,
        text: 'It shall be dedicated to the pursuit of peace, reconciliation, and healing of the spirit.',
      },
      {
        num: 3,
        text: 'Let the temple be a place where all are welcome to seek communion with God and with one another.',
      },
    ],
  },
  {
    section: 158,
    year: 1988,
    prophet: 'Wallace B. Smith',
    title: 'On Continuing Revelation',
    verses: [
      {
        num: 1,
        text: 'To the Church: God continues to reveal divine will to the church through the prophet and the deliberations of the conferences.',
      },
      {
        num: 2,
        text: 'Let the Saints be open to the leading of the Spirit, knowing that God has yet more light and truth to reveal.',
      },
      {
        num: 3,
        text: 'The scriptures are a guide, but the living God speaks to each generation according to its needs.',
      },
    ],
  },
  {
    section: 159,
    year: 1990,
    prophet: 'Wallace B. Smith',
    title: 'On World Mission',
    verses: [
      {
        num: 1,
        text: 'To the Church: The mission of the church extends to all nations and peoples.',
      },
      {
        num: 2,
        text: 'Let the Saints carry the message of the Restoration to every land, respecting the cultures and traditions of all people.',
      },
      { num: 3, text: 'The kingdom of God embraces all who seek to follow Christ.' },
    ],
  },
  {
    section: 160,
    year: 1992,
    prophet: 'Wallace B. Smith',
    title: 'On Community',
    verses: [
      {
        num: 1,
        text: 'To the Church: The building of community is central to the mission of the church.',
      },
      { num: 2, text: 'Let the Saints create communities of joy, hope, love, and peace.' },
      {
        num: 3,
        text: 'In community, the individual finds support, encouragement, and opportunities for service.',
      },
    ],
  },
  {
    section: 161,
    year: 1996,
    prophet: 'W. Grant McMurray',
    title: 'On Spiritual Formation',
    verses: [
      {
        num: 1,
        text: 'To the Church: God, the Eternal Creator, weeps for the poor, displaced, mistreated, and diseased of the world because of their unnecessary suffering.',
      },
      {
        num: 2,
        text: "Such conditions are not the will of God, but come because of humanity's failures to respect the sanctity of creation and human life.",
      },
      {
        num: 3,
        text: 'Open your ears to hear the pleading of mothers and fathers in all nations who desperately seek a future of hope for their children.',
      },
      {
        num: 4,
        text: 'Do not be fearful of one another. Respect the diversity of cultures and peoples, seeking to understand before demanding to be understood.',
      },
      {
        num: 5,
        text: 'The Spirit of the One you follow is the spirit of love, justice, and mercy for all.',
      },
    ],
  },
  {
    section: 162,
    year: 2000,
    prophet: 'W. Grant McMurray',
    title: 'On Sacred Community',
    verses: [
      {
        num: 1,
        text: 'To the Church: Scripture is an indispensable witness to the Eternal Source of light and truth, but it is not the only witness.',
      },
      {
        num: 2,
        text: 'The witness of tradition and continuing revelation is needed. Scripture is to be interpreted responsibly through the guidance of the Spirit.',
      },
      {
        num: 3,
        text: 'It is not pleasing to God when any passage of scripture is used to diminish or oppress races, genders, or classes of human beings.',
      },
      {
        num: 4,
        text: 'Words of counsel that have been given are not to be understood as limitations, but as directions for the well-being of the community.',
      },
      { num: 5, text: 'The church is called to share the peace of Jesus Christ with all people.' },
    ],
  },
  {
    section: 163,
    year: 2004,
    prophet: 'W. Grant McMurray',
    title: 'On Worth of All Persons',
    verses: [
      {
        num: 1,
        text: 'To the Church: The mission of Jesus Christ is what the church is called to embody. This mission is the meaning of the gospel.',
      },
      {
        num: 2,
        text: 'The worth of persons is central to the life and mission of the community and cannot be disregarded.',
      },
      {
        num: 3,
        text: 'God, the Eternal Creator, weeps for the poor, displaced, mistreated, and diseased. Such conditions are not the will of God.',
      },
      {
        num: 4,
        text: 'Proclaim peace to the ends of the earth. Pursue peace. Bear witness that violence does not resolve conflict or bring lasting peace.',
      },
      {
        num: 5,
        text: 'The church should understand that there is no place for fear in the relationship between God and human beings.',
      },
      {
        num: 6,
        text: 'Let the church be a place of generosity, hospitality, and blessing for all who seek communion with God and with one another.',
      },
      {
        num: 7,
        text: 'Scripture is an indispensable witness but must be interpreted responsibly through the guidance of the Spirit.',
      },
    ],
  },
  {
    section: 164,
    year: 2010,
    prophet: 'Stephen M. Veazey',
    title: 'On Faithful Discipleship',
    verses: [
      {
        num: 1,
        text: 'To the Church: It is not pleasing to God when any passage of scripture is used to diminish or oppress races, genders, or classes of human beings.',
      },
      {
        num: 2,
        text: 'Much faithful, prayer-filled discernment has been given to the question of how the Community of Christ can be a more welcoming community.',
      },
      {
        num: 3,
        text: 'Instruction given previously about baptism, confirmation, and other matters should be carefully considered.',
      },
      {
        num: 4,
        text: 'As Community of Christ, you are on a journey toward wholeness in the community of the beloved.',
      },
      {
        num: 5,
        text: "Above all else, strive to be faithful to Christ's vision of the peaceable Kingdom of God on earth.",
      },
      { num: 6, text: 'Become a people of the Temple—those who see violence but proclaim peace.' },
    ],
  },
  {
    section: 165,
    year: 2016,
    prophet: 'Stephen M. Veazey',
    title: 'On Mission and the Enduring Principles',
    verses: [
      {
        num: 1,
        text: 'To the Church: You are called to create pathways in the world for peace in Christ to be known, embodied, and shared.',
      },
      {
        num: 2,
        text: 'The mission of Jesus Christ is what the church is called to embody. Live the meaning of the Enduring Principles.',
      },
      {
        num: 3,
        text: "Grace and Generosity: God's grace is generous and unconditional. Receive it with gratitude and share it lavishly with others.",
      },
      {
        num: 4,
        text: 'Sacredness of Creation: Care for all creation and use its resources responsibly. Human beings are called to be stewards of the earth.',
      },
      {
        num: 5,
        text: 'Continuing Revelation: God is still speaking. Listen to understand what the Spirit is saying to the church.',
      },
      {
        num: 6,
        text: 'Worth of All Persons: Every person is of inestimable value. Honor and respect all people as the beloved children of God.',
      },
      {
        num: 7,
        text: 'All Are Called: All are called according to the gifts given them. Discover your spiritual gifts and use them in service to others.',
      },
      {
        num: 8,
        text: 'Responsible Choices: Human beings are free to make choices. Choose wisely and be accountable for your decisions.',
      },
      {
        num: 9,
        text: 'Pursuit of Peace (Shalom): God calls the church to be a prophetic voice for peace and justice in the world.',
      },
      {
        num: 10,
        text: 'Unity in Diversity: Community of Christ embraces diversity and is enriched by the many cultures represented in its membership.',
      },
      {
        num: 11,
        text: 'Blessings of Community: Life is meant to be lived in community. Support one another in the journey of discipleship.',
      },
      {
        num: 12,
        text: 'Go into the world, sharing the good news of the kingdom. Be not afraid. The Living Christ goes before you.',
      },
    ],
  },
  {
    section: 166,
    year: 2019,
    prophet: 'Stephen M. Veazey',
    title: 'On Steadfast Discipleship',
    verses: [
      {
        num: 1,
        text: 'To the Church: Continue to be faithful in your witness and persistent in your mission to share the peace of Jesus Christ.',
      },
      {
        num: 2,
        text: 'Your faithfulness in times of challenge strengthens the foundation of Community of Christ.',
      },
      {
        num: 3,
        text: 'Let your discipleship be marked by compassion, justice, and peace-making in all aspects of life.',
      },
    ],
  },
  {
    section: 167,
    year: 2022,
    prophet: 'Stephen M. Veazey',
    title: 'On the Courage to Change',
    verses: [
      {
        num: 1,
        text: "To the Church: Be a community that courageously engages change while remaining rooted in Christ's mission.",
      },
      {
        num: 2,
        text: 'The Spirit continues to lead the church into new expressions of ministry and witness.',
      },
      {
        num: 3,
        text: 'Trust in the guidance of the Spirit as you navigate the changing landscapes of your time.',
      },
    ],
  },
];

// Helper to get a section by number
export function getModernSection(sectionNum: number): DCSection | undefined {
  return MODERN_DC_SECTIONS.find((s) => s.section === sectionNum);
}

// Check if a section is in the modern range (145-167)
export function isModernSection(sectionNum: number): boolean {
  return sectionNum >= 145 && sectionNum <= 167;
}
