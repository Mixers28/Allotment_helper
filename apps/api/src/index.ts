import Fastify from 'fastify';
import cors from '@fastify/cors';
import { plotRoutes } from './routes/plots.js';
import { bedRoutes } from './routes/beds.js';

const server = Fastify({ logger: true });

// CORS configuration for production deployment
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173'];

console.log('CORS allowed origins:', allowedOrigins);

// Determine CORS origin setting
const corsOrigin = allowedOrigins.includes('*')
  ? true  // Allow all origins
  : allowedOrigins;

await server.register(cors, {
  origin: corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: !allowedOrigins.includes('*'), // Can't use credentials with wildcard
});

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
