import Fastify from 'fastify';
import { registerApiRoutes } from './routes/api.js';
import { registerStaticRoutes } from './routes/static.js';

export async function createServer() {
  const app = Fastify({
    logger: {
      level: 'info',
    },
  });

  // Register CORS for development
  app.addHook('onRequest', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
      return reply.send();
    }
  });

  // Register routes
  await registerApiRoutes(app);
  await registerStaticRoutes(app);

  return app;
}
