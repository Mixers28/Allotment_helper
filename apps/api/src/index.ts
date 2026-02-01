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

await server.register(cors, {
  origin: (origin, callback) => {
    console.log('CORS check - Origin:', origin);

    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is allowed or if wildcard is set
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS rejected - Origin not in allowed list');
      // Return false but don't throw error (avoids 500)
      callback(null, false);
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
