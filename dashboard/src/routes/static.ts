import { FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function registerStaticRoutes(app: FastifyInstance) {
  // Serve static files from the public directory
  await app.register(fastifyStatic, {
    root: join(__dirname, '../../public'),
    prefix: '/',
  });
}
