import { ApolloServer } from '@apollo/server';
import fastifyApollo, {
  fastifyApolloDrainPlugin,
} from '@as-integrations/fastify';
import type { FastifyInstance } from 'fastify';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { createContext } from './context';
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

/**
 * Create and configure Apollo GraphQL Server
 */
export async function setupGraphQL(fastify: FastifyInstance) {
  // Create Apollo Server
  const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [
      // Drain plugin for graceful shutdown
      fastifyApolloDrainPlugin(fastify),

      // Custom logging plugin
      {
        async requestDidStart() {
          return {
            async didEncounterErrors(requestContext) {
              logger.error(
                {
                  errors: requestContext.errors,
                  operation: requestContext.operationName,
                },
                'GraphQL errors encountered'
              );
            },
          };
        },
      },
    ],
    formatError: (formattedError, error) => {
      // Log the error
      logger.error({ err: error }, 'GraphQL error');

      // Don't expose internal server errors in production
      if (process.env.NODE_ENV === 'production') {
        if (formattedError.extensions?.code === 'INTERNAL_SERVER_ERROR') {
          return {
            message: 'An internal server error occurred',
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
            },
          };
        }
      }

      return formattedError;
    },
    introspection: process.env.NODE_ENV !== 'production', // Disable in production
  });

  await apollo.start();

  // Register GraphQL route
  await fastify.register(fastifyApollo(apollo), {
    context: createContext,
  });

  logger.info('GraphQL server initialized at /graphql');
}
