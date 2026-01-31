import Fastify from 'fastify';
import cors from '@fastify/cors';
import { plotRoutes } from './routes/plots.js';
import { bedRoutes } from './routes/beds.js';

const server = Fastify({ logger: true });

await server.register(cors, { origin: true });

server.get('/health', async () => ({ status: 'ok' }));

await server.register(plotRoutes, { prefix: '/plots' });
await server.register(bedRoutes, { prefix: '/beds' });

const port = Number(process.env.PORT) || 3001;

server.listen({ port, host: '0.0.0.0' }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  console.log(`Server running on http://localhost:${port}`);
});
