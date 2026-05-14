import { FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Production build output of the React UI. Built via `npm run build` from
// dashboard/, which runs `npm --prefix ui run build` first. Gitignored —
// each user builds locally. When running in dev mode (`npm run dev`), the
// UI is served by Vite on :5173 with /api proxied here, so this path is
// only hit by `npm start` after a build.
const UI_DIST = join(__dirname, '../../ui/dist');

export async function registerStaticRoutes(app: FastifyInstance) {
  if (!existsSync(UI_DIST)) {
    app.get('/', async (_request, reply) => {
      return reply.type('text/html').send(`<!doctype html>
<html><head><meta charset="utf-8"><title>DESIGN-OPS — build required</title>
<style>body{font-family:ui-monospace,Menlo,monospace;max-width:48rem;margin:6rem auto;padding:0 1.5rem;color:#191919;background:#FFFAEE;line-height:1.6}
code{background:#f5f3f0;padding:.1em .4em;border-radius:4px;color:#bf3600}
h1{color:#FE5102;letter-spacing:.05em}</style></head>
<body><h1>DESIGN-OPS</h1>
<p>UI is not built yet. From <code>dashboard/</code>:</p>
<p><code>npm run dev</code> — server + Vite hot-reload UI on :5173 (recommended)</p>
<p>or <code>npm run build &amp;&amp; npm start</code> — production build, served here on :3847</p>
</body></html>`);
    });
    return;
  }

  await app.register(fastifyStatic, {
    root: UI_DIST,
    prefix: '/',
  });
}
