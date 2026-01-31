import Fastify from 'fastify';
import cors from '@fastify/cors';
import { plotRoutes } from './routes/plots.js';
import { bedRoutes } from './routes/beds.js';

const server = Fastify({ logger: true });

// CORS configuration for production deployment
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173'];

await server.register(cors, {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Check if origin is allowed
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
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
