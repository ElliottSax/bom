// Minimal GraphQL API server for BOM Study Tools
// Uses plain Node.js without TypeScript compilation
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:postgres@localhost:5435/bom_study_tools_dev'
    }
  }
});

// GraphQL Schema
const typeDefs = `#graphql
  type Query {
    health: String!
    verses(editionId: String!, book: String, chapter: Int, limit: Int): [Verse!]!
    editions: [Edition!]!
    books(editionId: String!): [BookInfo!]!
  }

  type Verse {
    id: ID!
    editionId: String!
    book: String!
    chapter: Int!
    verse: Int!
    text: String!
    verseType: String
  }

  type Edition {
    id: ID!
    name: String!
    shortName: String!
    language: String!
    year: Int!
  }

  type BookInfo {
    book: String!
    verseCount: Int!
    chapters: Int!
  }
`;

// Resolvers
const resolvers = {
  Query: {
    health: () => 'OK',

    verses: async (_, { editionId, book, chapter, limit = 100 }) => {
      const where = { editionId };
      if (book) where.book = book;
      if (chapter !== undefined) where.chapter = chapter;

      return await prisma.verses.findMany({
        where,
        take: limit,
        orderBy: [
          { book: 'asc' },
          { chapter: 'asc' },
          { verse: 'asc' }
        ]
      });
    },

    editions: async () => {
      return await prisma.editions.findMany({
        orderBy: { name: 'asc' }
      });
    },

    books: async (_, { editionId }) => {
      const result = await prisma.$queryRaw`
        SELECT
          book,
          COUNT(*) as "verseCount",
          COUNT(DISTINCT chapter) as chapters
        FROM verses
        WHERE "editionId" = ${editionId}
        GROUP BY book
        ORDER BY MIN(id)
      `;

      return result.map(r => ({
        book: r.book,
        verseCount: Number(r.verseCount),
        chapters: Number(r.chapters)
      }));
    }
  }
};

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true, // Enable GraphQL Playground
});

// Start server
async function startServer() {
  try {
    console.log('Starting BOM Study Tools API Server...');
    console.log('Database URL: postgresql://postgres:***@localhost:5435/bom_study_tools_dev');

    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Count verses
    const verseCount = await prisma.verses.count();
    console.log(`✅ Found ${verseCount} verses in database`);

    // Start Apollo Server
    const { url } = await startStandaloneServer(server, {
      listen: { port: 4000 },
    });

    console.log(`🚀 GraphQL API ready at ${url}`);
    console.log(`📊 GraphQL Playground: ${url}`);
    console.log('');
    console.log('Sample queries:');
    console.log('  - Health check: { health }');
    console.log('  - List editions: { editions { id name } }');
    console.log('  - Get verses: { verses(editionId: "coc-bom-1908", book: "I Nephi", chapter: 1) { verse text } }');

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start the server
startServer();
