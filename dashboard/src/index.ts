import { createServer } from './server.js';

const PORT = parseInt(process.env.PORT || '3847', 10);
const HOST = process.env.HOST || '127.0.0.1';

async function main() {
  const server = await createServer();

  try {
    await server.listen({ port: PORT, host: HOST });

    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   DESIGN-OPS Dashboard                                           ║
║   ─────────────────────────────────────────────────────────────  ║
║                                                                  ║
║   Dashboard:  http://localhost:${PORT}                            ║
║   API:        http://localhost:${PORT}/api/health                 ║
║                                                                  ║
║   Press Ctrl+C to stop                                           ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
    `);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
